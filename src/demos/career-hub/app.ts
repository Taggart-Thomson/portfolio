// Career Hub demo: generic, invented data, nothing stored.
import { BOARDS, CHECKLIST, EXCLUDE, INCLUDE, RAW, STUDIOS } from "./data";
import type { Disc, Posting, Region } from "./data";
import { mountTour } from "../../components/tour/tour";
import type { TourStep } from "../../components/tour/tour";

type Tab = "jobs" | "studios" | "checklist" | "landed";

const fresh = () => ({
  tab: "jobs" as Tab,
  pipeline: false,
  disc: "all" as Disc | "all",
  region: "all" as Region | "all",
  juniors: false,
  checked: new Set<string>(),
  sent: false,
});
let S = fresh();

const root = document.querySelector<HTMLElement>("#demo-career-hub [data-demo-app]")!;
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

/** The feed filter: keep a title if it contains an include phrase and no exclude phrase. */
function verdict(p: Posting): { keep: boolean; why: string } {
  const t = p.title.toLowerCase();
  const ex = EXCLUDE.find((x) => t.includes(x));
  const inc = INCLUDE.find((x) => t.includes(x));
  if (ex) return { keep: false, why: `Dropped: "${ex}" role` };
  if (!inc) return { keep: false, why: "Dropped: not an art role" };
  return { keep: true, why: `Kept: matches "${inc}"` };
}
const kept = () => RAW.filter((p) => verdict(p).keep);
const total = CHECKLIST.reduce((n, g) => n + g.items.length, 0);

