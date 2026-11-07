#!/usr/bin/env node
// Builds worker/kb_index.json from content/kb/**/*.md for the Ask Taggart assistant.
// Each file is split into passages at "## " headings. BM25 term statistics are precomputed
// so the Worker only has to score the question at request time.
// Run: node scripts/build-kb-index.mjs  (also runs as part of npm run build)

import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { tokenize } from "../worker/text.js";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const KB = join(ROOT, "content", "kb");
const OUT = join(ROOT, "worker", "kb_index.json");

// Files whose passages are always given to the model, so broad questions ("tell me about him")
// work even when keyword search finds little.
const CORE_FILES = new Set(["00_about.md", "01_current_role.md"]);

// Pages that exist on the site. Source links must point at one of these.
const PAGES = new Set([
  "/", "/about", "/about#how-i-work", "/about#experience", "/about#other-work", "/about#education", "/about#skills",
  ...readdirSync(join(ROOT, "src", "content", "projects")).map((f) => `/projects/${f.replace(/\.md$/, "")}`),
]);

function walk(dir, out = []) {
  for (const name of readdirSync(dir).sort()) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (name.endsWith(".md")) out.push(p);
  }
  return out;
}

function frontMatter(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---\n/);
  const meta = {};
  if (m) for (const line of m[1].split("\n")) {
    const kv = line.match(/^(\w+):\s*(.*)$/);
    if (kv) meta[kv[1]] = kv[2].replace(/^"(.*)"$/, "$1");
  }
  return { meta, body: m ? text.slice(m[0].length) : text };
}

const clean = (s) => s.replace(/<!--[\s\S]*?-->/g, "").replace(/\n{3,}/g, "\n\n").trim();

const passages = [];
const problems = [];

for (const file of walk(KB)) {
  const rel = relative(KB, file);
  const { meta, body } = frontMatter(readFileSync(file, "utf8"));
  const url = meta.page_url || "/";
  if (!PAGES.has(url)) problems.push(`${rel}: page_url ${url} is not a page on the site`);
  const docTitle = (body.match(/^# (.+)$/m)?.[1] || meta.title || rel).trim();
  const fileName = rel.split("/").pop();

  // Split into sections at "## " headings. Text before the first heading joins the first section.
  const parts = body.replace(/^# .+$/m, "").split(/^## /m);
  const lead = clean(parts.shift() || "");
  parts.forEach((part, i) => {
    const nl = part.indexOf("\n");
    const heading = (nl === -1 ? part : part.slice(0, nl)).trim();
    let text = clean(nl === -1 ? "" : part.slice(nl + 1));
    if (i === 0 && lead) text = `${lead}\n\n${text}`;
    if (!text) return;
    passages.push({
      id: `${rel.replace(/\.md$/, "")}#${passages.length}`,
      doc: docTitle,
      heading,
      url,
      core: CORE_FILES.has(fileName),
      text,
    });
  });
}

// BM25 statistics. Title and heading words are counted too, so "Lastro" finds every Lastro passage.
const df = {};
for (const p of passages) {
  const terms = tokenize(`${p.doc} ${p.heading} ${p.text}`);
  p.len = terms.length;
  p.tf = {};
  for (const t of terms) p.tf[t] = (p.tf[t] || 0) + 1;
  for (const t of Object.keys(p.tf)) df[t] = (df[t] || 0) + 1;
}
const avgdl = passages.reduce((a, p) => a + p.len, 0) / passages.length;

if (problems.length) {
  console.error("KB index failed:\n" + problems.map((p) => "  " + p).join("\n"));
  process.exit(1);
}

writeFileSync(OUT, JSON.stringify({ built: "kb", n: passages.length, avgdl, df, passages }));
const words = passages.reduce((a, p) => a + p.text.split(/\s+/).length, 0);
console.log(`KB index built: ${passages.length} passages (${passages.filter((p) => p.core).length} core), ${words} words.`);
