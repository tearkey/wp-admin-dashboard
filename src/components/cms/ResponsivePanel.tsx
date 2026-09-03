import type { ReactNode } from "react";
import { RotateCcw } from "lucide-react";
import {
  DEFAULT_FOOTER_TIER,
  DEFAULT_HEADER_TIER,
  DEFAULT_PART_TIER,
  resolveTier,
  type Device,
  type FooterTier,
  type HeaderTier,
  type PartTier,
  type ThemeConfig,
  type Tiers,
} from "@/lib/cms/theme";
import { cn } from "@/lib/utils";

const input =
  "w-full rounded border border-tt-border bg-tt-surface px-2 py-1 text-[13px] text-tt-text";
const rowLabel = "flex items-center gap-2 text-[12px] font-semibold text-tt-text";

type Rec = Record<string, unknown>;

interface FieldProps<T extends Rec> {
  tiers: Tiers<T>;
  device: Device;
  name: keyof T & string;
  label: string;
  onChange: (key: string, value: unknown | undefined) => void;
  render: (value: unknown, set: (v: unknown) => void) => ReactNode;
}

/** One setting row with an inherited badge + reset control on non-base tiers. */
function TierField<T extends Rec>({ tiers, device, name, label, onChange, render }: FieldProps<T>) {
  const effective = resolveTier(tiers, device) as Rec;
  const overridden =
    device !== "desktop" && Object.prototype.hasOwnProperty.call(tiers[device], name);

  return (
    <div className="space-y-1">
      <div className={rowLabel}>
        <span>{label}</span>
        {device !== "desktop" &&
          (overridden ? (
            <button
              type="button"
              onClick={() => onChange(name, undefined)}
              className="ml-auto inline-flex items-center gap-1 rounded border border-tt-border px-1.5 py-0.5 text-[11px] font-normal text-tt-blue hover:bg-tt-body"
            >
              <RotateCcw size={11} /> Reset to inherit
            </button>
          ) : (
            <span className="ml-auto rounded border border-tt-border px-1.5 py-0.5 text-[11px] font-normal text-tt-muted">
              Inherited
            </span>
          ))}
      </div>
      {render(effective[name], (v) => onChange(name, v))}
    </div>
  );
}

function NumberControl({
  value,
  set,
  min,
  max,
  step = 1,
  suffix,
}: {
  value: unknown;
  set: (v: unknown) => void;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        className={input}
        value={Number(value)}
        onChange={(e) => set(Number(e.target.value))}
      />
      {suffix && <span className="text-[12px] text-tt-muted">{suffix}</span>}
    </div>
  );
}

