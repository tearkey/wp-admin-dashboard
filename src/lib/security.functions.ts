import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { hostingRequest, mock, type ProviderResult } from "@/lib/cms/provider";

/* ------------------------------------------------------------------ */
/* Cloudflare                                                          */
/* ------------------------------------------------------------------ */

const CF_BASE = "https://api.cloudflare.com/client/v4";

interface CfEnvelope<T> {
  success: boolean;
  errors?: { message: string }[];
  result: T;
}

export interface CfStatus {
  configured: boolean;
  ok: boolean;
  zoneName?: string;
  plan?: string;
  status?: string;
  message?: string;
}

export interface CfSetting {
  id: string;
  value: string | number | boolean;
  editable: boolean;
}

export interface CfRule {
  id: string;
  description: string;
  expression: string;
  action: string;
  enabled: boolean;
}

export interface CfAnalyticsPoint {
  label: string;
  requests: number;
  threats: number;
  bandwidth: number;
}

/** Cloudflare credentials are read per call and never returned to the client. */
function cfCreds() {
  const token = process.env["CLOUDFLARE_API_TOKEN"];
  const zoneId = process.env["CLOUDFLARE_ZONE_ID"];
  return token && zoneId ? { token, zoneId } : null;
}

async function cf<T>(
  path: string,
  init: { method?: string; body?: unknown } = {},
): Promise<{ ok: boolean; result?: T; message?: string }> {
  const creds = cfCreds();
  if (!creds) return { ok: false, message: "Cloudflare is not connected." };
  try {
    const res = await fetch(`${CF_BASE}${path.replace("{zone}", creds.zoneId)}`, {
      method: init.method ?? "GET",
      headers: {
        authorization: `Bearer ${creds.token}`,
        "content-type": "application/json",
      },
      ...(init.body === undefined ? {} : { body: JSON.stringify(init.body) }),
    });
    const json = (await res.json()) as CfEnvelope<T>;
    if (!res.ok || !json.success) {
      return {
        ok: false,
        message: json.errors?.[0]?.message ?? `Cloudflare returned ${res.status}.`,
      };
    }
    return { ok: true, result: json.result };
  } catch {
    return { ok: false, message: "Could not reach the Cloudflare API." };
  }
}

export const getCloudflareStatus = createServerFn({ method: "GET" }).handler(
  async (): Promise<CfStatus> => {
    if (!cfCreds()) {
      return {
        configured: false,
        ok: false,
        message: "Add CLOUDFLARE_API_TOKEN and CLOUDFLARE_ZONE_ID to connect.",
      };
    }
    const zone = await cf<{ name: string; status: string; plan?: { name: string } }>(
      "/zones/{zone}",
    );
    if (!zone.ok || !zone.result) {
      return { configured: true, ok: false, message: zone.message };
    }
    return {
      configured: true,
      ok: true,
      zoneName: zone.result.name,
      status: zone.result.status,
      plan: zone.result.plan?.name,
    };
  },
);

export const getCloudflareSettings = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ ok: boolean; message?: string; settings: CfSetting[] }> => {
    const res = await cf<CfSetting[]>("/zones/{zone}/settings");
    if (!res.ok || !res.result) return { ok: false, message: res.message, settings: [] };
    const wanted = new Set([
      "security_level",
      "always_use_https",
      "automatic_https_rewrites",
      "min_tls_version",
      "ssl",
      "browser_check",
      "challenge_ttl",
      "development_mode",
      "opportunistic_encryption",
      "http3",
      "brotli",
      "waf",
    ]);
    return {
      ok: true,
      settings: res.result
        .filter((s) => wanted.has(s.id))
        .map((s) => ({ id: s.id, value: s.value, editable: s.editable !== false })),
    };
  },
);

export const setCloudflareSetting = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({ id: z.string().min(1), value: z.union([z.string(), z.boolean(), z.number()]) })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const res = await cf(`/zones/{zone}/settings/${encodeURIComponent(data.id)}`, {
      method: "PATCH",
      body: { value: data.value },
    });
    return { ok: res.ok, message: res.message };
  });

export const getBotFightMode = createServerFn({ method: "GET" }).handler(async () => {
  const res = await cf<{ fight_mode?: boolean }>("/zones/{zone}/bot_management");
  return { ok: res.ok, message: res.message, enabled: Boolean(res.result?.fight_mode) };
});

export const setBotFightMode = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ enabled: z.boolean() }).parse(d))
  .handler(async ({ data }) => {
    const res = await cf("/zones/{zone}/bot_management", {
      method: "PUT",
      body: { fight_mode: data.enabled },
    });
    return { ok: res.ok, message: res.message };
  });

interface CfRuleset {
  id: string;
  phase: string;
  rules?: CfRule[];
}

async function customFirewallRuleset() {
  const list = await cf<CfRuleset[]>("/zones/{zone}/rulesets");
  if (!list.ok || !list.result) return { ok: false as const, message: list.message };
  const entry = list.result.find((r) => r.phase === "http_request_firewall_custom");
  if (!entry) return { ok: false as const, message: "No custom firewall ruleset on this zone." };
  const full = await cf<CfRuleset>(`/zones/{zone}/rulesets/${entry.id}`);
  if (!full.ok || !full.result) return { ok: false as const, message: full.message };
  return { ok: true as const, ruleset: full.result };
}

export const listFirewallRules = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ ok: boolean; message?: string; rulesetId?: string; rules: CfRule[] }> => {
    const res = await customFirewallRuleset();
    if (!res.ok) return { ok: false, message: res.message, rules: [] };
    return {
      ok: true,
      rulesetId: res.ruleset.id,
      rules: (res.ruleset.rules ?? []).map((r) => ({
        id: r.id,
        description: r.description || "(no description)",
        expression: r.expression,
        action: r.action,
        enabled: r.enabled !== false,
      })),
    };
  },
);

