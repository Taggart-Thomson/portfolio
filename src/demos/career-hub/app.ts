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

function jobsView() {
  const k = kept();
  return `<section class="ch-card">
      <div class="ch-card-h"><h3>Job boards worth checking</h3></div>
      <div class="ch-boards">${BOARDS.map((b) => `<div class="ch-board"><b>${b.name}</b><span>${b.note}</span></div>`).join("")}</div>
    </section>
    <section class="ch-card" data-tour="feed">
      <div class="ch-card-h"><h3>Jobs you can apply to now</h3>
        <button type="button" class="ch-btn ghost sm" data-a="pipeline" aria-expanded="${S.pipeline}" data-tour="pipeline-btn">${S.pipeline ? "Hide" : "How this feed is built"}</button></div>
      ${S.pipeline ? `<div class="ch-pipe" data-tour="pipeline">
        <p class="ch-muted">A scheduled job reads each studio's public job-board API, then keeps junior art roles. ${RAW.length} sample postings in, ${k.length} kept.</p>
        <ul class="ch-raw">${RAW.map((p) => { const v = verdict(p); return `<li class="${v.keep ? "keep" : "drop"}"><span><b>${esc(p.title)}</b> &middot; ${esc(p.studio)}</span><span class="ch-why">${esc(v.why)}</span></li>`; }).join("")}</ul>
      </div>` : ""}
      <ul class="ch-jobs">${k.map((p) => { const s = STUDIOS.find((x) => x.name === p.studio)!; return `<li>
        <div><b>${esc(p.title)}</b><div class="ch-muted">${esc(p.studio)} &middot; ${esc(p.location)}</div></div>
        <div class="ch-meta"><span class="ch-tag">${s.disc}</span><span class="ch-muted">${p.posted}</span><span class="ch-muted">via ${s.board}</span></div>
      </li>`; }).join("")}</ul>
      <p class="ch-muted">Invented postings. In the real feed, each one links to the studio's own listing.</p>
    </section>`;
}

function studiosView() {
  const list = STUDIOS.filter((s) => (S.disc === "all" || s.disc === S.disc) && (S.region === "all" || s.region === S.region) && (!S.juniors || s.juniors));
  const chips = <T extends string>(key: "disc" | "region", opts: T[]) => `<div class="ch-chips">${(["all", ...opts] as string[]).map((o) => `<button type="button" class="ch-chip" aria-pressed="${S[key] === o}" data-a="${key}" data-v="${o}" data-tour="${key}-${o.replace(/\s+/g, "-")}">${o === "all" ? "All" : o}</button>`).join("")}</div>`;
  return `<section class="ch-card" data-tour="studios">
    <div class="ch-card-h"><h3>Studios to target</h3><span class="ch-muted">${list.length} of ${STUDIOS.length}</span></div>
    <div class="ch-filters">
      ${chips<Disc>("disc", ["Games", "Film and VFX", "Animation"])}
      ${chips<Region>("region", ["Americas", "Europe", "Asia Pacific"])}
      <label class="ch-check"><input type="checkbox" data-a="juniors" ${S.juniors ? "checked" : ""}/> Hires juniors</label>
    </div>
    <div class="ch-studios">${list.map((s) => `<div class="ch-studio"><span class="ch-mark d-${s.disc.split(" ")[0].toLowerCase()}" aria-hidden="true"></span><div><b>${esc(s.name)}</b><div class="ch-muted">${s.city} &middot; ${s.disc}${s.juniors ? " &middot; hires juniors" : ""}</div></div></div>`).join("") || `<p class="ch-muted">No studios match. Loosen a filter.</p>`}</div>
    <p class="ch-muted">Invented studios.</p>
  </section>`;
}

function checklistView() {
  const n = S.checked.size;
  return `<section class="ch-card" data-tour="checklist">
    <div class="ch-card-h"><h3>Resume and cover letter checklist</h3><span class="ch-progress" data-tour="progress">${n} of ${total} done</span></div>
    ${CHECKLIST.map((g) => `<h4>${g.group}</h4><ul class="ch-list">${g.items.map((it) => {
      const id = `${g.group}:${it}`;
      return `<li><label class="ch-check"><input type="checkbox" data-a="check" data-v="${esc(id)}" ${S.checked.has(id) ? "checked" : ""} data-tour="item-${g.group === "Resume" ? g.items.indexOf(it) : "x"}"/> ${esc(it)}</label></li>`;
    }).join("")}</ul>`).join("")}
    <p class="ch-muted">Ticks stay on this page only.</p>
  </section>`;
}

function landedView() {
  if (S.sent) return `<section class="ch-card ch-done" data-tour="success">
    <h3>Congratulations, and thank you.</h3>
    <p>Your placement has been recorded.</p>
    <p class="ch-note">Demo only: nothing was sent or stored. In the real tracker the form posts to a small backend, records are protected by an admin token, and only a public count is shown.</p>
    <button type="button" class="ch-btn ghost sm" data-a="again">Fill it in again</button>
  </section>`;
  return `<section class="ch-card" data-tour="form">
    <div class="ch-card-h"><h3>Landed a job? Tell us</h3></div>
    <form class="ch-form" data-form="landed">
      <label>Name<input name="name" value="Ada Example" /></label>
      <label>Email<input name="email" type="email" value="ada@example.com" /></label>
      <label>Studio<input name="studio" value="Pinecone Interactive" /></label>
      <label>Role<input name="role" value="Environment Artist" /></label>
      <label>Start date<input name="start" type="month" value="2026-12" /></label>
      <label class="ch-check"><input type="checkbox" name="ok" checked /> It's fine to count my placement in school statistics</label>
      <button type="submit" class="ch-btn" data-tour="submit">Send</button>
      <p class="ch-muted">Filled in with made-up details. This demo stores nothing.</p>
    </form>
  </section>`;
}

function render() {
  const tabs: [Tab, string][] = [["jobs", "Jobs"], ["studios", "Studios"], ["checklist", "Checklist"], ["landed", "Landed a job?"]];
  const view = { jobs: jobsView, studios: studiosView, checklist: checklistView, landed: landedView }[S.tab]();
  root.innerHTML = `<div class="ch-app">
    <header class="ch-hero"><div class="ch-k">Career Hub demo</div><h2>Everything for your job search, in one place.</h2></header>
    <nav class="ch-tabs" role="tablist" aria-label="Sections">${tabs.map(([id, l]) => `<button type="button" role="tab" aria-selected="${S.tab === id}" data-a="tab" data-v="${id}" data-tour="tab-${id}">${l}</button>`).join("")}</nav>
    <div class="ch-body">${view}</div>
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
