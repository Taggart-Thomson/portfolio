// Driver's Exam Trainer demo: lessons with signal words, practice quizzes, a progress ring
// and a short timed mock exam. Original questions written from the public CTB.
import { MOCK_PER_SECTION, PASS, SECTIONS } from "./data";
import type { Q, Section } from "./data";
import { mountTour } from "../../components/tour/tour";
import type { TourStep } from "../../components/tour/tour";

interface Item { q: Q; order: number[]; sec: string }
type Screen =
  | { name: "home" }
  | { name: "lesson"; sec: string }
  | { name: "quiz"; mode: "practice" | "exam"; sec?: string; items: Item[]; i: number; picks: (number | null)[]; shown: boolean }
  | { name: "results"; mode: "practice" | "exam"; sec?: string; items: Item[]; picks: (number | null)[]; timedOut?: boolean };

let seed = 7;
const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const shuffle = <T,>(a: T[]) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

const fresh = () => ({ screen: { name: "home" } as Screen, done: new Set<string>(), best: null as number | null, english: false, left: 0 });
let S = fresh();
let timer = 0;

const root = document.querySelector<HTMLElement>("#demo-drivers-exam-trainer [data-demo-app]")!;
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
const sec = (id: string) => SECTIONS.find((s) => s.id === id)!;
const item = (q: Q, secId: string): Item => ({ q, order: shuffle(q.opts.map((_, i) => i)), sec: secId });
const passMark = (n: number) => Math.ceil(n * PASS);
const examSize = SECTIONS.length * MOCK_PER_SECTION;
const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
const bold = (text: string, sig: string) => {
  const i = text.toLowerCase().indexOf(sig.toLowerCase());
  return i < 0 ? esc(text) : `${esc(text.slice(0, i))}<mark>${esc(text.slice(i, i + sig.length))}</mark>${esc(text.slice(i + sig.length))}`;
};

// ---------- actions ----------

const A = {
  home() { stopTimer(); S.screen = { name: "home" }; },
  lesson(id: string) { stopTimer(); S.screen = { name: "lesson", sec: id }; },
  practice(id: string) {
    const items = sec(id).qs.map((q) => item(q, id));
    S.screen = { name: "quiz", mode: "practice", sec: id, items, i: 0, picks: items.map(() => null), shown: false };
  },
  exam() {
    const items = shuffle(SECTIONS.flatMap((s) => shuffle(s.qs).slice(0, MOCK_PER_SECTION).map((q) => item(q, s.id))));
    S.screen = { name: "quiz", mode: "exam", items, i: 0, picks: items.map(() => null), shown: false };
    S.left = examSize * 60;
    stopTimer();
    timer = window.setInterval(() => {
      S.left--;
      const t = root.querySelector(".dt-timer");
      if (t) t.textContent = fmt(S.left);
      if (S.left <= 0) { A.finish(true); render(); }
    }, 1000);
  },
  pick(k: number) {
    const s = S.screen;
    if (s.name !== "quiz" || s.shown) return;
    s.picks[s.i] = k;
    if (s.mode === "practice") s.shown = true;
    else A.next();
  },
  next() {
    const s = S.screen;
    if (s.name !== "quiz") return;
    if (s.i < s.items.length - 1) { s.i++; s.shown = false; } else A.finish(false);
  },
  /** Answers the rest of the quiz correctly. Used by the tour. */
  solve() {
    const s = S.screen;
    if (s.name !== "quiz") return;
    s.items.forEach((it, i) => { if (s.picks[i] === null) s.picks[i] = it.order.indexOf(it.q.answer); });
    A.finish(false);
  },
  finish(timedOut: boolean) {
    const s = S.screen;
    if (s.name !== "quiz") return;
    stopTimer();
    const score = s.items.filter((it, i) => s.picks[i] !== null && it.order[s.picks[i]!] === it.q.answer).length;
    if (s.mode === "practice" && s.sec && score >= passMark(s.items.length)) S.done.add(s.sec);
    if (s.mode === "exam") S.best = Math.max(S.best ?? 0, score);
    S.screen = { name: "results", mode: s.mode, sec: s.sec, items: s.items, picks: s.picks, timedOut };
  },
};
function stopTimer() { if (timer) { clearInterval(timer); timer = 0; } }

