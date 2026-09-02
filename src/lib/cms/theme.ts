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

/** Device tiers. `desktop` is the base; the others hold optional overrides. */
export type Device = "desktop" | "tablet" | "mobile";

export const DEVICES: Device[] = ["desktop", "tablet", "mobile"];

export const DEVICE_LABEL: Record<Device, string> = {
  desktop: "Desktop",
  tablet: "Tablet",
  mobile: "Mobile",
};

/** Preview widths and the breakpoints the public site uses for each tier. */
export const DEVICE_WIDTH: Record<Device, string> = {
  desktop: "100%",
  tablet: "834px",
  mobile: "390px",
};

/** Max-width media query for each non-base tier. */
export const DEVICE_QUERY: Record<Exclude<Device, "desktop">, string> = {
  tablet: "(max-width: 1023px)",
  mobile: "(max-width: 767px)",
};

export type Align = "left" | "center" | "right";
export type NavMode = "inline" | "drawer" | "bottom-bar";

export interface HeaderTier {
  hidden: boolean;
  align: Align;
  paddingY: number;
  fontScale: number;
  logoSize: number;
  navMode: NavMode;
  showTagline: boolean;
  showCta: boolean;
}

export interface FooterTier {
  hidden: boolean;
  align: Align;
  paddingY: number;
  fontScale: number;
  columns: number;
  showSitemap: boolean;
  showSocial: boolean;
}

export interface PartTier {
  hidden: boolean;
  align: Align;
  paddingY: number;
  fontScale: number;
}

/** Base value plus sparse overrides for the smaller tiers. */
export interface Tiers<T> {
  desktop: T;
  tablet: Partial<T>;
  mobile: Partial<T>;
}

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
  tiers: Tiers<PartTier>;
}

export interface ThemeConfig {
  version: number;
  header: {
    logoText: string;
    logoUrl: string;
    tagline: string;
    sticky: boolean;
    ctaLabel: string;
    ctaHref: string;
    nav: NavLink[];
    tiers: Tiers<HeaderTier>;
  };
  footer: {
    logoText: string;
    about: string;
    columns: FooterColumn[];
    social: SocialLink[];
    copyright: string;
    showSitemap: boolean;
    tiers: Tiers<FooterTier>;
  };
  parts: ThemePart[];
  snippets: {
    head: string;
    bodyOpen: string;
    bodyClose: string;
  };
}

export const THEME_VERSION = 2;

export const uid = (prefix: string) => `${prefix}_${Math.random().toString(36).slice(2, 9)}`;

/** Resolve the effective tier value: mobile falls back to tablet, then desktop. */
export function resolveTier<T extends object>(tiers: Tiers<T>, device: Device): T {
  if (device === "desktop") return tiers.desktop;
  if (device === "tablet") return { ...tiers.desktop, ...tiers.tablet };
  return { ...tiers.desktop, ...tiers.tablet, ...tiers.mobile };
}

/** True when this tier holds its own override for `key`. */
export function hasOverride<T extends object>(
  tiers: Tiers<T>,
  device: Device,
  key: keyof T,
): boolean {
  if (device === "desktop") return true;
  return Object.prototype.hasOwnProperty.call(tiers[device], key);
}

export const DEFAULT_HEADER_TIER: HeaderTier = {
  hidden: false,
  align: "left",
  paddingY: 12,
  fontScale: 1,
  logoSize: 32,
  navMode: "inline",
  showTagline: true,
  showCta: true,
};

export const DEFAULT_FOOTER_TIER: FooterTier = {
  hidden: false,
  align: "left",
  paddingY: 32,
  fontScale: 1,
  columns: 4,
  showSitemap: true,
  showSocial: true,
};

export const DEFAULT_PART_TIER: PartTier = {
  hidden: false,
  align: "left",
  paddingY: 16,
  fontScale: 1,
};

export const DEFAULT_THEME: ThemeConfig = {
  version: THEME_VERSION,
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
    tiers: {
      desktop: DEFAULT_HEADER_TIER,
      tablet: { paddingY: 10, showTagline: false },
      mobile: { navMode: "drawer", align: "left", paddingY: 8, logoSize: 28 },
    },
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
    tiers: {
      desktop: DEFAULT_FOOTER_TIER,
      tablet: { columns: 2, paddingY: 24 },
      mobile: { columns: 1, paddingY: 20, align: "center" },
    },
  },
  parts: [
    {
      id: "part_home_hero",
      label: "Home hero",
      enabled: true,
      heading: "A CMS you actually own",
      body: "Pages, theme parts and site chrome — all editable from the admin.",
      tiers: { desktop: DEFAULT_PART_TIER, tablet: {}, mobile: { paddingY: 12 } },
    },
    {
      id: "part_posts",
      label: "Posts loop",
      enabled: true,
      heading: "Latest posts",
      body: "Recent articles rendered by the posts archive part.",
      tiers: { desktop: DEFAULT_PART_TIER, tablet: {}, mobile: {} },
    },
    {
      id: "part_ads",
      label: "Ads slot",
      enabled: false,
      heading: "Sponsored",
      body: "Ad markup or partner message goes here.",
      tiers: { desktop: DEFAULT_PART_TIER, tablet: {}, mobile: { hidden: true } },
    },
    {
      id: "part_archive",
      label: "Archive header",
      enabled: true,
      heading: "Archive",
      body: "Shown above category, tag and author archives.",
      tiers: { desktop: DEFAULT_PART_TIER, tablet: {}, mobile: {} },
    },
  ],
  snippets: { head: "", bodyOpen: "", bodyClose: "" },
};

