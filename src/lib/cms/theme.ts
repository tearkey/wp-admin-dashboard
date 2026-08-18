/** Theme configuration for the public site (header, footer, parts, snippets). */

export type SocialNetwork =
  | "facebook"
  | "twitter"
  | "instagram"
  | "linkedin"
  | "youtube"
  | "github";

export const SOCIAL_NETWORKS: SocialNetwork[] = [
  "facebook",
  "twitter",
  "instagram",
  "linkedin",
  "youtube",
  "github",
];

export interface NavLink {
  id: string;
  label: string;
  href: string;
}

export interface SocialLink {
  id: string;
  network: SocialNetwork;
  href: string;
}

export interface FooterColumn {
  id: string;
  title: string;
  links: NavLink[];
}

/** A dynamic part of the site that can be edited independently. */
export interface ThemePart {
  id: string;
  label: string;
  enabled: boolean;
  heading: string;
  body: string;
}

export interface ThemeConfig {
  header: {
    logoText: string;
    logoUrl: string;
    tagline: string;
    sticky: boolean;
    ctaLabel: string;
    ctaHref: string;
    nav: NavLink[];
  };
  footer: {
    logoText: string;
    about: string;
    columns: FooterColumn[];
    social: SocialLink[];
    copyright: string;
    showSitemap: boolean;
  };
  parts: ThemePart[];
  snippets: {
    head: string;
    bodyOpen: string;
    bodyClose: string;
  };
}

export const uid = (prefix: string) => `${prefix}_${Math.random().toString(36).slice(2, 9)}`;

export const DEFAULT_THEME: ThemeConfig = {
  header: {
    logoText: "Techtrick CMS",
    logoUrl: "",
    tagline: "Open-source content management",
    sticky: true,
    ctaLabel: "Admin",
    ctaHref: "/admin",
    nav: [
      { id: "nav_home", label: "Home", href: "/site" },
      { id: "nav_about", label: "About", href: "/site/about" },
      { id: "nav_contact", label: "Contact", href: "/site/contact" },
    ],
  },
  footer: {
    logoText: "Techtrick CMS",
    about: "Built and maintained by Techtrick Technologies.",
    columns: [
      {
        id: "col_company",
        title: "Company",
        links: [
          { id: "fl_about", label: "About", href: "/site/about" },
          { id: "fl_contact", label: "Contact", href: "/site/contact" },
        ],
      },
      {
        id: "col_legal",
        title: "Legal",
        links: [{ id: "fl_privacy", label: "Privacy Policy", href: "/site/privacy-policy" }],
      },
    ],
    social: [
      { id: "so_gh", network: "github", href: "https://github.com" },
      { id: "so_li", network: "linkedin", href: "https://linkedin.com" },
    ],
    copyright: "© Techtrick Technologies — www.techtrick.com.bd",
    showSitemap: true,
  },
  parts: [
    {
      id: "part_home_hero",
      label: "Home hero",
      enabled: true,
      heading: "A CMS you actually own",
      body: "Pages, theme parts and site chrome — all editable from the admin.",
    },
    {
      id: "part_posts",
      label: "Posts loop",
      enabled: true,
      heading: "Latest posts",
      body: "Recent articles rendered by the posts archive part.",
    },
    {
      id: "part_ads",
      label: "Ads slot",
      enabled: false,
      heading: "Sponsored",
      body: "Ad markup or partner message goes here.",
    },
    {
      id: "part_archive",
      label: "Archive header",
      enabled: true,
      heading: "Archive",
      body: "Shown above category, tag and author archives.",
    },
  ],
  snippets: { head: "", bodyOpen: "", bodyClose: "" },
};
