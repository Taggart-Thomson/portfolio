// Virtual Program Assistant demo: how a webinar recording becomes part of the assistant's knowledge.
import { SNIPPETS } from "./data";
import type { Verdict } from "./data";
import { cleanVtt, rulesExtract } from "./pipeline";
import { mountTour } from "../../components/tour/tour";
import type { TourStep } from "../../components/tour/tour";

type Stage = "raw" | "clean" | "rules" | "model" | "compare";
const STAGES: [Stage, string][] = [["raw", "1 Raw VTT"], ["clean", "2 Cleaned"], ["rules", "3 Rules"], ["model", "4 Model"], ["compare", "Compare"]];
const VERDICT: Record<Verdict, string> = { usable: "Usable", split: "Wrong split", rhetorical: "Not a real question" };

let S = { snip: SNIPPETS[0].id, stage: "raw" as Stage };
const root = document.querySelector<HTMLElement>("#demo-virtual-program-assistant [data-demo-app]")!;
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
const snip = () => SNIPPETS.find((s) => s.id === S.snip)!;

function rawView() {
  const v = snip().vtt;
  const html = v.split("\n").map((l) => {
    if (l === "WEBVTT") return `<span class="ca-dim">${l}</span>`;
    if (/^\d+$/.test(l)) return `<span class="ca-dim">${l}</span>`;
    if (l.includes("-->")) return `<span class="ca-dim">${l}</span>`;
    const m = /^([^:]{1,40}):(.*)$/.exec(l);
    return m ? `<b class="ca-name">${esc(m[1])}:</b>${esc(m[2])}` : esc(l);
  }).join("\n");
  return `<p class="ca-cap">Zoom's caption file, as it comes out of the recording: a header, cue numbers, timestamps, and real names on every line. All names here are invented.</p>
    <pre class="ca-pre" data-tour="raw">${html}</pre>`;
}

