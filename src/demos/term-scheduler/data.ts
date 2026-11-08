// Invented demo term. Every student, supervisor, slot and price here is made up.
// Prices are in "credits", a pretend unit, not money.

export type PathId = "characters" | "environments" | "effects";
export type RegionId = "aw" | "ae" | "eu" | "ap";

/** Session times are stored in Pacific time (PT). Offsets are hours ahead of PT, fixed for the demo. */
export const REGIONS: Record<RegionId, { name: string; offset: number }> = {
  aw: { name: "Americas West", offset: 0 },
  ae: { name: "Americas East", offset: 3 },
  eu: { name: "Europe", offset: 9 },
  ap: { name: "Asia Pacific", offset: 16 },
};

export const PATHS: Record<PathId, { name: string }> = {
  characters: { name: "Characters" },
  environments: { name: "Environments" },
  effects: { name: "Effects" },
};
export const PATH_IDS = Object.keys(PATHS) as PathId[];

export interface Student { id: string; name: string; path: PathId; region: RegionId }
export interface Slot { day: number; hour: number } // day 0 = Monday, hour in PT (0 to 23)
export interface Supervisor { id: string; name: string; paths: PathId[]; slots: Slot[]; price: number; maxGroups: number }

/** Group rules for the demo. */
export const CAP = 8;          // most students in one group
export const BAND_EDGE = 6;    // up to 6 students is the standard band
export const LARGE_EXTRA = 20; // 7 or 8 students adds this many credits to the group

const roster: [string, PathId, RegionId][] = [
  ["Juno Q.", "characters", "eu"], ["Ilse W.", "characters", "eu"], ["Mateo R.", "characters", "eu"], ["Pia N.", "characters", "eu"],
  ["Kenji A.", "characters", "ap"], ["Yuna S.", "characters", "ap"], ["Arjun T.", "characters", "ap"],
  ["Wren H.", "characters", "aw"], ["Cal D.", "characters", "aw"], ["Noor F.", "characters", "aw"],
  ["Ezra B.", "characters", "ae"], ["Tess G.", "characters", "ae"],

  ["Lotte V.", "environments", "eu"], ["Bram K.", "environments", "eu"], ["Elodie P.", "environments", "eu"],
  ["Nils J.", "environments", "eu"], ["Marta C.", "environments", "eu"], ["Oskar E.", "environments", "eu"],
  ["Hiro M.", "environments", "ap"], ["Mei L.", "environments", "ap"], ["Jin P.", "environments", "ap"],
  ["Sana K.", "environments", "ap"], ["Tavi R.", "environments", "ap"],
  ["Remy O.", "environments", "aw"], ["Skye T.", "environments", "aw"],
  ["Dara Q.", "environments", "ae"], ["Felix N.", "environments", "ae"],

  ["Ines B.", "effects", "eu"], ["Teo Z.", "effects", "eu"], ["Annika L.", "effects", "eu"], ["Luca F.", "effects", "eu"], ["Freya D.", "effects", "eu"],
  ["Ren I.", "effects", "ap"], ["Aiko T.", "effects", "ap"], ["Minh V.", "effects", "ap"], ["Priya S.", "effects", "ap"],
  ["Jory W.", "effects", "aw"], ["Kit M.", "effects", "aw"],
  ["Lou A.", "effects", "ae"], ["Nia P.", "effects", "ae"],
];

export const STUDENTS: Student[] = roster.map(([name, path, region], i) => ({ id: `s${i + 1}`, name, path, region }));

const s = (day: number, hour: number): Slot => ({ day, hour });
export const SUPERVISORS: Supervisor[] = [
  { id: "aria", name: "Aria Bellweather", paths: ["characters"], slots: [s(3, 8), s(0, 9), s(5, 9)], price: 120, maxGroups: 2 },
  { id: "cole", name: "Cole Danvers", paths: ["characters", "environments"], slots: [s(1, 16), s(2, 16)], price: 100, maxGroups: 2 },
  { id: "mina", name: "Mina Okafor", paths: ["environments"], slots: [s(2, 7), s(3, 9)], price: 110, maxGroups: 2 },
  { id: "rafa", name: "Rafael Lindqvist", paths: ["environments"], slots: [s(3, 17), s(0, 17)], price: 130, maxGroups: 1 },
  { id: "sora", name: "Sora Whitlock", paths: ["effects"], slots: [s(1, 8), s(2, 9)], price: 105, maxGroups: 2 },
  { id: "dev", name: "Dev Castellan", paths: ["effects"], slots: [s(3, 15), s(4, 15)], price: 115, maxGroups: 2 },
  { id: "lena", name: "Lena Marchetti", paths: ["characters"], slots: [s(0, 8), s(4, 16), s(6, 10)], price: 140, maxGroups: 1 },
  { id: "hugo", name: "Hugo Brennan", paths: ["characters", "effects"], slots: [s(1, 6), s(5, 17)], price: 100, maxGroups: 1 },
];

/** The late roster change the tour walks through. */
export const LATE_CHANGE = { studentId: "s1", from: "eu" as RegionId, to: "ap" as RegionId };