const ALIGN_CSS: Record<Align, string> = { left: "flex-start", center: "center", right: "flex-end" };
const TEXT_ALIGN: Record<Align, string> = { left: "left", center: "center", right: "right" };

/** CSS custom properties for one resolved tier of the whole theme. */
export function themeVars(theme: ThemeConfig, device: Device): Record<string, string> {
  const h = resolveTier(theme.header.tiers, device);
  const f = resolveTier(theme.footer.tiers, device);
  const vars: Record<string, string> = {
    "--tt-h-display": h.hidden ? "none" : "block",
    "--tt-h-justify": ALIGN_CSS[h.align],
    "--tt-h-pad": `${h.paddingY}px`,
    "--tt-h-scale": String(h.fontScale),
    "--tt-h-logo": `${h.logoSize}px`,
    "--tt-h-nav": h.navMode === "inline" ? "flex" : "none",
    "--tt-h-toggle": h.navMode === "inline" ? "none" : "inline-flex",
    "--tt-h-tagline": h.showTagline ? "inline" : "none",
    "--tt-h-cta": h.showCta ? "inline-flex" : "none",
    "--tt-f-display": f.hidden ? "none" : "block",
    "--tt-f-align": TEXT_ALIGN[f.align],
    "--tt-f-pad": `${f.paddingY}px`,
    "--tt-f-scale": String(f.fontScale),
    "--tt-f-cols": String(f.columns),
    "--tt-f-sitemap": f.showSitemap ? "block" : "none",
    "--tt-f-social": f.showSocial ? "flex" : "none",
  };
  for (const part of theme.parts) {
    const p = resolveTier(part.tiers, device);
    vars[`--tt-p-${part.id}-display`] = p.hidden ? "none" : "block";
    vars[`--tt-p-${part.id}-align`] = TEXT_ALIGN[p.align];
    vars[`--tt-p-${part.id}-pad`] = `${p.paddingY}px`;
    vars[`--tt-p-${part.id}-scale`] = String(p.fontScale);
  }
  return vars;
}

function varsToCss(vars: Record<string, string>): string {
  return Object.entries(vars)
    .map(([k, v]) => `${k}:${v};`)
    .join("");
}

/**
 * Stylesheet for the real front end: base tier plus media-query overrides so
 * per-device settings apply without JavaScript.
 */
export function themeStylesheet(theme: ThemeConfig, scope = "[data-tt-site]"): string {
  const base = `${scope}{${varsToCss(themeVars(theme, "desktop"))}}`;
  const tablet = `@media ${DEVICE_QUERY.tablet}{${scope}{${varsToCss(themeVars(theme, "tablet"))}}}`;
  const mobile = `@media ${DEVICE_QUERY.mobile}{${scope}{${varsToCss(themeVars(theme, "mobile"))}}}`;
  return `${base}${tablet}${mobile}`;
}

/** Bring older saved themes up to the current shape. */
export function migrateTheme(raw: unknown): ThemeConfig {
  if (!raw || typeof raw !== "object") return DEFAULT_THEME;
  const t = raw as Partial<ThemeConfig>;
  if (t.version === THEME_VERSION && t.header?.tiers && t.footer?.tiers) return t as ThemeConfig;
  const header = (t.header ?? DEFAULT_THEME.header) as ThemeConfig["header"];
  const footer = (t.footer ?? DEFAULT_THEME.footer) as ThemeConfig["footer"];
  return {
    version: THEME_VERSION,
    header: { ...header, tiers: header.tiers ?? DEFAULT_THEME.header.tiers },
    footer: { ...footer, tiers: footer.tiers ?? DEFAULT_THEME.footer.tiers },
    parts: (t.parts ?? DEFAULT_THEME.parts).map((p) => ({
      ...p,
      tiers: p.tiers ?? { desktop: DEFAULT_PART_TIER, tablet: {}, mobile: {} },
    })),
    snippets: t.snippets ?? DEFAULT_THEME.snippets,
  };
}
