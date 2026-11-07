#!/usr/bin/env node
// Content safety checks. Fails (exit 1) if:
//   1. visible copy contains an em dash, en dash or double dash, or
//   2. any term from the private blocklist (private/blocklist.txt) appears anywhere in the repo.
// Run: node scripts/check-content.mjs

import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative, extname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const SKIP_DIRS = new Set(["node_modules", ".git", "private", "dist", ".astro", ".wrangler", ".vercel", "coverage", ".venv"]);
const TEXT_EXT = new Set([".md", ".mdx", ".astro", ".tsx", ".ts", ".jsx", ".js", ".mjs", ".json", ".jsonl", ".html", ".css", ".yml", ".yaml", ".txt", ".py", ".svg"]);
// Folders whose files are visible copy (dash rule applies).
const COPY_DIRS = ["content", "src/content", "src/pages", "src/components", "public/demos"];

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue;
    const p = join(dir, name);
    const s = statSync(p);
    if (s.isDirectory()) walk(p, out);
    else if (TEXT_EXT.has(extname(name).toLowerCase())) out.push(p);
  }
  return out;
}

// Strip parts of a file that aren't visible prose, so code like `--flag` or CSS vars doesn't trip the dash rule.
function visibleText(file, text) {
  const ext = extname(file).toLowerCase();
  if (ext === ".md" || ext === ".mdx") {
    return text
      .replace(/^---\n[\s\S]*?\n---\n/, "")      // front matter
      .replace(/```[\s\S]*?```/g, "")             // fenced code
      .replace(/`[^`\n]*`/g, "")                  // inline code
      .replace(/<!--[\s\S]*?-->/g, "")            // comments
      .replace(/^\s*(-{3,}|\*{3,})\s*$/gm, "");   // horizontal rules
  }
  if ([".astro", ".tsx", ".jsx", ".html"].includes(ext)) {
    return text
      .replace(/<style[\s\S]*?<\/style>/g, "")
      .replace(/<script[\s\S]*?<\/script>/g, "")
      .replace(/^---\n[\s\S]*?\n---\n/, "")
      .replace(/\{\/\*[\s\S]*?\*\/\}/g, "")
      .replace(/<!--[\s\S]*?-->/g, "")
      .replace(/\b[\w-]+=(["'])[^"']*\1/g, "");   // attributes (class names, CSS vars)
  }
  return null; // other files: dash rule not applied
}

const DASHES = [
  { re: /—/g, name: "em dash" },
  { re: /–/g, name: "en dash" },
  { re: /(^|[^-])--(?!-)/g, name: "double dash" },
];

function loadBlocklist() {
  const p = join(ROOT, "private", "blocklist.txt");
  if (!existsSync(p)) return { terms: [], missing: true };
  const terms = readFileSync(p, "utf8")
    .split("\n").map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"));
  return { terms, missing: false };
}

function escapeRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

const problems = [];
const files = walk(ROOT);
const { terms, missing } = loadBlocklist();
const termRes = terms.map((t) => ({ t, re: new RegExp(`(^|[^\\p{L}\\p{N}])${escapeRe(t)}(?=$|[^\\p{L}\\p{N}])`, "giu") }));

for (const file of files) {
  const rel = relative(ROOT, file);
  const text = readFileSync(file, "utf8");
  const lines = text.split("\n");

  // Blocklist: every text file, every line.
  // The term itself is never printed, so it can't leak into public CI logs.
  termRes.forEach(({ re }, ti) => {
    lines.forEach((line, i) => {
      re.lastIndex = 0;
      if (re.test(line)) problems.push(`${rel}:${i + 1}  blocklisted term #${ti + 1} from private/blocklist.txt`);
    });
  });

  // Dashes: visible copy only.
  if (!COPY_DIRS.some((d) => rel.startsWith(d + "/"))) continue;
  const visible = visibleText(file, text);
  if (visible == null) continue;
  visible.split("\n").forEach((line) => {
    for (const { re, name } of DASHES) {
      re.lastIndex = 0;
      if (re.test(line)) {
        const n = lines.findIndex((l) => l.includes(line.trim().slice(0, 40)));
        problems.push(`${rel}:${n + 1}  ${name}: "${line.trim().slice(0, 80)}"`);
      }
    }
  });
}

if (missing) console.warn("Note: private/blocklist.txt not found, blocklist check skipped.");
else if (terms.length === 0) console.warn("Note: private/blocklist.txt has no terms yet, blocklist check is empty.");

if (problems.length) {
  console.error(`Content check failed (${problems.length}):\n` + problems.map((p) => "  " + p).join("\n"));
  process.exit(1);
}
console.log(`Content check passed: ${files.length} files scanned, ${terms.length} blocklist terms.`);
