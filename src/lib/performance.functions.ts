import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { hostingRequest, mock, type ProviderResult } from "@/lib/cms/provider";

/* ------------------------------------------------------------------ */
/* PageSpeed Insights                                                  */
/* ------------------------------------------------------------------ */

export type Strategy = "mobile" | "desktop";

export interface Vital {
  id: string;
  label: string;
  display: string;
  score: number | null;
}

export interface Opportunity {
  id: string;
  title: string;
  description: string;
  savingsMs: number;
  savingsBytes: number;
}

export interface HeavyResource {
  url: string;
  type: string;
  transferBytes: number;
  loadMs: number;
}

export interface SpeedReport {
  ok: boolean;
  message?: string;
  url: string;
  strategy: Strategy;
  fetchedAt: string;
  performanceScore: number | null;
  vitals: Vital[];
  opportunities: Opportunity[];
  resources: HeavyResource[];
}

const VITALS: { id: string; label: string }[] = [
  { id: "largest-contentful-paint", label: "Largest Contentful Paint" },
  { id: "first-contentful-paint", label: "First Contentful Paint" },
  { id: "cumulative-layout-shift", label: "Cumulative Layout Shift" },
  { id: "total-blocking-time", label: "Total Blocking Time" },
  { id: "speed-index", label: "Speed Index" },
  { id: "interactive", label: "Time to Interactive" },
];

interface PsiAudit {
  id?: string;
  title?: string;
  description?: string;
  score?: number | null;
  displayValue?: string;
  details?: {
    overallSavingsMs?: number;
    overallSavingsBytes?: number;
    items?: Record<string, unknown>[];
  };
}

interface PsiResponse {
  lighthouseResult?: {
    categories?: { performance?: { score?: number } };
    audits?: Record<string, PsiAudit>;
  };
  error?: { message?: string };
}

function emptyReport(url: string, strategy: Strategy, message: string): SpeedReport {
  return {
    ok: false,
    message,
    url,
    strategy,
    fetchedAt: new Date().toISOString(),
    performanceScore: null,
    vitals: [],
    opportunities: [],
    resources: [],
  };
}

/** Run a real PageSpeed Insights audit. The API key is optional but avoids rate limits. */
export const runSpeedTest = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        url: z.string().url().max(500),
        strategy: z.enum(["mobile", "desktop"]),
      })
      .parse(d),
  )
  .handler(async ({ data }): Promise<SpeedReport> => {
    const key = process.env["PAGESPEED_API_KEY"];
    const params = new URLSearchParams({
      url: data.url,
      strategy: data.strategy,
      category: "performance",
    });
    if (key) params.set("key", key);

    let json: PsiResponse;
    try {
      const res = await fetch(
        `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?${params.toString()}`,
      );
      json = (await res.json()) as PsiResponse;
      if (!res.ok) {
        return emptyReport(
          data.url,
          data.strategy,
          json.error?.message ?? `PageSpeed returned ${res.status}.`,
        );
      }
    } catch {
      return emptyReport(data.url, data.strategy, "Could not reach the PageSpeed API.");
    }

    const audits = json.lighthouseResult?.audits ?? {};

    const vitals: Vital[] = VITALS.map((v) => ({
      id: v.id,
      label: v.label,
      display: audits[v.id]?.displayValue ?? "—",
      score: audits[v.id]?.score ?? null,
    }));

    const opportunities: Opportunity[] = Object.values(audits)
      .filter(
        (a) => (a.details?.overallSavingsMs ?? 0) > 0 || (a.details?.overallSavingsBytes ?? 0) > 0,
      )
      .map((a) => ({
        id: a.id ?? a.title ?? "audit",
        title: a.title ?? "Opportunity",
        description: (a.description ?? "").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1"),
        savingsMs: Math.round(a.details?.overallSavingsMs ?? 0),
        savingsBytes: Math.round(a.details?.overallSavingsBytes ?? 0),
      }))
      .sort((a, b) => b.savingsMs - a.savingsMs || b.savingsBytes - a.savingsBytes)
      .slice(0, 10);

    const items = (audits["network-requests"]?.details?.items ?? []) as Record<string, unknown>[];
    const resources: HeavyResource[] = items
      .map((i) => ({
        url: String(i["url"] ?? ""),
        type: String(i["resourceType"] ?? "other").toLowerCase(),
        transferBytes: Number(i["transferSize"] ?? 0),
        loadMs: Math.round(Number(i["endTime"] ?? 0) - Number(i["startTime"] ?? 0)),
      }))
      .sort((a, b) => b.transferBytes - a.transferBytes)
      .slice(0, 12);

    const score = json.lighthouseResult?.categories?.performance?.score;

    return {
      ok: true,
      url: data.url,
      strategy: data.strategy,
      fetchedAt: new Date().toISOString(),
      performanceScore: typeof score === "number" ? Math.round(score * 100) : null,
      vitals,
      opportunities,
      resources,
    };
  });

/* ------------------------------------------------------------------ */
/* Optimizer tools (hosting API, with sample fallback)                 */
/* ------------------------------------------------------------------ */