function SelectControl({
  value,
  set,
  options,
}: {
  value: unknown;
  set: (v: unknown) => void;
  options: readonly string[];
}) {
  return (
    <select className={input} value={String(value)} onChange={(e) => set(e.target.value)}>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

function ToggleControl({
  value,
  set,
  text,
}: {
  value: unknown;
  set: (v: unknown) => void;
  text: string;
}) {
  return (
    <label className="flex items-center gap-2 text-[13px] text-tt-text">
      <input type="checkbox" checked={Boolean(value)} onChange={(e) => set(e.target.checked)} />
      {text}
    </label>
  );
}

interface PanelProps {
  theme: ThemeConfig;
  update: (patch: (prev: ThemeConfig) => ThemeConfig) => void;
  device: Device;
}

function writeTier<T extends Rec>(tiers: Tiers<T>, device: Device, key: string, value: unknown) {
  if (device === "desktop") {
    return { ...tiers, desktop: { ...tiers.desktop, [key]: value } };
  }
  const next = { ...(tiers[device] as Rec) };
  if (value === undefined) delete next[key];
  else next[key] = value;
  return { ...tiers, [device]: next };
}

/**
 * Per-device overrides for header, footer and every theme part. Desktop is the
 * base tier; tablet inherits desktop and mobile inherits tablet.
 */
export function ResponsivePanel({ theme, update, device }: PanelProps) {
  const headerTiers = theme.header.tiers as Tiers<HeaderTier & Rec>;
  const footerTiers = theme.footer.tiers as Tiers<FooterTier & Rec>;

  const setHeader = (key: string, value: unknown) =>
    update((p) => ({
      ...p,
      header: { ...p.header, tiers: writeTier(p.header.tiers as Tiers<Rec>, device, key, value) },
    }));

  const setFooter = (key: string, value: unknown) =>
    update((p) => ({
      ...p,
      footer: { ...p.footer, tiers: writeTier(p.footer.tiers as Tiers<Rec>, device, key, value) },
    }));

  const setPart = (id: string) => (key: string, value: unknown) =>
    update((p) => ({
      ...p,
      parts: p.parts.map((x) =>
        x.id === id ? { ...x, tiers: writeTier(x.tiers as Tiers<Rec>, device, key, value) } : x,
      ),
    }));

  return (
    <div className="space-y-4">
      <p className="rounded border border-tt-border bg-tt-body p-2 text-[12px] text-tt-muted">
        Editing the <strong className="text-tt-text">{device}</strong> tier. Tablet inherits
        desktop, mobile inherits tablet — set a value here to override, or reset it to inherit
        again.
      </p>

      <Section title="Header">
        <TierField
          tiers={headerTiers}
          device={device}
          name="hidden"
          label="Visibility"
          onChange={setHeader}
          render={(v, set) => (
            <ToggleControl value={v} set={set} text="Hide header on this device" />
          )}
        />
        <TierField
          tiers={headerTiers}
          device={device}
          name="navMode"
          label="Navigation"
          onChange={setHeader}
          render={(v, set) => (
            <SelectControl value={v} set={set} options={["inline", "drawer", "bottom-bar"]} />
          )}
        />
        <TierField
          tiers={headerTiers}
          device={device}
          name="align"
          label="Alignment"
          onChange={setHeader}
          render={(v, set) => (
            <SelectControl value={v} set={set} options={["left", "center", "right"]} />
          )}
        />
        <TierField
          tiers={headerTiers}
          device={device}
          name="logoSize"
          label="Logo size"
          onChange={setHeader}
          render={(v, set) => <NumberControl value={v} set={set} min={16} max={96} suffix="px" />}
        />
        <TierField
          tiers={headerTiers}
          device={device}
          name="paddingY"
          label="Vertical padding"
          onChange={setHeader}
          render={(v, set) => <NumberControl value={v} set={set} min={0} max={64} suffix="px" />}
        />
        <TierField
          tiers={headerTiers}
          device={device}
          name="fontScale"
          label="Font scale"
          onChange={setHeader}
          render={(v, set) => (
            <NumberControl value={v} set={set} min={0.7} max={1.6} step={0.05} suffix="×" />
          )}
        />
        <TierField
          tiers={headerTiers}
          device={device}
          name="showTagline"
          label="Tagline"
          onChange={setHeader}
          render={(v, set) => <ToggleControl value={v} set={set} text="Show tagline" />}
        />
        <TierField
          tiers={headerTiers}
          device={device}
          name="showCta"
          label="CTA button"
          onChange={setHeader}
          render={(v, set) => <ToggleControl value={v} set={set} text="Show CTA button" />}
        />
      </Section>

      <Section title="Footer">
        <TierField
          tiers={footerTiers}
          device={device}
          name="hidden"
          label="Visibility"
          onChange={setFooter}
          render={(v, set) => (
            <ToggleControl value={v} set={set} text="Hide footer on this device" />
          )}
        />
        <TierField
          tiers={footerTiers}
          device={device}
          name="columns"
          label="Columns"
          onChange={setFooter}
          render={(v, set) => <NumberControl value={v} set={set} min={1} max={4} />}
        />
        <TierField
          tiers={footerTiers}
          device={device}
          name="align"
          label="Alignment"
          onChange={setFooter}
          render={(v, set) => (
            <SelectControl value={v} set={set} options={["left", "center", "right"]} />
          )}
        />
        <TierField
          tiers={footerTiers}
          device={device}
          name="paddingY"
          label="Vertical padding"
          onChange={setFooter}
          render={(v, set) => <NumberControl value={v} set={set} min={0} max={96} suffix="px" />}
        />
        <TierField
          tiers={footerTiers}
          device={device}
          name="fontScale"
          label="Font scale"
          onChange={setFooter}
          render={(v, set) => (
            <NumberControl value={v} set={set} min={0.7} max={1.6} step={0.05} suffix="×" />
          )}
        />
        <TierField
          tiers={footerTiers}
          device={device}
          name="showSitemap"
          label="Sitemap column"
          onChange={setFooter}
          render={(v, set) => <ToggleControl value={v} set={set} text="Show sitemap" />}
        />
        <TierField
          tiers={footerTiers}
          device={device}
          name="showSocial"
          label="Social icons"
          onChange={setFooter}
          render={(v, set) => <ToggleControl value={v} set={set} text="Show social icons" />}
        />
      </Section>

      {theme.parts.map((part) => {
        const tiers = part.tiers as Tiers<PartTier & Rec>;
        const onChange = setPart(part.id);
        return (
          <Section key={part.id} title={part.label}>
            <TierField
              tiers={tiers}
              device={device}
              name="hidden"
              label="Visibility"
              onChange={onChange}
              render={(v, set) => (
                <ToggleControl value={v} set={set} text="Hide on this device" />
              )}
            />
            <TierField
              tiers={tiers}
              device={device}
              name="align"
              label="Alignment"
              onChange={onChange}
              render={(v, set) => (
                <SelectControl value={v} set={set} options={["left", "center", "right"]} />
              )}
            />
            <TierField
              tiers={tiers}
              device={device}
              name="paddingY"
              label="Vertical padding"
              onChange={onChange}
              render={(v, set) => (
                <NumberControl value={v} set={set} min={0} max={96} suffix="px" />
              )}
            />
            <TierField
              tiers={tiers}
              device={device}
              name="fontScale"
              label="Font scale"
              onChange={onChange}
              render={(v, set) => (
                <NumberControl value={v} set={set} min={0.7} max={1.6} step={0.05} suffix="×" />
              )}
            />
          </Section>
        );
      })}
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className={cn("rounded border border-tt-border p-2")}>
      <div className="mb-2 text-[13px] font-semibold text-tt-text">{title}</div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

export const TIER_DEFAULTS = {
  header: DEFAULT_HEADER_TIER,
  footer: DEFAULT_FOOTER_TIER,
  part: DEFAULT_PART_TIER,
};
