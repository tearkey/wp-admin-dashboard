import { useCallback, useMemo, useState } from "react";
import {
  comments as seedComments,
  drafts as seedDrafts,
  events,
  news,
  pages,
  posts,
  site,
  siteHealthIssues,
  type WpComment,
  type WpDraft,
} from "@/data/cms-mock";

/**
 * Single read/write surface for every admin screen. Swap the seed imports for
 * real WP REST API calls (via a server function) without touching components.
 */
export function useDashboardData() {
  const [commentList, setCommentList] = useState<WpComment[]>(seedComments);
  const [draftList, setDraftList] = useState<WpDraft[]>(seedDrafts);

  const setCommentStatus = useCallback((id: number, status: WpComment["status"]) => {
    setCommentList((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
  }, []);

  const addDraft = useCallback((title: string, excerpt: string) => {
    setDraftList((prev) => [
      {
        id: Date.now(),
        title: title.trim() || "(no title)",
        excerpt: excerpt.trim(),
        date: new Date().toISOString(),
      },
      ...prev,
    ]);
  }, []);

  const counts = useMemo(
    () => ({
      posts: posts.filter((p) => p.status === "publish").length,
      pages: pages.filter((p) => p.status === "publish").length,
      comments: commentList.filter((c) => c.status === "approved").length,
      pendingComments: commentList.filter((c) => c.status === "pending").length,
      spamComments: commentList.filter((c) => c.status === "spam").length,
      criticalIssues: siteHealthIssues.filter((i) => i.severity === "critical").length,
      recommendedIssues: siteHealthIssues.filter((i) => i.severity === "recommended").length,
    }),
    [commentList],
  );

  return {
    site,
    posts,
    pages,
    comments: commentList,
    drafts: draftList,
    siteHealthIssues,
    events,
    news,
    counts,
    setCommentStatus,
    addDraft,
  };
}
