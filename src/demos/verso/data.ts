// Invented data for the Verso demo. The organization, entities, people, artists,
// artworks and amounts are all made up. Emails use example.com.

export interface Entity { id: string; name: string; reviewer: string }
export const ENTITIES: Entity[] = [
  { id: "soc", name: "Lantern Arts Society", reviewer: "mara" },
  { id: "inc", name: "Lantern Studios Inc.", reviewer: "oli" },
  { id: "trust", name: "Lantern Collection Trust", reviewer: "wendy" },
];

export type Role = "contractor" | "reviewer" | "accounting" | "admin";
export interface Person { id: string; name: string; role: Role; email: string; entity?: string; active: boolean }
export const PEOPLE: Person[] = [
  { id: "jun", name: "Jun Park", role: "contractor", email: "jun.park@example.com", active: true },
  { id: "bea", name: "Bea Moreno", role: "contractor", email: "bea.moreno@example.com", active: true },
  { id: "theo", name: "Theo Lund", role: "contractor", email: "theo.lund@example.com", active: true },
  { id: "mara", name: "Mara Quell", role: "reviewer", email: "mara.quell@example.com", entity: "soc", active: true },
  { id: "oli", name: "Oli Brandt", role: "reviewer", email: "oli.brandt@example.com", entity: "inc", active: true },
  { id: "wendy", name: "Wendy Arkwright", role: "reviewer", email: "wendy.arkwright@example.com", entity: "trust", active: true },
  { id: "pat", name: "Pat Ellery", role: "accounting", email: "pat.ellery@example.com", active: true },
  { id: "sol", name: "Sol Ferreira", role: "admin", email: "sol.ferreira@example.com", active: true },
];

export interface Contract { id: string; contractor: string; entity: string; title: string; ends: string }
export const CONTRACTS: Contract[] = [
  { id: "C-114", contractor: "jun", entity: "inc", title: "Installation crew, spring program", ends: "2027-03-31" },
  { id: "C-121", contractor: "jun", entity: "soc", title: "Gallery rehang, community wing", ends: "2026-12-15" },
  { id: "C-108", contractor: "bea", entity: "trust", title: "Conservation checks, outdoor works", ends: "2027-06-30" },
  { id: "C-117", contractor: "theo", entity: "trust", title: "Catalogue photography", ends: "2027-01-31" },
  { id: "C-119", contractor: "theo", entity: "soc", title: "Event photography", ends: "2026-12-31" },
];

export type InvStatus = "submitted" | "returned" | "approved" | "paid";
export interface Event { at: string; who: string; what: string }
export interface Invoice { id: string; contract: string; desc: string; amount: number; date: string; status: InvStatus; note?: string; history: Event[] }

export const INVOICES: Invoice[] = [
  { id: "INV-2041", contract: "C-108", desc: "October condition reports, 6 outdoor works", amount: 1450, date: "2026-10-31", status: "paid",
    history: [{ at: "Oct 31", who: "Bea Moreno", what: "Submitted" }, { at: "Nov 2", who: "Wendy Arkwright", what: "Approved" }, { at: "Nov 5", who: "Pat Ellery", what: "Payment recorded, ref EFT-5531" }] },
  { id: "INV-2046", contract: "C-117", desc: "Catalogue photography, 18 works", amount: 2160, date: "2026-11-03", status: "approved",
    history: [{ at: "Nov 3", who: "Theo Lund", what: "Submitted" }, { at: "Nov 4", who: "Wendy Arkwright", what: "Approved" }] },
  { id: "INV-2047", contract: "C-119", desc: "Fall opening night photography", amount: 600, date: "2026-11-04", status: "submitted",
    history: [{ at: "Nov 4", who: "Theo Lund", what: "Submitted" }] },
  { id: "INV-2049", contract: "C-121", desc: "Rehang labour, 2 days", amount: 980, date: "2026-11-05", status: "returned", note: "Please split labour and materials into separate lines.",
    history: [{ at: "Nov 5", who: "Jun Park", what: "Submitted" }, { at: "Nov 6", who: "Mara Quell", what: "Returned: Please split labour and materials into separate lines." }] },
];

/** Prefilled draft the tour submits. */
export const DRAFT = { contract: "C-114", desc: "Install of 3 outdoor works, Nov 9 to 11", amount: 1800 };

// ---------- the collection ----------

export type Medium = "sculpture" | "painting" | "print" | "textile" | "photograph" | "installation";
export interface Work {
  id: string; title: string; artist: string; year: number; medium: Medium; material: string;
  h: number; w: number; d: number; kg?: number; location: string; status: "available" | "on hold" | "on loan";
  outdoor: boolean;
  // Sensitive. Kept in the app, never sent to the assistant.
  cost: number; insured: number; owner: string;
}

