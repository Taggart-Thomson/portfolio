// Term Scheduler demo UI. Plain DOM, re-rendered from state on every change.
import { CAP, LARGE_EXTRA, LATE_CHANGE, PATHS, PATH_IDS, REGIONS, STUDENTS, SUPERVISORS } from "./data";
import type { PathId, Student } from "./data";
import * as E from "./engine";
import type { Group, MoveOption } from "./engine";
import { mountTour } from "../../components/tour/tour";
import type { TourStep } from "../../components/tour/tour";

type Tab = "roster" | "build" | "groups" | "assistant";
interface Proposal { studentId: string; from: string; to: string; status: "pending" | "approved" | "dismissed" }
interface Msg { who: "you" | "bot" | "tool"; html: string }

interface State {
  tab: Tab;
  students: Student[];
  rosterPath: PathId | "all";
  rankPath: PathId;
  groups: Group[] | null;
  reports: ReturnType<typeof E.buildDraft>["reports"] | null;
  lateApplied: boolean;
  chat: Msg[];
  asked: { summary: boolean; juno: boolean };
  proposal: Proposal | null;
  moving: string | null; // student id with the move panel open
  log: string[];
}

const fresh = (): State => ({
  tab: "roster",
  students: STUDENTS.map((s) => ({ ...s })),
  rosterPath: "all",
  rankPath: "characters",
  groups: null,
  reports: null,
  lateApplied: false,
  chat: [],
  asked: { summary: false, juno: false },
  proposal: null,
  moving: null,
  log: [],
});

let S = fresh();
const root = document.querySelector<HTMLElement>("#demo-term-scheduler [data-demo-app]")!;

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
const stu = (id: string) => S.students.find((s) => s.id === id)!;
const sup = (id: string) => E.supById(SUPERVISORS, id);
const chip = (f: E.Fit) => `<span class="ps-fit ps-fit-${f}">${E.FIT_LABEL[f]}</span>`;
const cr = (n: number) => `${n} credits`;
const signed = (n: number) => (n > 0 ? `+${n}` : n < 0 ? `${n}` : "no change");
const juno = () => stu(LATE_CHANGE.studentId);

// ---------- actions (shared by clicks and the tour) ----------

