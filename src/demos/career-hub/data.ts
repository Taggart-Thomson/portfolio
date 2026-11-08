// Invented studios, postings and boards for the Career Hub demo. No real studio or school.

export type Disc = "Games" | "Film and VFX" | "Animation";
export type Region = "Americas" | "Europe" | "Asia Pacific";
export interface Studio { name: string; disc: Disc; region: Region; city: string; juniors: boolean; board: "Greenhouse" | "Lever" }

export const STUDIOS: Studio[] = [
  { name: "Pinecone Interactive", disc: "Games", region: "Americas", city: "Montreal", juniors: true, board: "Greenhouse" },
  { name: "Kettle Moon Games", disc: "Games", region: "Europe", city: "Warsaw", juniors: true, board: "Lever" },
  { name: "Brightwater VFX", disc: "Film and VFX", region: "Americas", city: "Vancouver", juniors: true, board: "Greenhouse" },
  { name: "Saltmarsh Animation", disc: "Animation", region: "Europe", city: "Dublin", juniors: false, board: "Lever" },
  { name: "Orbit Owl Studios", disc: "Games", region: "Asia Pacific", city: "Singapore", juniors: true, board: "Greenhouse" },
  { name: "Tallgrass FX", disc: "Film and VFX", region: "Europe", city: "London", juniors: true, board: "Lever" },
  { name: "Lanternfish Pictures", disc: "Animation", region: "Asia Pacific", city: "Sydney", juniors: true, board: "Greenhouse" },
  { name: "Gravel Road Games", disc: "Games", region: "Americas", city: "Austin", juniors: false, board: "Lever" },
  { name: "Northpaw Animation", disc: "Animation", region: "Americas", city: "Toronto", juniors: true, board: "Greenhouse" },
  { name: "Quarry Light VFX", disc: "Film and VFX", region: "Asia Pacific", city: "Wellington", juniors: false, board: "Lever" },
];

/** Raw postings as the public job-board APIs would return them (invented). */
export interface Posting { studio: string; title: string; location: string; posted: string }
export const RAW: Posting[] = [
  { studio: "Pinecone Interactive", title: "Environment Artist", location: "Montreal or remote", posted: "2 days ago" },
  { studio: "Pinecone Interactive", title: "Senior Gameplay Engineer", location: "Montreal", posted: "3 days ago" },
  { studio: "Kettle Moon Games", title: "Junior 3D Prop Artist", location: "Warsaw", posted: "1 day ago" },
  { studio: "Kettle Moon Games", title: "HR Business Partner", location: "Warsaw", posted: "5 days ago" },
  { studio: "Brightwater VFX", title: "FX Artist (Houdini)", location: "Vancouver", posted: "today" },
  { studio: "Brightwater VFX", title: "Lead Lighting Artist", location: "Vancouver", posted: "4 days ago" },
  { studio: "Orbit Owl Studios", title: "Character Artist", location: "Singapore", posted: "6 days ago" },
  { studio: "Tallgrass FX", title: "Texture Artist", location: "London", posted: "2 days ago" },
  { studio: "Tallgrass FX", title: "Marketing Coordinator", location: "London", posted: "1 week ago" },
  { studio: "Lanternfish Pictures", title: "Lighting Artist", location: "Sydney", posted: "3 days ago" },
  { studio: "Northpaw Animation", title: "Principal Technical Artist", location: "Toronto", posted: "2 days ago" },
  { studio: "Northpaw Animation", title: "3D Modeler", location: "Toronto or remote", posted: "today" },
];

/** Same idea as the real filter: keep art roles, drop senior roles. Example phrases. */
export const INCLUDE = ["environment artist", "prop artist", "3d artist", "modeler", "texture artist", "character artist", "fx artist", "houdini", "technical artist", "lighting artist"];
export const EXCLUDE = ["senior", "lead", "principal"];

export const BOARDS = [
  { name: "Studio careers pages", note: "Go straight to the source. The feed below pulls from these." },
  { name: "General art job boards", note: "Wide reach, lots of noise. Filter by junior roles." },
  { name: "Discipline communities", note: "Smaller boards run by artists in your field. Often the best leads." },
];

export const CHECKLIST: { group: string; items: string[] }[] = [
  { group: "Resume", items: ["One page, with your reel link at the top", "Most relevant work first, not oldest first", "Software listed by what you used it for", "Action verbs: built, shipped, led, fixed", "Saved as a PDF named with your name"] },
  { group: "Cover letter", items: ["Addressed to the studio, naming the role", "Paragraph 1: why this studio", "Paragraph 2: one project that proves you fit", "Paragraph 3: short close and your links"] },
  { group: "Before you send", items: ["Reel plays, links open, nothing private"] },
];
