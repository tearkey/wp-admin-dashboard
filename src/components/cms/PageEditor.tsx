import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  DYNAMIC_SOURCES,
  PAGE_TEMPLATES,
  slugify,
  type CmsPage,
  type PageKind,
  type PageStatus,
} from "@/lib/cms/types";
import { cn } from "@/lib/utils";

const STATUSES: { value: PageStatus; label: string }[] = [
  { value: "publish", label: "Published" },
  { value: "draft", label: "Draft" },
  { value: "pending", label: "Pending review" },
  { value: "private", label: "Private" },
];

export interface PageEditorProps {
  value: Partial<CmsPage>;
  parents: CmsPage[];
  heading: string;
  canDelete?: boolean;
  onSave: (draft: Partial<CmsPage>) => void;
  onDelete?: () => void;
}

/** Split editor: form fields on the left, live preview on the right. */
export function PageEditor({
  value,
  parents,
  heading,
  canDelete,
  onSave,
  onDelete,
}: PageEditorProps) {
  const navigate = useNavigate();
  const [draft, setDraft] = useState<Partial<CmsPage>>({
    kind: "static",
    status: "draft",
    template: PAGE_TEMPLATES[0],
    ...value,
  });
  const [slugTouched, setSlugTouched] = useState(Boolean(value.slug));

  const set = <K extends keyof CmsPage>(key: K, v: CmsPage[K]) =>
    setDraft((d) => ({ ...d, [key]: v }));

  const submit = () => {
    if (!draft.title?.trim()) {
      toast.error("A page title is required.");
      return;
    }
    onSave({ ...draft, slug: draft.slug ?? slugify(draft.title) });
  };

  return (
    <div className="px-3 pt-3 pb-24 sm:px-5">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <h1 className="text-[23px] leading-[1.3] font-normal text-tt-text">{heading}</h1>
        <Link to="/admin/pages" className="text-[13px] text-tt-blue hover:underline">
          Back to all pages
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
        <div className="min-w-0 space-y-4">
          <Card title="Content">
            <Field label="Title">
              <input
                value={draft.title ?? ""}
                onChange={(e) => {
                  set("title", e.target.value);
                  if (!slugTouched) set("slug", slugify(e.target.value));
                }}
                className={inputCls}
                placeholder="Add title"
              />
            </Field>
            <Field label="URL slug" hint="Leave empty for the front page.">
              <div className="flex items-center gap-1">
                <span className="shrink-0 text-[12px] text-tt-muted">/</span>
                <input
                  value={draft.slug ?? ""}
                  onChange={(e) => {
                    setSlugTouched(true);
                    set("slug", e.target.value);
                  }}
                  onBlur={(e) =>
                    set(
                      "slug",
                      e.target.value.includes(":") ? e.target.value : slugify(e.target.value),
                    )
                  }
                  className={inputCls}
                  placeholder="url-slug"
                />
              </div>
            </Field>
            {draft.kind === "static" ? (
              <Field label="Page content">
                <textarea
                  value={draft.content ?? ""}
                  onChange={(e) => set("content", e.target.value)}
                  rows={12}
                  className={cn(inputCls, "font-mono text-[12px] leading-relaxed")}
                  placeholder="Write the page content…"
                />
              </Field>
            ) : (
              <>
                <Field label="Content source">
                  <select
                    value={draft.source ?? "post-archive"}
                    onChange={(e) => set("source", e.target.value as CmsPage["source"])}
                    className={inputCls}
                  >
                    {DYNAMIC_SOURCES.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Items per page">
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={draft.perPage ?? 10}
                    onChange={(e) => set("perPage", Number(e.target.value))}
                    className={inputCls}
                  />
                </Field>
                <Field label="Intro / query notes">
                  <textarea
                    value={draft.content ?? ""}
                    onChange={(e) => set("content", e.target.value)}
                    rows={6}
                    className={cn(inputCls, "font-mono text-[12px]")}
                    placeholder="Optional intro copy shown above the loop."
                  />
                </Field>
              </>
            )}
          </Card>

          <Card title="Search engine listing">
            <Field label="SEO title">
              <input
                value={draft.seoTitle ?? ""}
                onChange={(e) => set("seoTitle", e.target.value)}
                className={inputCls}
                maxLength={60}
              />
            </Field>
            <Field label="Meta description" hint="Under 160 characters.">
              <textarea
                value={draft.seoDescription ?? ""}
                onChange={(e) => set("seoDescription", e.target.value)}
                rows={3}
                className={inputCls}
                maxLength={160}
              />
            </Field>
          </Card>
        </div>

        <div className="min-w-0 space-y-4">
          <Card title="Publish">
            <Field label="Page type">
              <div className="flex gap-2">
                {(["static", "dynamic"] as PageKind[]).map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => set("kind", k)}
                    className={cn(
                      "min-h-11 flex-1 rounded border px-3 text-[13px] capitalize md:min-h-[32px]",
                      draft.kind === k
                        ? "border-tt-blue bg-tt-blue text-tt-menu-text"
                        : "border-tt-border bg-tt-surface text-tt-text hover:border-tt-blue",
                    )}
                  >
                    {k}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Status">
              <select
                value={draft.status ?? "draft"}
                onChange={(e) => set("status", e.target.value as PageStatus)}
                className={inputCls}
              >
                {STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Parent page">
              <select
                value={draft.parentId ?? ""}
                onChange={(e) => set("parentId", e.target.value || null)}
                className={inputCls}
              >
                <option value="">(no parent)</option>
                {parents.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Template">
              <select
                value={draft.template ?? PAGE_TEMPLATES[0]}
                onChange={(e) => set("template", e.target.value)}
                className={inputCls}
              >
                {PAGE_TEMPLATES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </Field>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={submit}
                className="min-h-11 rounded bg-tt-blue px-4 text-[13px] font-semibold text-tt-menu-text hover:bg-tt-blue-hover md:min-h-[32px]"
              >
                Save page
              </button>
              <button
                type="button"
                onClick={() => navigate({ to: "/admin/pages" })}
                className="min-h-11 rounded border border-tt-border bg-tt-surface px-3 text-[13px] md:min-h-[32px]"
              >
                Cancel
              </button>
              {canDelete && onDelete && (
                <button
                  type="button"
                  onClick={onDelete}
                  className="ml-auto min-h-11 px-2 text-[13px] text-tt-red hover:underline md:min-h-[32px]"
                >
                  Move to Trash
                </button>
              )}
            </div>
          </Card>

          <Card title="Live preview">
            <div className="rounded border border-tt-border bg-tt-body p-3">
              <div className="text-[11px] tracking-wide text-tt-muted uppercase">
                {draft.kind === "dynamic" ? "Dynamic template" : "Static page"} · {draft.template}
              </div>
              <div className="mt-1 text-[11px] break-all text-tt-muted">/{draft.slug ?? ""}</div>
              <h2 className="mt-2 text-[18px] font-semibold text-tt-text">
                {draft.title || "Untitled page"}
              </h2>
              {draft.kind === "dynamic" ? (
                <ul className="mt-2 space-y-2">
                  {Array.from({ length: Math.min(3, draft.perPage ?? 3) }).map((_, i) => (
                    <li
                      key={i}
                      className="rounded border border-dashed border-tt-border bg-tt-surface p-2 text-[12px] text-tt-muted"
                    >
                      Loop item {i + 1} —{" "}
                      {
                        DYNAMIC_SOURCES.find((s) => s.value === (draft.source ?? "post-archive"))
                          ?.label
                      }
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-[13px] whitespace-pre-wrap text-tt-text">
                  {draft.content || "No content yet."}
                </p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

const inputCls =
  "w-full min-h-11 rounded border border-tt-border bg-tt-surface px-2 py-1.5 text-[13px] text-tt-text outline-none focus:border-tt-blue md:min-h-[32px]";

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded border border-tt-border bg-tt-surface">
      <h2 className="border-b border-tt-border px-3 py-2 text-[14px] font-semibold text-tt-text">
        {title}
      </h2>
      <div className="space-y-3 p-3">{children}</div>
    </section>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[12px] font-semibold text-tt-text">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-tt-muted">{hint}</span>}
    </label>
  );
}