const A = {
  tab(t: Tab) { S.tab = t; S.moving = null; },
  build() {
    const d = E.buildDraft(S.students, SUPERVISORS);
    S.groups = d.groups; S.reports = d.reports;
    S.log.push(`Draft built: ${d.groups.length} groups, all ${STUDENTS.length} students placed.`);
  },
  late() {
    if (S.lateApplied) return;
    S.students = S.students.map((s) => (s.id === LATE_CHANGE.studentId ? { ...s, region: LATE_CHANGE.to } : s));
    S.lateApplied = true;
    S.log.push(`Roster change: ${juno().name} moved from ${REGIONS[LATE_CHANGE.from].name} to ${REGIONS[LATE_CHANGE.to].name}.`);
  },
  askSummary() {
    if (!S.groups || S.asked.summary) return;
    S.asked.summary = true;
    const t = E.termTotals(S.groups, S.students, SUPERVISORS);
    S.chat.push({ who: "you", html: "Summarize the term." });
    S.chat.push({ who: "tool", html: `term_overview() &rarr; ${t.groups} groups, ${t.placed} placed, ${t.cost} credits` });
    const ok = t.counts.ok ? ` ${t.counts.ok} start early but workable (OK).` : "";
    const bad = t.counts.bad ? ` ${t.counts.bad} start at a bad local time and need a look.` : "";
    S.chat.push({ who: "bot", html: `The draft has ${t.groups} groups holding all ${t.placed} students, for ${cr(t.cost)} this term. ${t.counts.ideal} students start at an ideal local time.${ok}${bad}` });
  },
  askJuno() {
    if (!S.groups || !S.lateApplied || S.asked.juno) return;
    S.asked.juno = true;
    const j = juno();
    const from = E.groupOf(S.groups, j.id)!;
    const opts = E.moveOptions(S.groups, j, SUPERVISORS);
    const best = opts[0];
    const neu = E.newGroupOption(S.groups, j, S.students, SUPERVISORS);
    const nowLocal = E.toLocal(from.slot, j.region);
    S.chat.push({ who: "you", html: `${esc(j.name)} moved time zones. Where should they go?` });
    S.chat.push({ who: "tool", html: `group_lookup(student="${esc(j.name)}") &rarr; ${esc(sup(from.supId).name)}, ${E.fmtSlot(from.slot)} PT, ${E.fmtSlot(nowLocal)} local, Not OK` });
    S.chat.push({ who: "tool", html: `move_costs(student="${esc(j.name)}") &rarr; ${opts.length} option${opts.length === 1 ? "" : "s"}${neu ? ", plus 1 new group" : ""}` });
    const g = best.group, gs = sup(g.supId);
    const ch = best.changes[0];
    let text = `${esc(j.name)} is now in ${REGIONS[j.region].name}, so their group (${E.fmtSlot(from.slot)} PT) starts at ${E.fmtSlot(nowLocal)} their time, which is Not OK. `;
    text += `The other ${PATHS[j.path].name} group, with ${esc(gs.name)} on ${E.DAY_FULL[g.slot.day]} at ${E.fmtHour(g.slot.hour)} PT, starts at ${E.fmtSlot(best.local)} their time: ${E.FIT_LABEL[best.fit]}. `;
    if (ch) text += `Moving them takes that group from ${g.studentIds.length} to ${g.studentIds.length + 1} students, into the large band. That adds ${best.costDelta} credits and changes ${esc(ch.name)}'s contract (${ch.before} to ${ch.after} credits). `;
    if (neu) text += `Opening a new group instead would cost ${cr(neu.sup.price)}. `;
    text += `I recommend the move. It changes a contract, so it needs your approval.`;
    S.chat.push({ who: "bot", html: text });
    S.proposal = { studentId: j.id, from: from.id, to: g.id, status: "pending" };
  },
  approve() {
    const p = S.proposal;
    if (!p || p.status !== "pending" || !S.groups) return;
    S.groups = E.moveStudent(S.groups, p.studentId, p.to);
    p.status = "approved";
    S.log.push(`Approved by you: moved ${stu(p.studentId).name} to ${sup(S.groups.find((g) => g.id === p.to)!.supId).name}'s group.`);
  },
  dismiss() { if (S.proposal?.status === "pending") S.proposal.status = "dismissed"; },
  move(studentId: string, groupId: string) {
    if (!S.groups) return;
    S.groups = E.moveStudent(S.groups, studentId, groupId);
    S.log.push(`Moved by you: ${stu(studentId).name} to ${sup(S.groups.find((g) => g.id === groupId)!.supId).name}'s group.`);
    S.moving = null;
  },
};

// ---------- views (styled after the real app's admin-portal look) ----------

const PATH_TABS = (key: "rpath" | "kpath", current: string, withAll: boolean) => {
  const ids: string[] = withAll ? ["all", ...PATH_IDS] : [...PATH_IDS];
  return `<div class="ps-tabbar">${ids.map((p) => {
    const n = p === "all" ? S.students.length : S.students.filter((s) => s.path === p).length;
    return `<button type="button" class="ps-tab ${current === p ? "sel" : ""} ${p === "all" ? "all" : ""}" aria-pressed="${current === p}" data-a="${key}" data-v="${p}">${p === "all" ? "All" : PATHS[p as PathId].name}<span class="ps-tab-n">${n}</span></button>`;
  }).join("")}</div>`;
};

