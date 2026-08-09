import { useState } from "react";
import {
  CircleAlert,
  FileText,
  MessageSquare,
  Pin,
  Rss,
  ShieldCheck,
} from "lucide-react";
import { Postbox } from "@/components/wp/Postbox";
import type { useDashboardData } from "@/hooks/use-dashboard-data";
import { eventLocation } from "@/data/wp-mock";
import { cn } from "@/lib/utils";

type Data = ReturnType<typeof useDashboardData>;

const dateFmt = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });
const timeFmt = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" });

function fmt(iso: string) {
  const d = new Date(iso);
  return `${dateFmt.format(d)}, ${timeFmt.format(d)}`;
}

export function AtAGlanceWidget({ data }: { data: Data }) {
  const { counts, site } = data;
  return (
    <Postbox title="At a Glance">
      <ul className="grid grid-cols-2 gap-y-1.5">
        <GlanceStat icon={Pin} label={`${counts.posts} Posts`} />
        <GlanceStat icon={FileText} label={`${counts.pages} Pages`} />
        <GlanceStat icon={MessageSquare} label={`${counts.comments} Comments`} />
        {counts.pendingComments > 0 && (
          <GlanceStat
            icon={MessageSquare}
            label={`${counts.pendingComments} in moderation`}
            tone="pending"
          />
        )}
      </ul>
      <p className="mt-3 border-t border-wp-border pt-2 text-wp-muted">
        WordPress {site.version} running{" "}
        <button type="button" className="text-wp-blue hover:underline">
          {site.theme}
        </button>{" "}
        theme.
      </p>
    </Postbox>
  );
}

function GlanceStat({
  icon: Icon,
  label,
  tone,
}: {
  icon: typeof Pin;
  label: string;
  tone?: "pending";
}) {
  return (
    <li>
      <button
        type="button"
        className={cn(
          "flex items-center gap-1.5 hover:underline",
          tone === "pending" ? "text-wp-red" : "text-wp-blue",
        )}
      >
        <Icon size={15} className="text-wp-muted" />
        {label}
      </button>
    </li>
  );
}

export function ActivityWidget({ data }: { data: Data }) {
  const recent = data.posts.filter((p) => p.status === "publish").slice(0, 4);
  const recentComments = data.comments.filter((c) => c.status !== "trash").slice(0, 4);

  return (
    <Postbox title="Activity">
      <h3 className="mb-1.5 text-[13px] font-semibold text-wp-text">Recently Published</h3>
      <ul className="mb-4 space-y-1">
        {recent.map((p) => (
          <li key={p.id} className="flex gap-2">
            <span className="shrink-0 text-wp-muted">{fmt(p.date)}</span>
            <button type="button" className="text-left text-wp-blue hover:underline">
              {p.title}
            </button>
          </li>
        ))}
      </ul>

      <h3 className="mb-1.5 text-[13px] font-semibold text-wp-text">Recent Comments</h3>
      <ul className="divide-y divide-wp-border">
        {recentComments.map((c) => (
          <li key={c.id} className="group py-2">
            <p className="text-wp-text">
              <span className="font-semibold">{c.author}</span>{" "}
              <span className="text-wp-muted">on</span>{" "}
              <button type="button" className="text-wp-blue hover:underline">
                {c.postTitle}
              </button>
            </p>
            <p className="mt-0.5 line-clamp-2 text-wp-muted">{c.content}</p>
            <div className="mt-1 flex flex-wrap gap-x-1 text-[13px] opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
              {c.status === "pending" ? (
                <ActionLink onClick={() => data.setCommentStatus(c.id, "approved")}>
                  Approve
                </ActionLink>
              ) : (
                <ActionLink onClick={() => data.setCommentStatus(c.id, "pending")}>
                  Unapprove
                </ActionLink>
              )}
              <Sep />
              <ActionLink>Reply</ActionLink>
              <Sep />
              <ActionLink>Edit</ActionLink>
              <Sep />
              <ActionLink danger onClick={() => data.setCommentStatus(c.id, "spam")}>
                Spam
              </ActionLink>
              <Sep />
              <ActionLink danger onClick={() => data.setCommentStatus(c.id, "trash")}>
                Trash
              </ActionLink>
            </div>
          </li>
        ))}
      </ul>
    </Postbox>
  );
}

function Sep() {
  return <span className="text-wp-muted">|</span>;
}

function ActionLink({
  children,
  onClick,
  danger,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn("hover:underline", danger ? "text-wp-red" : "text-wp-blue")}
    >
      {children}
    </button>
  );
}

