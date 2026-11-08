// Mentor Assessment Automation demo: supervisor scores from student surveys,
// matching a student, and a short look at mentor scoring.
import { ANALYSIS, CRITERIA, DIMS, MENTORS, RATINGS, RESPONSES, STUDENT, SUPERVISORS, WAVE_LABEL, WEEKS, weekScores } from "./data";
import type { Dim, Wave } from "./data";
import { mountTour } from "../../components/tour/tour";
import type { TourStep } from "../../components/tour/tour";

type Tab = "surveys" | "scores" | "match" | "mentors";

const fresh = () => ({
  tab: "surveys" as Tab,
  received: { mid: false, end: false } as Record<Wave, boolean>,
  analyzed: { mid: false, end: false } as Record<Wave, boolean>,
  surveyWave: "mid" as Wave,
  scoreWave: "mid" as Wave,
  needs: STUDENT.needs.slice() as Dim[],
  forms: false,
  collected: false,
  mentor: 0,
  wbStudent: 0,
});
let S = fresh();

const root = document.querySelector<HTMLElement>("#demo-mentor-assessments [data-demo-app]")!;
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
const sup = (id: string) => SUPERVISORS.find((s) => s.id === id)!;
const responses = (w: Wave) => RESPONSES.filter((r) => r.wave === w);
const ratingAvg = (w: Wave, id: string) => {
  const rs = responses(w).filter((r) => r.sup === id).flatMap((r) => r.r);
  return rs.reduce((a, b) => a + b, 0) / rs.length;
};
const latest = (): Wave | null => (S.analyzed.end ? "end" : S.analyzed.mid ? "mid" : null);

// ---------- actions ----------

const A = {
  tab(t: Tab) { S.tab = t; },
  receive(w: Wave) {
    if (w === "end" && !S.received.mid) return;
    S.received[w] = true; S.surveyWave = w;
  },
  analyze(w: Wave) { if (S.received[w]) { S.analyzed[w] = true; S.scoreWave = w; } },
  forms() { S.forms = true; },
  collect() { if (S.forms) S.collected = true; },
};

// ---------- views (a spreadsheet workbook with an add-on sidebar, and a form) ----------

