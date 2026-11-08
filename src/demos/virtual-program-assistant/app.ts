// Virtual Program Assistant demo: the assistant docked beside an invented course page,
// and behind the scenes, how a webinar recording becomes something it can answer from.
// Everything here is invented: the course, the instructor, the lessons and the webinars.
import { SNIPPETS } from "./data";
import type { Verdict } from "./data";
import { cleanVtt, rulesExtract } from "./pipeline";
import { mountTour } from "../../components/tour/tour";
import type { TourStep } from "../../components/tour/tour";

type Stage = "raw" | "clean" | "rules" | "model" | "compare";
type View = "course" | "pipeline";
const STAGES: [Stage, string][] = [["raw", "1 Raw VTT"], ["clean", "2 Cleaned"], ["rules", "3 Rules"], ["model", "4 Model"], ["compare", "Compare"]];
const VERDICT: Record<Verdict, string> = { usable: "usable", split: "wrong split", rhetorical: "not a real question" };

/** Questions a student can ask in the demo, answered from the extracted pairs. */
const ASKS = [
  { id: "reel", snip: "reel", q: "How long should my demo reel be?" },
  { id: "junior", snip: "no-experience", q: "Can I apply to junior roles without studio experience?" },
  { id: "arttest", snip: "art-test", q: "Any tips for a studio art test?" },
];

interface Msg { ask: string; done: boolean }
const fresh = () => ({ view: "course" as View, snip: SNIPPETS[0].id, stage: "raw" as Stage, chat: [] as Msg[] });
let S = fresh();

const root = document.querySelector<HTMLElement>("#demo-virtual-program-assistant [data-demo-app]")!;
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
const snip = () => SNIPPETS.find((s) => s.id === S.snip)!;

