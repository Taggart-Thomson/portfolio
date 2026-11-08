// Invented webinar snippets for the demo. Fictional speakers, fictional webinars,
// written for the portfolio. No real transcript was used.

export interface QA { q: string; a: string }
export type Verdict = "usable" | "split" | "rhetorical";

export interface Snippet {
  id: string;
  title: string;
  /** How the question shows up in the transcript. */
  pattern: string;
  vtt: string;
  /** Precomputed LLM extraction (written for the demo, no live model call). */
  llm: QA[];
  /** Hand-checked verdict for each pair the rules extractor returns, in order. */
  rules: Verdict[];
  /** Why rules work or fail here, in one or two sentences. */
  note: string;
}

/** Hosts known to the cleaner. Everyone else becomes "Participant". */
export const KNOWN_HOSTS = ["Marlo Penn", "Ade Okoro"];

const cues = (start: number, lines: string[]) => {
  let t = start;
  const ts = (s: number) => {
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(x).padStart(2, "0")}.${String((s * 137) % 1000).padStart(3, "0")}`;
  };
  return "WEBVTT\n\n" + lines.map((l, i) => {
    const d = 3 + Math.min(4, Math.round(l.length / 40));
    const out = `${i + 1}\n${ts(t)} --> ${ts(t + d)}\n${l}`;
    t += d;
    return out;
  }).join("\n\n") + "\n";
};

export const SNIPPETS: Snippet[] = [
  {
    id: "reel",
    title: "How long should a reel be",
    pattern: "Host reads the question out word for word",
    vtt: cues(1843, [
      "Marlo Penn: Okay, let me grab one from the Q&A box.",
      "Marlo Penn: How long should a demo reel be?",
      "Marlo Penn: Great question. Shorter than you think.",
      "Marlo Penn: Aim for under two minutes, and put your strongest piece in the first ten seconds.",
      "Marlo Penn: Recruiters often stop watching after the first shot, so don't save the best for last.",
    ]),
    llm: [{ q: "How long should a demo reel be?", a: "Under two minutes, with the strongest piece in the first ten seconds, because recruiters often stop watching after the first shot." }],
    rules: ["usable"],
    note: "The easy case. The host reads the question as written and it ends in a question mark, so the rules find it. The answer still picks up filler like \"Great question.\"",
  },
  {
    id: "portfolio",
    title: "How many portfolio pieces",
    pattern: "Host paraphrases several typed questions",
    vtt: cues(2410, [
      "Marlo Penn: A bunch of you are asking about portfolio size, basically how many pieces is enough.",
      "Marlo Penn: I'd say quality beats count every time.",
      "Marlo Penn: Six to eight finished pieces is plenty for a junior role.",
      "Marlo Penn: If one piece is weaker than the rest, cut it. Your portfolio is judged by its weakest piece.",
    ]),
    llm: [{ q: "How many pieces should a portfolio have?", a: "Six to eight finished pieces is plenty for a junior role. Quality beats count, and a weaker piece should be cut, because a portfolio is judged by its weakest piece." }],
    rules: [],
    note: "No question mark anywhere. The host turned several typed questions into one statement, so the rules find nothing.",
  },
  {
    id: "art-test",
    title: "Art tests",
    pattern: "Question only implied",
    vtt: cues(3022, [
      "Ade Okoro: Someone wanted to know about art tests.",
      "Ade Okoro: So, art tests. A lot of studios send one after the first interview.",
      "Ade Okoro: Why do they do that? Because they want to see how you work to a brief, not just your best piece.",
      "Ade Okoro: Take the full time they give you, ask questions if the brief is unclear,",
      "and keep your files tidy. They often open them.",
    ]),
    llm: [{ q: "What should I know about studio art tests?", a: "Many studios send one after the first interview to see how you work to a brief. Use the full time allowed, ask if the brief is unclear, and keep your files tidy, because studios often open them." }],
    rules: ["split"],
    note: "The real question is never spoken as a question. The rules latch onto the host's rhetorical \"Why do they do that?\" and miss half the answer.",
  },
  {
    id: "no-experience",
    title: "Applying without studio experience",
    pattern: "Participant asks out loud",
    vtt: cues(4105, [
      "Rin Takeda: Can I apply to junior roles if I haven't worked in a studio yet?",
      "Marlo Penn: Yes. Junior roles exist for exactly that.",
      "Marlo Penn: What they want to see is finished work and that you can take feedback.",
      "Marlo Penn: Mention any team projects, even student ones.",
    ]),
    llm: [{ q: "Can I apply to junior roles without studio experience?", a: "Yes. Junior roles exist for that. Studios want to see finished work and that you can take feedback, so mention any team projects, including student ones." }],
    rules: ["usable"],
    note: "Rules work here: the participant speaks the question, and the next speaker answers it. This is the case the rules were designed for.",
  },
  {
    id: "website",
    title: "Own site or portfolio platform",
    pattern: "Two questions read together, then answered together",
    vtt: cues(4870, [
      "Marlo Penn: Two related ones here.",
      "Marlo Penn: Should I host my reel on my own site or on a portfolio platform?",
      "Marlo Penn: And does my site need a custom domain?",
      "Marlo Penn: For the first one, do both. The platform gets you found, your site shows how you present yourself.",
      "Marlo Penn: For the domain, it helps, but nobody will turn you down without one.",
    ]),
    llm: [
      { q: "Should I host my reel on my own site or on a portfolio platform?", a: "Both. A portfolio platform helps people find you, and your own site shows how you present yourself." },
      { q: "Does my portfolio site need a custom domain?", a: "It helps, but nobody will turn you down without one." },
    ],
    rules: ["split", "split"],
    note: "The rules give the first question no answer at all, and give the second question both answers.",
  },
  {
    id: "recruiters",
    title: "What recruiters look at",
    pattern: "Presentation with rhetorical questions, no Q&A",
    vtt: cues(5302, [
      "Ade Okoro: So what do recruiters look at first?",
      "Ade Okoro: Honestly, the first few seconds of your reel.",
      "Ade Okoro: Does that make sense? It's a quick decision.",
      "Ade Okoro: And then what? Then they open the breakdown to see what you actually did on each shot.",
    ]),
    llm: [],
    rules: ["rhetorical", "rhetorical", "rhetorical"],
    note: "No student asked anything. The host is presenting and using questions as a speaking style. The rules turn every one into a fake Q&A pair. The model skips it as presentation.",
  },
  {
    id: "follow-up",
    title: "Following up after applying",
    pattern: "Question taken from the chat, paraphrased",
    vtt: cues(6015, [
      "Marlo Penn: I see the same thing coming up in the chat, about following up after you apply.",
      "Marlo Penn: One polite email after a week or two is fine.",
      "Marlo Penn: Keep it short, link your reel again, and then leave it.",
      "Marlo Penn: Studios hire in batches, so silence usually means timing, not a no.",
    ]),
    llm: [{ q: "Should I follow up after applying to a studio, and how?", a: "Yes, with one short, polite email after a week or two that links the reel again. Then leave it: studios hire in batches, so silence usually means timing, not a no." }],
    rules: [],
    note: "The question lives in the chat, not the transcript. The host only names the topic, so there is nothing for the rules to catch.",
  },
  {
    id: "generalist",
    title: "Generalist or specialist",
    pattern: "Question finished by a co-host, answer split across speakers",
    vtt: cues(6720, [
      "Sam Iversen: I was wondering, is it better to be a generalist",
      "Ade Okoro: Just to add, they mean for games specifically, from the Q&A.",
      "Marlo Penn: Got it. For games, specialize, but know the pipeline around you.",
      "Marlo Penn: A character artist who understands rigging and engines is easier to hire.",
    ]),
    llm: [{ q: "For games, is it better to be a generalist or a specialist?", a: "Specialize, but understand the pipeline around you. A character artist who knows rigging and game engines is easier to hire." }],
    rules: [],
    note: "The participant's question trails off without a question mark, a co-host finishes it, and a third person answers. Rules see three statements.",
  },
];
