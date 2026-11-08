// Shared guided-tour engine for the project demos.
// A tour is a list of steps. Each step can highlight an element inside the demo,
// explain it, and either wait for the visitor to click it or move on with Next.
// Back works by resetting the demo and replaying the actions of earlier steps,
// so every step always sees the same state, however the visitor got there.

export interface TourStep {
  /** CSS selector inside the demo app to highlight. Omit for a plain note. */
  target?: string;
  title: string;
  body: string;
  /** Puts the demo in the state this step needs (for example, switch tab). Runs on show. */
  before?: () => void;
  /** The action the highlighted click performs. Next runs it for the visitor. */
  act?: () => void;
  /** Advance when the visitor clicks the target. */
  advanceOnClick?: boolean;
}

export interface TourOptions {
  steps: TourStep[];
  /** Restores the demo to its starting data and view. */
  reset: () => void;
  /** Short line for the intro card, e.g. "About 2 minutes, 11 steps." */
  intro?: string;
}

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export function mountTour(frame: HTMLElement, opts: TourOptions) {
  const bar = frame.querySelector<HTMLElement>("[data-tour-bar]")!;
  const stage = frame.querySelector<HTMLElement>("[data-demo-stage]")!;
  const app = frame.querySelector<HTMLElement>("[data-demo-app]")!;
  const ring = frame.querySelector<HTMLElement>("[data-tour-ring]")!;
  const { steps } = opts;
  let mode: "intro" | "running" | "off" = "intro";
  let i = 0;
  let raf = 0;

  function renderBar() {
    frame.dataset.tour = mode;
    if (mode === "intro") {
      bar.innerHTML = `
        <div class="tb-row">
          <div class="tb-text">
            <div class="tb-title">Take the guided tour</div>
            <div class="tb-body">${esc(opts.intro ?? "A short walk through the tool.")} Everything runs in your browser on invented data.</div>
          </div>
          <div class="tb-ctrl">
            <button type="button" class="tb-btn solid" data-t="start">Start tour</button>
            <button type="button" class="tb-btn" data-t="skip">Explore on my own</button>
          </div>
        </div>`;
      return;
    }
    if (mode === "off") {
      bar.innerHTML = `
        <div class="tb-row">
          <div class="tb-text"><div class="tb-body">Tour off. Click around freely.</div></div>
          <div class="tb-ctrl">
            <button type="button" class="tb-btn solid" data-t="restart">Restart tour</button>
            <button type="button" class="tb-btn" data-t="reset">Reset demo</button>
          </div>
        </div>`;
      return;
    }
    const s = steps[i];
    const last = i === steps.length - 1;
    const waiting = s.advanceOnClick && s.target;
    bar.innerHTML = `
      <div class="tb-row">
        <div class="tb-text" aria-live="polite">
          <div class="tb-count">Step ${i + 1} of ${steps.length}</div>
          <div class="tb-title">${esc(s.title)}</div>
          <div class="tb-body">${esc(s.body)}</div>
          ${waiting ? `<div class="tb-hint">Click the highlighted spot, or press Next.</div>` : ""}
        </div>
        <div class="tb-ctrl">
          <button type="button" class="tb-btn" data-t="back" ${i === 0 ? "disabled" : ""}>Back</button>
          <button type="button" class="tb-btn solid" data-t="next">${last ? "Finish" : "Next"}</button>
          <button type="button" class="tb-btn link" data-t="skip">Skip tour</button>
        </div>
      </div>
      <div class="tb-progress" aria-hidden="true"><span style="width:${((i + 1) / steps.length) * 100}%"></span></div>`;
  }

  function targetEl(): HTMLElement | null {
    const s = steps[i];
    if (mode !== "running" || !s?.target) return null;
    return app.querySelector<HTMLElement>(s.target);
  }

  function place() {
    const el = targetEl();
    if (!el || !el.getClientRects().length) {
      ring.hidden = true;
      stage.classList.remove("dim");
    } else {
      const r = el.getBoundingClientRect();
      const b = stage.getBoundingClientRect();
      const pad = 6;
      ring.hidden = false;
      stage.classList.add("dim");
      ring.style.left = `${r.left - b.left - pad}px`;
      ring.style.top = `${r.top - b.top - pad}px`;
      ring.style.width = `${r.width + pad * 2}px`;
      ring.style.height = `${r.height + pad * 2}px`;
    }
    raf = requestAnimationFrame(place);
  }

  function scrollToTarget() {
    const el = targetEl();
    if (!el) return;
    const r = el.getBoundingClientRect();
    // The tour bar is sticky, so keep the target below it.
    const top = bar.offsetHeight + 16;
    const room = window.innerHeight - top - 16;
    if (r.top >= top && r.bottom <= window.innerHeight - 16) return;
    const offset = r.height > room ? r.top - top : r.top - top - (room - r.height) / 2;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollBy({ top: offset, behavior: reduce ? "auto" : "smooth" });
  }

  function show(n: number) {
    i = Math.max(0, Math.min(n, steps.length - 1));
    steps[i].before?.();
    renderBar();
    requestAnimationFrame(scrollToTarget);
  }

  function replayTo(n: number) {
    opts.reset();
    for (let k = 0; k < n; k++) {
      steps[k].before?.();
      steps[k].act?.();
    }
    show(n);
  }

  function start() {
    mode = "running";
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(place);
    replayTo(0);
    frame.scrollIntoView({ block: "start", behavior: "smooth" });
  }

  function stop() {
    mode = "off";
    cancelAnimationFrame(raf);
    ring.hidden = true;
    stage.classList.remove("dim");
    renderBar();
  }

  function next() {
    if (i === steps.length - 1) return stop();
    show(i + 1);
  }

  bar.addEventListener("click", (e) => {
    const b = (e.target as HTMLElement).closest<HTMLButtonElement>("[data-t]");
    if (!b) return;
    const t = b.dataset.t;
    if (t === "start" || t === "restart") start();
    else if (t === "skip") stop();
    else if (t === "reset") { opts.reset(); renderBar(); }
    else if (t === "back") replayTo(i - 1);
    else if (t === "next") {
      steps[i].act?.();
      next();
    }
  });

  // Registered after the demo's own handlers, so the demo reacts first, then the tour moves on.
  app.addEventListener("click", (e) => {
    if (mode !== "running") return;
    const s = steps[i];
    if (!s.advanceOnClick || !s.target) return;
    const hit = (e.target as HTMLElement).closest(s.target);
    if (hit) setTimeout(next, 0);
  });

  renderBar();
  return { start, stop };
}