function header() {
  const t = S.groups ? E.termTotals(S.groups, S.students, SUPERVISORS) : null;
  const tabs: [Tab, string][] = [["build", "Build"], ["groups", "Groups"], ["roster", "Roster"], ["assistant", "Assistant"]];
  return `
    <header class="ps-top">
      <div class="ps-brand"><span>Term Scheduler</span><span class="ps-brand-sub">Online &middot; demo</span></div>
      <nav class="ps-nav" role="tablist" aria-label="Scheduler views">
        ${tabs.map(([id, label]) => `<button type="button" role="tab" class="ps-nav-link ${S.tab === id ? "active" : ""}" aria-selected="${S.tab === id}" data-a="tab" data-v="${id}" data-tour="tab-${id}">${label}${id === "assistant" && S.lateApplied && !S.asked.juno ? `<i class="ps-dot" aria-label="new"></i>` : ""}</button>`).join("")}
      </nav>
      <div class="ps-spacer"></div>
      <select class="ps-input ps-term" aria-label="Term"><option>Demo term (invented)</option></select>
    </header>
    <div class="ps-stats" data-tour="stats">
      <div class="ps-stat"><div class="n">${STUDENTS.length}</div><div class="l">students</div></div>
      <div class="ps-stat"><div class="n">${SUPERVISORS.length}</div><div class="l">supervisors</div></div>
      <div class="ps-stat"><div class="n">${t ? t.groups : "&ndash;"}</div><div class="l">groups</div></div>
      <div class="ps-stat"><div class="n">${t ? t.cost : "&ndash;"}</div><div class="l">credits this term</div></div>
      <div class="ps-stat"><div class="n">${t ? `${t.counts.ideal}<small> / ${t.counts.ok} / ${t.counts.bad}</small>` : "&ndash;"}</div><div class="l">${t ? "ideal / OK / not OK" : "no draft yet"}</div></div>
    </div>`;
}

function rosterView() {
  const list = S.students.filter((s) => S.rosterPath === "all" || s.path === S.rosterPath);
  return `
    <div class="ps-page-head"><h1>Roster</h1><span class="ps-muted ps-tiny">Session times are stored in Pacific time (PT) and converted to each student's local time.</span></div>
    <div class="ps-grid2">
      <section class="ps-card" data-tour="students">
        <div class="ps-card-h"><h2>Students</h2></div>
        ${PATH_TABS("rpath", S.rosterPath, true)}
        <div class="ps-scroll"><table class="ps-table">
          <thead><tr><th>Student</th><th>Path</th><th>Region</th><th class="num">Ahead of PT</th></tr></thead>
          <tbody>${list.map((s) => `<tr><td class="ps-strong">${esc(s.name)}</td><td>${PATHS[s.path].name}</td><td>${REGIONS[s.region].name}</td><td class="num">+${REGIONS[s.region].offset}h</td></tr>`).join("")}</tbody>
        </table></div>
      </section>
      <section class="ps-card" data-tour="supervisors">
        <div class="ps-card-h"><h2>Supervisors</h2></div>
        <div class="ps-scroll"><table class="ps-table">
          <thead><tr><th>Supervisor</th><th>Teaches</th><th>Available (PT)</th><th class="num">Price</th><th class="num">Max</th></tr></thead>
          <tbody>${SUPERVISORS.map((v) => `<tr>
            <td class="ps-strong">${esc(v.name)}</td>
            <td>${v.paths.map((p) => PATHS[p].name).join(", ")}</td>
            <td>${v.slots.map((sl) => `<span class="ps-pill ps-slot ${E.DAY_WEIGHT[sl.day] === null ? "ps-wk" : ""}">${E.fmtSlot(sl)}</span>`).join(" ")}</td>
            <td class="num">${v.price}</td>
            <td class="num">${v.maxGroups}</td></tr>`).join("")}</tbody>
        </table></div>
        <p class="ps-muted ps-tiny ps-foot">Price is credits per group, a pretend unit. A group of 7 or 8 adds ${LARGE_EXTRA} credits. Struck-through slots fall on a weekend and are never used.</p>
      </section>
    </div>`;
}

