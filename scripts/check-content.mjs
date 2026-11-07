#!/usr/bin/env node
// Content safety checks. Fails (exit 1) if:
//   1. visible copy contains an em dash, en dash or double dash, or
//   2. any term from the private blocklists (private/blocklist*.txt) appears anywhere in the repo,
//      unless it sits inside an exact phrase listed in private/allowlist.txt (optional).
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

// Blocklist files (all git-ignored), blocked in every file:
// hand-written terms, plus people's names generated from the rosters.
const BLOCKLIST_FILES = ["blocklist.txt", "blocklist-names.txt"];

// Words are compared case-insensitively and without accents ("José" matches "jose").
function tokens(s) {
  return s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().split(/[^\p{L}\p{N}]+/u).filter(Boolean);
}

function loadBlocklist() {
  const terms = new Map(); // "word word" -> "private/<file> line N"
  let found = 0, maxLen = 1;
  for (const f of BLOCKLIST_FILES) {
    const p = join(ROOT, "private", f);
    if (!existsSync(p)) continue;
    found++;
    readFileSync(p, "utf8").split("\n").forEach((raw, i) => {
      const l = raw.trim();
      if (!l || l.startsWith("#")) return;
      const t = tokens(l);
      if (!t.length) return;
      maxLen = Math.max(maxLen, t.length);
      const key = t.join(" ");
      if (!terms.has(key)) terms.set(key, `private/${f} line ${i + 1}`);
    });
  }
  return { terms, maxLen, missing: found === 0 };
}

// Exact phrases that are allowed even though they contain a blocked term
// (one per line in private/allowlist.txt, e.g. a school's full name).
function loadAllowlist() {
  const p = join(ROOT, "private", "allowlist.txt");
  if (!existsSync(p)) return [];
  return readFileSync(p, "utf8").split("\n").map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#")).map(tokens).filter((t) => t.length);
}

// Marks which word positions in a line sit inside an allowed phrase.
function allowedMask(t) {
  const mask = new Array(t.length).fill(false);
  for (const phrase of allowlist) {
    for (let a = 0; a + phrase.length <= t.length; a++) {
      if (phrase.every((w, k) => t[a + k] === w)) for (let k = 0; k < phrase.length; k++) mask[a + k] = true;
    }
  }
  return mask;
}

const problems = [];
const files = walk(ROOT);
const { terms, maxLen, missing } = loadBlocklist();
const allowlist = loadAllowlist();

for (const file of files) {
  const rel = relative(ROOT, file);
  const text = readFileSync(file, "utf8");
  const lines = text.split("\n");

  // Blocklist: every text file, every line, as whole words.
  // The term itself is never printed, so it can't leak into public CI logs.
  if (terms.size) lines.forEach((line, i) => {
    const t = tokens(line);
    const allowed = allowedMask(t);
    for (let a = 0; a < t.length; a++) {
      for (let n = 1; n <= maxLen && a + n <= t.length; n++) {
        if (allowed.slice(a, a + n).every(Boolean)) continue;
        const where = terms.get(t.slice(a, a + n).join(" "));
        if (where) problems.push(`${rel}:${i + 1}  blocklisted term (${where})`);
      }
    }
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

if (missing) console.warn("Note: no private blocklist files found, blocklist check skipped.");
else if (terms.size === 0) console.warn("Note: private blocklist files have no terms yet, blocklist check is empty.");

if (problems.length) {
  console.error(`Content check failed (${problems.length}):\n` + problems.map((p) => "  " + p).join("\n"));
  process.exit(1);
}
console.log(`Content check passed: ${files.length} files scanned, ${terms.size} blocklist terms.`);
