// Verso demo: collection, collection assistant, and the invoice workflow across roles.
import { CONTRACTS, DRAFT, ENTITIES, INVOICES, PEOPLE, WORKS } from "./data";
import type { Invoice, InvStatus, Medium, Person, Role, Work } from "./data";
import { HIDDEN_FIELDS, collectionStats, fmtCall, searchCollection, shape } from "./search";
import type { SearchArgs } from "./search";
import { mountTour } from "../../components/tour/tour";
import type { TourStep } from "../../components/tour/tour";

type Tab = "collection" | "assistant" | "invoices";
interface Answer { q: string; text: string; call?: string; matches?: number; payload?: object[]; open: boolean }

const NEW_ID = "INV-2050";
const TODAY = "Nov 8";

const fresh = () => ({
  tab: "collection" as Tab,
  query: "",
  medium: "all" as Medium | "all",
  work: null as string | null,
  answers: [] as Answer[],
  asked: new Set<string>(),
  role: "contractor" as Role,
  reviewerEntity: "inc",
  invoices: INVOICES.map((i) => ({ ...i, history: i.history.slice() })) as Invoice[],
  people: PEOPLE.map((p) => ({ ...p })) as Person[],
  returning: null as string | null,
  toast: "",
  nextRef: 5540,
});
let S = fresh();

const root = document.querySelector<HTMLElement>("#demo-verso [data-demo-app]")!;
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
const money = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
const person = (id: string) => S.people.find((p) => p.id === id)!;
const entity = (id: string) => ENTITIES.find((e) => e.id === id)!;
const contract = (id: string) => CONTRACTS.find((c) => c.id === id)!;
const work = (id: string) => WORKS.find((w) => w.id === id)!;
const MEDIA: Medium[] = ["sculpture", "painting", "print", "textile", "photograph", "installation"];
const cap = (s: string) => s[0].toUpperCase() + s.slice(1);
const STATUS_LABEL: Record<InvStatus, string> = { submitted: "Waiting for review", returned: "Returned", approved: "Approved, unpaid", paid: "Paid" };

function me(): Person {
  if (S.role === "contractor") return person("jun");
  if (S.role === "reviewer") return person(entity(S.reviewerEntity).reviewer);
  if (S.role === "accounting") return person("pat");
  return person("sol");
}

// ---------- the assistant (canned questions, live searches) ----------

const titles = (rs: ReturnType<typeof shape>[]) => rs.map((r) => `${r.title} (${r.artist}, ${r.dimensions_cm[0]} cm tall)`).join("; ");

const QUESTIONS: { id: string; q: string; run: () => Omit<Answer, "q" | "open"> }[] = [
  {
    id: "bronze", q: "What do we have in bronze?",
    run: () => {
      const a: SearchArgs = { text: "bronze" };
      const r = searchCollection(a);
      return { call: fmtCall("search_collection", a), matches: r.total_matches, payload: r.results,
        text: `${r.total_matches} works list bronze in their materials: ${titles(r.results)}.` };
    },
  },
  {
    id: "tall", q: "Which works are over two meters tall?",
    run: () => {
      const a: SearchArgs = { min_height_cm: 200 };
      const r = searchCollection(a);
      const loan = r.results.filter((x) => x.status === "on loan").length;
      return { call: fmtCall("search_collection", a), matches: r.total_matches, payload: r.results,
        text: `${r.total_matches} works are over 200 cm tall. Tallest first: ${titles(r.results)}.${loan ? ` ${loan} of them ${loan === 1 ? "is" : "are"} on loan right now.` : ""}` };
    },
  },
  {
    id: "outdoor", q: "What could go outdoors that's in the warehouse now?",
    run: () => {
      const a: SearchArgs = { outdoor_capable: true, location: "Warehouse" };
      const r = searchCollection(a);
      return { call: fmtCall("search_collection", a), matches: r.total_matches, payload: r.results,
        text: `${r.total_matches} weather-durable works are in the warehouse: ${r.results.map((x) => `${x.title} (${x.material}${x.status === "on hold" ? ", on hold" : ""})`).join("; ")}.` };
    },
  },
  {
    id: "stats", q: "How many works do we have, by medium?",
    run: () => {
      const r = collectionStats("medium");
      const parts = Object.entries(r.groups).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${v} ${k}${v === 1 ? "" : k.endsWith("s") ? "" : "s"}`);
      return { call: fmtCall("collection_stats", { group_by: "medium" }), matches: r.total, payload: [r],
        text: `The collection holds ${r.total} works: ${parts.join(", ")}.` };
    },
  },
  {
    id: "value", q: "What is Tidewater Study insured for?",
    run: () => {
      const a: SearchArgs = { text: "tidewater" };
      const r = searchCollection(a);
      const w = r.results[0];
      return { call: fmtCall("search_collection", a), matches: r.total_matches, payload: r.results,
        text: `I found ${w.title} (${w.id}), ${w.material}, ${w.dimensions_cm[0]} cm tall, in the ${w.location.toLowerCase()}. I don't have access to cost, insured value or owner. Those stay in the app, and an admin can see them on the record.` };
    },
  },
];

