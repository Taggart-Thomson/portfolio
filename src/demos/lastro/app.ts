// Lastro demo: a dockable panel workspace on sample data. Rebuilt from scratch for the portfolio.
import { DEFAULT_BUDGET, HISTORY, MARKET, MEMORY, MONTH, MONTH_COST, NEWS, POSITIONS, REJECTED, RUNS, SUGGESTIONS } from "./data";
import type { Memory, Turn } from "./data";
import { mountTour } from "../../components/tour/tour";
import type { TourStep } from "../../components/tour/tour";

type PanelId = "positions" | "allocation" | "market" | "suggestions" | "news" | "advisor" | "memory" | "report" | "cost";
type Ws = "overview" | "advisor";
interface Slot { id: PanelId; wide: boolean }

const BUDGET_SAID = "Only invest R$ 1.000 this month, back to normal next month.";

const fresh = () => ({
  ws: "overview" as Ws,
  layouts: {
    overview: [{ id: "positions", wide: true }, { id: "market", wide: false }, { id: "suggestions", wide: true }, { id: "allocation", wide: false }, { id: "news", wide: false }],
    advisor: [{ id: "advisor", wide: true }, { id: "memory", wide: false }, { id: "report", wide: false }],
  } as Record<Ws, Slot[]>,
  menu: false,
  chat: HISTORY.slice() as Turn[],
  memory: MEMORY.slice() as Memory[],
  override: null as null | { amount: number; said: string },
  asked: new Set<string>(),
});
let S = fresh();

const root = document.querySelector<HTMLElement>("#demo-lastro [data-demo-app]")!;
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
const brl = (n: number, d = 2) => "R$ " + n.toLocaleString("pt-BR", { minimumFractionDigits: d, maximumFractionDigits: d });
const pct = (n: number) => `${n > 0 ? "+" : ""}${n.toFixed(1).replace(".", ",")}%`;

const valued = POSITIONS.filter((p) => p.price !== null);
const total = valued.reduce((t, p) => t + p.qty * p.price!, 0);
const byClass = () => {
  const m: Record<string, number> = {};
  for (const p of valued) m[p.cls] = (m[p.cls] ?? 0) + p.qty * p.price!;
  return Object.entries(m).sort((a, b) => b[1] - a[1]);
};
const cryptoShare = () => ((byClass().find(([c]) => c === "Crypto")?.[1] ?? 0) / total) * 100;

// ---------- panels ----------

