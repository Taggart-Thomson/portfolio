// Stage 1 and the failed first try at stage 2, rebuilt from scratch for the demo.
// Both run live in the page on the invented snippets.

import { KNOWN_HOSTS } from "./data";

export interface Turn { role: "Instructor" | "Participant"; text: string }

const SPEAKER = /^([A-Za-z][A-Za-z0-9 ._'-]{0,40}):\s*(.*)$/;

/** Stage 1, rules-based cleaner: drop the header, cue numbers and timestamps,
 *  replace speaker names with roles, and stitch each speaker's lines into one turn. */
export function cleanVtt(vtt: string): Turn[] {
  const hosts = new Set(KNOWN_HOSTS.map((h) => h.toLowerCase()));
  const segs: Turn[] = [];
  for (const raw of vtt.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line === "WEBVTT" || /^\d+$/.test(line) || line.includes("-->")) continue;
    const m = SPEAKER.exec(line);
    if (m) {
      const role = hosts.has(m[1].trim().toLowerCase()) ? "Instructor" : "Participant";
      if (m[2]) segs.push({ role, text: m[2].trim() });
    } else if (segs.length) {
      segs[segs.length - 1].text += " " + line; // caption wrapped onto a new cue
    }
  }
  const turns: Turn[] = [];
  for (const s of segs) {
    const last = turns[turns.length - 1];
    if (last && last.role === s.role) last.text += " " + s.text;
    else turns.push({ ...s });
  }
  return turns;
}

export interface RulePair { q: string; a: string }

const sentences = (t: string) => t.match(/[^.?!]+[.?!]+["')]*|[^.?!]+$/g)?.map((s) => s.trim()).filter(Boolean) ?? [];

/** The first stage 2 attempt, rules only:
 *  1. A sentence ending in "?" is a question.
 *  2. Its answer is everything after it, up to the next question.
 *  3. If nothing follows it in the same turn, the next speaker's turn is the answer. */
export function rulesExtract(turns: Turn[]): RulePair[] {
  const out: RulePair[] = [];
  turns.forEach((turn, ti) => {
    let cur: { q: string; a: string[] } | null = null;
    const close = (atEnd: boolean) => {
      if (!cur) return;
      let a = cur.a.join(" ");
      if (!a && atEnd && turns[ti + 1]) a = sentences(turns[ti + 1].text).filter((s) => !s.endsWith("?")).join(" ");
      out.push({ q: cur.q, a });
      cur = null;
    };
    for (const s of sentences(turn.text)) {
      if (s.endsWith("?")) { close(false); cur = { q: s, a: [] }; }
      else if (cur) cur.a.push(s);
    }
    close(true);
  });
  return out;
}
