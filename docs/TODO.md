# TODO

## Blockers

- [ ] **Learning trainer: do not link from the portfolio yet.** Its question bank must be rewritten with original questions based on Brazil's public traffic code (CTB), in its own repo (`Taggart-Thomson/cnh-mg-trainer`). Link the live app only after Taggart confirms. Until then, show the case study without the live link. Details in `private/BRIEF.md`, Section 5.

## Waiting on Taggart

- [x] Answer BRIEF Section 10 questions (see docs/DECISIONS.md). Lastro still open.
- [ ] Fill `private/blocklist.txt` with real names (employer, client, colleagues, platforms).
- [ ] Create the GitHub repo on the Taggart-Thomson account and choose visibility.
- [ ] Create the Cloudflare account and buy the domain (Cloudflare Registrar recommended).
- [ ] Create a site-specific Anthropic API key with a monthly spend limit; add it as a Cloudflare Worker secret and to local `.env`.
- [ ] Supply the resume PDF (`public/Taggart_Thomson_Resume.pdf`).
- [ ] Review every knowledge base file before Phase 2 deploys.
- [ ] Lastro: state of the build and access to the repo and brand assets.

## Later

- [ ] Custom domain hookup (moved earlier, since the domain is being bought now).
- [ ] Flip `noindex` off when the job search is public.
