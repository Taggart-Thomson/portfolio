// Deterministic scheduling engine for the demo. Pure functions, no I/O.
// Written from scratch for the portfolio: fit rule, cost structure, slot ranking,
// placement, and contract-impact checks.

import { BAND_EDGE, CAP, LARGE_EXTRA, PATH_IDS, REGIONS } from "./data";
import type { PathId, RegionId, Slot, Student, Supervisor } from "./data";

export type Fit = "ideal" | "ok" | "bad";
export const FIT_LABEL: Record<Fit, string> = { ideal: "Ideal", ok: "OK", bad: "Not OK" };
const FIT_SCORE: Record<Fit, number> = { ideal: 3, ok: 1, bad: -4 };

export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
export const DAY_FULL = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
/** Midweek preferred. Weekends are never used (null). */
export const DAY_WEIGHT: (number | null)[] = [0, 0.1, 0.3, 0.3, 0.1, null, null];

/** The fit rule: local start 8am to 9pm is ideal, 6 to 8am is OK, anything else is not OK. */
export function fitFor(localHour: number): Fit {
  if (localHour >= 8 && localHour < 21) return "ideal";
  if (localHour >= 6 && localHour < 8) return "ok";
  return "bad";
}

export function toLocal(slot: Slot, region: RegionId): Slot {
  const t = slot.hour + REGIONS[region].offset;
  return { day: (slot.day + Math.floor(t / 24)) % 7, hour: t % 24 };
}

export function fmtHour(h: number) {
  const ap = h < 12 ? "AM" : "PM";
  return `${h % 12 || 12}:00 ${ap}`;
}
export const fmtSlot = (s: Slot) => `${DAYS[s.day]} ${fmtHour(s.hour)}`;

export function studentFit(slot: Slot, region: RegionId): Fit {
  return fitFor(toLocal(slot, region).hour);
}

/** Group cost in credits: the supervisor's price, plus a surcharge in the larger size band. */
export const isLarge = (n: number) => n > BAND_EDGE;
export const groupCost = (price: number, n: number) => (n === 0 ? 0 : price + (isLarge(n) ? LARGE_EXTRA : 0));
export const bandLabel = (n: number) => (isLarge(n) ? "Large band (7 to 8)" : "Standard band (up to 6)");
export const minGroups = (n: number) => Math.ceil(n / CAP);

export interface Candidate {
  sup: Supervisor;
  slot: Slot;
  counts: Record<Fit, number>;
  score: number;
  skipped?: string;
}

function slotScore(slot: Slot, students: Student[], price: number) {
  const counts: Record<Fit, number> = { ideal: 0, ok: 0, bad: 0 };
  let fit = 0;
  for (const st of students) {
    const f = studentFit(slot, st.region);
    counts[f]++;
    fit += FIT_SCORE[f];
  }
  return { counts, score: fit * 10 + (DAY_WEIGHT[slot.day] ?? 0) * 10 - price / 10 };
}

/** Every slot of every supervisor who teaches the path, ranked by fit, day and price. Weekends listed as skipped. */
export function rankSlots(path: PathId, students: Student[], sups: Supervisor[]): Candidate[] {
  const pathStudents = students.filter((s) => s.path === path);
  const out: Candidate[] = [];
  for (const sup of sups) {
    if (!sup.paths.includes(path)) continue;
    for (const slot of sup.slots) {
      const { counts, score } = slotScore(slot, pathStudents, sup.price);
      const skipped = DAY_WEIGHT[slot.day] === null ? "Weekend, never used" : undefined;
      out.push({ sup, slot, counts, score, skipped });
    }
  }
  return out.sort((a, b) => Number(!!a.skipped) - Number(!!b.skipped) || b.score - a.score);
}

export interface Group { id: string; path: PathId; supId: string; slot: Slot; studentIds: string[] }

export interface PathReport {
  path: PathId;
  n: number;
  groups: number;
  sizes: number[];
  cost: number;
  alt?: { groups: number; cost: number; bad: number };
  reason: string;
  counts: Record<Fit, number>;
}

function combos<T>(items: T[], k: number, start = 0, acc: T[] = [], out: T[][] = []): T[][] {
  if (acc.length === k) { out.push(acc.slice()); return out; }
  for (let i = start; i < items.length; i++) { acc.push(items[i]); combos(items, k, i + 1, acc, out); acc.pop(); }
  return out;
}

