import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Copy, ExternalLink, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PartBlock, SiteFooter, SiteHeader, themeScopeProps } from "@/components/site/SiteChrome";
import { LiveEditProvider } from "@/components/site/live-edit";
import { ScreenMeta } from "@/components/cms/ScreenMeta";
import { useCmsPages } from "@/hooks/use-cms-pages";
import { useThemeConfig } from "@/hooks/use-theme-config";
import {
  DEFAULT_PART_TIER,
  DEVICE_WIDTH,
  DEVICES,
  uid,
  type Device,
  type ThemeConfig,
} from "@/lib/cms/theme";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_admin/admin/theme-parts")({
  head: () => ({
    meta: [
      { title: "Theme Parts — Techtrick CMS" },
      {
        name: "description",
        content:
          "Reusable header, footer and content templates you can edit live on the front end of your site.",
      },
      { property: "og:title", content: "Theme Parts — Techtrick CMS" },
      {
        property: "og:description",
        content: "Manage reusable site templates and edit their text directly in the preview.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ThemePartsScreen,
});

const card = "rounded border border-tt-border bg-tt-surface";
const input =
  "w-full rounded border border-tt-border bg-tt-surface px-2 py-1.5 text-[13px] text-tt-text";
const smallBtn =
  "inline-flex items-center gap-1 rounded border border-tt-border px-2 py-1 text-[12px] text-tt-blue hover:bg-tt-body";

type Selected = "header" | "footer" | string;

function ThemePartsScreen() {
  const { theme, update } = useThemeConfig();
  const { pages } = useCmsPages();
  const [selected, setSelected] = useState<Selected>("header");
  const [device, setDevice] = useState<Device>("desktop");

  const part = theme.parts.find((p) => p.id === selected);
  const scope = themeScopeProps(theme, device);

  const setPart = (id: string, patch: Partial<ThemeConfig["parts"][number]>) =>
    update((p) => ({ ...p, parts: p.parts.map((x) => (x.id === id ? { ...x, ...patch } : x)) }));

  const addPart = () => {
    const id = uid("part");
    update((p) => ({
      ...p,
      parts: [
        ...p.parts,
        {
          id,
          label: "New template",
          description: "Reusable content block.",
          enabled: true,
          heading: "Heading",
          body: "Body copy",
          tiers: { desktop: DEFAULT_PART_TIER, tablet: {}, mobile: {} },
        },
      ],
    }));
    setSelected(id);
    toast.success("Template created.");
  };

  const duplicatePart = (id: string) => {
    const source = theme.parts.find((p) => p.id === id);
    if (!source) return;
    const copyId = uid("part");
    update((p) => ({
      ...p,
      parts: [...p.parts, { ...source, id: copyId, label: `${source.label} copy` }],
    }));
    setSelected(copyId);
    toast.success("Template duplicated.");
  };

  const removePart = (id: string) => {
    update((p) => ({ ...p, parts: p.parts.filter((x) => x.id !== id) }));
    setSelected("header");
    toast.success("Template removed.");
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
                Every header, footer and content block is a reusable template. Pick one on the left,
                then click its text in the preview to edit it in place — the change is applied to
                the live site immediately.
              </p>
            ),
          },
        ]}
      />

      <div className="mt-1 mb-3 flex flex-wrap items-center gap-2">
        <h1 className="text-[23px] leading-[1.3] font-normal text-tt-text">Theme Parts</h1>
        <a
          href="/site?edit=1"
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-[26px] items-center gap-1 rounded border border-tt-blue px-2 text-[13px] text-tt-blue hover:bg-tt-blue hover:text-tt-menu-text"
        >
          <ExternalLink size={13} /> Edit on the live site
        </a>
      </div>

      <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
        {/* Template library */}
        <div className={card}>
          <div className="border-b border-tt-border px-3 py-2 text-[12px] font-semibold text-tt-text">
            Templates
          </div>
          <ul className="p-2">
            {(
              [
                ["header", "Header", "Shown at the top of every page."],
                ["footer", "Footer", "Shown at the bottom of every page."],
              ] as const
            ).map(([id, title, note]) => (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => setSelected(id)}
                  aria-pressed={selected === id}
                  className={cn(
                    "min-h-11 w-full rounded px-2 py-2 text-left",
                    selected === id ? "bg-tt-body" : "hover:bg-tt-body",
                  )}
                >
                  <span className="block text-[13px] font-semibold text-tt-text">{title}</span>
                  <span className="block text-[12px] text-tt-muted">{note}</span>
                </button>
              </li>
            ))}
            {theme.parts.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => setSelected(p.id)}
                  aria-pressed={selected === p.id}
                  className={cn(
                    "min-h-11 w-full rounded px-2 py-2 text-left",
                    selected === p.id ? "bg-tt-body" : "hover:bg-tt-body",
                  )}
                >
                  <span className="flex items-center gap-2 text-[13px] font-semibold text-tt-text">
                    {p.label}
                    <span
                      className={cn(
                        "rounded border px-1 text-[11px] font-normal",
                        p.enabled
                          ? "border-tt-green text-tt-green"
                          : "border-tt-border text-tt-muted",
                      )}
                    >
                      {p.enabled ? "Active" : "Off"}
                    </span>
                  </span>
                  <span className="block text-[12px] text-tt-muted">
                    {p.description ?? "Reusable content block."}
                  </span>
                </button>
              </li>
            ))}
            <li className="px-2 pt-2">
              <button type="button" className={smallBtn} onClick={addPart}>
                <Plus size={13} /> New template
              </button>
            </li>
          </ul>
        </div>

        {/* Editor + live preview */}
        <div className="space-y-4">
          <div className={cn(card, "space-y-3 p-3")}>
            {selected === "header" && (
              <p className="text-[13px] text-tt-muted">
                The header template is reused on every page. Click the logo text or tagline in the
                preview below to rename it.
              </p>
            )}
            {selected === "footer" && (
              <p className="text-[13px] text-tt-muted">
                The footer template is reused on every page. Click the footer heading, about text or
                copyright line in the preview to edit them.
              </p>
            )}
            {part && (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    aria-label="Template name"
                    className={cn(input, "max-w-[240px]")}
                    value={part.label}
                    onChange={(e) => setPart(part.id, { label: e.target.value })}
                  />
                  <label className="flex items-center gap-2 text-[13px] text-tt-text">
                    <input
                      type="checkbox"
                      checked={part.enabled}
                      onChange={(e) => setPart(part.id, { enabled: e.target.checked })}
                    />
                    Active on the site
                  </label>
                  <div className="ml-auto flex gap-1">
                    <button
                      type="button"
                      className={smallBtn}
                      onClick={() => duplicatePart(part.id)}
                    >
                      <Copy size={13} /> Duplicate
                    </button>
                    <button
                      type="button"
                      onClick={() => removePart(part.id)}
                      className="inline-flex items-center gap-1 rounded border border-tt-border px-2 py-1 text-[12px] text-tt-red hover:bg-tt-body"
                    >
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                </div>
                <input
                  aria-label="Where this template is used"
                  className={input}
                  placeholder="Where is this template used?"
                  value={part.description ?? ""}
                  onChange={(e) => setPart(part.id, { description: e.target.value })}
                />
              </>
            )}
          </div>

          <div className="rounded border border-tt-border bg-tt-body">
            <div className="flex items-center gap-2 border-b border-tt-border bg-tt-surface px-3 py-2">
              <span className="text-[12px] font-semibold text-tt-text">
                Live template — click text to edit
              </span>
              <div className="ml-auto flex gap-1">
                {DEVICES.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDevice(d)}
                    aria-pressed={device === d}
                    className={cn(
                      "rounded border px-2 py-1 text-[12px] capitalize",
                      device === d
                        ? "border-tt-blue text-tt-blue"
                        : "border-tt-border text-tt-muted",
                    )}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
            <div className="overflow-x-auto p-3">
              <LiveEditProvider editing update={update}>
                <div
                  {...scope}
                  style={{ ...scope.style, width: DEVICE_WIDTH[device] }}
                  className="mx-auto overflow-hidden rounded border border-tt-border bg-tt-surface font-tt"
                >
                  {selected === "header" && <SiteHeader theme={theme} inert />}
                  {selected === "footer" && <SiteFooter theme={theme} pages={pages} inert />}
                  {part && (
                    <div className="p-3">
                      {part.enabled ? (
                        <PartBlock part={part} />
                      ) : (
                        <p className="text-[13px] text-tt-muted">
                          This template is turned off, so it is hidden on the site. Turn it on to
                          preview it.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </LiveEditProvider>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