// ---------- views ----------

function ring() {
  const pct = Math.round((S.done.size / SECTIONS.length) * 100);
  return `<div class="dt-ring" style="--p:${pct}" data-tour="ring"><span>${pct}%</span></div>`;
}

function homeView() {
  return `<div class="dt-hero">
      ${ring()}
      <div><h3>Learn the rules, and the Portuguese words that decide each question.</h3>
      <p class="dt-muted">${S.done.size} of ${SECTIONS.length} sections complete. A section is complete at 70 percent or higher.${S.best !== null ? ` Best mock exam: ${S.best} of ${examSize}.` : ""}</p></div>
    </div>
    <div class="dt-secs" data-tour="sections">${SECTIONS.map((s, i) => `<button type="button" class="dt-sec ${S.done.has(s.id) ? "done" : ""}" data-a="lesson" data-v="${s.id}" data-tour="sec-${s.id}">
        <span class="dt-num">${String(i + 1).padStart(2, "0")}</span>
        <span><b>${s.en}</b><span class="dt-pt">${s.pt}</span></span>
        <span class="dt-st">${S.done.has(s.id) ? "Complete" : `${s.qs.length} questions`}</span>
      </button>`).join("")}</div>
    <div class="dt-mock" data-tour="mock">
      <div><b>Mock exam</b><p class="dt-muted">${examSize} questions in ${examSize} minutes, ${passMark(examSize)} to pass, drawn evenly from every section and reshuffled each time. The real exam is 30 questions in 30 minutes, 21 to pass.</p></div>
      <button type="button" class="dt-btn" data-a="exam" data-tour="exam-btn">Start mock exam</button>
    </div>`;
}

function lessonView(s: Section) {
  return `<button type="button" class="dt-back" data-a="home">&#8592; All sections</button>
    <h3>${s.en} <span class="dt-pt">${s.pt}</span></h3>
    <section class="dt-card" data-tour="words"><div class="dt-k">Signal words</div>
      <div class="dt-words">${s.words.map(([pt, en]) => `<div><b>${esc(pt)}</b><span>${esc(en)}</span></div>`).join("")}</div></section>
    <section class="dt-card" data-tour="rules"><div class="dt-k">The rules</div>
      <ol class="dt-rules">${s.rules.map((r, i) => `<li data-tour="rule-${i}">${esc(r.en)}<div class="dt-dec">Decided by: <b>${esc(r.pt)}</b></div></li>`).join("")}</ol></section>
    <button type="button" class="dt-btn" data-a="practice" data-v="${s.id}" data-tour="practice-btn">Practice ${s.qs.length} questions</button>`;
}