/** Places students into the chosen slots, pickiest first (fewest good options), each group capped. */
function assign(students: Student[], chosen: Candidate[], cap: number) {
  const good = (st: Student) => chosen.filter((c) => studentFit(c.slot, st.region) !== "bad").length;
  const order = students.slice().sort((a, b) => good(a) - good(b));
  const members: Student[][] = chosen.map(() => []);
  for (const st of order) {
    let best = -1, bestVal = -Infinity;
    chosen.forEach((c, gi) => {
      if (members[gi].length >= cap) return;
      const val = FIT_SCORE[studentFit(c.slot, st.region)] * 100 - members[gi].length;
      if (val > bestVal) { bestVal = val; best = gi; }
    });
    members[best].push(st);
  }
  const bad = students.filter((st) => {
    const gi = members.findIndex((m) => m.includes(st));
    return studentFit(chosen[gi].slot, st.region) === "bad";
  }).length;
  const cost = chosen.reduce((sum, c, gi) => sum + groupCost(c.sup.price, members[gi].length), 0);
  return { members, bad, cost };
}

/** Best set of k slots for a path: brute force over the candidates, with supervisor limits. */
function plan(students: Student[], cands: Candidate[], k: number, load: Map<string, number>) {
  let best: { chosen: Candidate[]; members: Student[][]; bad: number; cost: number } | null = null;
  let bestScore = -Infinity;
  for (const combo of combos(cands, k)) {
    const per = new Map<string, number>();
    let legal = true;
    for (const c of combo) {
      const used = (per.get(c.sup.id) ?? 0) + 1;
      per.set(c.sup.id, used);
      if ((load.get(c.sup.id) ?? 0) + used > c.sup.maxGroups) legal = false;
      if (combo.some((o) => o !== c && o.sup.id === c.sup.id && o.slot.day === c.slot.day)) legal = false;
    }
    if (!legal) continue;
    let fit = 0;
    for (const st of students) fit += Math.max(...combo.map((c) => FIT_SCORE[studentFit(c.slot, st.region)]));
    const score = fit * 10 + combo.reduce((s, c) => s + (DAY_WEIGHT[c.slot.day] ?? 0) * 10 - c.sup.price / 10, 0);
    if (score > bestScore) {
      bestScore = score;
      best = { chosen: combo, ...assign(students, combo, Math.ceil(students.length / k)) };
    }
  }
  return best;
}

/** Builds the whole draft: cheapest structure per path, slots, placements and a plain-language report. */
export function buildDraft(students: Student[], sups: Supervisor[]) {
  const groups: Group[] = [];
  const reports: PathReport[] = [];
  const load = new Map<string, number>();
  const usedSlots = new Set<string>();
  const byPath = PATH_IDS.map((p) => ({ p, st: students.filter((s) => s.path === p) })).sort((a, b) => b.st.length - a.st.length);

  for (const { p, st } of byPath) {
    const cands = rankSlots(p, students, sups).filter((c) => !c.skipped && !usedSlots.has(`${c.sup.id}:${c.slot.day}:${c.slot.hour}`));
    const k0 = minGroups(st.length);
    const a = plan(st, cands, k0, load);
    const b = plan(st, cands, k0 + 1, load);
    let pick = a!, reason: string, alt: PathReport["alt"];
    if (a && b && a.bad >= 2 && b.bad < a.bad) {
      pick = b;
      reason = `Added a group because ${a.bad} students would start at a bad local time with ${k0}.`;
      alt = { groups: k0, cost: a.cost, bad: a.bad };
    } else if (a && b && b.cost < a.cost) {
      pick = b;
      reason = `${k0 + 1} groups cost less than ${k0}.`;
      alt = { groups: k0, cost: a.cost, bad: a.bad };
    } else {
      reason = `The fewest groups that fit ${st.length} students at up to ${CAP} each.`;
      if (b) alt = { groups: k0 + 1, cost: b.cost, bad: b.bad };
    }
    const counts: Record<Fit, number> = { ideal: 0, ok: 0, bad: 0 };
    pick.chosen.forEach((c, gi) => {
      const g: Group = { id: `g${groups.length + 1}`, path: p, supId: c.sup.id, slot: c.slot, studentIds: pick.members[gi].map((m) => m.id) };
      groups.push(g);
      load.set(c.sup.id, (load.get(c.sup.id) ?? 0) + 1);
      usedSlots.add(`${c.sup.id}:${c.slot.day}:${c.slot.hour}`);
      for (const m of pick.members[gi]) counts[studentFit(c.slot, m.region)]++;
    });
    reports.push({ path: p, n: st.length, groups: pick.chosen.length, sizes: pick.members.map((m) => m.length), cost: pick.cost, alt, reason, counts });
  }
  return { groups, reports };
}

