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

// ---------- views ----------

function header() {
  const tabs: [Tab, string][] = [["surveys", "Surveys"], ["scores", "Supervisor scores"], ["match", "Match"], ["mentors", "Mentor scoring"]];
  const wave = (w: Wave) => S.received[w]
    ? `<span class="ma-wave ok">${WAVE_LABEL[w]} survey: ${responses(w).length} responses in</span>`
    : `<button type="button" class="ma-btn sm" data-a="receive" data-v="${w}" data-tour="receive-${w}" ${w === "end" && !S.received.mid ? "disabled" : ""}>Receive ${WAVE_LABEL[w].toLowerCase()} responses</button>`;
  return `<div class="ma-head">
    <div class="ma-status" data-tour="status"><span class="ma-k">Demo term &middot; invented data</span>${wave("mid")}${wave("end")}</div>
    <nav class="ma-tabs" role="tablist" aria-label="Views">${tabs.map(([id, l]) => `<button type="button" role="tab" aria-selected="${S.tab === id}" data-a="tab" data-v="${id}" data-tour="tab-${id}">${l}</button>`).join("")}</nav>
  </div>`;
}

function waveToggle(key: "surveyWave" | "scoreWave", allowed: Record<Wave, boolean>) {
  return `<div class="ma-chips">${(["mid", "end"] as Wave[]).map((w) => `<button type="button" class="ma-chip" aria-pressed="${S[key] === w}" data-a="${key}" data-v="${w}" ${allowed[w] ? "" : "disabled"}>${WAVE_LABEL[w]}</button>`).join("")}</div>`;
}

function surveysView() {
  if (!S.received.mid) return `<section class="ma-card ma-empty"><h3>No responses yet</h3><p>Students fill in a survey twice a term, at mid-term and at the end, rating their supervisor and writing comments. Receive the mid-term responses to start.</p></section>`;
  const rs = responses(S.surveyWave);
  return `<section class="ma-card" data-tour="responses">
    <div class="ma-card-h"><h3>${WAVE_LABEL[S.surveyWave]} responses</h3>${waveToggle("surveyWave", S.received)}</div>
    <p class="ma-muted ma-top">${rs.length} invented responses. Ratings from 1 to 5 on ${RATINGS.join(", ").toLowerCase()}, plus a written comment.</p>
    <div class="ma-scroll"><table class="ma-t">
      <thead><tr><th>Student</th><th>Supervisor</th>${RATINGS.map((r) => `<th>${r}</th>`).join("")}<th>Comment</th></tr></thead>
      <tbody>${rs.map((r) => `<tr><td>${esc(r.student)}</td><td>${esc(sup(r.sup).name)}</td>${r.r.map((x) => `<td class="n">${x}</td>`).join("")}<td class="c">${esc(r.comment)}</td></tr>`).join("")}</tbody>
    </table></div>
  </section>`;
}

function scoreCard(id: string, w: Wave) {
  const a = ANALYSIS[w][id], s = sup(id), avg = ratingAvg(w, id);
  const prev = w === "end" && S.analyzed.mid ? ANALYSIS.mid[id].score : null;
  const delta = prev !== null ? a.score - prev : 0;
  return `<article class="ma-sc ${a.flag ? "flag" : ""}" data-tour="score-${id}">
    <div class="ma-sc-h">
      <div><h4>${esc(s.name)}</h4><div class="ma-muted">${s.path}</div></div>
      <div class="ma-score"><b>${a.score.toFixed(1)}</b><span>AI score of 5</span></div>
    </div>
    <div class="ma-muted">Ratings alone average ${avg.toFixed(1)}.${prev !== null && Math.abs(delta) >= 0.05 ? ` ${delta > 0 ? "Up" : "Down"} ${Math.abs(delta).toFixed(1)} since mid-term.` : ""}</div>
    ${a.flag ? `<div class="ma-flag">Needs attention now: ${esc(a.watch ?? "")}</div>` : ""}
    <p>${esc(a.summary)}</p>
    <div class="ma-chips">${a.strengths.map((x) => `<span class="ma-tag">${x}</span>`).join("")}</div>
    ${a.watch && !a.flag ? `<div class="ma-muted">Watch: ${esc(a.watch)}</div>` : ""}
    <div class="ma-ev">${a.evidence.map((e) => `<q>${esc(e)}</q>`).join("")}</div>
  </article>`;
}