export function QuickDraftWidget({ data }: { data: Data }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  return (
    <Postbox title="Quick Draft">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!title.trim() && !content.trim()) return;
          data.addDraft(title, content);
          setTitle("");
          setContent("");
        }}
      >
        <label htmlFor="qd-title" className="mb-1 block font-semibold text-wp-text">
          Title
        </label>
        <input
          id="qd-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mb-3 h-8 w-full rounded border border-wp-border px-2 text-[13px] outline-none focus:border-wp-blue"
        />
        <label htmlFor="qd-content" className="mb-1 block font-semibold text-wp-text">
          Content
        </label>
        <textarea
          id="qd-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          placeholder="What's on your mind?"
          className="mb-3 w-full rounded border border-wp-border p-2 text-[13px] outline-none focus:border-wp-blue"
        />
        <button
          type="submit"
          className="h-[30px] rounded border border-wp-blue bg-wp-blue px-3 text-[13px] font-medium text-wp-menu-text hover:bg-wp-blue-hover"
        >
          Save Draft
        </button>
      </form>

      {data.drafts.length > 0 && (
        <div className="mt-4 border-t border-wp-border pt-3">
          <h3 className="mb-1.5 text-[13px] font-semibold text-wp-text">Your Recent Drafts</h3>
          <ul className="space-y-2">
            {data.drafts.map((d) => (
              <li key={d.id}>
                <button type="button" className="font-medium text-wp-blue hover:underline">
                  {d.title}
                </button>
                <span className="ml-2 text-wp-muted">{fmt(d.date)}</span>
                {d.excerpt && <p className="text-wp-muted">{d.excerpt}</p>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Postbox>
  );
}

export function EventsNewsWidget({ data }: { data: Data }) {
  return (
    <Postbox title="WordPress Events and News">
      <p className="mb-2 text-wp-muted">
        Attend an upcoming event near {eventLocation}.{" "}
        <button type="button" className="text-wp-blue hover:underline">
          Select location
        </button>
      </p>
      <ul className="mb-3 space-y-2">
        {data.events.map((e) => (
          <li key={e.id} className="flex gap-2">
            <span className="mt-0.5 shrink-0 text-wp-muted">
              {e.kind === "wordcamp" ? "◆" : "●"}
            </span>
            <div>
              <button type="button" className="text-left text-wp-blue hover:underline">
                {e.title}
              </button>
              <p className="text-wp-muted">
                {e.location} — {fmt(e.date)}
              </p>
            </div>
          </li>
        ))}
      </ul>
      <ul className="space-y-1 border-t border-wp-border pt-2">
        {data.news.map((n) => (
          <li key={n.id} className="flex items-start gap-1.5">
            <Rss size={13} className="mt-1 shrink-0 text-wp-muted" />
            <button type="button" className="text-left text-wp-blue hover:underline">
              {n.title}
            </button>
          </li>
        ))}
      </ul>
    </Postbox>
  );
}

export function SiteHealthWidget({ data }: { data: Data }) {
  const { criticalIssues, recommendedIssues } = data.counts;
  const total = criticalIssues + recommendedIssues;
  const passed = recommendedIssues - criticalIssues;
  const percent = total === 0 ? 100 : Math.round((Math.max(passed, 0) / total) * 100);
  const good = criticalIssues === 0;

  return (
    <Postbox title="Site Health Status">
      <div className="flex items-center gap-4">
        <div
          className="grid size-[100px] shrink-0 place-items-center rounded-full"
          style={{
            background: `conic-gradient(var(--wp-${good ? "green" : "orange"}) ${percent}%, var(--wp-border) ${percent}%)`,
          }}
          role="img"
          aria-label={`Site health ${percent} percent`}
        >
          <div className="grid size-[76px] place-items-center rounded-full bg-wp-surface">
            {good ? (
              <ShieldCheck size={26} className="text-wp-green" />
            ) : (
              <CircleAlert size={26} className="text-wp-orange" />
            )}
          </div>
        </div>
        <div>
          <p className="text-[14px] font-semibold text-wp-text">
            {good ? "Good" : "Should be improved"}
          </p>
          <p className="mt-1 text-wp-muted">
            Your site has {criticalIssues} critical{" "}
            {criticalIssues === 1 ? "issue" : "issues"} and {recommendedIssues} recommended{" "}
            {recommendedIssues === 1 ? "improvement" : "improvements"}.
          </p>
        </div>
      </div>
      <ul className="mt-3 space-y-1 border-t border-wp-border pt-2">
        {data.siteHealthIssues.map((issue) => (
          <li key={issue.id} className="flex items-start gap-1.5">
            <span
              className={cn(
                "mt-1 size-2 shrink-0 rounded-full",
                issue.severity === "critical" ? "bg-wp-red" : "bg-wp-orange",
              )}
            />
            <span className="text-wp-text">{issue.label}</span>
          </li>
        ))}
      </ul>
    </Postbox>
  );
}
