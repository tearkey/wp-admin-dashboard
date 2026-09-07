import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Gauge, Play } from "lucide-react";
import { toast } from "sonner";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ScreenMeta } from "@/components/cms/ScreenMeta";
import { usePersistentState } from "@/hooks/use-persistent-state";
import { useRole } from "@/hooks/use-role";
import {
  getCleanupItems,
  getDatabaseTables,
  getImageAudit,
  optimizeImages,
  purgeSiteCache,
  runDatabaseAction,
  runFileCleanup,
  runSpeedTest,
  type SpeedReport,
  type Strategy,
} from "@/lib/performance.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_admin/admin/tools/performance")({
  head: () => ({
    meta: [
      { title: "Performance & Optimizer — Techtrick CMS" },
      {
        name: "description",
        content:
          "Run real PageSpeed tests, review Core Web Vitals, optimise images, clean the database and purge caches.",
      },
      { property: "og:title", content: "Performance & Optimizer — Techtrick CMS" },
      {
        property: "og:description",
        content: "Speed tests, image optimisation, database tools and file cleanup.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PerformanceScreen,
});

const card = "rounded border border-tt-border bg-tt-surface p-3";
const input =
  "w-full rounded border border-tt-border bg-tt-surface px-2 py-1.5 text-[13px] text-tt-text";
const btn = "h-[30px] rounded bg-tt-blue px-3 text-[13px] text-tt-menu-text disabled:opacity-50";
const ghostBtn =
  "inline-flex h-[26px] items-center rounded border border-tt-border px-2 text-[12px] text-tt-blue hover:bg-tt-body disabled:opacity-50";

interface HistoryEntry {
  at: string;
  url: string;
  mobile: number | null;
  desktop: number | null;
}

const kb = (b: number) => `${(b / 1024).toFixed(0)} KB`;
const mb = (b: number) => `${(b / 1024 / 1024).toFixed(1)} MB`;

function scoreColor(score: number | null) {
  if (score === null) return "text-tt-muted";
  if (score >= 90) return "text-tt-green";
  if (score >= 50) return "text-tt-orange";
  return "text-tt-red";
}

function PerformanceScreen() {
  const { isSuperadmin } = useRole();
  const speedTest = useServerFn(runSpeedTest);
  const imagesFn = useServerFn(getImageAudit);
  const optimizeFn = useServerFn(optimizeImages);
  const tablesFn = useServerFn(getDatabaseTables);
  const dbActionFn = useServerFn(runDatabaseAction);
  const filesFn = useServerFn(getCleanupItems);
  const cleanFn = useServerFn(runFileCleanup);
  const purgeFn = useServerFn(purgeSiteCache);

  const [url, setUrl] = useState("https://techtrick-cms-dashboard.lovable.app/site");
  const [running, setRunning] = useState(false);
  const [reports, setReports] = useState<Record<Strategy, SpeedReport | null>>({
    mobile: null,
    desktop: null,
  });
  const [history, setHistory] = usePersistentState<HistoryEntry[]>("performance:history", []);
  const [dryRun, setDryRun] = useState(true);

  const imagesQ = useQuery({ queryKey: ["perf", "images"], queryFn: () => imagesFn() });
  const tablesQ = useQuery({ queryKey: ["perf", "tables"], queryFn: () => tablesFn() });
  const filesQ = useQuery({ queryKey: ["perf", "files"], queryFn: () => filesFn() });

  const runBoth = async () => {
    setRunning(true);
    try {
      const [mobile, desktop] = await Promise.all([
        speedTest({ data: { url, strategy: "mobile" as const } }),
        speedTest({ data: { url, strategy: "desktop" as const } }),
      ]);
      setReports({ mobile, desktop });
      if (!mobile.ok && !desktop.ok) {
        toast.error(mobile.message ?? "Speed test failed.");
      } else {
        toast.success("Speed test complete.");
        setHistory([
          ...history.slice(-19),
          {
            at: new Date().toISOString().slice(5, 16).replace("T", " "),
            url,
            mobile: mobile.performanceScore,
            desktop: desktop.performanceScore,
          },
        ]);
      }
    } catch {
      toast.error("Speed test failed.");
    } finally {
      setRunning(false);
    }
  };

  const active = reports.mobile ?? reports.desktop;

  return (
    <div className="px-3 pt-2 pb-10 sm:px-5">
      <ScreenMeta
        helpTabs={[
          {
            id: "overview",
            label: "Overview",
            content: (
              <p>
                Speed tests call the Google PageSpeed Insights API for real field and lab data. Add
                a PAGESPEED_API_KEY secret to avoid rate limits. Optimizer actions run against your
                hosting API; without it they report what would change.
              </p>
            ),
          },
        ]}
      />
      <div className="mt-1 mb-3 flex flex-wrap items-center gap-2">
        <h1 className="text-[23px] leading-[1.3] font-normal text-tt-text">
          Performance &amp; Optimizer
        </h1>
      </div>

      <section className={cn(card, "mb-3")}>
        <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
          <div>
            <label className="block text-[12px] font-semibold text-tt-text" htmlFor="perf-url">
              URL to test
            </label>
            <input
              id="perf-url"
              className={input}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
          <button type="button" className={btn} disabled={running} onClick={runBoth}>
            <Play size={13} className="mr-1 inline" />
            {running ? "Running…" : "Run mobile + desktop"}
          </button>
        </div>

        {active && !active.ok && (
          <p className="mt-2 text-[13px] text-tt-red">{active.message}</p>
        )}

        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {(["mobile", "desktop"] as Strategy[]).map((s) => {
            const r = reports[s];
            return (
              <div key={s} className="rounded border border-tt-border p-2">
                <div className="mb-2 flex items-center gap-2">
                  <Gauge size={15} className="text-tt-muted" aria-hidden="true" />
                  <span className="text-[13px] font-semibold text-tt-text capitalize">{s}</span>
                  <span className={cn("ml-auto text-[24px] font-semibold", scoreColor(r?.performanceScore ?? null))}>
                    {r?.performanceScore ?? "—"}
                  </span>
                </div>
                <ul className="grid grid-cols-2 gap-1">
                  {(r?.vitals ?? []).map((v) => (
                    <li key={v.id} className="rounded border border-tt-border p-1.5">
                      <div className="truncate text-[11px] text-tt-muted">{v.label}</div>
                      <div className={cn("text-[14px] font-semibold", scoreColor(v.score === null ? null : v.score * 100))}>
                        {v.display}
                      </div>
                    </li>
                  ))}
                  {!r && <li className="text-[13px] text-tt-muted">No run yet.</li>}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      <div className="grid gap-3 lg:grid-cols-2">
        <section className={card}>
          <h2 className="mb-2 text-[15px] font-semibold text-tt-text">Heaviest resources</h2>
          {!active?.resources.length && (
            <p className="text-[13px] text-tt-muted">Run a test to see resource weights.</p>
          )}
          {!!active?.resources.length && (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={active.resources.map((r) => ({
                    name: r.url.split("/").pop()?.slice(0, 22) || r.type,
                    kb: Math.round(r.transferBytes / 1024),
                    ms: r.loadMs,
                  }))}
                >
                  <CartesianGrid stroke="var(--tt-border)" horizontal={false} />
                  <XAxis type="number" stroke="var(--tt-muted)" fontSize={11} />
                  <YAxis type="category" dataKey="name" width={130} stroke="var(--tt-muted)" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--tt-surface)",
                      border: "1px solid var(--tt-border)",
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="kb" fill="var(--tt-blue)" name="KB transferred" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        <section className={card}>
          <h2 className="mb-2 text-[15px] font-semibold text-tt-text">Score history</h2>
          {history.length === 0 && (
            <p className="text-[13px] text-tt-muted">Past runs will appear here.</p>
          )}
          {history.length > 0 && (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={history}>
                  <CartesianGrid stroke="var(--tt-border)" vertical={false} />
                  <XAxis dataKey="at" stroke="var(--tt-muted)" fontSize={11} />
                  <YAxis domain={[0, 100]} stroke="var(--tt-muted)" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--tt-surface)",
                      border: "1px solid var(--tt-border)",
                      fontSize: 12,
                    }}
                  />
                  <Line type="monotone" dataKey="mobile" stroke="var(--tt-blue)" dot={false} />
                  <Line type="monotone" dataKey="desktop" stroke="var(--tt-green)" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        <section className={cn(card, "lg:col-span-2")}>
          <h2 className="mb-2 text-[15px] font-semibold text-tt-text">Opportunities</h2>
          {!active?.opportunities.length && (
            <p className="text-[13px] text-tt-muted">Run a test to see what to fix first.</p>
          )}
          <ul className="space-y-2">
            {active?.opportunities.map((o) => (
              <li key={o.id} className="rounded border border-tt-border p-2">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
                  <span className="truncate text-[13px] font-semibold text-tt-text">{o.title}</span>
                  <span className="text-[12px] text-tt-muted">
                    {o.savingsMs > 0 && `${o.savingsMs} ms`}
                    {o.savingsMs > 0 && o.savingsBytes > 0 && " · "}
                    {o.savingsBytes > 0 && kb(o.savingsBytes)}
                  </span>
                </div>
                <p className="mt-1 text-[12px] text-tt-muted">{o.description}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className={card}>
          <h2 className="mb-2 text-[15px] font-semibold text-tt-text">Image optimizer</h2>
          {imagesQ.data && !imagesQ.data.connected && (
            <p className="mb-2 text-[12px] text-tt-muted">{imagesQ.data.message}</p>
          )}
          <ul className="space-y-1">
            {imagesQ.data?.data.map((i) => (
              <li key={i.path} className="border-b border-tt-border py-1.5 last:border-0">
                <div className="truncate text-[13px] text-tt-text">{i.path}</div>
                <div className="text-[12px] text-tt-muted">
                  {mb(i.bytes)} · {i.width}×{i.height} · {i.reason}
                </div>
              </li>
            ))}
          </ul>
          <button
            type="button"
            disabled={!isSuperadmin}
            className={cn(ghostBtn, "mt-2")}
            onClick={async () => {
              const res = await optimizeFn({
                data: { paths: (imagesQ.data?.data ?? []).map((i) => i.path), dryRun },
              });
              toast.success(
                `${dryRun ? "Dry run: " : ""}${res.converted} images, ${mb(res.savedBytes)} saved${res.persisted ? "" : " (not applied — hosting API not connected)"}.`,
              );
            }}
          >
            Convert to WebP/AVIF
          </button>
        </section>

        <section className={card}>
          <h2 className="mb-2 text-[15px] font-semibold text-tt-text">Cache</h2>
          <p className="mb-2 text-[13px] text-tt-muted">
            Purge the site cache. Cloudflare edge cache is purged from the Security → Cloudflare
            screen.
          </p>
          <button
            type="button"
            disabled={!isSuperadmin}
            className={ghostBtn}
            onClick={async () => {
              const res = await purgeFn({ data: { urls: [] } });
              toast.success(
                res.persisted ? "Site cache purged." : "Hosting API not connected — nothing purged.",
              );
            }}
          >
            Purge site cache
          </button>
        </section>

        <section className={card}>
          <h2 className="mb-2 text-[15px] font-semibold text-tt-text">Database tools</h2>
          {tablesQ.data && !tablesQ.data.connected && (
            <p className="mb-2 text-[12px] text-tt-muted">{tablesQ.data.message}</p>
          )}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[380px] text-left text-[13px]">
              <thead>
                <tr className="border-b border-tt-border text-tt-muted">
                  <th className="py-1.5">Table</th>
                  <th>Rows</th>
                  <th>Size</th>
                  <th>Overhead</th>
                </tr>
              </thead>
              <tbody>
                {tablesQ.data?.data.map((t) => (
                  <tr key={t.name} className="border-b border-tt-border last:border-0">
                    <td className="py-1.5 text-tt-text">{t.name}</td>
                    <td className="text-tt-muted">{t.rows.toLocaleString()}</td>
                    <td className="text-tt-muted">{mb(t.bytes)}</td>
                    <td className="text-tt-muted">{mb(t.overheadBytes)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            {(
              [
                ["optimize", "Optimize tables"],
                ["repair", "Repair tables"],
                ["clean-revisions", "Clean revisions"],
                ["clean-transients", "Clean transients"],
                ["clean-orphans", "Clean orphaned rows"],
              ] as const
            ).map(([action, text]) => (
              <button
                key={action}
                type="button"
                disabled={!isSuperadmin}
                className={ghostBtn}
                onClick={async () => {
                  const res = await dbActionFn({
                    data: {
                      action,
                      tables: (tablesQ.data?.data ?? []).map((t) => t.name),
                      dryRun,
                    },
                  });
                  toast.success(
                    `${dryRun ? "Dry run: " : ""}${res.affected} tables, ${mb(res.freedBytes)} freed${res.persisted ? "" : " (not applied)"}.`,
                  );
                }}
              >
                {text}
              </button>
            ))}
          </div>
        </section>

        <section className={card}>
          <h2 className="mb-2 text-[15px] font-semibold text-tt-text">File cleanup</h2>
          {filesQ.data && !filesQ.data.connected && (
            <p className="mb-2 text-[12px] text-tt-muted">{filesQ.data.message}</p>
          )}
          <ul className="space-y-1">
            {filesQ.data?.data.map((f) => (
              <li key={f.path} className="border-b border-tt-border py-1.5 last:border-0">
                <div className="truncate text-[13px] text-tt-text">{f.path}</div>
                <div className="text-[12px] text-tt-muted">
                  {f.kind} · {mb(f.bytes)}
                </div>
              </li>
            ))}
          </ul>
          <button
            type="button"
            disabled={!isSuperadmin}
            className={cn(ghostBtn, "mt-2")}
            onClick={async () => {
              const res = await cleanFn({
                data: { paths: (filesQ.data?.data ?? []).map((f) => f.path), dryRun },
              });
              toast.success(
                `${dryRun ? "Dry run: " : ""}${res.removed} items, ${mb(res.freedBytes)} freed${res.persisted ? "" : " (not applied)"}.`,
              );
            }}
          >
            Clean up files
          </button>
        </section>

        <section className={cn(card, "lg:col-span-2")}>
          <label className="flex items-center gap-2 text-[13px] text-tt-text">
            <input type="checkbox" checked={dryRun} onChange={(e) => setDryRun(e.target.checked)} />
            Dry run — preview what each action would change without applying it
          </label>
          {!isSuperadmin && (
            <p className="mt-1 text-[12px] text-tt-orange">
              Destructive actions are limited to superadmins.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