function scoresView() {
  if (!S.received.mid) return `<section class="ma-card ma-empty"><h3>Nothing to score yet</h3><p>Receive the mid-term survey responses first.</p></section>`;
  const w = S.scoreWave;
  const n = responses(w).length;
  if (!S.analyzed[w]) return `<section class="ma-card" data-tour="analyze-card">
    <div class="ma-card-h"><h3>${WAVE_LABEL[w]} scores</h3>${waveToggle("scoreWave", S.received)}</div>
    <p>${n} responses waiting. The analysis reads every written comment together with the ratings, then gives each supervisor a score, strengths and anything to watch.</p>
    <button type="button" class="ma-btn" data-a="analyze" data-v="${w}" data-tour="analyze-${w}">Run AI analysis</button>
    <p class="ma-muted">Precomputed for this demo. No model is called from your browser.</p>
  </section>`;
  return `<section class="ma-card">
    <div class="ma-card-h"><h3>${WAVE_LABEL[w]} scores</h3>${waveToggle("scoreWave", S.received)}</div>
    <p class="ma-muted ma-top">From ${n} responses. Precomputed for this demo. Quotes show the comments each score leaned on.</p>
    <div class="ma-scores">${SUPERVISORS.map((s) => scoreCard(s.id, w)).join("")}</div>
  </section>`;
}

function matchView() {
  const w = latest();
  if (!w) return `<section class="ma-card ma-empty"><h3>No scores yet</h3><p>Run the AI analysis on a survey first. Matching uses each supervisor's strengths.</p></section>`;
  const cands = SUPERVISORS.filter((s) => s.path === STUDENT.path).map((s) => {
    const dims = ANALYSIS[w][s.id].dims;
    const fit = S.needs.length ? S.needs.reduce((t, d) => t + dims[d], 0) / S.needs.length : 0;
    return { s, dims, fit };
  }).sort((a, b) => b.fit - a.fit);
  return `<div class="ma-two">
    <section class="ma-card" data-tour="student">
      <div class="ma-k">Incoming student</div>
      <h3>${STUDENT.name}</h3>
      <div class="ma-muted">${STUDENT.path} path</div>
      <p>${esc(STUDENT.note)}</p>
      <div class="ma-k">What they need most (pick up to 3)</div>
      <div class="ma-chips">${DIMS.map((d) => `<button type="button" class="ma-chip" aria-pressed="${S.needs.includes(d)}" data-a="need" data-v="${d}">${d}</button>`).join("")}</div>
    </section>
    <section class="ma-card" data-tour="matches">
      <div class="ma-card-h"><h3>${STUDENT.path} supervisors</h3><span class="ma-muted">Using ${WAVE_LABEL[w].toLowerCase()} strengths</span></div>
      ${S.needs.length ? cands.map((c, i) => `<div class="ma-match ${i === 0 ? "best" : ""}" data-tour="${i === 0 ? "best" : ""}">
        <div class="ma-sc-h"><div><h4>${esc(c.s.name)}</h4>${i === 0 ? `<span class="ma-tag solid">Best match</span>` : ""}</div><div class="ma-score"><b>${c.fit.toFixed(1)}</b><span>fit of 5</span></div></div>
        <div class="ma-muted">${S.needs.map((d) => `${d} ${c.dims[d]} of 5`).join(" &middot; ")}</div>
      </div>`).join("") : `<p class="ma-muted">Pick at least one need.</p>`}
      <p class="ma-muted">Students are matched within their path. The person placing groups still decides.</p>
    </section>
  </div>`;
}