// ---------- icons (drawn for the demo) ----------
const ic = (d: string) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
const I = {
  grid: ic('<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>'),
  book: ic('<path d="M4 5a2 2 0 0 1 2-2h12v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5"/>'),
  cal: ic('<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>'),
  chat: ic('<path d="M4 5h16v11H8l-4 4z"/>'),
  folder: ic('<path d="M3 6h6l2 2h10v11H3z"/>'),
  bell: ic('<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 21h4"/>'),
  search: ic('<circle cx="11" cy="11" r="6"/><path d="M20 20l-4-4"/>'),
  user: ic('<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/>'),
  spark: ic('<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 3v4M17 5h4"/>'),
  play: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill="rgba(255,255,255,.85)"/><path d="M10 8l6 4-6 4z" fill="#111"/></svg>`,
  video: ic('<rect x="3" y="6" width="13" height="12" rx="2"/><path d="M16 10l5-3v10l-5-3"/>'),
  clock: ic('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
  doc: ic('<path d="M6 3h9l4 4v14H6z"/><path d="M9 12h7M9 16h7"/>'),
  send: ic('<path d="M12 19V5M6 11l6-6 6 6"/>'),
  newchat: ic('<path d="M4 5h16v11H8l-4 4z"/><path d="M12 8v5M9.5 10.5h5"/>'),
  hist: ic('<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 8v4l3 2"/>'),
  min: ic('<path d="M5 12h14"/>'),
  x: ic('<path d="M6 6l12 12M18 6L6 18"/>'),
  term: ic('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 9l3 3-3 3M12 15h5"/>'),
};

// ---------- the course page (invented) ----------

const WEEKS = [
  { n: 1, items: [{ kind: "Video", t: "Lesson 1: Blocking the primary forms", d: "Start from simple volumes, read the silhouette from every side, and keep the big shapes honest before any detail.", len: "14m", shape: "a" }, { kind: "Exercise", t: "Silhouette studies", d: "Three quick blockouts from the reference pack.", shape: "" }] },
  { n: 2, items: [{ kind: "Video", t: "Lesson 2: Secondary forms and planes", d: "Break the big forms into planes, find where they turn, and build secondary shapes that support the primary read.", len: "18m", shape: "b" }, { kind: "Exercise", t: "Plane breakdown", d: "Turn one blockout into clear planes.", shape: "" }] },
  { n: 3, items: [{ kind: "Video", t: "Lesson 3: Topology for posing", d: "Edge flow that deforms well, where to add loops, and how to check it before handing off to rigging.", len: "16m", shape: "c" }, { kind: "Exercise", t: "Retopology pass", d: "Clean topology on last week's model.", shape: "" }] },
];

function courseView() {
  return `<div class="sy-course">
    <div class="sy-intro">
      <h1>Character Sculpting 101</h1>
      <div class="sy-by">by Noemi Hartwell</div>
      <p>An invented course for this demo. It covers the foundations of sculpting characters for games and film: reading form, building clean shapes, and preparing a model for the rest of the pipeline.</p>
      <h3>Learning outcomes:</h3>
      <ul><li>Block out a character from simple primary forms.</li><li>Describe secondary forms and planes on a model.</li><li>Plan topology that deforms well in a pose.</li><li>Present a sculpt with clear turnarounds.</li></ul>
    </div>
    <div class="sy-weeks">${WEEKS.map((w) => `<div class="sy-week"><div class="sy-week-k">Week ${w.n}</div>
      ${w.items.map((it) => `<div class="sy-lesson">
        <div class="sy-thumb ${it.shape ? `s-${it.shape}` : "ex"}">${it.shape ? `<span class="sy-play">${I.play}</span>` : `<span class="sy-doc">${I.doc}</span>`}</div>
        <div class="sy-lbody">
          <div class="sy-tags"><span>${it.kind === "Video" ? I.video : I.doc}${it.kind}</span>${it.len ? `<span>${I.clock}${it.len}</span>` : ""}</div>
          <div class="sy-lt">${it.t}</div><div class="sy-ld">${it.d}</div>
        </div></div>`).join("")}
    </div>`).join("")}</div>
  </div>`;
}

// ---------- behind the scenes: the pipeline as a terminal ----------

const term = (title: string, body: string, tour?: string) =>
  `<div class="sy-term" ${tour ? `data-tour="${tour}"` : ""}><div class="sy-term-bar"><i></i><i></i><i></i><span>${title}</span></div><div class="sy-term-body">${body}</div></div>`;
const cmd = (c: string, note = "") => `<span class="t-p">$</span> <span class="t-c">${esc(c)}</span>${note ? `  <span class="t-dim"># ${esc(note)}</span>` : ""}\n`;

function rawTerm() {
  const html = snip().vtt.trim().split("\n").map((l) => {
    if (l === "WEBVTT" || /^\d+$/.test(l) || l.includes("-->")) return `<span class="t-dim">${l}</span>`;
    const m = /^([^:]{1,40}):(.*)$/.exec(l);
    return m ? `<span class="t-name">${esc(m[1])}:</span>${esc(m[2])}` : esc(l);
  }).join("\n");
  return term(`recordings/${S.snip}.vtt`, cmd(`cat recordings/${S.snip}.vtt`) + html, "raw");
}

function cleanTerm() {
  const v = snip().vtt, lines = v.split("\n");
  const cues = lines.filter((l) => l.includes("-->")).length;
  const names = new Set(lines.map((l) => /^([A-Za-z][A-Za-z0-9 ._'-]{0,40}):/.exec(l)?.[1]).filter(Boolean)).size;
  const turns = cleanVtt(v);
  const out = cmd(`python clean_vtt.py recordings/${S.snip}.vtt`) +
    `<span class="t-ok">removed ${cues} cue numbers and ${cues} timestamps</span>\n<span class="t-ok">replaced ${names} speaker name${names === 1 ? "" : "s"} with roles</span>\n<span class="t-ok">stitched ${cues} caption lines into ${turns.length} turn${turns.length === 1 ? "" : "s"}</span>\n\n` +
    turns.map((t) => `<span class="${t.role === "Instructor" ? "t-inst" : "t-part"}">${t.role}:</span> ${esc(t.text)}`).join("\n\n");
  return term(`cleaned/${S.snip}.txt`, out, "clean");
}

function rulesBody() {
  const s = snip();
  const pairs = rulesExtract(cleanVtt(s.vtt));
  let out = cmd(`python extract_qa_rules.py cleaned/${S.snip}.txt`, "first try");
  if (!pairs.length) out += `<span class="t-warn">0 questions found</span>\n`;
  pairs.forEach((p, i) => {
    const v = s.rules[i] ?? "split";
    out += `\n<span class="${v === "usable" ? "t-ok" : "t-bad"}">[${VERDICT[v]}]</span>\n<span class="t-q">Q:</span> ${esc(p.q)}\n<span class="t-q">A:</span> ${p.a ? esc(p.a) : `<span class="t-dim">(no answer found)</span>`}\n`;
  });
  return out + `\n<span class="t-dim"># why: ${esc(s.note)}</span>`;
}

