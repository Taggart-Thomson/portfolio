// Invented supervisors, students, survey answers and mentor scores for the demo.
// The AI analysis results are precomputed and written for the demo. No model is called.

export type Wave = "mid" | "end";
export const WAVE_LABEL: Record<Wave, string> = { mid: "Mid-term", end: "End of term" };

/** Example survey ratings, 1 to 5. Invented for the demo. */
export const RATINGS = ["Feedback", "Availability", "Clarity", "Encouragement"] as const;

/** Strength dimensions the analysis scores, used for matching. */
export const DIMS = ["Technical depth", "Clear feedback", "Encouragement", "Industry insight", "Responsiveness", "Structure"] as const;
export type Dim = (typeof DIMS)[number];

export interface Supervisor { id: string; name: string; path: string }
export const SUPERVISORS: Supervisor[] = [
  { id: "ivo", name: "Ivo Marsh", path: "Characters" },
  { id: "renata", name: "Renata Sol", path: "Characters" },
  { id: "dmitri", name: "Dmitri Vale", path: "Environments" },
  { id: "amara", name: "Amara Quist", path: "Environments" },
  { id: "felipe", name: "Felipe Arden", path: "Effects" },
  { id: "yara", name: "Yara Nakamura", path: "Effects" },
];

export interface Response { wave: Wave; sup: string; student: string; r: [number, number, number, number]; comment: string }

const R = (wave: Wave, sup: string, student: string, r: [number, number, number, number], comment: string): Response => ({ wave, sup, student, r, comment });

export const RESPONSES: Response[] = [
  R("mid", "ivo", "Lena B.", [5, 4, 5, 4], "Every critique comes with a paintover. I finally understand edge flow."),
  R("mid", "ivo", "Omar T.", [5, 4, 4, 4], "Very technical. Sometimes more than I can take in at once, but always right."),
  R("mid", "ivo", "Sun-mi P.", [4, 5, 4, 3], "Replies fast on the forum. Could be warmer in group sessions."),
  R("mid", "renata", "Caio R.", [4, 4, 4, 5], "She makes you want to keep going. Great at reminding us why we started."),
  R("mid", "renata", "Ella W.", [4, 3, 4, 5], "Shares a lot about how studios actually work. Very motivating."),
  R("mid", "renata", "Bodhi N.", [4, 4, 3, 5], "Lovely energy. Feedback is a bit general sometimes."),
  R("mid", "dmitri", "Maya F.", [4, 3, 4, 4], "Good notes when we get them, but two sessions were moved last minute."),
  R("mid", "dmitri", "Jonas K.", [4, 3, 4, 3], "Hard to reach between sessions. My questions sat for a week."),
  R("mid", "dmitri", "Priti D.", [4, 4, 4, 4], "Knows his stuff. Replies have been slow lately though."),
  R("mid", "amara", "Theo G.", [5, 5, 5, 4], "Every session has a clear plan and homework. I always know what to fix next."),
  R("mid", "amara", "Iris M.", [5, 5, 5, 4], "The weekly checklist is gold."),
  R("mid", "amara", "Ravi S.", [4, 5, 5, 4], "Organized and patient. Explains lighting really clearly."),
  R("mid", "felipe", "Nadia O.", [4, 4, 4, 4], "Brings real production examples from studio work. Super useful."),
  R("mid", "felipe", "Kai L.", [4, 4, 3, 4], "Great stories from industry, sometimes we run out of time for reviews."),
  R("mid", "felipe", "Aya H.", [4, 5, 4, 4], "Helped me rethink my reel for effects roles."),
  R("mid", "yara", "Ben C.", [5, 4, 4, 5], "Explains simulations step by step and never makes you feel slow."),
  R("mid", "yara", "Lucia V.", [5, 4, 5, 5], "Patient and precise. I went from scared of the software to enjoying it."),
  R("mid", "yara", "Tomi A.", [4, 4, 4, 5], "Very encouraging, and the breakdowns of her setups are excellent."),

  R("end", "ivo", "Lena B.", [5, 4, 5, 4], "Still the most detailed critiques I've had. My portfolio piece is much stronger."),
  R("end", "ivo", "Omar T.", [5, 4, 5, 4], "Started summarizing the top three fixes after each review, which helped a lot."),
  R("end", "ivo", "Sun-mi P.", [5, 5, 4, 4], "Fast, precise, honest."),
  R("end", "renata", "Caio R.", [4, 4, 4, 5], "Kept me going in the hardest weeks."),
  R("end", "renata", "Ella W.", [4, 4, 4, 5], "Her talk on studio pipelines was the highlight of the term."),
  R("end", "renata", "Bodhi N.", [4, 4, 4, 5], "Feedback got more specific in the second half. Very supportive."),
  R("end", "dmitri", "Maya F.", [4, 5, 4, 4], "Much easier to reach now. Replies within a day."),
  R("end", "dmitri", "Jonas K.", [5, 4, 4, 4], "Big improvement in the second half. Clear notes on composition."),
  R("end", "dmitri", "Priti D.", [4, 5, 4, 4], "Sessions on time and replies quick. Good term overall."),
  R("end", "amara", "Theo G.", [5, 5, 5, 4], "Same great structure all term."),
  R("end", "amara", "Iris M.", [5, 5, 5, 5], "Best organized class I've taken."),
  R("end", "amara", "Ravi S.", [5, 5, 5, 4], "I always knew where I stood."),
  R("end", "felipe", "Nadia O.", [4, 4, 4, 4], "The studio examples made the job market feel real."),
  R("end", "felipe", "Kai L.", [4, 4, 4, 4], "Better time management for reviews this half."),
  R("end", "felipe", "Aya H.", [5, 4, 4, 4], "Got two portfolio reviews arranged through his contacts' advice."),
  R("end", "yara", "Ben C.", [5, 4, 5, 5], "Clear, kind and technical."),
  R("end", "yara", "Lucia V.", [5, 4, 5, 5], "The best teacher I've had for simulations."),
  R("end", "yara", "Tomi A.", [5, 4, 4, 5], "Encouraging every single week."),
];

