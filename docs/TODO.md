# TODO

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