function quizView(s: Extract<Screen, { name: "quiz" }>) {
  const it = s.items[s.i], q = it.q, pick = s.picks[s.i];
  const correctPos = it.order.indexOf(q.answer);
  return `<div class="dt-qhead">
      <button type="button" class="dt-back" data-a="home">&#8592; Quit</button>
      <span class="dt-k">${s.mode === "exam" ? "Mock exam" : sec(s.sec!).en} &middot; ${s.i + 1} of ${s.items.length}</span>
      ${s.mode === "exam" ? `<span class="dt-timer" data-tour="timer">${fmt(S.left)}</span>` : ""}
    </div>
    <section class="dt-card dt-q" data-tour="question">
      <p class="dt-qt">${bold(q.pt, q.signal)}</p>
      ${S.english ? `<p class="dt-en">${esc(q.en)}</p>` : ""}
      <button type="button" class="dt-link" data-a="english" data-tour="english">${S.english ? "Hide English" : "Show in English"}</button>
      <div class="dt-opts">${it.order.map((oi, pos) => {
        const [pt, en] = q.opts[oi];
        let cls = "";
        if (s.shown) cls = pos === correctPos ? "right" : pos === pick ? "wrong" : "dim";
        return `<button type="button" class="dt-opt ${cls}" data-a="pick" data-v="${pos}" ${s.shown ? "disabled" : ""} data-tour="${pos === correctPos ? "correct" : ""}">
          <span class="dt-l">${"ABCD"[pos]}</span><span>${esc(pt)}${S.english ? `<span class="dt-en">${esc(en)}</span>` : ""}</span></button>`;
      }).join("")}</div>
      ${s.shown ? `<div class="dt-fb ${pick === correctPos ? "ok" : "no"}" data-tour="feedback">
        <b>${pick === correctPos ? "Correct." : "Not quite."}</b> The deciding words: <mark>${esc(q.signal)}</mark>. ${esc(q.why)}
        <div class="dt-art">CTB, ${esc(q.art)}</div></div>
        <button type="button" class="dt-btn" data-a="next">${s.i < s.items.length - 1 ? "Next question" : "See results"}</button>` : ""}
    </section>
    ${s.mode === "practice" ? `<button type="button" class="dt-link sm" data-a="solve" data-tour="solve">Skip ahead: answer the rest for me</button>` : ""}`;
}

function resultsView(s: Extract<Screen, { name: "results" }>) {
  const right = (it: Item, i: number) => s.picks[i] !== null && it.order[s.picks[i]!] === it.q.answer;
  const score = s.items.filter(right).length, need = passMark(s.items.length), passed = score >= need;
  const missed = s.items.map((it, i) => ({ it, i })).filter(({ it, i }) => !right(it, i));
  return `<section class="dt-card dt-res ${passed ? "pass" : "fail"}" data-tour="results">
      <div class="dt-k">${s.mode === "exam" ? "Mock exam" : sec(s.sec!).en}${s.timedOut ? " &middot; time ran out" : ""}</div>
      <div class="dt-score">${score} of ${s.items.length}</div>
      <p>${passed ? (s.mode === "exam" ? "Passed." : "Section complete.") : "Not yet."} The pass mark is ${need} of ${s.items.length}, 70 percent or higher.</p>
    </section>
    ${missed.length ? `<section class="dt-card"><div class="dt-k">Review what you missed</div>${missed.map(({ it, i }) => `<div class="dt-miss">
        <p>${bold(it.q.pt, it.q.signal)}</p>
        <p class="dt-muted">Your answer: ${s.picks[i] === null ? "none" : esc(it.q.opts[it.order[s.picks[i]!]][0])}. Right answer: <b>${esc(it.q.opts[it.q.answer][0])}</b>.</p>
        <p class="dt-muted">${esc(it.q.why)} <span class="dt-art">CTB, ${esc(it.q.art)}</span></p></div>`).join("")}</section>` : ""}
    <div class="dt-row"><button type="button" class="dt-btn" data-a="home" data-tour="home-btn">Back to sections</button>${s.mode === "practice" ? `<button type="button" class="dt-btn ghost" data-a="practice" data-v="${s.sec}">Practice again</button>` : ""}</div>`;
}

function render() {
  const s = S.screen;
  const view = s.name === "home" ? homeView() : s.name === "lesson" ? lessonView(sec(s.sec)) : s.name === "quiz" ? quizView(s) : resultsView(s);
  root.innerHTML = `<div class="dt-app">${view}<p class="dt-src">Original questions written for this demo from Brazil's public traffic code (CTB, Lei nº 9.503/1997). Each one cites its article.</p></div>`;
}

root.addEventListener("click", (e) => {
  const b = (e.target as HTMLElement).closest<HTMLElement>("[data-a]");
  if (!b || (b as HTMLButtonElement).disabled) return;
  const v = b.dataset.v ?? "";
  switch (b.dataset.a) {
    case "home": A.home(); break;
    case "lesson": A.lesson(v); break;
    case "practice": A.practice(v); break;
    case "exam": A.exam(); break;
    case "pick": A.pick(Number(v)); break;
    case "next": A.next(); break;
    case "solve": A.solve(); break;
    case "english": S.english = !S.english; break;
  }
  render();
});
render();