const PANELS: Record<PanelId, { title: string; render: () => string }> = {
  positions: {
    title: "Positions",
    render: () => `<table class="lt-t"><thead><tr><th>Ticker</th><th>Qty</th><th>Avg cost</th><th>Price</th><th>Value</th><th>P/L</th></tr></thead><tbody>
      ${POSITIONS.map((p) => {
        if (p.price === null) return `<tr><td><b>${esc(p.ticker)}</b><div class="lt-sub">${esc(p.name)}</div></td><td class="m">${p.qty}</td><td class="m">${brl(p.avg)}</td><td colspan="3" class="lt-sub">${esc(p.note ?? "")}</td></tr>`;
        const v = p.qty * p.price, pl = ((p.price - p.avg) / p.avg) * 100;
        return `<tr><td><b>${esc(p.ticker)}</b><div class="lt-sub">${esc(p.name)}</div></td><td class="m">${p.qty}</td><td class="m">${brl(p.avg)}</td><td class="m">${brl(p.price)}</td><td class="m">${brl(v)}</td><td class="m ${pl >= 0 ? "gain" : "loss"}">${pct(pl)}</td></tr>`;
      }).join("")}</tbody></table>
      <div class="lt-sub lt-foot">Total valued: <span class="m">${brl(total)}</span>. Updated by hand after each trade: Lastro never connects to a broker.</div>`,
  },
  allocation: {
    title: "Allocation",
    render: () => `<ul class="lt-list">${byClass().map(([c, v]) => `<li><span>${c}</span><span class="m">${((v / total) * 100).toFixed(1).replace(".", ",")}%</span></li>`).join("")}</ul>
      <div class="lt-sub lt-foot">Of the valued positions. Standing rule: crypto under 5%.</div>`,
  },
  market: {
    title: "Market",
    render: () => `<ul class="lt-list">${MARKET.map((m) => `<li><span>${m.name}</span><span class="m">${m.value} <span class="${m.move >= 0 ? "gain" : "loss"}">${pct(m.move)}</span></span></li>`).join("")}</ul>
      <div class="lt-sub lt-foot">Sample values. The real app fetches hourly during B3 trading hours.</div>`,
  },
  suggestions: {
    title: "Suggestions",
    render: () => `<div class="lt-sugs">${SUGGESTIONS.map((s) => `<article class="lt-sug">
        <div class="lt-sug-h"><span class="lt-act a-${s.action.toLowerCase()}">${s.action}</span><b class="m">${esc(s.ticker)}</b></div>
        <p>${esc(s.why)}</p>
        <div class="lt-sub">Sources: ${s.sources.map(esc).join(", ")}</div>
      </article>`).join("")}</div>
      <div class="lt-rej" data-tour="rejected">${REJECTED.map((r) => `<b class="m">${r.ticker}</b> rejected by the validator: ${esc(r.reason)}`).join("")}</div>`,
  },
  news: {
    title: "News",
    render: () => `<ul class="lt-news">${NEWS.map((n) => `<li>${esc(n)}</li>`).join("")}</ul>`,
  },
  advisor: {
    title: "Advisor",
    render: () => {
      const prompts: [string, string][] = [
        ["budget", BUDGET_SAID],
        ["why", "Why did you suggest DEMU11?"],
        ["note", "Note for later: I like dividend payers."],
      ];
      const left = prompts.filter(([k]) => !S.asked.has(k));
      return `<div class="lt-chat">${S.chat.map((t) => `<div class="lt-msg ${t.who}">${esc(t.text.replace("{CRYPTO}", `${cryptoShare().toFixed(1).replace(".", ",")}%`))}</div>`).join("")}</div>
        <div class="lt-prompts">${left.map(([k, q]) => `<button type="button" class="lt-chip" data-a="ask" data-v="${k}" data-tour="ask-${k}">${esc(q)}</button>`).join("") || `<span class="lt-sub">No more sample messages.</span>`}</div>
        <div class="lt-sub lt-foot">Sample conversation with canned replies. No model is called from this page.</div>`;
    },
  },
  memory: {
    title: "Memory",
    render: () => `<ul class="lt-mem">${S.memory.map((m) => `<li class="k-${m.kind}"><span class="lt-kind">${m.kind}</span><div>${esc(m.text)}${m.said ? `<div class="lt-said">You said: "${esc(m.said)}"</div>` : ""}</div><span class="lt-sub">${m.when}</span></li>`).join("")}</ul>
      <div class="lt-sub lt-foot">Budgets and instructions are structured. Notes are background only, never rules.</div>`,
  },
  report: {
    title: "Monthly report",
    render: () => {
      const budget = S.override?.amount ?? DEFAULT_BUDGET;
      const buys = SUGGESTIONS.filter((s) => s.action === "Buy");
      return `<div class="lt-report">
        <div class="lt-sub">${MONTH} budget</div>
        <div class="lt-big m">${brl(budget, 0)}</div>
        <div class="lt-sub">${S.override ? `From a budget override, ${MONTH} only. Normally ${brl(DEFAULT_BUDGET, 0)}.` : "Standing monthly budget."}</div>
        <ul class="lt-list">${buys.map((b) => `<li><span class="m">${esc(b.ticker)}</span><span class="m">${brl(budget / buys.length, 0)}</span></li>`).join("")}</ul>
        <div class="lt-sub lt-foot">The split reads only the structured budget, never the chat text.</div>
      </div>`;
    },
  },
  cost: {
    title: "Cost",
    render: () => `<table class="lt-t"><thead><tr><th>Run</th><th>Input</th><th>Cached</th><th>Output</th><th>Cost</th></tr></thead><tbody>
      ${RUNS.map((r) => `<tr class="${r.ok ? "" : "fail"}"><td>${r.at}${r.ok ? "" : `<div class="lt-sub loss">Failed: ${esc(r.note ?? "")}</div>`}</td><td class="m">${r.input.toLocaleString("en-US")}</td><td class="m">${r.cached.toLocaleString("en-US")}</td><td class="m">${r.output.toLocaleString("en-US")}</td><td class="m">US$ ${r.cost.toFixed(3)}</td></tr>`).join("")}
      </tbody></table>
      <div class="lt-sub lt-foot">Sample token counts. The long system prompt is cached, so most input tokens are read from cache. Every run is logged, failed ones too. Month to date: <span class="m">US$ ${MONTH_COST.toFixed(2)}</span>.</div>`,
  },
};
const ALL = Object.keys(PANELS) as PanelId[];

// ---------- actions ----------

