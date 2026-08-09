import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ScreenMeta } from "@/components/wp/ScreenMeta";
import { useDashboardData } from "@/hooks/use-dashboard-data";

export const Route = createFileRoute("/_wpadmin/wp-admin/settings")({
  head: () => ({
    meta: [
      { title: "General Settings — WP Admin" },
      {
        name: "description",
        content: "Site title, tagline, address, timezone and date format settings.",
      },
      { property: "og:title", content: "General Settings — WP Admin" },
      { property: "og:description", content: "The WordPress General Settings form." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SettingsScreen,
});

function SettingsScreen() {
  const { site } = useDashboardData();
  const [form, setForm] = useState({
    name: site.name,
    tagline: site.tagline,
    url: site.url,
    email: "admin@renita21.example",
    membership: false,
    timezone: "UTC+5:30",
    dateFormat: "F j, Y",
  });
  const [saved, setSaved] = useState(false);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setSaved(false);
  };

  return (
    <div className="px-5 pt-2 pb-10">
      <ScreenMeta
        helpTabs={[
          {
            id: "overview",
            label: "Overview",
            content: <p>General settings control your site identity and formatting defaults.</p>,
          },
        ]}
      />
      <h1 className="mt-1 mb-3 text-[23px] leading-[1.3] font-normal text-wp-text">
        General Settings
      </h1>

      {saved && (
        <div className="mb-4 border-l-4 border-l-wp-green bg-wp-surface px-3 py-2 shadow-[0_1px_1px_rgba(0,0,0,0.04)]">
          Settings saved.
        </div>
      )}

      <form
        className="max-w-[760px]"
        onSubmit={(e) => {
          e.preventDefault();
          setSaved(true);
        }}
      >
        <table className="w-full text-[13px]">
          <tbody>
            <Row id="s-name" label="Site Title">
              <Text id="s-name" value={form.name} onChange={(v) => set("name", v)} />
            </Row>
            <Row id="s-tagline" label="Tagline" hint="In a few words, explain what this site is about.">
              <Text id="s-tagline" value={form.tagline} onChange={(v) => set("tagline", v)} />
            </Row>
            <Row id="s-url" label="WordPress Address (URL)">
              <Text id="s-url" value={form.url} onChange={(v) => set("url", v)} />
            </Row>
            <Row id="s-email" label="Administration Email Address">
              <Text id="s-email" value={form.email} onChange={(v) => set("email", v)} />
            </Row>
            <Row id="s-membership" label="Membership">
              <label className="flex items-center gap-2">
                <input
                  id="s-membership"
                  type="checkbox"
                  checked={form.membership}
                  onChange={(e) => set("membership", e.target.checked)}
                />
                Anyone can register
              </label>
            </Row>
            <Row id="s-tz" label="Timezone">
              <select
                id="s-tz"
                value={form.timezone}
                onChange={(e) => set("timezone", e.target.value)}
                className="h-[30px] rounded border border-wp-border bg-wp-surface px-2 text-[13px]"
              >
                {["UTC+0", "UTC+1", "UTC+5:30", "UTC-5", "UTC-8"].map((tz) => (
                  <option key={tz}>{tz}</option>
                ))}
              </select>
            </Row>
            <Row id="s-date" label="Date Format">
              <div className="space-y-1">
                {[
                  ["F j, Y", "August 9, 2026"],
                  ["Y-m-d", "2026-08-09"],
                  ["m/d/Y", "08/09/2026"],
                ].map(([value, sample]) => (
                  <label key={value} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="dateFormat"
                      checked={form.dateFormat === value}
                      onChange={() => set("dateFormat", value)}
                    />
                    {sample}
                  </label>
                ))}
              </div>
            </Row>
          </tbody>
        </table>

        <button
          type="submit"
          className="mt-4 h-[32px] rounded border border-wp-blue bg-wp-blue px-3 text-[13px] font-medium text-wp-menu-text hover:bg-wp-blue-hover"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
}

function Row({
  id,
  label,
  hint,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <tr className="align-top">
      <th scope="row" className="w-[200px] py-4 pr-4 text-left font-semibold text-wp-text">
        <label htmlFor={id}>{label}</label>
      </th>
      <td className="py-4">
        {children}
        {hint && <p className="mt-1 text-wp-muted">{hint}</p>}
      </td>
    </tr>
  );
}

function Text({
  id,
  value,
  onChange,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <input
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-[30px] w-full max-w-[400px] rounded border border-wp-border px-2 text-[13px] outline-none focus:border-wp-blue"
    />
  );
}