// ---------- guided tour ----------

const v = (fn: () => void) => () => { fn(); render(); };
const onQuiz = () => S.screen.name === "quiz" && S.screen.mode === "practice";
const steps: TourStep[] = [
  {
    title: "Passing a driving test in Portuguese",
    body: "I built this to pass Brazil's written driver's exam as a native English speaker. The questions here are original, written for this demo from Brazil's public traffic code, and each cites its article.",
    before: v(() => A.home()),
  },
  {
    target: '[data-tour="sections"]',
    title: "Sections, and a progress ring",
    body: "Each section has a lesson and a practice quiz. Score 70 percent or higher and the section is complete.",
    before: v(() => A.home()),
  },
  {
    target: '[data-tour="sec-seg"]',
    title: "Open a section",
    body: "Start with Safety.",
    before: v(() => A.home()),
    act: v(() => A.lesson("seg")),
    advanceOnClick: true,
  },
  {
    target: '[data-tour="words"]',
    title: "Signal words",
    body: "Many exam questions turn on one word. Each section starts with the Portuguese words that decide its questions.",
    before: v(() => A.lesson("seg")),
  },
  {
    target: '[data-tour="rule-3"]',
    title: "One phrase changes the answer",
    body: "Using a phone while driving is média. Holding or handling it, one-handed, is gravíssima. The rule is taught in English, with the Portuguese that decides it.",
    before: v(() => A.lesson("seg")),
  },
  {
    target: '[data-tour="practice-btn"]',
    title: "Practice",
    body: "Five questions, in Portuguese, like the real exam.",
    before: v(() => A.lesson("seg")),
    act: v(() => { seed = 7; A.practice("seg"); }),
    advanceOnClick: true,
  },
  {
    target: '[data-tour="english"]',
    title: "English when you need it",
    body: "The deciding words are highlighted. Show the English if you're stuck.",
    before: v(() => { if (!onQuiz()) { seed = 7; A.practice("seg"); } }),
    act: v(() => { S.english = true; }),
    advanceOnClick: true,
  },
  {
    target: '[data-tour="correct"]',
    title: "Answer",
    body: "Pick the right answer.",
    before: v(() => { if (!onQuiz()) { seed = 7; A.practice("seg"); } S.english = true; }),
    act: v(() => { const s = S.screen; if (s.name === "quiz" && !s.shown) A.pick(s.items[s.i].order.indexOf(s.items[s.i].q.answer)); }),
    advanceOnClick: true,
  },
  {
    target: '[data-tour="feedback"]',
    title: "Why, and where it's written",
    body: "Every answer explains the rule, repeats the deciding words, and cites the article of the traffic code it comes from.",
    before: v(() => {}),
  },
  {
    target: '[data-tour="solve"]',
    title: "Skip to the end",
    body: "For the tour, answer the rest automatically.",
    before: v(() => {}),
    act: v(() => A.solve()),
    advanceOnClick: true,
  },
  {
    target: '[data-tour="results"]',
    title: "Section complete",
    body: "70 percent or higher completes the section. Missed questions are listed for review.",
    before: v(() => {}),
  },
  {
    target: '[data-tour="home-btn"]',
    title: "Back to the sections",
    body: "Watch the ring move.",
    before: v(() => {}),
    act: v(() => A.home()),
    advanceOnClick: true,
  },
  {
    target: '[data-tour="mock"]',
    title: "A short mock exam",
    body: "Timed, drawn evenly from every section, reshuffled every attempt, and every miss reviewed at the end. The real app mirrors the official 30-question exam.",
    before: v(() => A.home()),
  },
];

mountTour(document.getElementById("demo-drivers-exam-trainer")!, {
  steps,
  reset: () => { stopTimer(); seed = 7; S = fresh(); render(); },
  intro: `About 2 minutes, ${steps.length} steps.`,
});