function modelBody() {
  const s = snip();
  const json = s.llm.length ? JSON.stringify(s.llm.map((p) => ({ question: p.q, answer: p.a })), null, 2) : "[]";
  return cmd(`python extract_qa_llm.py cleaned/${S.snip}.txt`, "precomputed for this demo") +
    `<span class="t-json">${esc(json)}</span>${s.llm.length ? "" : `\n<span class="t-dim"># no Q&amp;A exchange: skipped as presentation</span>`}`;
}

function stageView() {
  switch (S.stage) {
    case "raw": return `<p class="sy-cap">Zoom's caption file, as it comes out of the recording: a header, cue numbers, timestamps, and a name on every line. All names here are invented.</p>${rawTerm()}`;
    case "clean": return `<p class="sy-cap">Stage 1 is a rules-based cleaner, and rules are right for it: strip the timing, stitch lines into turns, and replace names with roles.</p>${cleanTerm()}`;
    case "rules": return `<p class="sy-cap">The first try at stage 2 was rules too: a sentence ending in "?" is a question, and what follows is its answer. These rules run live on the cleaned text.</p>${term("extract_qa_rules.py", rulesBody(), "rules")}`;
    case "model": return `<p class="sy-cap">The fix: a language model pulls out each real question and answer and skips presentation. Precomputed here, so no model is called from your browser.</p>${term("extract_qa_llm.py", modelBody(), "model")}`;
    case "compare": return `<div class="sy-compare" data-tour="compare">${term("rules", rulesBody())}${term("model", modelBody())}</div>`;
  }
}

function scoreTerm() {
  let found = 0, usable = 0, model = 0;
  const pad = (s: string | number, n: number) => String(s).padEnd(n);
  const rows = SNIPPETS.map((s) => {
    const n = rulesExtract(cleanVtt(s.vtt)).length, u = s.rules.filter((v) => v === "usable").length;
    found += n; usable += u; model += s.llm.length;
    return `${s.id === S.snip ? '<span class="t-hl">' : ""}${esc(pad(s.title, 38))}${pad(n, 7)}${pad(u, 8)}${s.llm.length}${s.id === S.snip ? "</span>" : ""}`;
  });
  const body = cmd("python score_extractors.py", "all 8 snippets") +
    `<span class="t-dim">${pad("snippet", 38)}${pad("rules", 7)}${pad("usable", 8)}model</span>\n${rows.join("\n")}\n<span class="t-dim">${"-".repeat(60)}</span>\n${pad("total", 38)}${pad(found, 7)}${pad(usable, 8)}${model}\n\n` +
    `<span class="t-ok">rules: ${found} pairs found, ${usable} usable. model: ${model} real pairs, presentation skipped.</span>`;
  return term("score_extractors.py", body, "score");
}

function pipelineView() {
  const s = snip();
  return `<div class="sy-pipe">
    <div class="sy-pipe-h"><h2>Behind the scenes: from recording to knowledge</h2><p>Eight fictional webinar snippets, written for this demo. Pick one and step through the pipeline.</p></div>
    <div class="sy-pipe-grid">
      <nav class="sy-snips" aria-label="Snippets" data-tour="list">${SNIPPETS.map((x, i) => `<button type="button" class="sy-snip" aria-pressed="${x.id === S.snip}" data-a="snip" data-v="${x.id}" data-tour="snip-${x.id}">
        <span class="sy-snip-n">${String(i + 1).padStart(2, "0")}</span><span><b>${esc(x.title)}</b><small>${esc(x.pattern)}</small></span></button>`).join("")}</nav>
      <div class="sy-stage-col">
        <div class="sy-stages" role="tablist" aria-label="Pipeline stage">${STAGES.map(([id, l]) => `<button type="button" role="tab" aria-selected="${S.stage === id}" data-a="stage" data-v="${id}" data-tour="stage-${id}">${l}</button>`).join("")}</div>
        <div class="sy-stage-title">${esc(s.title)} <span>${esc(s.pattern)}</span></div>
        ${stageView()}
      </div>
    </div>
    ${scoreTerm()}
  </div>`;
}

// ---------- the assistant panel ----------