export interface Analysis {
  score: number;          // out of 5
  summary: string;
  strengths: Dim[];
  watch?: string;
  flag?: boolean;         // problem worth acting on now
  evidence: string[];     // short quotes the analysis leaned on
  dims: Record<Dim, number>; // 1 to 5
}

const d = (a: number, b: number, c: number, e: number, f: number, g: number): Record<Dim, number> =>
  ({ "Technical depth": a, "Clear feedback": b, Encouragement: c, "Industry insight": e, Responsiveness: f, Structure: g });

/** Precomputed analysis per supervisor per wave. */
export const ANALYSIS: Record<Wave, Record<string, Analysis>> = {
  mid: {
    ivo: { score: 4.4, summary: "Highly technical, detailed critiques with paintovers. Some students find the volume of notes a lot at once.", strengths: ["Technical depth", "Clear feedback"], watch: "Can overload students with notes; warmth in group sessions.", evidence: ["Every critique comes with a paintover", "more than I can take in at once"], dims: d(5, 4, 3, 3, 4, 3) },
    renata: { score: 4.3, summary: "Strongly motivating, with real insight into how studios work. Feedback can be general.", strengths: ["Encouragement", "Industry insight"], watch: "Feedback sometimes too general.", evidence: ["makes you want to keep going", "how studios actually work", "a bit general sometimes"], dims: d(3, 3, 5, 5, 4, 3) },
    dmitri: { score: 3.2, summary: "Good notes, but three of three students mention slow replies or moved sessions. Ratings alone (3.8 average) hide how consistent the complaint is.", strengths: ["Technical depth"], watch: "Responsiveness: slow replies and sessions moved at short notice.", flag: true, evidence: ["two sessions were moved last minute", "My questions sat for a week", "Replies have been slow lately"], dims: d(4, 4, 3, 3, 2, 3) },
    amara: { score: 4.7, summary: "Very structured: clear session plans, weekly checklists and homework. Students always know the next fix.", strengths: ["Structure", "Clear feedback"], evidence: ["clear plan and homework", "The weekly checklist is gold"], dims: d(4, 5, 4, 3, 5, 5) },
    felipe: { score: 4.0, summary: "Brings production experience into class. Reviews sometimes run out of time.", strengths: ["Industry insight"], watch: "Time management in reviews.", evidence: ["real production examples", "we run out of time for reviews"], dims: d(4, 3, 4, 5, 4, 3) },
    yara: { score: 4.6, summary: "Patient, step-by-step teaching that builds confidence in difficult software.", strengths: ["Encouragement", "Technical depth"], evidence: ["never makes you feel slow", "went from scared of the software to enjoying it"], dims: d(5, 4, 5, 3, 4, 4) },
  },
  end: {
    ivo: { score: 4.6, summary: "Detailed technical critiques, now with a short list of top fixes after each review, which students say helped.", strengths: ["Technical depth", "Clear feedback"], evidence: ["most detailed critiques", "summarizing the top three fixes"], dims: d(5, 5, 3, 3, 4, 4) },
    renata: { score: 4.4, summary: "Keeps students motivated through hard weeks and shares real studio knowledge. Feedback became more specific.", strengths: ["Encouragement", "Industry insight"], evidence: ["Kept me going in the hardest weeks", "talk on studio pipelines", "more specific in the second half"], dims: d(3, 4, 5, 5, 4, 3) },
    dmitri: { score: 4.3, summary: "Clear improvement since mid-term: replies within a day and sessions on time. Notes on composition are strong.", strengths: ["Technical depth", "Responsiveness"], evidence: ["Much easier to reach now", "Big improvement in the second half"], dims: d(4, 4, 3, 3, 4, 3) },
    amara: { score: 4.8, summary: "Consistently the most structured supervisor. Students always know where they stand.", strengths: ["Structure", "Clear feedback"], evidence: ["Best organized class", "I always knew where I stood"], dims: d(4, 5, 4, 3, 5, 5) },
    felipe: { score: 4.2, summary: "Strong industry insight and practical portfolio advice. Review timing improved.", strengths: ["Industry insight"], evidence: ["made the job market feel real", "Better time management"], dims: d(4, 3, 4, 5, 4, 3) },
    yara: { score: 4.7, summary: "Clear, kind and technical. Builds confidence every week.", strengths: ["Encouragement", "Technical depth"], evidence: ["Clear, kind and technical", "Encouraging every single week"], dims: d(5, 4, 5, 3, 4, 4) },
  },
};

/** The invented student the tour matches. */
export const STUDENT = { name: "Noa K.", path: "Environments", note: "New to 3D, wants a clear plan each week and quick answers between sessions.", needs: ["Structure", "Responsiveness"] as Dim[] };

// ---------- mentor scoring (secondary view) ----------

export const CRITERIA = ["Craft", "Composition", "Progress", "Communication", "Professionalism"];
export interface Mentor { id: string; name: string; students: string[] }
export const MENTORS: Mentor[] = [
  { id: "m1", name: "Hollis Grey", students: ["Lena B.", "Omar T.", "Caio R."] },
  { id: "m2", name: "Petra Lind", students: ["Maya F.", "Jonas K."] },
  { id: "m3", name: "Quentin Abara", students: ["Theo G.", "Iris M.", "Ravi S."] },
];
export const WEEKS = 4;

/** Weekly rubric scores (0 to 5 per criterion), invented. [mentor][student][week][criterion] */
export function weekScores(mentorIdx: number, studentIdx: number, week: number): number[] {
  return CRITERIA.map((_, c) => Math.min(5, 2 + ((mentorIdx * 3 + studentIdx * 2 + week + c * 7) % 3) + (week > 1 ? 1 : 0)));
}
