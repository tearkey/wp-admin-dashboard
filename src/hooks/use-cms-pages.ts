import { useCallback, useMemo } from "react";
import { usePersistentState } from "@/hooks/use-persistent-state";
import { SEED_PAGES } from "@/lib/cms/seed-pages";
import { newPage, uniqueSlug, type CmsPage } from "@/lib/cms/types";

/**
 * Pages store. Persisted in localStorage (cross-tab synced) so the admin is a
 * working CRUD surface today; swap this hook's body for API calls when the
 * hosted REST backend documented in docs/api-contract.md is available.
 */
export function useCmsPages() {
  const [pages, setPages] = usePersistentState<CmsPage[]>("pages:data", SEED_PAGES);

  const create = useCallback(
    (draft: Partial<CmsPage>) => {
      const page = newPage(draft);
      let created = page;
      setPages((prev) => {
        created = { ...page, slug: uniqueSlug(page.slug, prev) };
        return [created, ...prev];
      });
      return created;
    },
    [setPages],
  );

  const update = useCallback(
    (id: string, patch: Partial<CmsPage>) => {
      setPages((prev) =>
        prev.map((p) =>
          p.id === id
            ? {
                ...p,
                ...patch,
                slug: patch.slug !== undefined ? uniqueSlug(patch.slug, prev, id) : p.slug,
                updatedAt: new Date().toISOString(),
              }
            : p,
        ),
      );
    },
    [setPages],
  );

  const duplicate = useCallback(
    (id: string) => {
      setPages((prev) => {
        const src = prev.find((p) => p.id === id);
        if (!src) return prev;
        const copy = newPage({
          ...src,
          title: `${src.title} (copy)`,
          slug: uniqueSlug(`${src.slug || "page"}-copy`, prev),
          status: "draft",
        });
        return [copy, ...prev];
      });
    },
    [setPages],
  );

  const trash = useCallback((id: string) => update(id, { status: "trash" }), [update]);
  const restore = useCallback((id: string) => update(id, { status: "draft" }), [update]);
  const remove = useCallback(
    (id: string) => setPages((prev) => prev.filter((p) => p.id !== id)),
    [setPages],
  );
  const resetAll = useCallback(() => setPages(SEED_PAGES), [setPages]);

  const counts = useMemo(
    () => ({
      all: pages.filter((p) => p.status !== "trash").length,
      static: pages.filter((p) => p.kind === "static" && p.status !== "trash").length,
      dynamic: pages.filter((p) => p.kind === "dynamic" && p.status !== "trash").length,
      draft: pages.filter((p) => p.status === "draft").length,
      trash: pages.filter((p) => p.status === "trash").length,
    }),
    [pages],
  );

  return { pages, counts, create, update, duplicate, trash, restore, remove, resetAll };
}
