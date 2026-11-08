// The assistant's tools, rebuilt from scratch for the demo. The model never sees the
// catalog: it asks for a search, the app runs it, and only safe fields go back.

import { WORKS } from "./data";
import type { Medium, Work } from "./data";

export interface SearchArgs {
  text?: string;
  medium?: Medium;
  min_height_cm?: number;
  outdoor_capable?: boolean;
  location?: string;
}

/** Fields the model may see. Cost, insured value and owner are never included. */
export const SAFE_FIELDS = ["id", "title", "artist", "year", "medium", "material", "dimensions_cm", "weight_kg", "location", "status", "outdoor_capable"] as const;
export const HIDDEN_FIELDS = ["cost", "insured value", "owner"];

export function shape(w: Work) {
  return {
    id: w.id, title: w.title, artist: w.artist, year: w.year, medium: w.medium, material: w.material,
    dimensions_cm: [w.h, w.w, w.d], ...(w.kg !== undefined ? { weight_kg: w.kg } : {}),
    location: w.location, status: w.status, outdoor_capable: w.outdoor,
  };
}

function matches(w: Work, a: SearchArgs) {
  if (a.text) {
    const hay = `${w.title} ${w.artist} ${w.material} ${w.location}`.toLowerCase();
    if (!a.text.toLowerCase().split(/\s+/).every((t) => hay.includes(t))) return false;
  }
  if (a.medium && w.medium !== a.medium) return false;
  if (a.min_height_cm !== undefined && w.h < a.min_height_cm) return false;
  if (a.outdoor_capable !== undefined && w.outdoor !== a.outdoor_capable) return false;
  if (a.location && !w.location.toLowerCase().includes(a.location.toLowerCase())) return false;
  return true;
}

export function searchCollection(a: SearchArgs) {
  const hits = WORKS.filter((w) => matches(w, a)).sort((x, y) => y.h - x.h);
  return { total_matches: hits.length, results: hits.map(shape) };
}

export function collectionStats(groupBy: "medium" | "location") {
  const out: Record<string, number> = {};
  for (const w of WORKS) {
    const k = groupBy === "medium" ? w.medium : w.location.startsWith("On loan") ? "On loan" : w.location;
    out[k] = (out[k] ?? 0) + 1;
  }
  return { total: WORKS.length, groups: out };
}

/** Readable form of a tool call, for the line under each answer. */
export function fmtCall(name: string, args: object) {
  const parts = Object.entries(args).map(([k, v]) => `${k}: ${typeof v === "string" ? `"${v}"` : v}`);
  return `${name}(${parts.join(", ")})`;
}