function panel() {
  const pending = S.chat.some((m) => !m.done);
  const asked = new Set(S.chat.map((m) => m.ask));
  const left = ASKS.filter((a) => !asked.has(a.id));
  const body = S.chat.length
    ? S.chat.map((m, i) => {
        const a = ASKS.find((x) => x.id === m.ask)!, src = SNIPPETS.find((x) => x.id === a.snip)!;
        return `<div class="sy-msg user"><div class="sy-bubble">${esc(a.q)}</div><span class="sy-me">S</span></div>
          ${m.done
            ? `<div class="sy-msg bot" data-tour="answer-${i}"><span class="sy-ava">${I.spark}</span><div class="sy-bubble">${esc(src.llm[0].a)}<div class="sy-src">From a recorded career webinar (fictional): the question and answer extracted from "${esc(src.title)}".</div></div></div>`
            : `<div class="sy-msg bot"><span class="sy-ava">${I.spark}</span><span class="sy-computing">Computing...</span></div>`}`;
      }).join("")
    : `<div class="sy-empty"><span class="sy-spark">${I.spark}</span><h3>Hi, I'm Synapse, your program assistant.</h3><p>Ask me about your course, your program or your career.</p></div>`;
  return `<aside class="sy-panel" data-tour="synapse">
    <header class="sy-ph"><span class="sy-logo">${I.spark}</span><b>Synapse</b><span class="sy-grow"></span><span class="sy-pi">${I.newchat}</span><span class="sy-pi">${I.hist}</span><span class="sy-pi">${I.min}</span><span class="sy-pi">${I.x}</span></header>
    <div class="sy-log">${body}</div>
    <div class="sy-suggest">${left.map((a) => `<button type="button" data-a="ask" data-v="${a.id}" data-tour="ask-${a.id}" ${pending ? "disabled" : ""}>${esc(a.q)}</button>`).join("")}</div>
    <div class="sy-input"><span>Ask me anything about what you're learning...</span><span class="sy-send">${I.send}</span></div>
  </aside>`;
}

function render() {
  root.innerHTML = `<div class="sy-app ${S.view === "pipeline" ? "pipe" : ""}">
    <nav class="sy-rail" aria-hidden="true"><span class="sy-ri on">${I.grid}</span><span class="sy-ri c1">${I.book}</span><span class="sy-ri">${I.cal}</span><span class="sy-ri c2">${I.chat}</span><span class="sy-ri">${I.folder}</span><span class="sy-grow"></span><span class="sy-ri">${I.search}</span><span class="sy-ri">${I.bell}</span><span class="sy-ri">${I.user}</span></nav>
    <div class="sy-center">
      <div class="sy-top">
        <div class="sy-wk"><b>Week 3</b><small>Demo term</small></div>
        <span class="sy-select">Week 3 &#9662;</span>
        <span class="sy-grow"></span>
        <div class="sy-views" role="tablist" aria-label="View">
          <button type="button" role="tab" aria-selected="${S.view === "course"}" data-a="view" data-v="course" data-tour="tab-course">Course page</button>
          <button type="button" role="tab" aria-selected="${S.view === "pipeline"}" data-a="view" data-v="pipeline" data-tour="tab-pipeline">${I.term}Behind the scenes</button>
        </div>
      </div>
      <div class="sy-main">${S.view === "course" ? courseView() : pipelineView()}</div>
    </div>
    ${S.view === "course" ? panel() : ""}
  </div>`;
}

function ask(id: string, instant: boolean) {
  if (S.chat.some((m) => m.ask === id) || S.chat.some((m) => !m.done)) return;
  const m: Msg = { ask: id, done: instant };
  S.chat.push(m);
  if (!instant) setTimeout(() => { m.done = true; render(); }, 900);
}

root.addEventListener("click", (e) => {
  const b = (e.target as HTMLElement).closest<HTMLElement>("[data-a]");
  if (!b || (b as HTMLButtonElement).disabled) return;
  const v = b.dataset.v!;
  if (b.dataset.a === "snip") S.snip = v;
  if (b.dataset.a === "stage") S.stage = v as Stage;
  if (b.dataset.a === "view") S.view = v as View;
  if (b.dataset.a === "ask") ask(v, false);
  render();
});
render();

// ---------- guided tour ----------