function cleanStats() {
  const v = snip().vtt, lines = v.split("\n");
  const cues = lines.filter((l) => l.includes("-->")).length;
  const names = new Set(lines.map((l) => /^([A-Za-z][A-Za-z0-9 ._'-]{0,40}):/.exec(l)?.[1]).filter(Boolean));
  const turns = cleanVtt(v);
  return { cues, names: names.size, turns: turns.length, turnsList: turns };
}

function cleanView() {
  const st = cleanStats();
  return `<p class="ca-cap">Stage 1 is rules, and rules are right for it. Removed ${st.cues} cue numbers and ${st.cues} timestamps, replaced ${st.names} speaker name${st.names === 1 ? "" : "s"} with roles (known hosts become Instructor, everyone else Participant), and stitched ${st.cues} caption lines into ${st.turns} turn${st.turns === 1 ? "" : "s"}.</p>
    <div class="ca-turns" data-tour="clean">${st.turnsList.map((t) => `<p class="ca-turn"><b class="ca-role ${t.role === "Instructor" ? "i" : "p"}">${t.role}</b> ${esc(t.text)}</p>`).join("")}</div>`;
}

function rulesList() {
  const s = snip();
  const pairs = rulesExtract(cleanVtt(s.vtt));
  if (!pairs.length) return `<div class="ca-empty">The rules found no questions.</div>`;
  return pairs.map((p, i) => {
    const v = s.rules[i] ?? "split";
    return `<div class="ca-pair r-${v}">
      <span class="ca-verdict v-${v}">${VERDICT[v]}</span>
      <div><span class="ca-k">Q</span> ${esc(p.q)}</div>
      <div><span class="ca-k">A</span> ${p.a ? esc(p.a) : `<em class="ca-muted">(no answer found)</em>`}</div>
    </div>`;
  }).join("");
}

function modelList() {
  const s = snip();
  if (!s.llm.length) return `<div class="ca-empty">No Q&amp;A exchange. Skipped as presentation.</div>`;
  return s.llm.map((p) => `<div class="ca-pair m">
    <div><span class="ca-k">Q</span> ${esc(p.q)}</div>
    <div><span class="ca-k">A</span> ${esc(p.a)}</div></div>`).join("");
}

const RULES_CAP = `First try at stage 2, also rules: a sentence ending in "?" is a question, its answer is what follows until the next question, and if nothing follows, the next speaker's turn is the answer. These rules run live on the cleaned text.`;
const MODEL_CAP = `The fix: send the cleaned transcript to a language model with instructions to pull out each real question and answer, clean them up, stay faithful to what was said, and skip presentation. Precomputed for this demo, so no model is called from your browser.`;

function stageView() {
  const s = snip();
  switch (S.stage) {
    case "raw": return rawView();
    case "clean": return cleanView();
    case "rules": return `<p class="ca-cap">${RULES_CAP}</p><div class="ca-pairs" data-tour="rules">${rulesList()}</div><p class="ca-note" data-tour="note"><b>Why:</b> ${esc(s.note)}</p>`;
    case "model": return `<p class="ca-cap">${MODEL_CAP}</p><div class="ca-pairs" data-tour="model">${modelList()}</div>`;
    case "compare": return `
      <div class="ca-compare" data-tour="compare">
        <section><h4>Rules</h4><div class="ca-pairs">${rulesList()}</div></section>
        <section><h4>Model <span class="ca-muted">(precomputed)</span></h4><div class="ca-pairs">${modelList()}</div></section>
      </div>
      <p class="ca-note"><b>Why:</b> ${esc(s.note)}</p>`;
  }
}

function scoreboard() {
  let found = 0, usable = 0, model = 0;
  const rows = SNIPPETS.map((s) => {
    const n = rulesExtract(cleanVtt(s.vtt)).length;
    const u = s.rules.filter((v) => v === "usable").length;
    found += n; usable += u; model += s.llm.length;
    return `<tr class="${s.id === S.snip ? "on" : ""}"><td>${esc(s.title)}</td><td class="n">${n}</td><td class="n">${u}</td><td class="n">${s.llm.length}</td></tr>`;
  }).join("");
  return `<section class="ca-card" data-tour="score">
    <h3>All ${SNIPPETS.length} snippets</h3>
    <p class="ca-cap">The rules found ${found} question and answer pairs, and only ${usable} were usable. The model found ${model} real pairs, including questions that were paraphrased, implied or asked in the chat, and skipped the presentation with no questions in it.</p>
    <div class="ca-scroll"><table class="ca-t">
      <thead><tr><th>Snippet</th><th>Rules found</th><th>Usable</th><th>Model found</th></tr></thead>
      <tbody>${rows}</tbody>
      <tfoot><tr><td>Total</td><td class="n">${found}</td><td class="n">${usable}</td><td class="n">${model}</td></tr></tfoot>
    </table></div>
  </section>`;
}

function render() {
  const s = snip();
  root.innerHTML = `<div class="ca-app">
    <div class="ca-k">Fictional webinar snippets &middot; written for this demo</div>
    <div class="ca-layout">
      <nav class="ca-list" aria-label="Snippets" data-tour="list">
        ${SNIPPETS.map((x, i) => `<button type="button" class="ca-item" aria-pressed="${x.id === S.snip}" data-a="snip" data-v="${x.id}" data-tour="snip-${x.id}">
          <span class="ca-num">${String(i + 1).padStart(2, "0")}</span>
          <span><span class="ca-it">${esc(x.title)}</span><span class="ca-ip">${esc(x.pattern)}</span></span>
        </button>`).join("")}
      </nav>
      <section class="ca-card ca-main">
        <div class="ca-head">
          <div><h3>${esc(s.title)}</h3><div class="ca-muted">${esc(s.pattern)}</div></div>
        </div>
        <div class="ca-stages" role="tablist" aria-label="Pipeline stage">
          ${STAGES.map(([id, label]) => `<button type="button" role="tab" aria-selected="${S.stage === id}" data-a="stage" data-v="${id}" data-tour="stage-${id}">${label}</button>`).join("")}
        </div>
        <div class="ca-stage" role="tabpanel">${stageView()}</div>
      </section>
    </div>
    ${scoreboard()}
  </div>`;
}

root.addEventListener("click", (e) => {
  const b = (e.target as HTMLElement).closest<HTMLElement>("[data-a]");
  if (!b) return;
  if (b.dataset.a === "snip") S.snip = b.dataset.v!;
  if (b.dataset.a === "stage") S.stage = b.dataset.v as Stage;
  render();
});
render();

// ---------- guided tour ----------

const set = (snipId: string, stage: Stage) => () => { S = { snip: snipId, stage }; render(); };
const steps: TourStep[] = [
  {
    title: "From recording to knowledge",
    body: `The assistant answers from the school's curriculum, program guides and recorded webinars. This demo shows how a recording becomes something it can answer from. The real webinars can't be shown, so it runs the same pipeline on ${SNIPPETS.length} short, fictional snippets about reels, portfolios and art tests.`,
    before: set("reel", "raw"),
  },
  {
    target: '[data-tour="raw"]',
    title: "What a recording gives you",
    body: "A Zoom caption file: timestamps, cue numbers, and a real name on every line. Not something you can search, and not something you can keep names in.",
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
    body: "Know which problems need rules and which need a model. The clean pairs are what the assistant searches when a student asks. Click through the other snippets to see paraphrased questions, two questions at once, and questions asked in the chat.",
    before: set("recruiters", "compare"),
  },
];

mountTour(document.getElementById("demo-virtual-program-assistant")!, {
  steps,
  reset: () => { S = { snip: SNIPPETS[0].id, stage: "raw" }; render(); },
  intro: `About 2 minutes, ${steps.length} steps.`,
});