// ---------- reading the draft ----------

export const supById = (sups: Supervisor[], id: string) => sups.find((s) => s.id === id)!;

export function groupOf(groups: Group[], studentId: string) {
  return groups.find((g) => g.studentIds.includes(studentId));
}

export function termTotals(groups: Group[], students: Student[], sups: Supervisor[]) {
  const counts: Record<Fit, number> = { ideal: 0, ok: 0, bad: 0 };
  let cost = 0;
  for (const g of groups) {
    cost += groupCost(supById(sups, g.supId).price, g.studentIds.length);
    for (const id of g.studentIds) counts[studentFit(g.slot, students.find((s) => s.id === id)!.region)]++;
  }
  return { groups: groups.length, placed: groups.reduce((n, g) => n + g.studentIds.length, 0), cost, counts };
}

/** Each supervisor's term: groups held and credits. A change to either affects their contract. */
export function contracts(groups: Group[], sups: Supervisor[]) {
  const m = new Map<string, { groups: number; credits: number }>();
  for (const g of groups) {
    const cur = m.get(g.supId) ?? { groups: 0, credits: 0 };
    cur.groups++;
    cur.credits += groupCost(supById(sups, g.supId).price, g.studentIds.length);
    m.set(g.supId, cur);
  }
  return m;
}

export interface ContractChange { supId: string; name: string; before: number; after: number; why: string }

export function contractChanges(before: Group[], after: Group[], sups: Supervisor[]): ContractChange[] {
  const a = contracts(before, sups), b = contracts(after, sups);
  const out: ContractChange[] = [];
  for (const sup of sups) {
    const x = a.get(sup.id) ?? { groups: 0, credits: 0 };
    const y = b.get(sup.id) ?? { groups: 0, credits: 0 };
    if (x.credits === y.credits && x.groups === y.groups) continue;
    const why = x.groups !== y.groups
      ? `${x.groups} to ${y.groups} groups`
      : y.credits > x.credits ? "a group moves into the large band" : "a group drops to the standard band";
    out.push({ supId: sup.id, name: sup.name, before: x.credits, after: y.credits, why });
  }
  return out;
}

export function moveStudent(groups: Group[], studentId: string, toGroupId: string): Group[] {
  return groups.map((g) => {
    const ids = g.studentIds.filter((id) => id !== studentId);
    if (g.id === toGroupId) ids.push(studentId);
    return { ...g, studentIds: ids };
  });
}

export interface MoveOption {
  group: Group;
  fit: Fit;
  local: Slot;
  costDelta: number;
  changes: ContractChange[];
  full: boolean;
}

/** Every other group on the student's path, with fit, cost change and contract impact. Best first. */
export function moveOptions(groups: Group[], student: Student, sups: Supervisor[]): MoveOption[] {
  const from = groupOf(groups, student.id);
  const total = (gs: Group[]) => gs.reduce((s, g) => s + groupCost(supById(sups, g.supId).price, g.studentIds.length), 0);
  return groups
    .filter((g) => g.path === student.path && g.id !== from?.id)
    .map((g) => {
      const after = moveStudent(groups, student.id, g.id);
      return {
        group: g,
        fit: studentFit(g.slot, student.region),
        local: toLocal(g.slot, student.region),
        costDelta: total(after) - total(groups),
        changes: contractChanges(groups, after, sups),
        full: g.studentIds.length >= CAP,
      };
    })
    .sort((a, b) => FIT_SCORE[b.fit] - FIT_SCORE[a.fit] || a.costDelta - b.costDelta);
}

/** Cheapest unused slot that would give this student an ideal time, if a new group were opened. */
export function newGroupOption(groups: Group[], student: Student, students: Student[], sups: Supervisor[]) {
  const load = contracts(groups, sups);
  const used = new Set(groups.map((g) => `${g.supId}:${g.slot.day}:${g.slot.hour}`));
  return rankSlots(student.path, students, sups)
    .filter((c) => !c.skipped && !used.has(`${c.sup.id}:${c.slot.day}:${c.slot.hour}`))
    .filter((c) => (load.get(c.sup.id)?.groups ?? 0) < c.sup.maxGroups)
    .filter((c) => studentFit(c.slot, student.region) === "ideal")
    .sort((a, b) => a.sup.price - b.sup.price)[0];
}