const COLS = "ABCDEFGHIJKLMNOP";
/** A spreadsheet grid: column letters, row numbers, a bold frozen header row. */
function sheet(head: string[], rows: { cells: string[]; cls?: string; tour?: string }[], opts: { tour?: string; minRows?: number; widths?: number[] } = {}) {
  const pad = Math.max(0, (opts.minRows ?? 12) - rows.length);
  const w = opts.widths ?? head.map(() => 120);
  const total = 38 + w.reduce((a, b) => a + b, 0);
  return `<div class="gs-grid-wrap" ${opts.tour ? `data-tour="${opts.tour}"` : ""}><table class="gs-grid" style="width:${total}px">
    <colgroup><col style="width:38px">${w.map((x) => `<col style="width:${x}px">`).join("")}</colgroup>
    <thead><tr><th class="gs-corner"></th>${head.map((_, i) => `<th class="gs-col">${COLS[i]}</th>`).join("")}</tr></thead>
    <tbody>
      <tr class="gs-hrow"><th class="gs-rn">1</th>${head.map((h) => `<td>${h}</td>`).join("")}</tr>
      ${rows.map((r, i) => `<tr class="${r.cls ?? ""}" ${r.tour ? `data-tour="${r.tour}"` : ""}><th class="gs-rn">${i + 2}</th>${r.cells.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}
      ${Array.from({ length: pad }, (_, i) => `<tr><th class="gs-rn">${rows.length + i + 2}</th>${head.map(() => "<td></td>").join("")}</tr>`).join("")}
    </tbody></table></div>`;
}

const TITLES: Record<Tab, string> = { surveys: "Survey responses", scores: "Supervisor scores", match: "Match", mentors: "Mentor scoring" };

function chrome() {
  return `<header class="gs-top">
    <div class="gs-doc">
      <div class="gs-title">Supervisor assessments, demo term</div>
      <div class="gs-menus"><span>File</span><span>Edit</span><span>View</span><span>Insert</span><span>Format</span><span>Data</span><span>Tools</span><span>Extensions</span><span class="gs-custom">Assessment</span></div>
    </div>
    <span class="gs-share">Share</span>
  </header>`;
}

function sidebar() {
  const step = (done: boolean, label: string, btn: string) => `<div class="gs-side-step ${done ? "done" : ""}"><div class="gs-side-label">${done ? "&#10003; " : ""}${label}</div>${btn}</div>`;
  const b = (a: string, v: string, tour: string, label: string, disabled: boolean) =>
    `<button type="button" class="gs-btn" data-a="${a}" data-v="${v}" data-tour="${tour}" ${disabled ? "disabled" : ""}>${label}</button>`;
  return `<aside class="gs-side" data-tour="status">
    <div class="gs-side-h">Assessment tools</div>
    <div class="gs-side-sec">Student surveys</div>
    ${step(S.received.mid, S.received.mid ? `Mid-term: ${responses("mid").length} responses` : "Mid-term survey", S.received.mid ? "" : b("receive", "mid", "receive-mid", "Import responses", false))}
    ${step(S.analyzed.mid, S.analyzed.mid ? "Mid-term scored" : "Score mid-term", S.analyzed.mid ? "" : b("analyze", "mid", "analyze-mid", "Run AI analysis", !S.received.mid))}
    ${step(S.received.end, S.received.end ? `End of term: ${responses("end").length} responses` : "End-of-term survey", S.received.end ? "" : b("receive", "end", "receive-end", "Import responses", !S.received.mid))}
    ${step(S.analyzed.end, S.analyzed.end ? "End of term scored" : "Score end of term", S.analyzed.end ? "" : b("analyze", "end", "analyze-end", "Run AI analysis", !S.received.end))}
    <div class="gs-side-sec">Mentor scoring</div>
    ${step(S.forms, S.forms ? `${MENTORS.length} forms created` : "Weekly forms", S.forms ? "" : b("forms", "", "gen-forms", "Create a form per mentor", false))}
    ${step(S.collected, S.collected ? `${WEEKS} weeks collected` : "Weekly scores", S.collected ? "" : b("collect", "", "collect", `Collect ${WEEKS} weeks`, !S.forms))}
    <p class="gs-side-note">AI results are precomputed for this demo. Nothing is sent anywhere.</p>
  </aside>`;
}

function waveToggle(key: "surveyWave" | "scoreWave", allowed: Record<Wave, boolean>) {
  return `<div class="gs-filter"><span class="gs-filter-k">Filter view</span>${(["mid", "end"] as Wave[]).map((w) => `<button type="button" class="gs-chip" aria-pressed="${S[key] === w}" data-a="${key}" data-v="${w}" ${allowed[w] ? "" : "disabled"}>${WAVE_LABEL[w]}</button>`).join("")}</div>`;
}

function surveysView() {
  const head = ["Student", "Supervisor", ...RATINGS, "Comment"];
  const rs = S.received.mid ? responses(S.surveyWave) : [];
  return `${S.received.mid ? waveToggle("surveyWave", S.received) : `<div class="gs-filter"><span class="gs-filter-k">Waiting for responses. Use the sidebar to import them.</span></div>`}
    ${sheet(head, rs.map((r) => ({ cells: [esc(r.student), esc(sup(r.sup).name), ...r.r.map((x) => `<span class="gs-num">${x}</span>`), esc(r.comment)] })), { tour: "responses", widths: [90, 120, 78, 86, 70, 104, 420] })}`;
}

function scoresView() {
  const w = S.scoreWave;
  const head = ["Supervisor", "AI score", "Ratings avg", "Since mid-term", "Watch", "Strengths", "Evidence from comments", "Path"];
  const rows = S.analyzed[w] ? SUPERVISORS.map((s) => {
    const a = ANALYSIS[w][s.id], avg = ratingAvg(w, s.id);
    const prev = w === "end" && S.analyzed.mid ? ANALYSIS.mid[s.id].score : null;
    const d = prev !== null ? a.score - prev : 0;
    return {
      cls: a.flag ? "gs-flag" : "", tour: `score-${s.id}`,
      cells: [
        `<b>${esc(s.name)}</b>`, `<span class="gs-num gs-score">${a.score.toFixed(1)}</span>`, `<span class="gs-num">${avg.toFixed(1)}</span>`,
        prev === null ? "" : `<span class="gs-num ${d > 0.05 ? "gs-up" : d < -0.05 ? "gs-down" : ""}">${d > 0.05 ? "+" : ""}${Math.abs(d) < 0.05 ? "0.0" : d.toFixed(1)}</span>`,
        a.watch ? `${a.flag ? "<b>Needs attention now:</b> " : ""}${esc(a.watch)}` : "",
        a.strengths.map((x) => `<span class="gs-tag">${x}</span>`).join(" "),
        a.evidence.map((e) => `"${esc(e)}"`).join("; "), s.path,
      ],
    };
  }) : [];
  const note = !S.received.mid ? "Nothing to score yet. Import the mid-term responses first."
    : !S.analyzed[w] ? `${responses(w).length} ${WAVE_LABEL[w].toLowerCase()} responses waiting. Run the AI analysis from the sidebar: it reads every comment with the ratings, then writes a score, strengths and anything to watch for each supervisor.`
    : `${WAVE_LABEL[w]} scores from ${responses(w).length} responses. Rows in red need attention.`;
  return `${waveToggle("scoreWave", S.received)}<div class="gs-note" data-tour="analyze-card">${note}</div>
    ${sheet(head, rows, { widths: [120, 70, 84, 96, 250, 200, 380, 100], minRows: 10 })}`;
}

function matchView() {
  const w = latest();
  if (!w) return `<div class="gs-note">No scores yet. Run the AI analysis on a survey first: matching uses each supervisor's strengths.</div>${sheet(["Supervisor", "Fit"], [], { minRows: 8, widths: [160, 100] })}`;
  const cands = SUPERVISORS.filter((s) => s.path === STUDENT.path).map((s) => {
    const dims = ANALYSIS[w][s.id].dims;
    const fit = S.needs.length ? S.needs.reduce((t, d) => t + dims[d], 0) / S.needs.length : 0;
    return { s, dims, fit };
  }).sort((a, b) => b.fit - a.fit);
  const inputs = `<div class="gs-form-cells" data-tour="student">
    <div class="gs-kv"><span>Incoming student</span><b>${STUDENT.name}</b></div>
    <div class="gs-kv"><span>Path</span><b>${STUDENT.path}</b></div>
    <div class="gs-kv"><span>Notes</span><b>${esc(STUDENT.note)}</b></div>
    <div class="gs-kv"><span>Needs (up to 3)</span><span class="gs-checks">${DIMS.map((d) => `<button type="button" class="gs-check" role="checkbox" aria-checked="${S.needs.includes(d)}" data-a="need" data-v="${d}"><i></i>${d}</button>`).join("")}</span></div>
  </div>`;
  const head = ["Rank", "Supervisor", "Fit (of 5)", ...S.needs];
  const rows = S.needs.length ? cands.map((c, i) => ({
    cls: i === 0 ? "gs-best" : "", tour: i === 0 ? "best" : undefined,
    cells: [`<span class="gs-num">${i + 1}</span>`, `<b>${esc(c.s.name)}</b>${i === 0 ? ` <span class="gs-tag">Best match</span>` : ""}`, `<span class="gs-num gs-score">${c.fit.toFixed(1)}</span>`, ...S.needs.map((d) => `<span class="gs-num">${c.dims[d]}</span>`)],
  })) : [];
  return `${inputs}<div class="gs-note" data-tour="matches">${STUDENT.path} supervisors ranked on ${WAVE_LABEL[w].toLowerCase()} strengths. A person still makes the placement.</div>
    ${sheet(head, rows, { minRows: 6, widths: [60, 220, 90, ...S.needs.map(() => 130)] })}`;
}