function buildView() {
  const ranked = E.rankSlots(S.rankPath, S.students, SUPERVISORS);
  const n = S.students.filter((s) => s.path === S.rankPath).length;
  return `
    <div class="ps-page-head"><h1>Build</h1></div>
    <section class="ps-card ps-step" data-tour="rules">
      <div class="ps-step-head"><span class="ps-step-n">1</span><h2>Fit rule</h2></div>
      <div class="ps-rules">
        <div>${chip("ideal")} starts 8:00 AM to 9:00 PM local</div>
        <div>${chip("ok")} starts 6:00 to 8:00 AM local</div>
        <div>${chip("bad")} any other time</div>
        <div class="ps-muted">Midweek preferred. Weekends never.</div>
      </div>
    </section>
    <section class="ps-card ps-step" data-tour="ranking">
      <div class="ps-step-head"><span class="ps-step-n">2</span><h2>Ranked slots</h2></div>
      ${PATH_TABS("kpath", S.rankPath, false)}
      <p class="ps-sub ps-tiny ps-mb">How each supervisor slot fits the ${n} ${PATHS[S.rankPath].name} students on its own. No single slot suits every region, which is why the draft mixes morning and afternoon groups.</p>
      <div class="ps-scroll"><table class="ps-table">
        <thead><tr><th class="num">#</th><th>Supervisor</th><th>Slot (PT)</th><th>Fit</th><th class="num">Price</th></tr></thead>
        <tbody>${ranked.map((c, i) => `<tr class="${c.skipped ? "ps-skip" : ""}">
          <td class="num">${c.skipped ? "" : i + 1}</td><td class="ps-strong">${esc(c.sup.name)}</td>
          <td><span class="ps-sl">${E.fmtSlot(c.slot)}</span>${c.skipped ? `<div class="ps-note">${c.skipped}</div>` : ""}</td>
          <td><span class="ps-fitbar" aria-hidden="true"><span class="g" style="flex:${c.counts.ideal}"></span><span class="w" style="flex:${c.counts.ok}"></span><span class="b" style="flex:${c.counts.bad}"></span></span> <span class="ps-tiny ps-sub">${c.counts.ideal} ideal, ${c.counts.ok} OK, ${c.counts.bad} not OK</span></td>
          <td class="num">${c.sup.price}</td></tr>`).join("")}</tbody>
      </table></div>
    </section>
    <section class="ps-card ps-step" data-tour="draft">
      <div class="ps-step-head"><span class="ps-step-n">3</span><h2>Draft</h2><span class="ps-spacer"></span>
        <button type="button" class="ps-btn ps-btn-primary" data-a="build" data-tour="build-btn">${S.groups ? "Rebuild draft" : "Build draft"}</button></div>
      ${S.reports ? `<div class="ps-reports">${S.reports.map((r) => `
        <div class="ps-bucket">
          <div class="ps-bucket-head">${PATHS[r.path].name} <strong>${r.n} students</strong></div>
          <div>${r.groups} groups (${r.sizes.join(" and ")} students): <strong>${cr(r.cost)}</strong></div>
          <div class="ps-sub ps-tiny">${r.reason}${r.alt ? ` ${r.alt.groups} groups would cost ${cr(r.alt.cost)}.` : ""}</div>
          <div class="ps-fits">${r.counts.ideal} ${chip("ideal")} ${r.counts.ok} ${chip("ok")} ${r.counts.bad} ${chip("bad")}</div>
        </div>`).join("")}</div>` : `<p class="ps-sub ps-tiny">The engine picks the cheapest group structure for each path, chooses slots, then places the pickiest students first.</p>`}
    </section>`;
}

function moveRow(o: MoveOption, studentId: string) {
  const gs = sup(o.group.supId);
  const flag = o.changes.length
    ? `<div class="ps-flag">Contract change: ${o.changes.map((c) => `${esc(c.name)}, ${c.before} to ${c.after} credits (${c.why})`).join("; ")}</div>`
    : `<div class="ps-muted ps-tiny">No contract change</div>`;
  return `<li class="ps-opt">
    <div><strong>${esc(gs.name)}</strong>, ${E.fmtSlot(o.group.slot)} PT &rarr; ${E.fmtSlot(o.local)} local ${chip(o.fit)}</div>
    <div class="ps-sub ps-tiny">Cost ${signed(o.costDelta)}${o.costDelta ? " credits" : ""}. Group goes to ${o.group.studentIds.length + 1} students.</div>
    ${flag}
    <button type="button" class="ps-btn ps-btn-sm ps-btn-primary" data-a="move" data-v="${studentId}" data-g="${o.group.id}" ${o.full ? "disabled" : ""}>${o.full ? "Group full" : "Move here"}</button>
  </li>`;
}

