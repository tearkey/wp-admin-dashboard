import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ScreenMeta } from "@/components/cms/ScreenMeta";
import { useRole } from "@/hooks/use-role";
import {
  createFirewallRule,
  deleteFirewallRule,
  getBotFightMode,
  getCloudflareAnalytics,
  getCloudflareSettings,
  getCloudflareStatus,
  listFirewallRules,
  purgeCloudflareCache,
  setBotFightMode,
  setCloudflareSetting,
  toggleFirewallRule,
} from "@/lib/security.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_admin/admin/security/cloudflare")({
  head: () => ({
    meta: [
      { title: "Cloudflare — Techtrick CMS Security" },
      {
        name: "description",
        content:
          "Manage your Cloudflare zone: analytics, firewall rules, security level, bot protection and cache purging.",
      },
      { property: "og:title", content: "Cloudflare — Techtrick CMS Security" },
      {
        property: "og:description",
        content: "Zone analytics, WAF rules and cache purge from the CMS admin.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CloudflareScreen,
});

const card = "rounded border border-tt-border bg-tt-surface p-3";
const input =
  "w-full rounded border border-tt-border bg-tt-surface px-2 py-1.5 text-[13px] text-tt-text";
const label = "block text-[12px] font-semibold text-tt-text";
const btn = "h-[30px] rounded bg-tt-blue px-3 text-[13px] text-tt-menu-text disabled:opacity-50";
const ghostBtn =
  "inline-flex h-[26px] items-center gap-1 rounded border border-tt-border px-2 text-[12px] text-tt-blue hover:bg-tt-body";

const ACTIONS = ["block", "managed_challenge", "challenge", "js_challenge", "log", "skip"] as const;

function CloudflareScreen() {
  const { isSuperadmin } = useRole();
  const qc = useQueryClient();

  const status = useServerFn(getCloudflareStatus);
  const analytics = useServerFn(getCloudflareAnalytics);
  const settings = useServerFn(getCloudflareSettings);
  const rules = useServerFn(listFirewallRules);
  const bot = useServerFn(getBotFightMode);
  const saveSetting = useServerFn(setCloudflareSetting);
  const saveBot = useServerFn(setBotFightMode);
  const addRule = useServerFn(createFirewallRule);
  const flipRule = useServerFn(toggleFirewallRule);
  const dropRule = useServerFn(deleteFirewallRule);
  const purge = useServerFn(purgeCloudflareCache);

  const statusQ = useQuery({ queryKey: ["cf", "status"], queryFn: () => status() });
  const connected = statusQ.data?.ok === true;

  const analyticsQ = useQuery({
    queryKey: ["cf", "analytics"],
    queryFn: () => analytics(),
    enabled: connected,
  });
  const settingsQ = useQuery({
    queryKey: ["cf", "settings"],
    queryFn: () => settings(),
    enabled: connected,
  });
  const rulesQ = useQuery({
    queryKey: ["cf", "rules"],
    queryFn: () => rules(),
    enabled: connected,
  });
  const botQ = useQuery({ queryKey: ["cf", "bot"], queryFn: () => bot(), enabled: connected });

  const [newRule, setNewRule] = useState({
    description: "",
    expression: '(http.request.uri.path contains "/admin")',
    action: "managed_challenge" as (typeof ACTIONS)[number],
  });
  const [purgeMode, setPurgeMode] = useState<"everything" | "files" | "prefixes" | "tags">("files");
  const [purgeValues, setPurgeValues] = useState("");

  const settingMutation = useMutation({
    mutationFn: (v: { id: string; value: string | boolean }) => saveSetting({ data: v }),
    onSuccess: (res) => {
      if (res.ok) {
        toast.success("Cloudflare setting updated.");
        void qc.invalidateQueries({ queryKey: ["cf", "settings"] });
      } else toast.error(res.message ?? "Cloudflare rejected the change.");
    },
  });

  const settingValue = (id: string) => settingsQ.data?.settings.find((s) => s.id === id)?.value;

  const doPurge = async () => {
    const values = purgeValues.split("\n").map((s) => s.trim()).filter(Boolean);
    const res = await purge({ data: { mode: purgeMode, values } });
    if (res.ok) toast.success("Cache purge requested.");
    else toast.error(res.message ?? "Purge failed.");
  };

  return (
    <div className="px-3 pt-2 pb-10 sm:px-5">
      <ScreenMeta
        helpTabs={[
          {
            id: "overview",
            label: "Overview",
            content: (
              <p>
                All Cloudflare calls run server-side with your API token; the token and zone ID are
                never sent to the browser. Add CLOUDFLARE_API_TOKEN and CLOUDFLARE_ZONE_ID to
                connect a zone.
              </p>
            ),
          },
        ]}
      />
      <div className="mt-1 mb-3 flex flex-wrap items-center gap-2">
        <h1 className="text-[23px] leading-[1.3] font-normal text-tt-text">Cloudflare</h1>
        <Link to="/admin/security" className={ghostBtn}>
          Back to Security
        </Link>
        <button
          type="button"
          className={ghostBtn}
          onClick={() => void qc.invalidateQueries({ queryKey: ["cf"] })}
        >
          <RefreshCw size={13} /> Test connection
        </button>
      </div>

      <div
        className={cn(
          "mb-3 rounded border p-2 text-[13px]",
          connected ? "border-tt-green text-tt-text" : "border-tt-orange text-tt-text",
        )}
      >
        {statusQ.isLoading && "Checking connection…"}
        {statusQ.data && connected && (
          <>
            Connected to <strong>{statusQ.data.zoneName}</strong> — plan {statusQ.data.plan ?? "—"},
            status {statusQ.data.status}.
          </>
        )}
        {statusQ.data && !connected && (
          <>
            Not connected. {statusQ.data.message} Calls are read-only until a valid token and zone
            ID are set.
          </>
        )}
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <section className={card}>
          <h2 className="mb-2 text-[15px] font-semibold text-tt-text">Traffic (last 24h)</h2>
          {!connected && <p className="text-[13px] text-tt-muted">Connect a zone to see traffic.</p>}
          {connected && analyticsQ.data && !analyticsQ.data.ok && (
            <p className="text-[13px] text-tt-muted">{analyticsQ.data.message}</p>
          )}
          {connected && analyticsQ.data?.ok && (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analyticsQ.data.points}>
                  <CartesianGrid stroke="var(--tt-border)" vertical={false} />
                  <XAxis dataKey="label" stroke="var(--tt-muted)" fontSize={11} />
                  <YAxis stroke="var(--tt-muted)" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--tt-surface)",
                      border: "1px solid var(--tt-border)",
                      fontSize: 12,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="requests"
                    stroke="var(--tt-blue)"
                    fill="var(--tt-blue)"
                    fillOpacity={0.15}
                  />
                  <Area
                    type="monotone"
                    dataKey="threats"
                    stroke="var(--tt-red)"
                    fill="var(--tt-red)"
                    fillOpacity={0.2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        <section className={card}>
          <h2 className="mb-2 text-[15px] font-semibold text-tt-text">Zone settings</h2>
          <fieldset disabled={!connected || !isSuperadmin} className="space-y-3">
            <div>
              <label className={label} htmlFor="seclevel">
                Security level
              </label>
              <select
                id="seclevel"
                className={input}
                value={String(settingValue("security_level") ?? "medium")}
                onChange={(e) =>
                  settingMutation.mutate({ id: "security_level", value: e.target.value })
                }
              >
                {["off", "essentially_off", "low", "medium", "high", "under_attack"].map((v) => (
                  <option key={v} value={v}>
                    {v.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>

            {(
              [
                ["always_use_https", "Always use HTTPS"],
                ["automatic_https_rewrites", "Automatic HTTPS rewrites"],
                ["browser_check", "Browser integrity check"],
                ["development_mode", "Development mode"],
                ["http3", "HTTP/3"],
                ["brotli", "Brotli compression"],
              ] as const
            ).map(([id, text]) => (
              <label key={id} className="flex items-center gap-2 text-[13px] text-tt-text">
                <input
                  type="checkbox"
                  checked={settingValue(id) === "on"}
                  onChange={(e) =>
                    settingMutation.mutate({ id, value: e.target.checked ? "on" : "off" })
                  }
                />
                {text}
              </label>
            ))}

            <label className="flex items-center gap-2 text-[13px] text-tt-text">
              <input
                type="checkbox"
                checked={Boolean(botQ.data?.enabled)}
                onChange={async (e) => {
                  const res = await saveBot({ data: { enabled: e.target.checked } });
                  if (res.ok) {
                    toast.success("Bot Fight Mode updated.");
                    void qc.invalidateQueries({ queryKey: ["cf", "bot"] });
                  } else toast.error(res.message ?? "Could not update Bot Fight Mode.");
                }}
              />
              Bot Fight Mode
            </label>
          </fieldset>
        </section>

        <section className={cn(card, "lg:col-span-2")}>
          <h2 className="mb-2 text-[15px] font-semibold text-tt-text">Firewall rules</h2>
          {!connected && <p className="text-[13px] text-tt-muted">Connect a zone to manage rules.</p>}
          {connected && rulesQ.data && !rulesQ.data.ok && (
            <p className="text-[13px] text-tt-muted">{rulesQ.data.message}</p>
          )}
          {connected && rulesQ.data?.ok && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-[13px]">
                <thead>
                  <tr className="border-b border-tt-border text-tt-muted">
                    <th className="py-1.5">Description</th>
                    <th>Expression</th>
                    <th>Action</th>
                    <th>Enabled</th>
                    <th aria-label="Row actions" />
                  </tr>
                </thead>
                <tbody>
                  {rulesQ.data.rules.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-2 text-tt-muted">
                        No custom rules yet.
                      </td>
                    </tr>
                  )}
                  {rulesQ.data.rules.map((r) => (
                    <tr key={r.id} className="border-b border-tt-border last:border-0">
                      <td className="py-1.5 text-tt-text">{r.description}</td>
                      <td className="max-w-[280px] truncate text-tt-muted">{r.expression}</td>
                      <td className="text-tt-muted">{r.action}</td>
                      <td>
                        <input
                          type="checkbox"
                          aria-label={`Enable ${r.description}`}
                          disabled={!isSuperadmin}
                          checked={r.enabled}
                          onChange={async (e) => {
                            const res = await flipRule({
                              data: {
                                rulesetId: rulesQ.data.rulesetId!,
                                ruleId: r.id,
                                enabled: e.target.checked,
                              },
                            });
                            if (res.ok) void qc.invalidateQueries({ queryKey: ["cf", "rules"] });
                            else toast.error(res.message ?? "Could not update the rule.");
                          }}
                        />
                      </td>
                      <td className="text-right">
                        <button
                          type="button"
                          disabled={!isSuperadmin}
                          className="inline-flex items-center gap-1 text-[12px] text-tt-red disabled:opacity-50"
                          onClick={async () => {
                            const res = await dropRule({
                              data: { rulesetId: rulesQ.data.rulesetId!, ruleId: r.id },
                            });
                            if (res.ok) {
                              toast.success("Rule deleted.");
                              void qc.invalidateQueries({ queryKey: ["cf", "rules"] });
                            } else toast.error(res.message ?? "Could not delete the rule.");
                          }}
                        >
                          <Trash2 size={13} /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <fieldset
            disabled={!connected || !isSuperadmin}
            className="mt-3 grid gap-2 sm:grid-cols-[1fr_2fr_auto_auto]"
          >
            <input
              aria-label="Rule description"
              placeholder="Description"
              className={input}
              value={newRule.description}
              onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
            />
            <input
              aria-label="Rule expression"
              placeholder="Expression"
              className={input}
              value={newRule.expression}
              onChange={(e) => setNewRule({ ...newRule, expression: e.target.value })}
            />
            <select
              aria-label="Rule action"
              className={input}
              value={newRule.action}
              onChange={(e) =>
                setNewRule({ ...newRule, action: e.target.value as (typeof ACTIONS)[number] })
              }
            >
              {ACTIONS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
            <button
              type="button"
              className={btn}
              onClick={async () => {
                const res = await addRule({ data: newRule });
                if (res.ok) {
                  toast.success("Rule created.");
                  setNewRule({ ...newRule, description: "" });
                  void qc.invalidateQueries({ queryKey: ["cf", "rules"] });
                } else toast.error(res.message ?? "Could not create the rule.");
              }}
            >
              <Plus size={13} className="mr-1 inline" />
              Add rule
            </button>
          </fieldset>
        </section>

        <section className={cn(card, "lg:col-span-2")}>
          <h2 className="mb-2 text-[15px] font-semibold text-tt-text">Cache purge</h2>
          <fieldset disabled={!connected || !isSuperadmin} className="grid gap-2 sm:grid-cols-2">
            <div>
              <label className={label} htmlFor="purge-mode">
                Purge type
              </label>
              <select
                id="purge-mode"
                className={input}
                value={purgeMode}
                onChange={(e) => setPurgeMode(e.target.value as typeof purgeMode)}
              >
                <option value="everything">Everything</option>
                <option value="files">By URL</option>
                <option value="prefixes">By prefix</option>
                <option value="tags">By cache tag</option>
              </select>
            </div>
            <div>
              <label className={label} htmlFor="purge-values">
                Values (one per line)
              </label>
              <textarea
                id="purge-values"
                rows={3}
                disabled={purgeMode === "everything"}
                className={input}
                value={purgeValues}
                onChange={(e) => setPurgeValues(e.target.value)}
              />
            </div>
            <button type="button" className={cn(btn, "w-fit")} onClick={doPurge}>
              Purge cache
            </button>
          </fieldset>
        </section>
      </div>
    </div>
  );
}
