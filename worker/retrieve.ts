// Keyword retrieval (BM25) over the prebuilt knowledge index.
import index from "./kb_index.json";
import { tokenize } from "./text.js";

export interface Passage {
  id: string;
  doc: string;
  heading: string;
  url: string;
  core: boolean;
  text: string;
  len: number;
  tf: Record<string, number>;
}

const PASSAGES = index.passages as Passage[];
const DF = index.df as Record<string, number>;
const N = index.n as number;
const AVGDL = index.avgdl as number;
const K1 = 1.2;
const B = 0.75;

export const CORE = PASSAGES.filter((p) => p.core);

/** Top passages for a query, excluding core passages (those are always in the system prompt). */
export function retrieve(query: string, k = 8): Passage[] {
  const terms = [...new Set(tokenize(query))];
  if (!terms.length) return [];
  const scored: { p: Passage; s: number }[] = [];
  for (const p of PASSAGES) {
    if (p.core) continue;
    let s = 0;
    for (const t of terms) {
      const f = p.tf[t];
      if (!f) continue;
      const idf = Math.log(1 + (N - DF[t] + 0.5) / (DF[t] + 0.5));
      s += idf * ((f * (K1 + 1)) / (f + K1 * (1 - B + (B * p.len) / AVGDL)));
    }
    if (s > 0) scored.push({ p, s });
  }
  return scored.sort((a, b) => b.s - a.s).slice(0, k).map((x) => x.p);
}

export const formatPassage = (p: Passage) =>
  `<passage source="${p.doc} > ${p.heading}" page="${p.url}">\n${p.text}\n</passage>`;