function formPreview() {
  const m = MENTORS[S.mentor];
  return `<div class="gf" data-tour="form">
    <div class="gf-head"><div class="gf-title">Weekly scores: ${esc(m.name)}</div><div class="gf-desc">One entry per student per week. Example rubric, scored 0 to 5.</div></div>
    <div class="gf-q"><div class="gf-ql">Student <span>*</span></div><div class="gf-select">${esc(m.students[0])} &#9662;</div><div class="gf-hint">Pre-filled with ${m.students.length} students</div></div>
    <div class="gf-q"><div class="gf-ql">Week <span>*</span></div><div class="gf-select">Week 1 &#9662;</div><div class="gf-hint">Pre-filled with the term's weeks</div></div>
    <div class="gf-q"><div class="gf-ql">Rubric <span>*</span></div>
      <div class="gf-scroll"><table class="gf-grid"><thead><tr><th></th>${[0, 1, 2, 3, 4, 5].map((n) => `<th>${n}</th>`).join("")}</tr></thead>
      <tbody>${CRITERIA.map((c) => `<tr><td>${c}</td>${[0, 1, 2, 3, 4, 5].map(() => `<td><span class="gf-radio"></span></td>`).join("")}</tr>`).join("")}</tbody></table></div></div>
  </div>`;
}