// ---------- actions ----------

const A = {
  tab(t: Tab) { S.tab = t; S.returning = null; },
  openWork(id: string | null) { S.work = id; },
  ask(id: string) {
    if (S.asked.has(id)) return;
    const q = QUESTIONS.find((x) => x.id === id)!;
    S.asked.add(id);
    S.answers.push({ q: q.q, open: false, ...q.run() });
  },
  togglePayload(i: number) { const a = S.answers[i]; if (a) a.open = !a.open; },
  role(r: Role) { S.role = r; S.returning = null; },
  submit(c: string, desc: string, amount: number) {
    if (S.invoices.some((i) => i.id === NEW_ID)) return;
    S.invoices.unshift({ id: NEW_ID, contract: c, desc, amount, date: "2026-11-08", status: "submitted", history: [{ at: TODAY, who: me().name, what: "Submitted" }] });
    S.toast = `Sent to ${entity(contract(c).entity).name} for review.`;
  },
  approve(id: string) {
    const inv = S.invoices.find((i) => i.id === id);
    if (!inv || inv.status !== "submitted") return;
    inv.status = "approved"; inv.history.push({ at: TODAY, who: me().name, what: "Approved" });
    S.toast = `${id} approved. It now waits for accounting.`;
  },
  ret(id: string, reason: string) {
    const inv = S.invoices.find((i) => i.id === id);
    if (!inv || inv.status !== "submitted" || !reason.trim()) return;
    inv.status = "returned"; inv.note = reason.trim(); inv.history.push({ at: TODAY, who: me().name, what: `Returned: ${reason.trim()}` });
    S.returning = null; S.toast = `${id} returned to the contractor with your reason.`;
  },
  resubmit(id: string) {
    const inv = S.invoices.find((i) => i.id === id);
    if (!inv || inv.status !== "returned") return;
    inv.status = "submitted"; inv.note = undefined; inv.history.push({ at: TODAY, who: me().name, what: "Corrected and resubmitted" });
    S.toast = `${id} resubmitted.`;
  },
  pay(id: string) {
    const inv = S.invoices.find((i) => i.id === id);
    if (!inv || inv.status !== "approved") return;
    inv.status = "paid"; inv.history.push({ at: TODAY, who: me().name, what: `Payment recorded, ref EFT-${S.nextRef++}` });
    S.toast = `Payment recorded for ${id}.`;
  },
};

// ---------- views (styled after the real collection tool) ----------

