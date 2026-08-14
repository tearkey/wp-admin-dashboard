/**
 * Mock CMS data.
 *
 * Every screen reads from this module through `useDashboardData()` so that
 * swapping in a real WP REST API later is a single-file change.
 */

export type PostStatus = "publish" | "draft" | "pending" | "private";
export type CommentStatus = "approved" | "pending" | "spam" | "trash";

export interface WpPost {
  id: number;
  title: string;
  author: string;
  categories: string[];
  tags: string[];
  comments: number;
  status: PostStatus;
  date: string; // ISO
}

export interface WpPage {
  id: number;
  title: string;
  author: string;
  comments: number;
  status: PostStatus;
  date: string;
}

export interface WpComment {
  id: number;
  author: string;
  authorEmail: string;
  content: string;
  postTitle: string;
  status: CommentStatus;
  date: string;
}

export interface WpDraft {
  id: number;
  title: string;
  excerpt: string;
  date: string;
}

export interface SiteHealthIssue {
  id: string;
  label: string;
  severity: "critical" | "recommended";
}

export interface WpEvent {
  id: string;
  kind: "meetup" | "conference";
  title: string;
  location: string;
  date: string;
}

export interface WpNewsItem {
  id: string;
  title: string;
  source: string;
}

export interface SiteInfo {
  name: string;
  tagline: string;
  url: string;
  version: string;
  theme: string;
  user: string;
  updates: number;
}

export const site: SiteInfo = {
  name: "Renita21",
  tagline: "Just another Techtrick CMS site",
  url: "https://renita21.example",
  version: "6.7.1",
  theme: "Techtrick Default 2026",
  user: "admin",
  updates: 3,
};

export const posts: WpPost[] = [
  {
    id: 1,
    title: "Hello world!",
    author: "admin",
    categories: ["Uncategorized"],
    tags: [],
    comments: 1,
    status: "publish",
    date: "2026-08-04T09:12:00Z",
  },
  {
    id: 2,
    title: "Designing a calmer admin experience",
    author: "admin",
    categories: ["Design", "Notes"],
    tags: ["ui", "craft"],
    comments: 4,
    status: "publish",
    date: "2026-08-02T14:40:00Z",
  },
  {
    id: 3,
    title: "Notes on shipping faster without breaking things",
    author: "editor",
    categories: ["Engineering"],
    tags: ["process"],
    comments: 2,
    status: "publish",
    date: "2026-07-29T08:05:00Z",
  },
  {
    id: 4,
    title: "Draft: what we learned from the migration",
    author: "admin",
    categories: ["Engineering"],
    tags: ["postmortem"],
    comments: 0,
    status: "draft",
    date: "2026-07-27T18:22:00Z",
  },
  {
    id: 5,
    title: "Weekly roundup #14",
    author: "editor",
    categories: ["Notes"],
    tags: ["roundup"],
    comments: 6,
    status: "publish",
    date: "2026-07-21T11:00:00Z",
  },
  {
    id: 6,
    title: "Pending review: accessibility audit results",
    author: "contributor",
    categories: ["Design"],
    tags: ["a11y"],
    comments: 0,
    status: "pending",
    date: "2026-07-18T16:45:00Z",
  },
];

export const pages: WpPage[] = [
  {
    id: 101,
    title: "Sample Page",
    author: "admin",
    comments: 0,
    status: "publish",
    date: "2026-06-01T10:00:00Z",
  },
  {
    id: 102,
    title: "About",
    author: "admin",
    comments: 0,
    status: "publish",
    date: "2026-06-03T10:00:00Z",
  },
  {
    id: 103,
    title: "Contact",
    author: "admin",
    comments: 2,
    status: "publish",
    date: "2026-06-09T10:00:00Z",
  },
  {
    id: 104,
    title: "Privacy Policy",
    author: "admin",
    comments: 0,
    status: "draft",
    date: "2026-06-11T10:00:00Z",
  },
];

export const comments: WpComment[] = [
  {
    id: 501,
    author: "A Techtrick Commenter",
    authorEmail: "hello@techtrick.com.bd",
    content:
      "Hi, this is a comment. To get started with moderating, editing, and deleting comments, please visit the Comments screen in the dashboard.",
    postTitle: "Hello world!",
    status: "approved",
    date: "2026-08-04T09:30:00Z",
  },
  {
    id: 502,
    author: "Mara Lindqvist",
    authorEmail: "mara@example.com",
    content: "This is exactly the write-up I needed. The section on spacing rhythm is gold.",
    postTitle: "Designing a calmer admin experience",
    status: "approved",
    date: "2026-08-03T07:18:00Z",
  },
  {
    id: 503,
    author: "devops_dan",
    authorEmail: "dan@example.com",
    content: "Curious how you handled rollbacks during the migration window?",
    postTitle: "Notes on shipping faster without breaking things",
    status: "pending",
    date: "2026-08-02T21:02:00Z",
  },
  {
    id: 504,
    author: "Cheap Watches",
    authorEmail: "spam@example.net",
    content: "BUY NOW LIMITED OFFER!!! visit our store",
    postTitle: "Weekly roundup #14",
    status: "spam",
    date: "2026-08-01T03:44:00Z",
  },
  {
    id: 505,
    author: "Priya N.",
    authorEmail: "priya@example.com",
    content: "Small typo in the third paragraph — otherwise a great read.",
    postTitle: "Designing a calmer admin experience",
    status: "pending",
    date: "2026-07-31T12:11:00Z",
  },
];

export const drafts: WpDraft[] = [
  {
    id: 4,
    title: "Draft: what we learned from the migration",
    excerpt:
      "Three weeks, two rollbacks, and one very patient ops team. Here is the honest version.",
    date: "2026-07-27T18:22:00Z",
  },
  {
    id: 7,
    title: "Untitled",
    excerpt: "Rough notes on the editor redesign.",
    date: "2026-07-24T09:00:00Z",
  },
];

export const siteHealthIssues: SiteHealthIssue[] = [
  { id: "php", label: "Your site is running an outdated version of Node.js", severity: "recommended" },
  { id: "cron", label: "A scheduled event has failed", severity: "recommended" },
  { id: "https", label: "Your site is using HTTPS", severity: "recommended" },
  { id: "updates", label: "Your plugins are all up to date", severity: "recommended" },
  { id: "backup", label: "No automatic backups are configured", severity: "critical" },
];

export const events: WpEvent[] = [
  {
    id: "e1",
    kind: "meetup",
    title: "Monthly Techtrick CMS Meetup",
    location: "Bengaluru, India",
    date: "2026-08-16T18:00:00Z",
  },
  {
    id: "e2",
    kind: "conference",
    title: "Techtrick Conf Asia 2026",
    location: "Manila, Philippines",
    date: "2026-09-04T09:00:00Z",
  },
  {
    id: "e3",
    kind: "meetup",
    title: "Block Theme Builders Night",
    location: "Online",
    date: "2026-09-11T17:30:00Z",
  },
];

export const news: WpNewsItem[] = [
  { id: "n1", title: "Techtrick CMS 6.7.1 Maintenance Release", source: "Techtrick News" },
  { id: "n2", title: "The Month in Techtrick CMS – July 2026", source: "Techtrick News" },
  { id: "n3", title: "Techtrick Blog: Building blocks that ship", source: "Techtrick Blog" },
  { id: "n4", title: "Community: What the new admin design means for plugin authors", source: "Techtrick Community" },
];

export const eventLocation = "Bengaluru, India";