export const createFirewallRule = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        description: z.string().min(1).max(120),
        expression: z.string().min(3).max(1000),
        action: z.enum(["block", "challenge", "managed_challenge", "js_challenge", "log", "skip"]),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const res = await customFirewallRuleset();
    if (!res.ok) return { ok: false, message: res.message };
    const created = await cf(`/zones/{zone}/rulesets/${res.ruleset.id}/rules`, {
      method: "POST",
      body: { ...data, enabled: true },
    });
    return { ok: created.ok, message: created.message };
  });

export const toggleFirewallRule = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({ rulesetId: z.string().min(1), ruleId: z.string().min(1), enabled: z.boolean() })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const res = await cf(`/zones/{zone}/rulesets/${data.rulesetId}/rules/${data.ruleId}`, {
      method: "PATCH",
      body: { enabled: data.enabled },
    });
    return { ok: res.ok, message: res.message };
  });

export const deleteFirewallRule = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({ rulesetId: z.string().min(1), ruleId: z.string().min(1) }).parse(d),
  )
  .handler(async ({ data }) => {
    const res = await cf(`/zones/{zone}/rulesets/${data.rulesetId}/rules/${data.ruleId}`, {
      method: "DELETE",
    });
    return { ok: res.ok, message: res.message };
  });

export const purgeCloudflareCache = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        mode: z.enum(["everything", "files", "prefixes", "tags"]),
        values: z.array(z.string().min(1)).max(30).default([]),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const body =
      data.mode === "everything"
        ? { purge_everything: true }
        : data.mode === "files"
          ? { files: data.values }
          : data.mode === "prefixes"
            ? { prefixes: data.values }
            : { tags: data.values };
    const res = await cf("/zones/{zone}/purge_cache", { method: "POST", body });
    return { ok: res.ok, message: res.message };
  });

/** Zone analytics for the last 24 hours, bucketed hourly. */
export const getCloudflareAnalytics = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ ok: boolean; message?: string; points: CfAnalyticsPoint[] }> => {
    const res = await cf<{
      timeseries?: {
        since: string;
        requests: { all: number };
        threats: { all: number };
        bandwidth: { all: number };
      }[];
    }>("/zones/{zone}/analytics/dashboard?since=-1440&continuous=true");
    if (!res.ok || !res.result?.timeseries) {
      return {
        ok: false,
        message: res.message ?? "Zone analytics is not available on this plan.",
        points: [],
      };
    }
    return {
      ok: true,
      points: res.result.timeseries.map((t) => ({
        label: new Date(t.since).toISOString().slice(11, 16),
        requests: t.requests.all,
        threats: t.threats.all,
        bandwidth: t.bandwidth.all,
      })),
    };
  },
);

/* ------------------------------------------------------------------ */
/* Site security posture (hosting API, with sample fallback)           */
/* ------------------------------------------------------------------ */

export interface SecurityCheck {
  id: string;
  label: string;
  status: "pass" | "warn" | "fail";
  detail: string;
}

export interface SecurityEvent {
  id: string;
  at: string;
  kind: string;
  ip: string;
  detail: string;
}

export interface SecurityPosture {
  checks: SecurityCheck[];
  events: SecurityEvent[];
  blockedRequests24h: number;
  failedLogins24h: number;
}

const SAMPLE_POSTURE: SecurityPosture = {
  blockedRequests24h: 128,
  failedLogins24h: 9,
  checks: [
    { id: "ssl", label: "HTTPS certificate", status: "pass", detail: "Valid, expires in 62 days." },
    { id: "hsts", label: "HSTS header", status: "warn", detail: "Not sent on all responses." },
    { id: "csp", label: "Content-Security-Policy", status: "fail", detail: "Header missing." },
    { id: "xfo", label: "X-Frame-Options", status: "pass", detail: "SAMEORIGIN." },
    { id: "perms", label: "File permissions", status: "pass", detail: "No world-writable files." },
    {
      id: "integrity",
      label: "Core file integrity",
      status: "pass",
      detail: "No changes detected.",
    },
  ],
  events: [
    {
      id: "e1",
      at: "10:22",
      kind: "Blocked",
      ip: "198.51.100.24",
      detail: "SQL injection pattern",
    },
    {
      id: "e2",
      at: "09:58",
      kind: "Failed login",
      ip: "203.0.113.9",
      detail: "admin — 5 attempts",
    },
    {
      id: "e3",
      at: "08:14",
      kind: "Rate limited",
      ip: "192.0.2.77",
      detail: "120 req/min on /admin",
    },
  ],
};

export const getSecurityPosture = createServerFn({ method: "GET" }).handler(
  async (): Promise<ProviderResult<SecurityPosture>> => {
    const live = await hostingRequest<SecurityPosture>("/security/posture");
    if (live?.connected) return live;
    return mock(SAMPLE_POSTURE, live?.message ?? "Sample data — hosting API not connected.");
  },
);

export const saveSecurityControls = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        rateLimitEnabled: z.boolean(),
        rateLimitPerMinute: z.number().int().min(10).max(1000),
        twoFactorRequired: z.boolean(),
        allowList: z.array(z.string().max(64)).max(100),
        denyList: z.array(z.string().max(64)).max(100),
        headers: z.object({ hsts: z.boolean(), csp: z.boolean(), xfo: z.boolean() }),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const live = await hostingRequest<{ saved: boolean }>("/security/controls", {
      method: "POST",
      body: data,
    });
    if (live?.connected) return { ok: true, persisted: true as const };
    return { ok: true, persisted: false as const, message: live?.message };
  });