function header() {
  const tabs: [Tab, string][] = [["collection", "Collection"], ["assistant", "Ask Verso"], ["invoices", "Contracts and invoices"]];
  return `<header class="vx-top">
    <div class="vx-brand">Collection Search<span>Lantern &middot; demo</span></div>
    <span class="vx-pill">invented data</span>
    <div class="vx-grow"></div>
    <nav class="vx-nav" role="tablist" aria-label="Verso sections">${tabs.map(([id, l]) => `<button type="button" role="tab" class="vx-tbtn" aria-selected="${S.tab === id}" data-a="tab" data-v="${id}" data-tour="tab-${id}">${l}</button>`).join("")}</nav>
  </header>`;
}

function filtered() {
  const q = S.query.trim().toLowerCase();
  return WORKS.filter((w) => (S.medium === "all" || w.medium === S.medium) && (!q || `${w.title} ${w.artist} ${w.material} ${w.location}`.toLowerCase().includes(q)));
}

function gridHtml() {
  const list = filtered();
  return `<div class="vx-bar"><span class="vx-count"><b>${list.length}</b> of ${WORKS.length} works</span></div>
    <div class="vx-grid">${list.map((w) => `<button type="button" class="vx-card ${S.work === w.id ? "on" : ""}" data-a="work" data-v="${w.id}" data-tour="work-${w.id}">
      <span class="vx-thumb"><span class="vx-none">No image in demo</span></span>
      <span class="vx-cbody">
        <span class="vx-cart">${esc(w.artist)}</span>
        <span class="vx-ctit">${esc(w.title)}, ${w.year}</span>
        <span class="vx-dims">${w.h} &times; ${w.w} &times; ${w.d} cm</span>
        <span class="vx-cmeta"><span class="vx-tag">${w.medium}</span>${w.outdoor ? `<span class="vx-tag out">outdoor</span>` : ""}${w.status !== "available" ? `<span class="vx-tag ns">${w.status}</span>` : ""}</span>
      </span>
    </button>`).join("") || `<div class="vx-empty"><b>No works match.</b>Clear a filter to see more.</div>`}</div>`;
}

function detail(w: Work) {
  return `<div class="vx-sheet">
    <button type="button" class="vx-sheet-bg" data-a="work" data-v="" aria-label="Close record"></button>
    <section class="vx-sheet-card" data-tour="detail">
      <button type="button" class="vx-sheet-x" data-a="work" data-v="" aria-label="Close">&times;</button>
      <h2>${esc(w.title)}</h2>
      <div class="vx-who">${esc(w.artist)}, ${w.year} &middot; <span class="vx-mono">${w.id}</span></div>
      <dl class="vx-kv">
        <dt>Medium</dt><dd>${cap(w.medium)}</dd>
        <dt>Material</dt><dd>${esc(w.material)}</dd>
        <dt>Dimensions</dt><dd class="vx-mono">${w.h} &times; ${w.w} &times; ${w.d} cm${w.kg ? `, ${w.kg} kg` : ""}</dd>
        <dt>Location</dt><dd>${esc(w.location)}</dd>
        <dt>Status</dt><dd>${cap(w.status)}</dd>
        <dt>Outdoors</dt><dd>${w.outdoor ? "Weather durable" : "Indoor only"}</dd>
      </dl>
      <div class="vx-conf" data-tour="lock">
        <h4>Confidential &middot; never sent to the assistant</h4>
        <dl class="vx-kv">
          <dt>Cost</dt><dd class="vx-mono">${money(w.cost)}</dd>
          <dt>Insured value</dt><dd class="vx-mono">${money(w.insured)}</dd>
          <dt>Owner</dt><dd>${esc(w.owner)}</dd>
        </dl>
      </div>
    </section>
  </div>`;
}

