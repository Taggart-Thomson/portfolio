# TODO

## Blockers

- [ ] **Learning trainer: do not link from the portfolio yet.** Its question bank must be rewritten with original questions based on Brazil's public traffic code (CTB), in its own repo (`Taggart-Thomson/cnh-mg-trainer`). Link the live app only after Taggart confirms. Until then, show the case study without the live link. Details in `private/BRIEF.md`, Section 5.

## Waiting on Taggart

- [x] Answer BRIEF Section 10 questions (see docs/DECISIONS.md). Lastro still open.
- [ ] Fill `private/blocklist.txt` with real names (employer, client, colleagues, platforms).
- [ ] Create the GitHub repo on the Taggart-Thomson account and choose visibility.
- [x] Create the Cloudflare account.
- [x] Buy the domain: taggartthomson.ca (Cloudflare Registrar, 2026-11-07).
- [ ] Create a site-specific Anthropic API key with a monthly spend limit; add it as a Cloudflare Worker secret and to local `.env`.
- [ ] Supply the resume PDF (`public/Taggart_Thomson_Resume.pdf`).
- [ ] Review every knowledge base file before Phase 2 deploys.
- [x] Lastro: repo reviewed (v1 built end to end, 333 offline tests). Assets permitted. Demo needs invented data.

## Later

- [ ] Connect taggartthomson.ca to the Worker once the first deploy exists (wait for the .ca registration to finish first).
- [ ] Flip `noindex` off when the job search is public.