type Row = [string, string, number, Medium, string, number, number, number, number | undefined, string, Work["status"], boolean, number, number, string];
const rows: Row[] = [
  ["Tidewater Study", "Ines Halvorsen", 2011, "sculpture", "Bronze", 212, 80, 75, 640, "Warehouse", "available", true, 38000, 52000, "Lantern Collection Trust"],
  ["Small Gate", "Ines Halvorsen", 2014, "sculpture", "Bronze", 64, 40, 22, 48, "Office", "available", true, 9500, 14000, "Lantern Collection Trust"],
  ["Night Ferry", "Caspar Moll", 2009, "painting", "Oil on canvas", 120, 180, 4, undefined, "Office", "available", false, 12000, 18000, "Lantern Arts Society"],
  ["Paper Lanterns III", "Rue Okonjo", 2019, "installation", "Rice paper, steel wire, LED", 340, 600, 600, undefined, "Warehouse", "available", false, 26000, 30000, "Lantern Collection Trust"],
  ["Weathervane", "Tomas Ekwueme", 2016, "sculpture", "Corten steel", 410, 120, 120, 900, "On loan, City Hall plaza", "on loan", true, 61000, 75000, "Lantern Collection Trust"],
  ["Low Tide Grid", "Mae Calloway", 2021, "print", "Screenprint, edition 4 of 20", 70, 50, 1, undefined, "Warehouse", "available", false, 800, 1200, "Lantern Arts Society"],
  ["Low Tide Grid (blue)", "Mae Calloway", 2021, "print", "Screenprint, edition 9 of 20", 70, 50, 1, undefined, "Warehouse", "on hold", false, 800, 1200, "Lantern Arts Society"],
  ["Orchard Wall", "Juno Abernathy", 2018, "textile", "Wool and linen, hand woven", 240, 310, 3, 22, "Warehouse", "available", false, 14500, 19000, "Private lender"],
  ["Granary", "Leif Santoro", 2007, "photograph", "Archival pigment print", 100, 150, 4, undefined, "Office", "available", false, 3200, 4500, "Lantern Arts Society"],
  ["Granary, Winter", "Leif Santoro", 2008, "photograph", "Archival pigment print", 100, 150, 4, undefined, "Warehouse", "available", false, 3200, 4500, "Lantern Arts Society"],
  ["Stone Reader", "Odile Fairweather", 2003, "sculpture", "Granite", 160, 70, 60, 1100, "Warehouse", "available", true, 22000, 31000, "Lantern Collection Trust"],
  ["Signal Fire", "Tomas Ekwueme", 2020, "sculpture", "Painted steel", 230, 90, 90, 310, "Warehouse", "on hold", true, 27000, 34000, "Lantern Collection Trust"],
  ["Kitchen Window", "Caspar Moll", 2012, "painting", "Oil on linen", 60, 50, 3, undefined, "Office", "available", false, 4800, 7000, "Lantern Arts Society"],
  ["Field Notes 1 to 12", "Mae Calloway", 2017, "print", "Etching, set of 12", 30, 40, 1, undefined, "Warehouse", "available", false, 2400, 3600, "Lantern Arts Society"],
  ["Hearth", "Rue Okonjo", 2015, "sculpture", "Bronze and glass", 96, 60, 60, 120, "Warehouse", "available", false, 16000, 21000, "Private lender"],
  ["Bridge Song", "Juno Abernathy", 2022, "textile", "Cotton, natural dyes", 180, 120, 2, 6, "Office", "available", false, 7200, 9000, "Lantern Collection Trust"],
  ["Shoreline Benches", "Odile Fairweather", 2010, "installation", "Basalt, 3 pieces", 48, 220, 60, 2400, "On loan, Riverside Park", "on loan", true, 30000, 42000, "Lantern Collection Trust"],
  ["Morning Ledger", "Leif Santoro", 2019, "photograph", "Gelatin silver print", 50, 60, 3, undefined, "Warehouse", "available", false, 1500, 2200, "Lantern Arts Society"],
  ["Tall Grass", "Ines Halvorsen", 2018, "sculpture", "Stainless steel rods", 260, 140, 140, 180, "Warehouse", "available", true, 19000, 25000, "Lantern Collection Trust"],
  ["Blue Hour", "Caspar Moll", 2016, "painting", "Acrylic on panel", 90, 90, 4, undefined, "Warehouse", "available", false, 6500, 8500, "Private lender"],
  ["Untitled (Ropes)", "Rue Okonjo", 2012, "installation", "Hemp rope, wood", 300, 200, 200, undefined, "Warehouse", "on hold", false, 9000, 11000, "Lantern Arts Society"],
  ["Map of Small Rivers", "Juno Abernathy", 2013, "textile", "Embroidered silk", 90, 140, 1, 3, "Warehouse", "available", false, 5200, 7000, "Lantern Arts Society"],
  ["Lantern Keeper", "Tomas Ekwueme", 2012, "sculpture", "Bronze", 180, 55, 55, 420, "On loan, Central Library", "on loan", true, 33000, 46000, "Lantern Collection Trust"],
  ["Proof Sheets", "Mae Calloway", 2022, "print", "Risograph, set of 6", 42, 30, 1, undefined, "Office", "available", false, 600, 900, "Lantern Arts Society"],
];

export const WORKS: Work[] = rows.map((r, i) => ({
  id: `LC-${String(i + 1).padStart(3, "0")}`,
  title: r[0], artist: r[1], year: r[2], medium: r[3], material: r[4], h: r[5], w: r[6], d: r[7], kg: r[8],
  location: r[9], status: r[10], outdoor: r[11], cost: r[12], insured: r[13], owner: r[14],
}));