function collectionView() {
  const counts = (m: Medium) => WORKS.filter((w) => w.medium === m).length;
  return `<div class="vx-wrap">
    <aside class="vx-rail">
      <div class="vx-search"><input type="search" placeholder="Search or describe what you need" value="${esc(S.query)}" data-in="query" aria-label="Search the collection" autocomplete="off" /></div>
      <p class="vx-hint">Try <b>bronze</b>, <b>warehouse</b>, or an artist name.</p>
      <div class="vx-fs"><h3>Medium</h3>
        <button type="button" class="vx-opt" aria-pressed="${S.medium === "all"}" data-a="medium" data-v="all"><i></i>All<span class="n">${WORKS.length}</span></button>
        ${MEDIA.map((m) => `<button type="button" class="vx-opt" aria-pressed="${S.medium === m}" data-a="medium" data-v="${m}"><i></i>${cap(m)}<span class="n">${counts(m)}</span></button>`).join("")}
      </div>
    </aside>
    <main class="vx-main" data-tour="collection"><div data-grid>${gridHtml()}</div></main>
    ${S.work ? detail(work(S.work)) : ""}
  </div>`;
}

function assistantView() {
  const left = QUESTIONS.filter((q) => !S.asked.has(q.id));
  return `<div class="vx-assist">
    ${S.answers.length ? "" : `<div class="vx-land"><div class="vx-land-brand">Collection Search &middot; Lantern</div><h1>Hello, I'm Verso.<br>What can I help you find today?</h1>
      <p class="vx-sub">Ask about the collection in plain words. Verso searches the records and shows what fits.</p></div>`}
    <section class="vx-cpanel" data-tour="chat">
      <div class="vx-chead"><b>Verso</b><small>collection assistant</small><span class="vx-grow"></span><small>sample questions</small></div>
      <div class="vx-clog">
        ${S.answers.length ? "" : `<p class="vx-hintx">In the real app a language model chooses the search. Here each question maps to a fixed search, and the search runs live on the invented records.</p>`}
        ${S.answers.map((a, i) => `
          <div class="vx-msg you">${esc(a.q)}</div>
          <div class="vx-msg bot" data-tour="answer-${i}">
            <div>${esc(a.text)}</div>
            ${a.call ? `<div class="vx-trace" data-tour="trace-${i}"><span class="vx-q">${esc(a.call)}</span> &middot; ${a.matches} ${a.call.startsWith("collection_stats") ? "works counted" : `record${a.matches === 1 ? "" : "s"} matched`}</div>` : ""}
            ${a.payload ? `<button type="button" class="vx-link" data-a="payload" data-v="${i}" aria-expanded="${a.open}" data-tour="payload-btn-${i}">${a.open ? "Hide" : "See"} what the model received</button>` : ""}
            ${a.open ? `<div class="vx-payload" data-tour="payload-${i}"><div class="vx-payload-h">Sent to the model. Never included: ${HIDDEN_FIELDS.join(", ")}.</div><pre>${esc(JSON.stringify(a.payload!.slice(0, 2), null, 2))}${a.payload!.length > 2 ? `\n... and ${a.payload!.length - 2} more records with the same fields` : ""}</pre></div>` : ""}
          </div>`).join("")}
      </div>
      <div class="vx-eg">${left.map((q) => `<button type="button" data-a="ask" data-v="${q.id}" data-tour="ask-${q.id}">${esc(q.q)}</button>`).join("") || `<span class="vx-hintx">No more sample questions.</span>`}</div>
    </section>
  </div>`;
}

const STATUS_CLS: Record<InvStatus, string> = { submitted: "warn", returned: "stop", approved: "ok", paid: "" };

function invCard(inv: Invoice, actions: string) {
  const c = contract(inv.contract);
  return `<article class="vx-inv" data-tour="inv-${inv.id}">
    <div class="vx-inv-h">
      <div><b class="vx-mono">${inv.id}</b> <span class="vx-tag ${STATUS_CLS[inv.status]}">${STATUS_LABEL[inv.status]}</span>
        <div class="vx-inv-sub">${esc(person(c.contractor).name)} &middot; ${esc(entity(c.entity).name)} &middot; <span class="vx-mono">${c.id}</span></div></div>
      <div class="vx-amt vx-mono">${money(inv.amount)}</div>
    </div>
    <div>${esc(inv.desc)}</div>
    ${inv.status === "returned" && inv.note ? `<div class="vx-errbox">Returned: ${esc(inv.note)}</div>` : ""}
    <div class="vx-log" data-tour="hist-${inv.id}">${inv.history.map((h) => `<div class="vx-logrow"><span>${h.at}</span><b>${esc(h.who)}</b><span>${esc(h.what)}</span></div>`).join("")}</div>
    ${actions ? `<div class="vx-mact">${actions}</div>` : ""}
  </article>`;
}

