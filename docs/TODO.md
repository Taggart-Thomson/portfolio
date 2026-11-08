# TODO

## Today (2026-11-08)

How it runs: Taggart steers from his phone. Copy edits go to the main session. Demos are built in a separate demo session on its own branch, merged and pushed only when Taggart says so. The live site stays `noindex`, so he reviews everything on taggartthomson.ca.

**1. Copy pass (main session)**
- [x] Reorder projects: AI Career Assistant, Term Scheduler, Mentor Assessment Automation, Verso, Lastro, Career Hub, Driver's Exam Trainer.
- [ ] Taggart reads the live site and sends edits in plain words, page by page. Each batch is applied, checked (`npm run check:content`, build) and pushed on "push it".

**2. Working demos (demo session)**
- Approach: guided, hands-on demos rebuilt in the site on invented data (see `docs/DECISIONS.md`, "Demo style"). Not Figma: they run real logic in the page, work on phones, match the site and cost nothing to host.
- [x] Taggart pointed to the local project folders (map in `private/demo-sources.md`). Reference only, nothing copied.
- [ ] Shared tour component (steps, highlight, skip, back, restart).
- [ ] Build in this order, one at a time, each reviewed live before the next:
  1. Term Scheduler
  2. AI Career Assistant (raw transcript, cleaned, rules extraction failing, LLM extraction)
  3. Mentor Assessment Automation (now a demo, not a diagram)
  4. Verso (now a demo on an invented collection, not a diagram)
  5. Lastro (banner: "Demo with sample data. Not financial advice.")
  6. Career Hub ("Career Hub demo", form stores nothing)
  7. Driver's Exam Trainer (original questions written from the public CTB, approved 2026-11-08)
- [ ] When each demo ships, update its KB file (Mentor and Verso KB files still say "diagram only").

## Blockers

- [ ] **Learning trainer: do not link from the portfolio yet.** Its question bank must be rewritten with original questions based on Brazil's public traffic code (CTB), in its own repo (`Taggart-Thomson/cnh-mg-trainer`). Link the live app only after Taggart confirms. Until then, show the case study without the live link. Details in `private/BRIEF.md`, Section 5.

## Waiting on Taggart

- [x] Answer BRIEF Section 10 questions (see docs/DECISIONS.md).
- [x] Fill the private blocklists (names from rosters, the excluded project and the Verso client).
- [x] Create the GitHub repo on the Taggart-Thomson account (public).
- [x] Create the Cloudflare account.
- [x] Buy the domain: taggartthomson.ca (Cloudflare Registrar, 2026-11-07).
- [x] Create the Anthropic API key; added as a Cloudflare Worker secret and to local `.env`.
- [ ] Set a monthly spend limit on the Anthropic account (suggested USD 20).
- [ ] Supply the resume PDF (`public/Taggart_Thomson_Resume.pdf`).
- [ ] Copy pass on the live site.
- [ ] Approve the remaining new facts from the CV review (`private/cv_inventory.md`, section 3).
- [x] Lastro: repo reviewed (v1 built end to end, 333 offline tests). Assets permitted. Demo needs invented data.

## Ask Taggart: next

- [ ] Automated eval set (recruiter questions per role family, declines, prompt injection), judged by `JUDGE_MODEL`; publish results.
- [ ] Meaning-based retrieval (embeddings) alongside BM25.
- [ ] Project and demo cards in the chat.
- [ ] Static FAQ fallback when the API is down or the daily cap is hit.

## Later

- [x] Connect taggartthomson.ca to the Worker.
- [ ] Guided demos, starting with the Term Scheduler.
- [ ] Flip `noindex` off when the job search is public.