function groupsView() {
  if (!S.groups) return `<div class="ps-page-head"><h1>Groups</h1></div><div class="ps-card ps-empty">No draft yet.<br><button type="button" class="ps-btn ps-btn-primary" data-a="tab" data-v="build">Go to Build</button></div>`;
  const j = juno();
  const jg = E.groupOf(S.groups, j.id);
  const banner = !S.lateApplied
    ? `<div class="ps-headline" data-tour="late">
        <div><strong>1 roster change waiting.</strong> ${esc(j.name)} (${PATHS[j.path].name}) updated their time zone: ${REGIONS[LATE_CHANGE.from].name} to ${REGIONS[LATE_CHANGE.to].name}.</div>
        <button type="button" class="ps-btn ps-btn-sm ps-btn-primary" data-a="late" data-tour="late-btn">Apply change</button>
      </div>`
    : S.proposal?.status === "approved"
      ? `<div class="ps-headline ok">Change approved and logged. Every student is placed.</div>`
      : jg && E.studentFit(jg.slot, j.region) === "bad"
        ? `<div class="ps-headline bad"><div>${esc(j.name)} now starts at ${E.fmtSlot(E.toLocal(jg.slot, j.region))} local. Ask the assistant, or click their name to see move options.</div><button type="button" class="ps-btn ps-btn-sm" data-a="tab" data-v="assistant">Ask the assistant</button></div>`
        : "";
  return `<div class="ps-page-head"><h1>Groups</h1><span class="ps-pill">Draft</span></div>${banner}
    ${PATH_IDS.map((p) => {
      const gs = S.groups!.filter((g) => g.path === p);
      return `<h2 class="ps-sec">${PATHS[p].name} <span class="ps-muted ps-tiny">${gs.length} groups</span></h2>
      <div class="ps-group-grid">
        ${gs.map((g) => {
          const v = sup(g.supId), n = g.studentIds.length;
          return `<section class="ps-card ps-gc" data-tour="group-${g.id}">
            <div class="ps-gc-head">
              <div class="ps-gc-sup"><span class="ps-link">${esc(v.name)}</span></div>
              <div class="ps-gc-time">${E.DAY_FULL[g.slot.day]} ${E.fmtHour(g.slot.hour)} PT</div>
              <div class="ps-gc-meta"><span class="ps-pill">${n} of ${CAP}</span><span class="ps-pill">${E.bandLabel(n)}</span><span class="ps-pill">${cr(E.groupCost(v.price, n))}</span></div>
            </div>
            <ul class="ps-gc-body">
              ${g.studentIds.map((id) => {
                const s = stu(id), loc = E.toLocal(g.slot, s.region), f = E.studentFit(g.slot, s.region);
                const open = S.moving === id;
                return `<li class="ps-stud ${open ? "open" : ""}">
                  <div class="ps-stud-row">
                    <button type="button" class="ps-stud-name" data-a="pick" data-v="${id}" aria-expanded="${open}" data-tour="stu-${id}">${esc(s.name)}</button>
                    <span class="ps-stud-tz">${REGIONS[s.region].name}</span>
                    <span class="ps-stud-local">${E.fmtSlot(loc)}</span>${chip(f)}
                  </div>
                  ${open ? `<ul class="ps-opts">${E.moveOptions(S.groups!, s, SUPERVISORS).map((o) => moveRow(o, id)).join("") || `<li class="ps-muted">No other ${PATHS[s.path].name} group.</li>`}</ul>` : ""}
                </li>`;
              }).join("")}
            </ul>
          </section>`;
        }).join("")}
      </div>`;
    }).join("")}
    ${S.log.length ? `<section class="ps-card ps-log"><h3>Change log</h3><ul>${S.log.map((l) => `<li>${esc(l)}</li>`).join("")}</ul></section>` : ""}`;
}