function roleBar() {
  const roles: [Role, string, string][] = [
    ["contractor", "Contractor", "Jun Park"],
    ["reviewer", "Reviewer", person(entity(S.reviewerEntity).reviewer).name],
    ["accounting", "Accounting", "Pat Ellery"],
    ["admin", "Admin", "Sol Ferreira"],
  ];
  return `<div class="vx-mtabs" data-tour="roles"><span class="vx-mtabs-k">Signed in as</span>
    ${roles.map(([r, l, n]) => `<button type="button" role="tab" aria-selected="${S.role === r}" data-a="role" data-v="${r}" data-tour="role-${r}">${l} <span>${esc(n)}</span></button>`).join("")}
  </div>`;
}

function contractorView() {
  const mine = CONTRACTS.filter((c) => c.contractor === "jun");
  const invs = S.invoices.filter((i) => contract(i.contract).contractor === "jun");
  const sent = S.invoices.some((i) => i.id === NEW_ID);
  return `<div class="vx-two">
    <section class="vx-panel" data-tour="contracts">
      <h4>My contracts</h4>
      <table class="vx-table"><thead><tr><th>Contract</th><th>Entity</th><th>Ends</th></tr></thead>
      <tbody>${mine.map((c) => `<tr><td><b class="vx-mono">${c.id}</b><div class="vx-inv-sub">${esc(c.title)}</div></td><td>${esc(entity(c.entity).name)}</td><td class="vx-num">${c.ends}</td></tr>`).join("")}</tbody></table>
    </section>
    <section class="vx-panel" data-tour="form">
      <h4>New invoice</h4>
      ${sent ? `<div class="vx-okbox">Invoice ${NEW_ID} is with the reviewer. You'll see its progress below.</div>` : `
      <form class="vx-form" data-form="invoice">
        <label>Contract<select name="contract">${mine.map((c) => `<option value="${c.id}" ${c.id === DRAFT.contract ? "selected" : ""}>${c.id}, ${esc(entity(c.entity).name)}</option>`).join("")}</select></label>
        <label>Description<input name="desc" value="${esc(DRAFT.desc)}" /></label>
        <label>Amount<input name="amount" type="number" min="1" step="1" value="${DRAFT.amount}" /></label>
        <p class="vx-hintx">The contract decides which entity reviews and pays it.</p>
        <div class="vx-mact"><button type="submit" class="vx-pbtn" data-tour="submit">Submit invoice</button></div>
      </form>`}
    </section>
  </div>
  <h3 class="vx-sec">My invoices</h3>
  <div class="vx-invs">${invs.map((i) => invCard(i, i.status === "returned" ? `<button type="button" class="vx-pbtn" data-a="resubmit" data-v="${i.id}">Correct and resubmit</button>` : "")).join("")}</div>`;
}