const set = (snipId: string, stage: Stage) => () => { S.view = "pipeline"; S.snip = snipId; S.stage = stage; render(); };
const course = () => { S.view = "course"; render(); };
const answered = () => { if (!S.chat.some((m) => m.ask === "reel")) ask("reel", true); S.chat.forEach((m) => (m.done = true)); };
const steps: TourStep[] = [
  {
    title: "A program assistant, beside the course",
    body: "Synapse sits next to the course students are taking and answers from the school's curriculum, program guides and recorded webinars. Everything here is invented: the course, the instructor and the webinars.",
    before: course,
  },
  {
    target: '[data-tour="ask-reel"]',
    title: "Ask it something",
    body: "Students ask in their own words, while they study.",
    before: course,
    act: () => { answered(); course(); },
    advanceOnClick: true,
  },
  {
    target: '[data-tour="answer-0"]',
    title: "An answer from a webinar",
    body: "This answer comes from a question and answer pair pulled out of a recorded career webinar. Here is how a recording becomes something it can answer from.",
    before: () => { answered(); course(); },
  },
  {
    target: '[data-tour="tab-pipeline"]',
    title: "Go behind the scenes",
    body: `The real webinars can't be shown, so this runs the same pipeline on ${SNIPPETS.length} short, fictional snippets, the way the scripts ran: in a terminal.`,
    before: () => { answered(); course(); },
    act: set("reel", "raw"),
    advanceOnClick: true,
  },
  {
    target: '[data-tour="raw"]',
    title: "What a recording gives you",
    body: "A Zoom caption file: timestamps, cue numbers, and a name on every line. Not something you can search, and not something you can keep names in.",
    before: set("reel", "raw"),
  },
  {
    target: '[data-tour="stage-clean"]',
    title: "Run the cleaner",
    body: "Stage 1 is plain rules, and that is the right tool for it.",
    before: set("reel", "raw"),
    act: set("reel", "clean"),
    advanceOnClick: true,
  },
  {
    target: '[data-tour="clean"]',
    title: "Clean and anonymized",
    body: "Timestamps gone, lines stitched into readable turns, and names replaced with roles. Known hosts become Instructor, everyone else Participant.",
    before: set("reel", "clean"),
  },
  {
    target: '[data-tour="stage-rules"]',
    title: "Now pull out the questions",
    body: "Clean question and answer pairs retrieve far better than raw talk. My first try at this was rules too.",
    before: set("reel", "clean"),
    act: set("reel", "rules"),
    advanceOnClick: true,
  },
  {
    target: '[data-tour="rules"]',
    title: "The easy case works",
    body: "Here the host reads the student's question word for word, so a question mark finds it. Real webinars were not this tidy, as the next snippets show.",
    before: set("reel", "rules"),
  },
  {
    target: '[data-tour="snip-art-test"]',
    title: "Try an implied question",
    body: "Students typed into the Q&A box and the host answered inside one speaking turn. Often the question was never said as a question.",
    before: set("reel", "rules"),
    act: set("art-test", "rules"),
    advanceOnClick: true,
  },
  {
    target: '[data-tour="rules"]',
    title: "The rules grab the wrong thing",
    body: "The only question mark is the host's rhetorical \"Why do they do that?\", so the rules pair that with half the answer and miss what the student asked.",
    before: set("art-test", "rules"),
  },
  {
    target: '[data-tour="stage-compare"]',
    title: "Compare with the model",
    body: "Same cleaned text, sent to a language model instead.",
    before: set("art-test", "rules"),
    act: set("art-test", "compare"),
    advanceOnClick: true,
  },
  {
    target: '[data-tour="compare"]',
    title: "The model recovers the question",
    body: "It reads the turn the way a person would: the student asked about art tests, and here is the advice. The model output is precomputed for this demo.",
    before: set("art-test", "compare"),
  },
  {
    target: '[data-tour="snip-recruiters"]',
    title: "And when nobody asked anything",
    body: "Hosts use questions as a speaking style too.",
    before: set("art-test", "compare"),
    act: set("recruiters", "compare"),
    advanceOnClick: true,
  },
  {
    target: '[data-tour="compare"]',
    title: "Fake pairs from rhetorical questions",
    body: "The rules turn every rhetorical question into a Q&A pair, which would pollute the knowledge base. The model skips it as presentation.",
    before: set("recruiters", "compare"),
  },
  {
    target: '[data-tour="score"]',
    title: "Across all the snippets",
    body: "Rules found plenty of pairs, but few were usable. That is when I switched stage 2 to a model, and kept stage 1 as rules.",
    before: set("recruiters", "compare"),
  },
  {
    title: "The lesson",
    body: "Know which problems need rules and which need a model. The clean pairs are what Synapse searches when a student asks. Ask it the other questions, or click through the other snippets.",
    before: set("recruiters", "compare"),
  },
];

mountTour(document.getElementById("demo-virtual-program-assistant")!, {
  steps,
  reset: () => { S = fresh(); render(); },
  intro: `About 2 minutes, ${steps.length} steps.`,
});
