#!/usr/bin/env node
/**
 * Brand guard: fails the build if retired branding is reintroduced.
 *
 * Usage: npm run check:brand
 */
import { execFileSync } from "node:child_process";
import { readFileSync, statSync } from "node:fs";

/** Files/directories never scanned. */
const SKIP_PATHS = [
  "node_modules/",
  "dist/",
  ".output/",
  ".vinxi/",
  ".workspace/",
  ".lovable/",
  "bun.lock",
  "package-lock.json",
  "tsconfig.tsbuildinfo",
  "src/routeTree.gen.ts", // generated from the legacy redirect routes
  "scripts/check-brand.mjs",
];

/** Binary-ish extensions we never read. */
const SKIP_EXT = /\.(png|jpe?g|gif|webp|avif|ico|svg|woff2?|ttf|eot|pdf|zip|mp4|webm)$/i;

/**
 * Banned patterns. `allowedIn` lists paths where the match is legitimate.
 */
const RULES = [
  {
    label: "WordPress branding",
    pattern: /wordpress/gi,
    // Docs must be able to name the retired brand when describing this policy.
    allowedIn: ["README.md", "CONTRIBUTING.md", "SECURITY.md"],
  },
  {
    label: "legacy wp-admin path or prefix",
    pattern: /wp-admin/g,
    allowedIn: [
      "src/routes/wp-admin.$.tsx", // legacy redirect route
      "src/routes/wp-admin.index.tsx", // legacy redirect route
      "src/hooks/use-persistent-state.ts", // one-time localStorage migration
      "README.md", // documents the legacy redirects
      "SECURITY.md",
    ],
  },
  {
    label: "legacy --wp-* design token",
    pattern: /(--wp-|\b(?:bg|text|border|font)-wp-)/g,
    allowedIn: ["README.md"], // documents the retired token prefix
  },
  {
    label: "legacy wp-mock data module",
    pattern: /wp-mock/g,
    allowedIn: [],
  },
  {
    label: "Lovable ownership text",
    pattern:
      /(Lovable App|Lovable Generated Project|Made with Lovable|Edit with Lovable|lovable\.app|lovable-error-reporting|lovable_tagger)/gi,
    allowedIn: [],
  },
  {
    label: "Lovable branding in source (build tooling excepted)",
    // Any "lovable" that is NOT part of the @lovable.dev toolchain package name.
    pattern: /(?<!@)lovable(?!\.dev)/gi,
    allowedIn: [
      "src/lib/error-reporting.ts", // optional host hooks on globalThis
      "vite.config.ts",
      "bunfig.toml",
      "package.json",
      "AGENTS.md",
      "README.md", // documents this policy
      "CONTRIBUTING.md",
      ".dockerignore", // excludes the local .lovable/ directory from build context
    ],
  },
  {
    label: "non-Techtrick contact address",
    pattern: /[\w.+-]+@(?:lovable\.dev|wordpress\.org)/gi,
    allowedIn: [],
  },
];

function trackedFiles() {
  const out = execFileSync("git", ["ls-files", "-z"], { encoding: "utf8" });
  return out.split("\0").filter(Boolean);
}

function shouldSkip(file) {
  if (SKIP_PATHS.some((p) => file === p || file.startsWith(p))) return true;
  if (SKIP_EXT.test(file)) return true;
  try {
    if (statSync(file).size > 2_000_000) return true;
  } catch {
    return true; // deleted or unreadable
  }
  return false;
}

const violations = [];

for (const file of trackedFiles()) {
  if (shouldSkip(file)) continue;
  let text;
  try {
    text = readFileSync(file, "utf8");
  } catch {
    continue;
  }
  if (text.includes("\u0000")) continue; // binary

  const lines = text.split("\n");
  for (const rule of RULES) {
    if (rule.allowedIn.includes(file)) continue;
    lines.forEach((line, i) => {
      rule.pattern.lastIndex = 0;
      const match = rule.pattern.exec(line);
      if (match) {
        violations.push({
          file,
          line: i + 1,
          label: rule.label,
          match: match[0],
          text: line.trim().slice(0, 120),
        });
      }
    });
  }
}

if (violations.length > 0) {
  console.error(`\nBrand check failed — ${violations.length} banned string(s) found:\n`);
  for (const v of violations) {
    console.error(`  ${v.file}:${v.line}  [${v.label}] "${v.match}"`);
    console.error(`      ${v.text}`);
  }
  console.error(
    "\nTechtrick CMS must not reference WordPress or Lovable ownership.\n" +
      "Fix the lines above, or add a justified exception to RULES[].allowedIn in scripts/check-brand.mjs.\n",
  );
  process.exit(1);
}

console.log("Brand check passed — no banned strings found.");