const A = {
  ws(w: Ws) { S.ws = w; S.menu = false; },
  toggleMenu() { S.menu = !S.menu; },
  add(id: PanelId) {
    const l = S.layouts[S.ws];
    if (!l.some((s) => s.id === id)) l.push({ id, wide: id === "cost" || id === "positions" });
    S.menu = false;
  },
  remove(id: PanelId) { S.layouts[S.ws] = S.layouts[S.ws].filter((s) => s.id !== id); },
  move(id: PanelId, dir: number) {
    const l = S.layouts[S.ws], i = l.findIndex((s) => s.id === id), j = i + dir;
    if (i < 0 || j < 0 || j >= l.length) return;
    [l[i], l[j]] = [l[j], l[i]];
  },
  wide(id: PanelId) { const s = S.layouts[S.ws].find((x) => x.id === id); if (s) s.wide = !s.wide; },
  ask(k: string) {
    if (S.asked.has(k)) return;
    S.asked.add(k);
    if (k === "budget") {
      S.chat.push({ who: "you", text: BUDGET_SAID });
      S.chat.push({ who: "advisor", text: `Understood. ${MONTH} budget set to R$ 1.000 instead of ${brl(DEFAULT_BUDGET, 0)}. December goes back to normal. I saved it as a budget override for this month only and kept your sentence beside it.` });
      S.override = { amount: 1000, said: BUDGET_SAID };
      S.memory.unshift({ kind: "budget", text: `R$ 1.000 for ${MONTH} only`, said: BUDGET_SAID, when: "Nov 8" });
    } else if (k === "why") {
      S.chat.push({ who: "you", text: "Why did you suggest DEMU11?" });
      S.chat.push({ who: "advisor", text: "Brazil is about 70% of the valued portfolio. DEMU11 adds US market exposure in reais and is listed on B3, so you can buy it in your broker app. The reasoning and sources sit on the suggestion card." });
    } else if (k === "note") {
      S.chat.push({ who: "you", text: "Note for later: I like dividend payers." });
      S.chat.push({ who: "advisor", text: "Saved as a note. It will reach the analysis as background only, not as a rule." });
      S.memory.push({ kind: "note", text: "Likes dividend payers.", when: "Nov 8" });
    }
  },
};

// ---------- render ----------

function panel(s: Slot, i: number, n: number) {
  const p = PANELS[s.id];
  return `<section class="lt-panel ${s.wide ? "wide" : ""}" data-tour="panel-${s.id}">
    <header class="lt-ph">
      <h4>${p.title}</h4>
      <div class="lt-pc" data-tour="controls-${s.id}">
        <button type="button" data-a="move" data-v="${s.id}" data-d="-1" aria-label="Move ${p.title} earlier" ${i === 0 ? "disabled" : ""}>&#8592;</button>
        <button type="button" data-a="move" data-v="${s.id}" data-d="1" aria-label="Move ${p.title} later" ${i === n - 1 ? "disabled" : ""}>&#8594;</button>
        <button type="button" data-a="wide" data-v="${s.id}" aria-label="${s.wide ? "Make narrow" : "Make wide"}">${s.wide ? "&#8676;" : "&#8677;"}</button>
        <button type="button" data-a="remove" data-v="${s.id}" aria-label="Close ${p.title}">&#215;</button>
      </div>
    </header>
    <div class="lt-pb">${p.render()}</div>
  </section>`;
}

function render() {
  const l = S.layouts[S.ws];
  const missing = ALL.filter((id) => !l.some((s) => s.id === id));
  root.innerHTML = `<div class="lt-app">
    <div class="lt-banner" role="note">Demo with sample data. Not financial advice.</div>
    <header class="lt-top">
      <img src="/demos/lastro/lastro-lockup.svg" alt="Lastro" class="lt-logo" width="150" height="48" />
      <nav class="lt-tabs" aria-label="Workspaces">${(["overview", "advisor"] as Ws[]).map((w) => `<button type="button" aria-pressed="${S.ws === w}" data-a="ws" data-v="${w}" data-tour="ws-${w}">${w === "overview" ? "Overview" : "Advisor"}</button>`).join("")}</nav>
      <div class="lt-menuwrap">
        <button type="button" class="lt-btn" data-a="menu" aria-expanded="${S.menu}" data-tour="panels-btn">Panels</button>
        ${S.menu ? `<div class="lt-menu" role="menu">${missing.length ? missing.map((id) => `<button type="button" role="menuitem" data-a="add" data-v="${id}" data-tour="add-${id}">Add ${PANELS[id].title}</button>`).join("") : `<span class="lt-sub">All panels are open.</span>`}</div>` : ""}
      </div>
    </header>
    <div class="lt-grid">${l.map((s, i) => panel(s, i, l.length)).join("") || `<p class="lt-sub">No panels open. Use Panels to add one.</p>`}</div>
  </div>`;
}

