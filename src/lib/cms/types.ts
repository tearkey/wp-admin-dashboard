/** Shared content model for the Techtrick CMS admin. */

export type PageKind = "static" | "dynamic";
export type PageStatus = "publish" | "draft" | "pending" | "private" | "trash";

/** Data source a dynamic page template is bound to. */
export type DynamicSource =
  | "post-archive"
  | "category-archive"
  | "tag-archive"
  | "author-archive"
  | "search-results"
  | "single-post"
  | "custom-query";

export const DYNAMIC_SOURCES: { value: DynamicSource; label: string }[] = [
  { value: "post-archive", label: "Posts archive" },
  { value: "category-archive", label: "Category archive" },
  { value: "tag-archive", label: "Tag archive" },
  { value: "author-archive", label: "Author archive" },
  { value: "search-results", label: "Search results" },
  { value: "single-post", label: "Single post" },
  { value: "custom-query", label: "Custom query" },
];

export interface CmsPage {
  id: string;
  title: string;
  slug: string;
  kind: PageKind;
  status: PageStatus;
  parentId: string | null;
  template: string;
  content: string;
  seoTitle: string;
  seoDescription: string;
  author: string;
  /** Dynamic-only binding. */
  source?: DynamicSource;
  /** Dynamic-only: items per page. */
  perPage?: number;
  createdAt: string;
  updatedAt: string;
}

export const PAGE_TEMPLATES = [
  "Default template",
  "Full width",
  "Sidebar left",
  "Sidebar right",
  "Landing page",
] as const;

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Ensure `slug` is unique among `pages`, ignoring the page being edited. */
export function uniqueSlug(slug: string, pages: CmsPage[], ignoreId?: string): string {
  const base = slug || "page";
  let candidate = base;
  let n = 2;
  while (pages.some((p) => p.slug === candidate && p.id !== ignoreId)) {
    candidate = `${base}-${n++}`;
  }
  return candidate;
}

export function newPage(partial: Partial<CmsPage> = {}): CmsPage {
  const now = new Date().toISOString();
  const title = partial.title ?? "";
  return {
    id: `pg_${Math.random().toString(36).slice(2, 10)}`,
    title,
    slug: partial.slug ?? slugify(title),
    kind: partial.kind ?? "static",
    status: partial.status ?? "draft",
    parentId: partial.parentId ?? null,
    template: partial.template ?? PAGE_TEMPLATES[0],
    content: partial.content ?? "",
    seoTitle: partial.seoTitle ?? "",
    seoDescription: partial.seoDescription ?? "",
    author: partial.author ?? "admin",
    source: partial.source,
    perPage: partial.perPage,
    createdAt: now,
    updatedAt: now,
  };
}