function mentorsView() {
  const m = MENTORS[S.mentor];
  const list = sheet(["Mentor", "Students", "Weekly form", "Workbook"], MENTORS.map((x, i) => ({
    cls: i === S.mentor && S.forms ? "gs-sel" : "",
    cells: [`<button type="button" class="gs-cellbtn" data-a="mentor" data-v="${i}" ${S.forms ? "" : "disabled"}>${esc(x.name)}</button>`, `<span class="gs-num">${x.students.length}</span>`, S.forms ? `<span class="gs-link">Form created</span>` : `<span class="gs-dim">not created</span>`, S.collected ? `<span class="gs-link">Workbook</span>` : `<span class="gs-dim">waiting for scores</span>`],
  })), { minRows: 4, widths: [150, 80, 130, 150] });
  let master = "", book = "";
  if (S.collected) {
    const head = ["Week", "Student", ...CRITERIA];
    const rows = Array.from({ length: WEEKS }, (_, wk) => m.students.map((st, si) => ({ cells: [`<span class="gs-num">${wk + 1}</span>`, esc(st), ...weekScores(S.mentor, si, wk).map((x) => `<span class="gs-num">${x}</span>`)] }))).flat();
    master = `<div class="gs-block" data-tour="master"><div class="gs-block-h">Master file, tab "${esc(m.name)}" <span>one tab per mentor</span></div>
      <div class="gs-minitabs">${MENTORS.map((x, i) => `<button type="button" class="gs-minitab" aria-pressed="${i === S.mentor}" data-a="mentor" data-v="${i}">${esc(x.name)}</button>`).join("")}</div>
      ${sheet(head, rows, { minRows: 4, widths: [56, 100, ...CRITERIA.map(() => 108)] })}</div>`;
    const si = Math.min(S.wbStudent, m.students.length - 1);
    let sum = 0;
    const wrows = Array.from({ length: WEEKS }, (_, wk) => {
      const t = weekScores(S.mentor, si, wk).reduce((a, b) => a + b, 0);
      sum += t;
      return { cells: [`<span class="gs-num">${wk + 1}</span>`, `<span class="gs-num">${t}</span>`, `<span class="gs-num">25</span>`, `<span class="gs-num gs-score">${Math.round((sum / (25 * (wk + 1))) * 100)}%</span>`] };
    });
    book = `<div class="gs-block" data-tour="workbook"><div class="gs-block-h">${esc(m.name)}'s workbook, tab "${esc(m.students[si])}" <span>one tab per student</span></div>
      <div class="gs-minitabs">${m.students.map((s, i) => `<button type="button" class="gs-minitab" aria-pressed="${i === si}" data-a="wb" data-v="${i}">${esc(s)}</button>`).join("")}</div>
      ${sheet(["Week", "Weekly total", "Out of", "Running grade"], wrows, { minRows: 4, widths: [56, 100, 70, 110] })}</div>`;
  }
  return `<div class="gs-note">Each week, mentors score their students on a rubric. ${MENTORS.length} invented mentors here; the real term has about 72. This setup used to take about 20 hours by hand each term.</div>
    ${list}
    <div class="gs-mentor-split">${S.forms ? formPreview() : ""}${master}${book}</div>`;
}