function mentorsView() {
  const m = MENTORS[S.mentor];
  const formPanel = S.forms ? `<section class="ma-card" data-tour="form">
    <div class="ma-card-h"><h3>Form: ${esc(m.name)}</h3></div>
    <label class="ma-lab">Student<select>${m.students.map((s) => `<option>${esc(s)}</option>`).join("")}</select></label>
    <label class="ma-lab">Week<select>${Array.from({ length: WEEKS }, (_, i) => `<option>Week ${i + 1}</option>`).join("")}</select></label>
    <div class="ma-scroll"><table class="ma-t ma-grid"><thead><tr><th>Criterion</th>${[0, 1, 2, 3, 4, 5].map((n) => `<th>${n}</th>`).join("")}</tr></thead>
    <tbody>${CRITERIA.map((c) => `<tr><td>${c}</td>${[0, 1, 2, 3, 4, 5].map(() => `<td><span class="ma-radio"></span></td>`).join("")}</tr>`).join("")}</tbody></table></div>
    <p class="ma-muted">Pre-filled with this mentor's students and the term's weeks. Example rubric.</p>
  </section>` : "";
  let master = "", book = "";
  if (S.collected) {
    master = `<section class="ma-card" data-tour="master">
      <div class="ma-card-h"><h3>Master file</h3><span class="ma-muted">One tab per mentor</span></div>
      <div class="ma-sheettabs">${MENTORS.map((x, i) => `<button type="button" class="ma-stab" aria-pressed="${i === S.mentor}" data-a="mentor" data-v="${i}">${esc(x.name)}</button>`).join("")}</div>
      <div class="ma-scroll"><table class="ma-t"><thead><tr><th>Week</th><th>Student</th>${CRITERIA.map((c) => `<th>${c}</th>`).join("")}</tr></thead>
      <tbody>${Array.from({ length: WEEKS }, (_, wk) => m.students.map((st, si) => `<tr><td class="n">${wk + 1}</td><td>${esc(st)}</td>${weekScores(S.mentor, si, wk).map((x) => `<td class="n">${x}</td>`).join("")}</tr>`).join("")).join("")}</tbody></table></div>
    </section>`;
    const si = Math.min(S.wbStudent, m.students.length - 1);
    let sum = 0;
    const rows = Array.from({ length: WEEKS }, (_, wk) => {
      const t = weekScores(S.mentor, si, wk).reduce((a, b) => a + b, 0);
      sum += t;
      return `<tr><td class="n">${wk + 1}</td><td class="n">${t} of 25</td><td class="n">${Math.round((sum / (25 * (wk + 1))) * 100)}%</td></tr>`;
    }).join("");
    book = `<section class="ma-card" data-tour="workbook">
      <div class="ma-card-h"><h3>${esc(m.name)}'s workbook</h3><span class="ma-muted">One tab per student</span></div>
      <div class="ma-sheettabs">${m.students.map((s, i) => `<button type="button" class="ma-stab" aria-pressed="${i === si}" data-a="wb" data-v="${i}">${esc(s)}</button>`).join("")}</div>
      <table class="ma-t"><thead><tr><th>Week</th><th>Weekly total</th><th>Running grade</th></tr></thead><tbody>${rows}</tbody></table>
    </section>`;
  }
  return `<section class="ma-card">
      <div class="ma-card-h"><h3>Mentor scoring</h3><span class="ma-muted">${MENTORS.length} invented mentors here. The real term has about 72.</span></div>
      <p class="ma-top">Each week, mentors score their students on a rubric. The setup used to take about 20 hours by hand every term. Now it runs itself.</p>
      <div class="ma-row">
        <button type="button" class="ma-btn" data-a="forms" data-tour="gen-forms" ${S.forms ? "disabled" : ""}>${S.forms ? "Forms generated" : "Generate a form per mentor"}</button>
        <button type="button" class="ma-btn" data-a="collect" data-tour="collect" ${!S.forms || S.collected ? "disabled" : ""}>${S.collected ? `${WEEKS} weeks collected` : `Collect ${WEEKS} weeks of scores`}</button>
      </div>
      ${S.forms ? `<div class="ma-chips ma-mentors">${MENTORS.map((x, i) => `<button type="button" class="ma-chip" aria-pressed="${i === S.mentor}" data-a="mentor" data-v="${i}">${esc(x.name)}, ${x.students.length} students</button>`).join("")}</div>` : ""}
    </section>
    <div class="ma-three">${formPanel}${master}${book}</div>`;
}

function render() {
  const view = { surveys: surveysView, scores: scoresView, match: matchView, mentors: mentorsView }[S.tab]();
  root.innerHTML = `<div class="ma-app">${header()}<div class="ma-body">${view}</div></div>`;
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