// Simple line icons drawn for the demo.
const I = {
  board: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18"/></svg>`,
  studio: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21V8l9-5 9 5v13"/><path d="M9 21v-6h6v6"/></svg>`,
  jobs: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`,
  doc: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h9l4 4v14H6z"/><path d="M9 12h7M9 16h7"/></svg>`,
  star: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6-5.3-3-5.3 3 1.2-6L3.4 9.3l6-.7z"/></svg>`,
  arrow: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17L17 7M8 7h9v9"/></svg>`,
  check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5L20 7"/></svg>`,
  info: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>`,
};

function shead(n: string, title: string, desc: string) {
  return `<div class="ch-shead"><span class="ch-num">${n}</span><h2>${title}</h2></div><p class="ch-sdesc">${desc}</p>`;
}

function jobsView() {
  const k = kept();
  return `<section class="ch-section">
      ${shead("01", "Best job boards to check", "Where to look first. Invented examples for the demo.")}
      <div class="ch-boards">${BOARDS.map((b) => `<div class="ch-board"><div class="ch-board-top"><span class="ch-board-name">${b.name}</span><span class="ch-ico">${I.arrow}</span></div><div class="ch-blurb">${b.note}</div></div>`).join("")}</div>
    </section>
    <section class="ch-section" data-tour="feed">
      ${shead("03", "Jobs you can apply to now", "Junior roles pulled from studios' own public job boards.")}
      <div class="ch-feedhead"><span class="ch-live"><i></i>Live feed</span>
        <button type="button" class="ch-pill" data-a="pipeline" aria-expanded="${S.pipeline}" data-tour="pipeline-btn">${S.pipeline ? "Hide how it's built" : "How this feed is built"}</button></div>
      ${S.pipeline ? `<div class="ch-pipe" data-tour="pipeline">
        <p>A scheduled job reads each studio's public job-board API, then keeps junior art roles. ${RAW.length} sample postings in, ${k.length} kept.</p>
        <ul class="ch-raw">${RAW.map((p) => { const v = verdict(p); return `<li class="${v.keep ? "keep" : "drop"}"><span><b>${esc(p.title)}</b> &middot; ${esc(p.studio)}</span><span class="ch-why">${esc(v.why)}</span></li>`; }).join("")}</ul>
      </div>` : ""}
      <div class="ch-joblist">${k.map((p) => { const s = STUDIOS.find((x) => x.name === p.studio)!; return `<div class="ch-job">
        <div class="ch-jmain"><div class="ch-role">${esc(p.title)}</div>
          <div class="ch-meta"><span class="ch-studio">${esc(p.studio)}</span><span class="ch-dot">&middot;</span>${esc(p.location)}<span class="ch-dot">&middot;</span>${p.posted}<span class="ch-dot">&middot;</span>via ${s.board}</div></div>
        <div class="ch-tags"><span class="ch-tag ${s.disc === "Film and VFX" ? "vfx" : "asset"}">${s.disc}</span></div>
        <span class="ch-go">${I.arrow}</span>
      </div>`; }).join("")}</div>
      <p class="ch-note">${I.info}<span>Invented postings. In the real feed, each one links to the studio's own listing.</span></p>
    </section>`;
}

function studiosView() {
  const list = STUDIOS.filter((s) => (S.disc === "all" || s.disc === S.disc) && (S.region === "all" || s.region === S.region) && (!S.juniors || s.juniors));
  const pills = <T extends string>(key: "disc" | "region", opts: T[]) => `<div class="ch-filters">${(["all", ...opts] as string[]).map((o) => `<button type="button" class="ch-pill ${S[key] === o ? "active" : ""}" aria-pressed="${S[key] === o}" data-a="${key}" data-v="${o}" data-tour="${key}-${o.replace(/\s+/g, "-")}">${o === "all" ? (key === "disc" ? "All studios" : "All regions") : o}</button>`).join("")}</div>`;
  return `<section class="ch-section" data-tour="studios">
    ${shead("02", "Studios to target", `${list.length} of ${STUDIOS.length} invented studios.`)}
    ${pills<Disc>("disc", ["Games", "Film and VFX", "Animation"])}
    ${pills<Region>("region", ["Americas", "Europe", "Asia Pacific"])}
    <label class="ch-toggle"><input type="checkbox" data-a="juniors" ${S.juniors ? "checked" : ""}/><span></span>Hires juniors</label>
    <div class="ch-studios">${list.map((s) => `<div class="ch-chip ${s.disc === "Film and VFX" ? "vfx" : ""}"><span class="ch-sico">${I.studio}</span><span class="ch-label">${esc(s.name)}<small>${s.city}${s.juniors ? " &middot; hires juniors" : ""}</small></span></div>`).join("") || `<p class="ch-sdesc">No studios match. Loosen a filter.</p>`}</div>
  </section>`;
}

function checklistView() {
  const n = S.checked.size;
  return `<section class="ch-section" data-tour="checklist">
    ${shead("04", "Resume and cover letters", "Run through this before you send anything.")}
    ${CHECKLIST.map((g) => `<div class="ch-subhead"><span class="ch-sh-dot"></span><h3>${g.group}</h3></div>
      <div class="ch-checklist">${g.items.map((it, i) => {
        const id = `${g.group}:${it}`, done = S.checked.has(id);
        return `<button type="button" class="ch-check ${done ? "done" : ""}" role="checkbox" aria-checked="${done}" data-a="check" data-v="${esc(id)}" data-tour="item-${g.group === "Resume" ? i : "x"}"><span class="ch-box">${I.check}</span><span class="ch-ctitle">${esc(it)}</span></button>`;
      }).join("")}</div>`).join("")}
    <div class="ch-progress" data-tour="progress"><div class="ch-track"><div class="ch-fill" style="width:${(n / total) * 100}%"></div></div><span class="ch-plabel">${n} of ${total} done</span></div>
    <p class="ch-note">${I.info}<span>Ticks stay on this page only.</span></p>
  </section>`;
}

function landedView() {
  if (S.sent) return `<section class="ch-section"><div class="ch-place done" data-tour="success">
    <div class="ch-place-ico">${I.star}</div>
    <h3>Congratulations, and thank you.</h3>
    <p>Your placement has been recorded.</p>
    <p class="ch-note">${I.info}<span>Demo only: nothing was sent or stored. In the real tracker the form posts to a small backend, records are protected by an admin token, and only a public count is shown.</span></p>
    <button type="button" class="ch-pill" data-a="again">Fill it in again</button>
  </div></section>`;
  return `<section class="ch-section"><div class="ch-place" data-tour="form">
    <div class="ch-place-h"><div class="ch-place-ico">${I.star}</div><div><h3>Landed a job? Tell us</h3><p class="ch-sdesc">Filled in with made-up details. This demo stores nothing.</p></div></div>
    <form class="ch-form" data-form="landed">
      <label>Name<input name="name" value="Ada Example" /></label>
      <label>Email<input name="email" type="email" value="ada@example.com" /></label>
      <label>Studio<input name="studio" value="Pinecone Interactive" /></label>
      <label>Role<input name="role" value="Environment Artist" /></label>
      <label>Start date<input name="start" type="month" value="2026-12" /></label>
      <label class="ch-toggle wide"><input type="checkbox" name="ok" checked /><span></span>It's fine to count my placement in school statistics</label>
      <button type="submit" class="ch-send" data-tour="submit">Send</button>
    </form>
  </div></section>`;
}

function render() {
  const tabs: [Tab, string, string, string][] = [["jobs", "Jobs", I.jobs, "c1"], ["studios", "Studios", I.studio, "c2"], ["checklist", "Resume", I.doc, "c5"], ["landed", "Landed a job?", I.star, "c7"]];
  const view = { jobs: jobsView, studios: studiosView, checklist: checklistView, landed: landedView }[S.tab]();
  root.innerHTML = `<div class="ch-app">
    <nav class="ch-rail" aria-hidden="true"><span class="ch-logo-tab"><span></span></span>${tabs.map(([id, , ico, c]) => `<span class="ch-ricon ${c} ${S.tab === id ? "on" : ""}">${ico}</span>`).join("")}<span class="ch-rsep"></span><span class="ch-ricon c6">${I.board}</span></nav>
    <div class="ch-main">
      <header class="ch-hero"><div class="ch-hero-in"><h1>Career Hub demo</h1><p>Everything for your job search, in one place.</p></div></header>
      <nav class="ch-tabbar" role="tablist" aria-label="Sections"><div class="ch-tabbar-in">${tabs.map(([id, l]) => `<button type="button" role="tab" class="ch-tab ${S.tab === id ? "active" : ""}" aria-selected="${S.tab === id}" data-a="tab" data-v="${id}" data-tour="tab-${id}">${l}</button>`).join("")}</div></nav>
      <div class="ch-wrap">${view}</div>
    </div>
  </div>`;
}

const A = {
  tab(t: Tab) { S.tab = t; },
  check(id: string) { S.checked.has(id) ? S.checked.delete(id) : S.checked.add(id); },
  send() { S.sent = true; },
};

root.addEventListener("click", (e) => {
  const b = (e.target as HTMLElement).closest<HTMLElement>("[data-a]");
  if (!b) return;
  const v = b.dataset.v ?? "";
  switch (b.dataset.a) {
    case "tab": A.tab(v as Tab); break;
    case "pipeline": S.pipeline = !S.pipeline; break;
    case "disc": S.disc = v as Disc | "all"; break;
    case "region": S.region = v as Region | "all"; break;
    case "juniors": S.juniors = (b as HTMLInputElement).checked; break;
    case "check": A.check(v); break;
    case "again": S.sent = false; break;
    default: return;
  }
  render();
});
root.addEventListener("submit", (e) => {
  e.preventDefault();
  A.send();
  render();
});
render();

// ---------- guided tour ----------

const v = (fn: () => void) => () => { fn(); render(); };
const steps: TourStep[] = [
  {
    title: "A generic Career Hub",
    body: "The real page was the school's first central place for job search support. This demo rebuilds it with invented studios and postings, and no branding.",
    before: v(() => A.tab("jobs")),
  },
  {
    target: '[data-tour="feed"]',
    title: "A live jobs feed",
    body: "Junior roles students can apply to now, pulled from studios' own public job boards.",
    before: v(() => A.tab("jobs")),
  },
  {
    target: '[data-tour="pipeline-btn"]',
    title: "How the feed is built",
    body: "See what comes in and what gets kept.",
    before: v(() => { A.tab("jobs"); S.pipeline = false; }),
    act: v(() => { S.pipeline = true; }),
    advanceOnClick: true,
  },
  {
    target: '[data-tour="pipeline"]',
    title: "Only relevant junior roles",
    body: "Studio boards list every opening, from engineering to HR. A simple filter keeps art roles and drops senior, lead and principal ones. It only uses official public APIs, never sites that forbid scraping.",
    before: v(() => { A.tab("jobs"); S.pipeline = true; }),
  },
  {
    target: '[data-tour="tab-studios"]',
    title: "Studios to target",
    body: "A filterable list of studios worth applying to.",
    before: v(() => A.tab("jobs")),
    act: v(() => A.tab("studios")),
    advanceOnClick: true,
  },
  {
    target: '[data-tour="disc-Film-and-VFX"]',
    title: "Filter by discipline",
    body: "Narrow it to film and VFX studios.",
    before: v(() => { A.tab("studios"); S.disc = "all"; }),
    act: v(() => { S.disc = "Film and VFX"; }),
    advanceOnClick: true,
  },
  {
    target: '[data-tour="tab-checklist"]',
    title: "Resume and cover letters",
    body: "A short guide with a checklist to run before sending anything.",
    before: v(() => A.tab("studios")),
    act: v(() => A.tab("checklist")),
    advanceOnClick: true,
  },
  {
    target: '[data-tour="item-0"]',
    title: "Tick things off",
    body: "Check an item and the progress updates.",
    before: v(() => A.tab("checklist")),
    act: v(() => A.check(`${CHECKLIST[0].group}:${CHECKLIST[0].items[0]}`)),
    advanceOnClick: true,
  },
  {
    target: '[data-tour="tab-landed"]',
    title: "Landed a job?",
    body: "The placement tracker: the part that gave leadership a number it never had.",
    before: v(() => A.tab("checklist")),
    act: v(() => A.tab("landed")),
    advanceOnClick: true,
  },
  {
    target: '[data-tour="submit"]',
    title: "Tell us",
    body: "Graduates report where they landed. Send the made-up example.",
    before: v(() => { A.tab("landed"); S.sent = false; }),
    act: v(() => A.send()),
    advanceOnClick: true,
  },
  {
    target: '[data-tour="success"]',
    title: "Recorded, in the real one",
    body: "Here nothing is sent or stored. In the real tracker, these reports are what showed that 8 in 10 graduates from the past 2 years work in the industry.",
    before: v(() => { A.tab("landed"); S.sent = true; }),
  },
];

mountTour(document.getElementById("demo-career-hub")!, {
  steps,
  reset: () => { S = fresh(); render(); },
  intro: `About a minute, ${steps.length} steps.`,
});