function render() {
  const view = { surveys: surveysView, scores: scoresView, match: matchView, mentors: mentorsView }[S.tab]();
  const tabs: [Tab, string][] = [["surveys", "Survey responses"], ["scores", "Supervisor scores"], ["match", "Match"], ["mentors", "Mentor scoring"]];
  root.innerHTML = `<div class="gs-app">
    ${chrome()}
    <div class="gs-fx"><span class="gs-ref">A1</span><span class="gs-fxi">fx</span><span class="gs-fxv">${TITLES[S.tab]}</span></div>
    <div class="gs-body">
      <div class="gs-main">${view}</div>
      ${sidebar()}
    </div>
    <nav class="gs-tabs" role="tablist" aria-label="Sheets"><span class="gs-tabs-plus" aria-hidden="true">+</span>${tabs.map(([id, l]) => `<button type="button" role="tab" class="gs-tab" aria-selected="${S.tab === id}" data-a="tab" data-v="${id}" data-tour="tab-${id}">${l}</button>`).join("")}</nav>
  </div>`;
}

root.addEventListener("click", (e) => {
  const b = (e.target as HTMLElement).closest<HTMLElement>("[data-a]");
  if (!b || (b as HTMLButtonElement).disabled) return;
  const v = b.dataset.v ?? "";
  switch (b.dataset.a) {
    case "tab": A.tab(v as Tab); break;
    case "receive": A.receive(v as Wave); break;
    case "surveyWave": S.surveyWave = v as Wave; break;
    case "scoreWave": S.scoreWave = v as Wave; break;
    case "analyze": A.analyze(v as Wave); break;
    case "need": {
      const d = v as Dim;
      if (S.needs.includes(d)) S.needs = S.needs.filter((x) => x !== d);
      else if (S.needs.length < 3) S.needs.push(d);
      break;
    }
    case "forms": A.forms(); break;
    case "collect": A.collect(); break;
    case "mentor": S.mentor = Number(v); S.wbStudent = 0; break;
    case "wb": S.wbStudent = Number(v); break;
  }
  render();
});
render();

// ---------- guided tour ----------

