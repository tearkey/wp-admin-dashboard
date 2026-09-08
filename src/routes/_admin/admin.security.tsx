import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Cloud, ShieldAlert, ShieldCheck, ShieldX } from "lucide-react";
import { toast } from "sonner";
import { ScreenMeta } from "@/components/cms/ScreenMeta";
import { useRole } from "@/hooks/use-role";
import { usePersistentState } from "@/hooks/use-persistent-state";
import { getSecurityPosture, saveSecurityControls } from "@/lib/security.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_admin/admin/security")({
  head: () => ({
    meta: [
      { title: "Security — Techtrick CMS" },
      {
        name: "description",
        content:
          "Site security posture, login protection, IP rules, security headers and Cloudflare controls.",
      },
      { property: "og:title", content: "Security — Techtrick CMS" },
      {
        property: "og:description",
        content: "Threat feed, hardening controls and Cloudflare zone management.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SecurityScreen,
});

const card = "rounded border border-tt-border bg-tt-surface p-3";
const input =
  "w-full rounded border border-tt-border bg-tt-surface px-2 py-1.5 text-[13px] text-tt-text";
const label = "block text-[12px] font-semibold text-tt-text";

interface Controls {
  rateLimitEnabled: boolean;
  rateLimitPerMinute: number;
  twoFactorRequired: boolean;
  allowList: string[];
  denyList: string[];
  headers: { hsts: boolean; csp: boolean; xfo: boolean };
}

const DEFAULT_CONTROLS: Controls = {
  rateLimitEnabled: true,
  rateLimitPerMinute: 60,
  twoFactorRequired: false,
  allowList: [],
  denyList: [],
  headers: { hsts: true, csp: false, xfo: true },
};

function SecurityScreen() {
  const { isSuperadmin } = useRole();
  const fetchPosture = useServerFn(getSecurityPosture);
  const save = useServerFn(saveSecurityControls);
  const [controls, setControls] = usePersistentState<Controls>(
    "security:controls",
    DEFAULT_CONTROLS,
  );
  const [allowText, setAllowText] = useState("");
  const [denyText, setDenyText] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setAllowText(controls.allowList.join("\n"));
    setDenyText(controls.denyList.join("\n"));
  }, [controls.allowList, controls.denyList]);

  const posture = useQuery({ queryKey: ["security", "posture"], queryFn: () => fetchPosture() });

  const onSave = async () => {
    const next: Controls = {
      ...controls,
      allowList: allowText
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      denyList: denyText
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
    };
    setControls(next);
    setSaving(true);
    try {
      const res = await save({ data: next });
      toast.success(
        res.persisted
          ? "Security settings saved to your hosting."
          : "Saved locally — connect the hosting API to apply them on the server.",
      );
    } catch {
      toast.error("Could not save security settings.");
    } finally {
      setSaving(false);
    }
  };

  const data = posture.data?.data;

  return (
    <div className="px-3 pt-2 pb-10 sm:px-5">
      <ScreenMeta
        helpTabs={[
          {
            id: "overview",
            label: "Overview",
            content: (
              <p>
                Review the security posture of the site, tighten login and header settings, and
                manage your Cloudflare zone. Checks and the event feed come from the hosting API
                when it is connected; otherwise sample data is shown.
              </p>
            ),
          },
        ]}
      />
      <div className="mt-1 mb-3 flex flex-wrap items-center gap-2">
        <h1 className="text-[23px] leading-[1.3] font-normal text-tt-text">Security</h1>
        <Link
          to="/admin/security/cloudflare"
          className="inline-flex h-[26px] items-center gap-1 rounded border border-tt-blue px-2 text-[13px] text-tt-blue hover:bg-tt-blue hover:text-tt-menu-text"
        >
          <Cloud size={14} /> Cloudflare
        </Link>
      </div>

      {posture.data && !posture.data.connected && (
        <p className="mb-3 rounded border border-tt-border bg-tt-body p-2 text-[12px] text-tt-muted">
          {posture.data.message} Set <code>CMS_API_BASE_URL</code> and <code>CMS_API_TOKEN</code> to
          show live data from your hosting.
        </p>
      )}

      <div className="grid gap-3 lg:grid-cols-2">
        <section className={card}>
          <h2 className="mb-2 text-[15px] font-semibold text-tt-text">Posture checks</h2>
          {posture.isLoading && <p className="text-[13px] text-tt-muted">Loading checks…</p>}
          {posture.isError && <p className="text-[13px] text-tt-red">Could not load checks.</p>}
          <ul className="space-y-1">
            {data?.checks.map((c) => {
              const Icon =
                c.status === "pass" ? ShieldCheck : c.status === "warn" ? ShieldAlert : ShieldX;
              return (
                <li
                  key={c.id}
                  className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 border-b border-tt-border py-1.5 last:border-0"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <Icon
                      size={16}
                      className={cn(
                        "shrink-0",
                        c.status === "pass"
                          ? "text-tt-green"
                          : c.status === "warn"
                            ? "text-tt-orange"
                            : "text-tt-red",
                      )}
                      aria-hidden="true"
                    />
                    <div className="min-w-0">
                      <div className="truncate text-[13px] text-tt-text">{c.label}</div>
                      <div className="truncate text-[12px] text-tt-muted">{c.detail}</div>
                    </div>
                  </div>
                  <span className="text-[12px] text-tt-muted uppercase">{c.status}</span>
                </li>
              );
            })}
          </ul>
        </section>

        <section className={card}>
          <h2 className="mb-2 text-[15px] font-semibold text-tt-text">Last 24 hours</h2>
          <div className="mb-3 grid grid-cols-2 gap-2">
            <div className="rounded border border-tt-border p-2">
              <div className="text-[20px] font-semibold text-tt-text">
                {data?.blockedRequests24h ?? "—"}
              </div>
              <div className="text-[12px] text-tt-muted">Blocked requests</div>
            </div>
            <div className="rounded border border-tt-border p-2">
              <div className="text-[20px] font-semibold text-tt-text">
                {data?.failedLogins24h ?? "—"}
              </div>
              <div className="text-[12px] text-tt-muted">Failed logins</div>
            </div>
          </div>
          <h3 className="mb-1 text-[13px] font-semibold text-tt-text">Event feed</h3>
          <ul className="space-y-1">
            {data?.events.length === 0 && (
              <li className="text-[13px] text-tt-muted">No events recorded.</li>
            )}
            {data?.events.map((e) => (
              <li key={e.id} className="border-b border-tt-border py-1.5 text-[13px] last:border-0">
                <span className="text-tt-muted">{e.at}</span>{" "}
                <span className="font-semibold text-tt-text">{e.kind}</span>{" "}
                <span className="text-tt-muted">
                  {e.ip} — {e.detail}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className={cn(card, "lg:col-span-2")}>
          <h2 className="mb-2 text-[15px] font-semibold text-tt-text">Hardening controls</h2>
          {!isSuperadmin && (
            <p className="mb-2 text-[12px] text-tt-orange">
              Only a superadmin can change these settings.
            </p>
          )}
          <fieldset disabled={!isSuperadmin} className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[13px] text-tt-text">
                <input
                  type="checkbox"
                  checked={controls.rateLimitEnabled}
                  onChange={(e) => setControls({ ...controls, rateLimitEnabled: e.target.checked })}
                />
                Rate-limit login attempts
              </label>
              <div>
                <label className={label} htmlFor="rl">
                  Requests per minute
                </label>
                <input
                  id="rl"
                  type="number"
                  min={10}
                  max={1000}
                  className={input}
                  value={controls.rateLimitPerMinute}
                  onChange={(e) =>
                    setControls({ ...controls, rateLimitPerMinute: Number(e.target.value) })
                  }
                />
              </div>
              <label className="flex items-center gap-2 text-[13px] text-tt-text">
                <input
                  type="checkbox"
                  checked={controls.twoFactorRequired}
                  onChange={(e) =>
                    setControls({ ...controls, twoFactorRequired: e.target.checked })
                  }
                />
                Require two-factor authentication
              </label>
              <div className="space-y-1">
                <span className={label}>Security headers</span>
                {(
                  [
                    ["hsts", "Strict-Transport-Security"],
                    ["csp", "Content-Security-Policy"],
                    ["xfo", "X-Frame-Options"],
                  ] as const
                ).map(([key, text]) => (
                  <label key={key} className="flex items-center gap-2 text-[13px] text-tt-text">
                    <input
                      type="checkbox"
                      checked={controls.headers[key]}
                      onChange={(e) =>
                        setControls({
                          ...controls,
                          headers: { ...controls.headers, [key]: e.target.checked },
                        })
                      }
                    />
                    {text}
                  </label>
                ))}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2">
              <div>
                <label className={label} htmlFor="allow">
                  IP allow list (one per line)
                </label>
                <textarea
                  id="allow"
                  rows={5}
                  className={input}
                  value={allowText}
                  onChange={(e) => setAllowText(e.target.value)}
                />
              </div>
              <div>
                <label className={label} htmlFor="deny">
                  IP deny list (one per line)
                </label>
                <textarea
                  id="deny"
                  rows={5}
                  className={input}
                  value={denyText}
                  onChange={(e) => setDenyText(e.target.value)}
                />
              </div>
            </div>
          </fieldset>
          <button
            type="button"
            disabled={!isSuperadmin || saving}
            onClick={onSave}
            className="mt-3 h-[30px] rounded bg-tt-blue px-3 text-[13px] text-tt-menu-text disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </section>
      </div>
    </div>
  );
}