function reviewerView() {
  const e = entity(S.reviewerEntity);
  const mine = S.invoices.filter((i) => contract(i.contract).entity === e.id);
  const queue = mine.filter((i) => i.status === "submitted");
  const done = mine.filter((i) => i.status !== "submitted");
  return `<div class="vx-ents"><span class="vx-mtabs-k">Entity</span>${ENTITIES.map((x) => `<button type="button" class="vx-chip" aria-pressed="${x.id === e.id}" data-a="entity" data-v="${x.id}">${esc(x.name)}</button>`).join("")}</div>
    <h3 class="vx-sec">Waiting for ${esc(person(e.reviewer).name)}, ${esc(e.name)}</h3>
    <div class="vx-invs" data-tour="queue">${queue.map((i) => invCard(i, S.returning === i.id
      ? `<form class="vx-form row" data-form="return" data-v="${i.id}"><input name="reason" placeholder="Reason, sent to the contractor" required /><button type="submit" class="vx-dbtn">Return</button><button type="button" class="vx-sbtn" data-a="cancel-return">Cancel</button></form>`
      : `<button type="button" class="vx-pbtn" data-a="approve" data-v="${i.id}" data-tour="approve-${i.id}">Approve</button><button type="button" class="vx-dbtn" data-a="return" data-v="${i.id}">Return with reason</button>`)).join("") || `<div class="vx-empty"><b>Nothing waiting.</b>Reviewers only see their own entity's invoices.</div>`}</div>
    ${done.length ? `<h3 class="vx-sec">Decided</h3><div class="vx-invs">${done.map((i) => invCard(i, "")).join("")}</div>` : ""}`;
}

function accountingView() {
  const due = S.invoices.filter((i) => i.status === "approved");
  const paid = S.invoices.filter((i) => i.status === "paid");
  return `<div class="vx-bar"><h3 class="vx-sec">Approved, waiting for payment</h3><span class="vx-grow"></span><button type="button" class="vx-sbtn" data-a="export" data-v="Excel">Export to Excel</button><button type="button" class="vx-sbtn" data-a="export" data-v="PDF">Export PDF</button></div>
    <div class="vx-invs" data-tour="due">${due.map((i) => invCard(i, `<button type="button" class="vx-pbtn" data-a="pay" data-v="${i.id}" data-tour="pay-${i.id}">Record payment</button>`)).join("") || `<div class="vx-empty"><b>Nothing to pay.</b></div>`}</div>
    <h3 class="vx-sec">Paid</h3><div class="vx-invs">${paid.map((i) => invCard(i, "")).join("")}</div>`;
}

function adminView() {
  return `<section class="vx-panel" data-tour="accounts">
    <h4>Accounts</h4><p class="vx-hintx">Email-based sign-in. Admins add people, set roles and switch access off.</p>
    <div class="vx-scroll"><table class="vx-table"><thead><tr><th>Name</th><th>Role</th><th>Entity</th><th>Email</th><th>Access</th></tr></thead>
    <tbody>${S.people.map((p) => `<tr><td>${esc(p.name)}</td><td>${cap(p.role)}</td><td>${p.entity ? esc(entity(p.entity).name) : "All"}</td><td class="vx-num">${p.email}</td>
      <td><button type="button" class="vx-star" aria-pressed="${p.active}" data-a="access" data-v="${p.id}" ${p.id === "sol" ? "disabled" : ""}>${p.active ? "Active" : "Off"}</button></td></tr>`).join("")}</tbody></table></div>
  </section>`;
}

function invoicesView() {
  const body = { contractor: contractorView, reviewer: reviewerView, accounting: accountingView, admin: adminView }[S.role]();
  return `<div class="vx-pages">${roleBar()}<div class="vx-pbody">${body}</div></div>`;
}

function render() {
  const view = { collection: collectionView, assistant: assistantView, invoices: invoicesView }[S.tab]();
  root.innerHTML = `<div class="vx-app">${header()}${S.toast ? `<div class="vx-toast" role="status">${esc(S.toast)}</div>` : ""}${view}</div>`;
  S.toast = "";
}

let scrollDetail = false;
root.addEventListener("click", (e) => {
  const b = (e.target as HTMLElement).closest<HTMLElement>("[data-a]");
  if (!b || (b as HTMLButtonElement).disabled) return;
  const v = b.dataset.v ?? "";
  switch (b.dataset.a) {
    case "tab": A.tab(v as Tab); break;
    case "medium": S.medium = v as Medium | "all"; break;
    case "work": A.openWork(v || null); scrollDetail = !!v; break;
    case "ask": A.ask(v); break;
    case "payload": A.togglePayload(Number(v)); break;
    case "role": A.role(v as Role); break;
    case "entity": S.reviewerEntity = v; break;
    case "approve": A.approve(v); break;
    case "return": S.returning = v; break;
    case "cancel-return": S.returning = null; break;
    case "resubmit": A.resubmit(v); break;
    case "pay": A.pay(v); break;
    case "export": S.toast = `In the real app this downloads the ${v} file. The demo stores nothing.`; break;
    case "access": { const p = person(v); p.active = !p.active; break; }
  }
  render();
  if (scrollDetail) {
    scrollDetail = false;
    const d = root.querySelector<HTMLElement>('[data-tour="detail"]');
    if (d && d.getBoundingClientRect().top < 0) d.scrollIntoView({ block: "start" });
  }
});

root.addEventListener("submit", (e) => {
  e.preventDefault();
  const f = e.target as HTMLFormElement;
  const d = new FormData(f);
  if (f.dataset.form === "invoice") A.submit(String(d.get("contract")), String(d.get("desc") || DRAFT.desc), Number(d.get("amount")) || DRAFT.amount);
  if (f.dataset.form === "return") A.ret(f.dataset.v!, String(d.get("reason") || ""));
  render();
});

root.addEventListener("input", (e) => {
  const t = e.target as HTMLInputElement;
  if (t.dataset.in !== "query") return;
  S.query = t.value;
  root.querySelector("[data-grid]")!.innerHTML = gridHtml();
});

render();

// ---------- guided tour ----------

const view = (fn: () => void) => () => { fn(); render(); };
const steps: TourStep[] = [
  {
    title: "An invented organization",
    body: `The real client's records are confidential, so this runs on made-up data: 3 legal entities, ${WORKS.length} artworks, 3 contractors and their contracts, and the staff who review and pay. Nothing leaves your browser.`,
    before: view(() => A.tab("collection")),
  },
  {
    target: '[data-tour="collection"]',
    title: "The collection",
    body: "Every work in one searchable place. Type in the search box or filter by medium.",
    before: view(() => A.tab("collection")),
  },
  {
    target: '[data-tour="work-LC-001"]',
    title: "Open a record",
    body: "Click a work to see its full record.",
    before: view(() => { A.tab("collection"); A.openWork(null); }),
    act: view(() => A.openWork("LC-001")),
    advanceOnClick: true,
  },
  {
    target: '[data-tour="lock"]',
    title: "Some fields never leave the app",
    body: "Cost, insured value and owner live on the record for staff. They are never sent to the AI assistant.",
    before: view(() => { A.tab("collection"); A.openWork("LC-001"); }),
  },
  {
    target: '[data-tour="tab-assistant"]',
    title: "Ask the collection assistant",
    body: "Staff ask questions in plain language instead of building filters.",
    before: view(() => A.tab("collection")),
    act: view(() => A.tab("assistant")),
    advanceOnClick: true,
  },
  {
    target: '[data-tour="ask-tall"]',
    title: "Ask a question",
    body: "The model never sees the catalog. It asks the app for a search, and only the matching records come back.",
    before: view(() => A.tab("assistant")),
    act: view(() => A.ask("tall")),
    advanceOnClick: true,
  },
  {
    target: '[data-tour="trace-0"]',
    title: "It shows its work",
    body: "Under each answer: the exact search it ran and how many records matched. Every figure in the answer comes from those records.",
    before: view(() => A.tab("assistant")),
  },
  {
    target: '[data-tour="payload-btn-0"]',
    title: "See what the model received",
    body: "Open it to check exactly what was sent.",
    before: view(() => A.tab("assistant")),
    act: view(() => { if (!S.answers[0]?.open) A.togglePayload(0); }),
    advanceOnClick: true,
  },
  {
    target: '[data-tour="payload-0"]',
    title: "No cost, value or owner",
    body: "Titles, sizes, materials and locations, yes. The sensitive fields are stripped before anything reaches the model.",
    before: view(() => A.tab("assistant")),
  },
  {
    target: '[data-tour="ask-value"]',
    title: "Ask for a valuation",
    body: "What happens when someone asks for a figure the assistant was never given?",
    before: view(() => A.tab("assistant")),
    act: view(() => A.ask("value")),
    advanceOnClick: true,
  },
  {
    target: '[data-tour="answer-1"]',
    title: "It says so, instead of guessing",
    body: "It finds the work, then says it doesn't have access to cost, insured value or owner.",
    before: view(() => A.tab("assistant")),
  },
  {
    target: '[data-tour="tab-invoices"]',
    title: "Contracts and invoices",
    body: "The other half of Verso: contractor paperwork across the 3 entities.",
    before: view(() => A.tab("assistant")),
    act: view(() => { A.tab("invoices"); A.role("contractor"); }),
    advanceOnClick: true,
  },
  {
    target: '[data-tour="contracts"]',
    title: "One contractor, two entities",
    body: "Jun Park holds contracts with two different entities. The contract on an invoice decides who reviews it and which entity pays.",
    before: view(() => { A.tab("invoices"); A.role("contractor"); }),
  },
  {
    target: '[data-tour="submit"]',
    title: "Submit an invoice",
    body: "Filled in for you. It goes against the Lantern Studios Inc. contract.",
    before: view(() => { A.tab("invoices"); A.role("contractor"); }),
    act: view(() => A.submit(DRAFT.contract, DRAFT.desc, DRAFT.amount)),
    advanceOnClick: true,
  },
  {
    target: '[data-tour="role-reviewer"]',
    title: "Switch to the reviewer",
    body: "Now see it as the reviewer for Lantern Studios Inc.",
    before: view(() => { A.tab("invoices"); A.role("contractor"); }),
    act: view(() => { S.reviewerEntity = "inc"; A.role("reviewer"); }),
    advanceOnClick: true,
  },
  {
    target: `[data-tour="approve-${NEW_ID}"]`,
    title: "Approve or return",
    body: "Reviewers only see their own entity's invoices. They approve, or return it with a reason the contractor sees. Approve this one.",
    before: view(() => { A.tab("invoices"); S.reviewerEntity = "inc"; A.role("reviewer"); }),
    act: view(() => A.approve(NEW_ID)),
    advanceOnClick: true,
  },
  {
    target: '[data-tour="role-accounting"]',
    title: "Over to accounting",
    body: "Approved invoices from every entity land with accounting.",
    before: view(() => { A.tab("invoices"); A.role("reviewer"); }),
    act: view(() => A.role("accounting")),
    advanceOnClick: true,
  },
  {
    target: `[data-tour="pay-${NEW_ID}"]`,
    title: "Record the payment",
    body: "Accounting records the payment against the invoice.",
    before: view(() => { A.tab("invoices"); A.role("accounting"); }),
    act: view(() => A.pay(NEW_ID)),
    advanceOnClick: true,
  },
  {
    target: `[data-tour="hist-${NEW_ID}"]`,
    title: "A full trail",
    body: "Who submitted, approved and paid, and when, on every invoice. Records export to Excel and PDF.",
    before: view(() => { A.tab("invoices"); A.role("accounting"); }),
  },
  {
    target: '[data-tour="role-admin"]',
    title: "Done",
    body: "The fourth role, admin, manages accounts and access. Explore any role, try returning an invoice, or ask the assistant the other questions.",
    before: view(() => { A.tab("invoices"); A.role("accounting"); }),
  },
];

mountTour(document.getElementById("demo-verso")!, {
  steps,
  reset: () => { S = fresh(); render(); },
  intro: `About 3 minutes, ${steps.length} steps.`,
});