function assistantView() {
  if (!S.groups) return `<div class="ps-page-head"><h1>Assistant</h1></div><div class="ps-card ps-empty">Build a draft first, so the assistant has results to read.<br><button type="button" class="ps-btn ps-btn-primary" data-a="tab" data-v="build">Go to Build</button></div>`;
  const p = S.proposal;
  let card = "";
  if (p) {
    const s = stu(p.studentId), from = S.groups.find((g) => g.id === p.from)!, to = S.groups.find((g) => g.id === p.to)!;
    const before = p.status === "approved" ? E.moveStudent(S.groups, p.studentId, p.from) : S.groups;
    const after = p.status === "approved" ? S.groups : E.moveStudent(S.groups, p.studentId, p.to);
    const changes = E.contractChanges(before, after, SUPERVISORS);
    card = `<div class="ps-proposal ${p.status}" data-tour="apply">
      <div class="ps-proposal-k">Proposed change &middot; needs approval</div>
      <div class="ps-proposal-t">Move ${esc(s.name)}</div>
      <dl class="ps-kv">
        <dt>From</dt><dd>${esc(sup(from.supId).name)}, ${E.fmtSlot(from.slot)} PT &middot; ${E.fmtSlot(E.toLocal(from.slot, s.region))} local ${chip(E.studentFit(from.slot, s.region))}</dd>
        <dt>To</dt><dd>${esc(sup(to.supId).name)}, ${E.fmtSlot(to.slot)} PT &middot; ${E.fmtSlot(E.toLocal(to.slot, s.region))} local ${chip(E.studentFit(to.slot, s.region))}</dd>
        ${changes.map((c) => `<dt>Contract</dt><dd><span class="ps-flag">${esc(c.name)}: ${c.before} to ${c.after} credits</span> <span class="ps-sub ps-tiny">${c.why}</span></dd>`).join("")}
      </dl>
      ${p.status === "pending"
        ? `<div class="ps-row"><button type="button" class="ps-btn ps-btn-sm ps-btn-apply" data-a="approve" data-tour="approve">Approve</button><button type="button" class="ps-btn ps-btn-sm ps-btn-ghost" data-a="dismiss">Dismiss</button></div>`
        : `<div class="ps-status">${p.status === "approved" ? "Approved by you. Applied and logged." : "Dismissed. Nothing changed."}</div>`}
    </div>`;
  }
  const prompts = [
    !S.asked.summary ? `<button type="button" class="ps-example" data-a="ask-summary">Summarize the term.</button>` : "",
    S.lateApplied && !S.asked.juno ? `<button type="button" class="ps-example hot" data-a="ask-juno" data-tour="ask-juno">${esc(juno().name)} moved time zones. Where should they go?</button>` : "",
  ].join("");
  return `
    <div class="ps-page-head"><h1>Assistant</h1></div>
    <p class="ps-sub ps-tiny ps-mb">Reads the draft for <strong>Demo term</strong>. It proposes changes; nothing happens until you approve. Replies here are canned for the demo.</p>
    <section class="ps-card ps-chat" data-tour="chat">
      <div class="ps-chat-log">
        ${S.chat.length ? S.chat.map((m) => m.who === "tool" ? `<div class="ps-tool">${m.html}</div>` : `<div class="ps-msg ${m.who === "you" ? "user" : "assistant"}">${m.html}</div>`).join("") : `<div class="ps-empty ps-tiny">Pick an example below.</div>`}
        ${card}
      </div>
      <div class="ps-examples">${prompts || `<span class="ps-muted ps-tiny">${S.lateApplied ? "No more example questions." : "Apply the roster change on the Groups tab to unlock another question."}</span>`}</div>
    </section>`;
}

function render() {
  const view = { roster: rosterView, build: buildView, groups: groupsView, assistant: assistantView }[S.tab]();
  root.innerHTML = `<div class="ps-app">${header()}<main class="ps-main" role="tabpanel">${view}</main></div>`;
}

root.addEventListener("click", (e) => {
  const b = (e.target as HTMLElement).closest<HTMLElement>("[data-a]");
  if (!b || (b as HTMLButtonElement).disabled) return;
  const v = b.dataset.v!;
  switch (b.dataset.a) {
    case "tab": A.tab(v as Tab); break;
    case "rpath": S.rosterPath = v as PathId | "all"; break;
    case "kpath": S.rankPath = v as PathId; break;
    case "build": A.build(); break;
    case "late": A.late(); break;
    case "ask-summary": A.askSummary(); break;
    case "ask-juno": A.askJuno(); break;
    case "approve": A.approve(); break;
    case "dismiss": A.dismiss(); break;
    case "pick": S.moving = S.moving === v ? null : v; break;
    case "move": A.move(v, b.dataset.g!); break;
  }
  render();
});

render();

// ---------- guided tour ----------

