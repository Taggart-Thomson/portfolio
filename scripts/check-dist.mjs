#!/usr/bin/env node
// Post-build copy check. The HTML compressor drops a space when a line break sits next to an
// inline tag (for example "studied\n<strong>Visual Art</strong>\nin 2011" renders as
// "studied<strong>Visual Art</strong>in 2011"). This fails the build if any built page has
// text glued to an inline tag like that.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const DIST = join(ROOT, "dist");
const INLINE = "strong|em|b|i|a|code|span|mark|q|abbr|small";
const OPEN = new RegExp(`[A-Za-z0-9,.;:!?)](<(?:${INLINE})\\b[^>]*>)`, "g");
const CLOSE = new RegExp(`</(?:${INLINE})>[A-Za-z0-9(]`, "g");

const files = [];
(function walk(d) {
  for (const n of readdirSync(d)) {
    const p = join(d, n);
    if (statSync(p).isDirectory()) walk(p);
    else if (n.endsWith(".html")) files.push(p);
  }
})(DIST);

const problems = [];
for (const f of files) {
  const html = readFileSync(f, "utf8").replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, "");
  for (const re of [OPEN, CLOSE]) {
    for (const m of html.matchAll(re)) {
      const snip = html.slice(Math.max(0, m.index - 30), m.index + m[0].length + 20).replace(/ data-astro-cid-\w+/g, "").replace(/\s+/g, " ");
      problems.push(`${relative(ROOT, f)}: missing space near "${snip}"`);
    }
  }
}
if (problems.length) {
  console.error(`Copy spacing check failed (${problems.length}):\n` + problems.map((p) => "  " + p).join("\n"));
  console.error("Fix: keep the text and the inline tag on the same line in the source.");
  process.exit(1);
}
console.log(`Copy spacing check passed: ${files.length} pages.`);