export interface ImageIssue {
  path: string;
  bytes: number;
  width: number;
  height: number;
  reason: string;
}

export interface DbTable {
  name: string;
  rows: number;
  bytes: number;
  overheadBytes: number;
}

export interface CleanupItem {
  path: string;
  bytes: number;
  kind: string;
}

const SAMPLE_IMAGES: ImageIssue[] = [
  {
    path: "/uploads/2026/01/hero-original.jpg",
    bytes: 2_450_000,
    width: 4032,
    height: 3024,
    reason: "Oversized for its largest display size",
  },
  {
    path: "/uploads/2026/02/team.png",
    bytes: 1_180_000,
    width: 1600,
    height: 900,
    reason: "PNG that would be smaller as WebP",
  },
  {
    path: "/uploads/2025/11/banner.jpg",
    bytes: 860_000,
    width: 2400,
    height: 800,
    reason: "No AVIF/WebP variant generated",
  },
];

const SAMPLE_TABLES: DbTable[] = [
  { name: "posts", rows: 1_284, bytes: 18_400_000, overheadBytes: 1_200_000 },
  { name: "postmeta", rows: 42_910, bytes: 64_100_000, overheadBytes: 8_900_000 },
  { name: "options", rows: 3_205, bytes: 7_600_000, overheadBytes: 2_400_000 },
  { name: "comments", rows: 6_112, bytes: 5_100_000, overheadBytes: 240_000 },
];

const SAMPLE_FILES: CleanupItem[] = [
  { path: "/uploads/orphaned/tmp-3921.jpg", bytes: 420_000, kind: "Orphaned upload" },
  { path: "/logs/debug-2025-12.log", bytes: 9_800_000, kind: "Stale log" },
  { path: "/cache/tmp/", bytes: 31_400_000, kind: "Temp files" },
];

export const getImageAudit = createServerFn({ method: "GET" }).handler(
  async (): Promise<ProviderResult<ImageIssue[]>> => {
    const live = await hostingRequest<ImageIssue[]>("/optimizer/images");
    if (live?.connected) return live;
    return mock(SAMPLE_IMAGES, live?.message);
  },
);

export const optimizeImages = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({ paths: z.array(z.string().min(1)).max(200), dryRun: z.boolean() }).parse(d),
  )
  .handler(async ({ data }) => {
    const live = await hostingRequest<{ converted: number; savedBytes: number }>(
      "/optimizer/images/convert",
      { method: "POST", body: data },
    );
    if (live?.connected) return { ok: true, persisted: true as const, ...live.data };
    return {
      ok: true,
      persisted: false as const,
      converted: data.paths.length,
      savedBytes: data.paths.length * 380_000,
      message: live?.message,
    };
  });

export const getDatabaseTables = createServerFn({ method: "GET" }).handler(
  async (): Promise<ProviderResult<DbTable[]>> => {
    const live = await hostingRequest<DbTable[]>("/optimizer/database/tables");
    if (live?.connected) return live;
    return mock(SAMPLE_TABLES, live?.message);
  },
);

export const runDatabaseAction = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        action: z.enum([
          "optimize",
          "repair",
          "clean-revisions",
          "clean-transients",
          "clean-orphans",
        ]),
        tables: z.array(z.string().min(1)).max(200).default([]),
        dryRun: z.boolean(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const live = await hostingRequest<{ affected: number; freedBytes: number }>(
      "/optimizer/database/run",
      { method: "POST", body: data },
    );
    if (live?.connected) return { ok: true, persisted: true as const, ...live.data };
    return {
      ok: true,
      persisted: false as const,
      affected: data.tables.length || 4,
      freedBytes: 12_700_000,
      message: live?.message,
    };
  });

export const getCleanupItems = createServerFn({ method: "GET" }).handler(
  async (): Promise<ProviderResult<CleanupItem[]>> => {
    const live = await hostingRequest<CleanupItem[]>("/optimizer/files");
    if (live?.connected) return live;
    return mock(SAMPLE_FILES, live?.message);
  },
);

export const runFileCleanup = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({ paths: z.array(z.string().min(1)).max(500), dryRun: z.boolean() }).parse(d),
  )
  .handler(async ({ data }) => {
    const live = await hostingRequest<{ removed: number; freedBytes: number }>(
      "/optimizer/files/clean",
      { method: "POST", body: data },
    );
    if (live?.connected) return { ok: true, persisted: true as const, ...live.data };
    return {
      ok: true,
      persisted: false as const,
      removed: data.paths.length,
      freedBytes: data.paths.length * 1_200_000,
      message: live?.message,
    };
  });

export const purgeSiteCache = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({ urls: z.array(z.string().min(1)).max(50).default([]) }).parse(d),
  )
  .handler(async ({ data }) => {
    const live = await hostingRequest<{ purged: number }>("/optimizer/cache/purge", {
      method: "POST",
      body: data,
    });
    if (live?.connected) return { ok: true, persisted: true as const, purged: live.data.purged };
    return {
      ok: true,
      persisted: false as const,
      purged: data.urls.length,
      message: live?.message,
    };
  });