const go = (t: Tab) => () => { if (S.tab !== t) { A.tab(t); render(); } };
const J = LATE_CHANGE.studentId;
const steps: TourStep[] = [
  {
    title: "An invented term",
    body: `${STUDENTS.length} fictional students in 4 time zone regions and 3 program paths, and ${SUPERVISORS.length} fictional supervisors. The job: put every student in a small supervised group at a sensible local time, for the lowest cost.`,
    before: go("roster"),
  },
  {
    target: '[data-tour="students"]',
    title: "Students and their time zones",
    body: "Sessions are stored in Pacific time. Each student's region tells the tool how far ahead of Pacific they are, so it can work out their local start time.",
    before: go("roster"),
  },
  {
    target: '[data-tour="supervisors"]',
    title: "Supervisors, slots and prices",
    body: "Each supervisor teaches certain paths, lists the slots they can run, has a price per group in credits and a limit on groups. Weekend slots are listed but never used.",
    before: go("roster"),
  },
  {
    target: '[data-tour="tab-build"]',
    title: "Go to Build",
    body: "This is where the engine ranks slots and builds a first draft.",
    before: go("roster"),
    act: () => { A.tab("build"); render(); },
    advanceOnClick: true,
  },
  {
    target: '[data-tour="ranking"]',
    title: "Slots ranked by fit and cost",
    body: "For the Characters path, each slot is scored on how many students it suits at their local time, then on day and price. A morning slot works for Europe but lands after midnight in Asia Pacific, so no single slot suits everyone.",
    before: go("build"),
  },
  {
    target: '[data-tour="build-btn"]',
    title: "Build the draft",
    body: "The engine works out the cheapest group structure per path, chooses the slots, and places the pickiest students first.",
    before: go("build"),
    act: () => { if (!S.groups) { A.build(); render(); } },
    advanceOnClick: true,
  },
  {
    target: '[data-tour="draft"]',
    title: "Cheapest structure, explained",
    body: "Each path shows its group count, cost and why. Environments uses 2 groups of 8 and 7 because a third group would cost more. Effects puts its Asia Pacific students at 7:00 AM: early, but workable.",
    before: go("build"),
  },
  {
    target: '[data-tour="tab-groups"]',
    title: "See the groups",
    body: "Every placement, with each student's local time and fit.",
    before: go("build"),
    act: () => { A.tab("groups"); render(); },
    advanceOnClick: true,
  },
  {
    target: '[data-tour="late-btn"]',
    title: "A late roster change",
    body: "Real terms keep moving after the draft. Here a student has moved from Europe to Asia Pacific. Apply the change and watch their fit.",
    before: go("groups"),
    act: () => { A.late(); render(); },
    advanceOnClick: true,
  },
  {
    target: `[data-tour="stu-${J}"]`,
    title: "Now a bad local time",
    body: "Their group now starts just after midnight for them, so the tool marks it Not OK. Click a name any time to see move options with cost and contract impact.",
    before: go("groups"),
  },
  {
    target: '[data-tour="tab-assistant"]',
    title: "Ask the assistant",
    body: "The assistant reads the engine's results through tools and proposes a fix. It can't change anything itself.",
    before: go("groups"),
    act: () => { A.tab("assistant"); render(); },
    advanceOnClick: true,
  },
  {
    target: '[data-tour="ask-juno"]',
    title: "Ask about the move",
    body: "In the real tool this goes to a language model. Here the reply is canned, but every number in it comes from the engine you just ran.",
    before: go("assistant"),
    act: () => { A.askJuno(); render(); },
    advanceOnClick: true,
  },
  {
    target: '[data-tour="apply"]',
    title: "An Apply card, flagged",
    body: "The fix moves the student to an ideal time, but their new group grows from 6 to 7 and crosses a size band. That changes the supervisor's contract, so the card flags it.",
    before: go("assistant"),
  },
  {
    target: '[data-tour="approve"]',
    title: "A person decides",
    body: "Nothing changes until you approve. Approve it to apply the move and log it.",
    before: go("assistant"),
    act: () => { A.approve(); render(); },
    advanceOnClick: true,
  },
  {
    target: '[data-tour="stats"]',
    title: "Done",
    body: "All 40 students placed, the change approved and logged, and the cost updated. Explore freely, or restart the tour from the bar.",
    before: go("assistant"),
  },
];

mountTour(document.getElementById("demo-term-scheduler")!, {
  steps,
  reset: () => { S = fresh(); render(); },
  intro: `About 2 minutes, ${steps.length} steps.`,
});