root.addEventListener("click", (e) => {
  const b = (e.target as HTMLElement).closest<HTMLElement>("[data-a]");
  if (!b || (b as HTMLButtonElement).disabled) return;
  const v = b.dataset.v as PanelId;
  switch (b.dataset.a) {
    case "ws": A.ws(b.dataset.v as Ws); break;
    case "menu": A.toggleMenu(); break;
    case "add": A.add(v); break;
    case "remove": A.remove(v); break;
    case "move": A.move(v, Number(b.dataset.d)); break;
    case "wide": A.wide(v); break;
    case "ask": A.ask(b.dataset.v!); break;
  }
  render();
});
render();

// ---------- guided tour ----------

const v = (fn: () => void) => () => { fn(); render(); };
const steps: TourStep[] = [
  {
    title: "Lastro, on sample data",
    body: "My personal investing dashboard for Brazilian markets. Everything here is invented: the holdings, prices, headlines, suggestions and costs. Not financial advice.",
    before: v(() => A.ws("overview")),
  },
  {
    target: '[data-tour="panel-positions"]',
    title: "The portfolio",
    body: "Positions with cost, value and gain or loss. The bond isn't valued because the bond price fetcher isn't built yet, and the app says so instead of guessing.",
    before: v(() => A.ws("overview")),
  },
  {
    target: '[data-tour="panel-suggestions"]',
    title: "Suggestions with a ticker",
    body: "Each suggestion names a specific ticker, with the reasoning and sources beside it. It suggests, I decide and trade in my own broker app.",
    before: v(() => A.ws("overview")),
  },
  {
    target: '[data-tour="rejected"]',
    title: "Only things I can actually buy",
    body: "Every suggestion must be a B3 ticker or a Tesouro Direto bond. A validator rejects anything else by name, and keeps the rest of the analysis.",
    before: v(() => A.ws("overview")),
  },
  {
    target: '[data-tour="controls-market"]',
    title: "A workspace you arrange",
    body: "Move panels, make them wide or narrow, close them, or add others from the Panels menu. Try it after the tour.",
    before: v(() => A.ws("overview")),
  },
  {
    target: '[data-tour="ws-advisor"]',
    title: "Talk to the advisor",
    body: "A second workspace holds the advisor chat, its memory and the monthly report.",
    before: v(() => A.ws("overview")),
    act: v(() => A.ws("advisor")),
    advanceOnClick: true,
  },
  {
    target: '[data-tour="ask-budget"]',
    title: "Change this month's budget",
    body: "Tell it something in plain words, the way I would.",
    before: v(() => A.ws("advisor")),
    act: v(() => A.ask("budget")),
    advanceOnClick: true,
  },
  {
    target: '[data-tour="panel-memory"]',
    title: "Turned into structure",
    body: "The sentence becomes a budget override with an amount and a month attached, and the original words stay beside it so I can check what was understood.",
    before: v(() => A.ws("advisor")),
  },
  {
    target: '[data-tour="panel-report"]',
    title: "The math reads the structure, not the chat",
    body: "The monthly report now splits R$ 1.000 instead of the usual budget. It never parses free text to get there.",
    before: v(() => A.ws("advisor")),
  },
  {
    target: '[data-tour="panels-btn"]',
    title: "What does it cost to run?",
    body: "Open the Panels menu.",
    before: v(() => { A.ws("advisor"); S.menu = false; }),
    act: v(() => { S.menu = true; }),
    advanceOnClick: true,
  },
  {
    target: '[data-tour="add-cost"]',
    title: "Add the cost panel",
    body: "Dock it into this workspace.",
    before: v(() => { A.ws("advisor"); S.menu = true; }),
    act: v(() => A.add("cost")),
    advanceOnClick: true,
  },
  {
    target: '[data-tour="panel-cost"]',
    title: "Tokens and cost, every run",
    body: "The long system prompt is cached, so most input is read from cache. Every hourly run is logged with its tokens and cost, including the one that failed.",
    before: v(() => { A.ws("advisor"); if (!S.layouts.advisor.some((s) => s.id === "cost")) A.add("cost"); }),
  },
  {
    title: "Done",
    body: "Ask the advisor the other questions, rearrange the panels, or switch workspaces. Version 1 works end to end, but I haven't used it much yet, so it has no track record.",
    before: v(() => A.ws("advisor")),
  },
];

mountTour(document.getElementById("demo-lastro")!, {
  steps,
  reset: () => { S = fresh(); render(); },
  intro: `About 2 minutes, ${steps.length} steps.`,
});