const v = (fn: () => void) => () => { fn(); render(); };
const steps: TourStep[] = [
  {
    title: "An invented term",
    body: `${SUPERVISORS.length} invented supervisors and the students in their groups. Students fill in a survey twice a term, rating their supervisor and writing comments. Nothing here is real data.`,
    before: v(() => A.tab("surveys")),
  },
  {
    target: '[data-tour="receive-mid"]',
    title: "Mid-term feedback arrives",
    body: "Bring in the mid-term survey responses.",
    before: v(() => A.tab("surveys")),
    act: v(() => A.receive("mid")),
    advanceOnClick: true,
  },
  {
    target: '[data-tour="responses"]',
    title: "Ratings and written comments",
    body: "The numbers are easy to average. The comments are where students say what is actually happening, and they are hard to compare by hand.",
    before: v(() => A.tab("surveys")),
  },
  {
    target: '[data-tour="tab-scores"]',
    title: "Score the supervisors",
    body: "Open the scores view.",
    before: v(() => A.tab("surveys")),
    act: v(() => A.tab("scores")),
    advanceOnClick: true,
  },
  {
    target: '[data-tour="analyze-mid"]',
    title: "Run the AI analysis",
    body: "It reads every comment alongside the ratings and gives each supervisor a score and strengths. In this demo the results are precomputed.",
    before: v(() => { A.tab("scores"); S.scoreWave = "mid"; }),
    act: v(() => A.analyze("mid")),
    advanceOnClick: true,
  },
  {
    target: '[data-tour="score-dmitri"]',
    title: "A problem, caught mid-term",
    body: "The ratings alone average 3.8, not far behind the others. But every one of this supervisor's students mentions slow replies or moved sessions, so the score drops and the card is flagged while there is still time to act.",
    before: v(() => { A.tab("scores"); S.scoreWave = "mid"; }),
  },
  {
    target: '[data-tour="score-amara"]',
    title: "Strengths, with evidence",
    body: "Each supervisor gets strengths and the quotes behind them, so it's clear who is strongest at what.",
    before: v(() => { A.tab("scores"); S.scoreWave = "mid"; }),
  },
  {
    target: '[data-tour="receive-end"]',
    title: "End-of-term feedback",
    body: "Now bring in the end-of-term survey.",
    before: v(() => { A.tab("scores"); S.scoreWave = "mid"; }),
    act: v(() => { A.receive("end"); A.tab("scores"); S.scoreWave = "end"; }),
    advanceOnClick: true,
  },
  {
    target: '[data-tour="analyze-end"]',
    title: "Score the second survey",
    body: "Same analysis on the new responses.",
    before: v(() => { A.tab("scores"); S.scoreWave = "end"; }),
    act: v(() => A.analyze("end")),
    advanceOnClick: true,
  },
  {
    target: '[data-tour="score-dmitri"]',
    title: "Improvement shows up too",
    body: "The flagged supervisor's score is up since mid-term, and the comments say why: faster replies and sessions on time.",
    before: v(() => { A.tab("scores"); S.scoreWave = "end"; }),
  },
  {
    target: '[data-tour="tab-match"]',
    title: "Use it to match students",
    body: "Strengths are most useful when placing students into groups.",
    before: v(() => { A.tab("scores"); S.scoreWave = "end"; }),
    act: v(() => A.tab("match")),
    advanceOnClick: true,
  },
  {
    target: '[data-tour="student"]',
    title: "An incoming student",
    body: `${STUDENT.name} is new to 3D and wants structure and quick answers. Try changing what they need.`,
    before: v(() => A.tab("match")),
  },
  {
    target: '[data-tour="best"]',
    title: "The best fit",
    body: "Supervisors on their path are ranked on the strengths the student needs, from the latest scores. A person still makes the placement.",
    before: v(() => A.tab("match")),
  },
  {
    target: '[data-tour="tab-mentors"]',
    title: "The other half: mentor scoring",
    body: "Mentors score their students weekly. This part replaced about 20 hours of setup each term.",
    before: v(() => A.tab("match")),
    act: v(() => A.tab("mentors")),
    advanceOnClick: true,
  },
  {
    target: '[data-tour="gen-forms"]',
    title: "A form for every mentor",
    body: "One click creates each mentor's form, pre-filled with their students and the term's weeks.",
    before: v(() => A.tab("mentors")),
    act: v(() => A.forms()),
    advanceOnClick: true,
  },
  {
    target: '[data-tour="collect"]',
    title: "Scores flow in",
    body: "Collect a few weeks of scores.",
    before: v(() => A.tab("mentors")),
    act: v(() => A.collect()),
    advanceOnClick: true,
  },
  {
    target: '[data-tour="workbook"]',
    title: "Master file and running grades",
    body: "Every response lands in one master file with a tab per mentor, and each mentor's workbook keeps a running grade for every student.",
    before: v(() => A.tab("mentors")),
  },
  {
    title: "Done",
    body: "Explore freely: switch survey waves, change the student's needs, or open another mentor's workbook.",
    before: v(() => A.tab("mentors")),
  },
];

mountTour(document.getElementById("demo-mentor-assessments")!, {
  steps,
  reset: () => { S = fresh(); render(); },
  intro: `About 2 minutes, ${steps.length} steps.`,
});
