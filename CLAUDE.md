# CLAUDE.md

Personal portfolio site for Taggart Thomson with an "Ask Taggart" RAG chat agent. Full spec: `private/BRIEF.md` (source of truth, git-ignored because it names private terms; ask Taggart for it if missing). Open items: `docs/TODO.md`. Architecture: `docs/ARCHITECTURE.md`. Decisions that override the brief (Cloudflare hosting, guided in-browser demos, etc.): `docs/DECISIONS.md`.

## Working with Taggart

- Explain each step plainly. Give terminal commands **one line at a time**, each in its own code block.
- For Python, use Homebrew `python3.12` for virtual environments (system `python3` is 3.14, too new).
- Work in the phases in BRIEF Section 9. At the end of each phase: what changed, how to run it, what Taggart must do by hand.
- Ask before guessing. Never invent facts about Taggart. All facts come from BRIEF Section 6; if it isn't there, ask.

## Anonymization (non-negotiable)

- The current employer may be named (Think Tank Training Centre), including which tools were built there and for which of its products. No founder or staff names.
- One body of work is excluded completely (named in `private/BRIEF.md` Section 2 and `private/blocklist.txt`): never mention it anywhere, in any form, until Taggart says otherwise.
- Never name the public art client behind Verso. Use "a public art organization."
- No real people anywhere: content, demo data, screenshots, alt text, code comments, commit messages.
- No real data. Demo data is synthetic and obviously fake (invented names, `@example.com` emails).
- No contractor pay rates or rate changes, ever. Cost work is "owning a budget and being relied on for cost-saving measures."
- Some projects, names and items are excluded completely. The full list is in `private/BRIEF.md` (Section 2) and `private/blocklist.txt`. Course projects are never named; mention the stack only.
- The career assistant project is called only "AI Career Assistant." Never use its internal name.
- Aggregate figures on the public resume (BRIEF Section 6) are fine. Anything else, ask first.
- Private blocklists (all git-ignored), checked by `npm run check:content`, and the build must fail on any hit:
  - `private/blocklist.txt` (hand-written terms) and `private/blocklist-names.txt` (people's names from the rosters): blocked everywhere.
  - `private/allowlist.txt` (optional): exact phrases that are always allowed.

## Writing style

- Plain, grounded, non-hype. Direct and specific. No "passionate," "revolutionary" or buzzword soup.
- **No em dashes and no double dashes** in visible copy. Use commas, periods or colons.
- American English.
- Real numbers over percentages unless the percentage is the natural unit ("8 in 10 graduates").
- Never show a number without context. No stat graphics or big floating numbers.

## Git

- All commits authored by `Taggart Thomson <taggartthomson98@gmail.com>` (set in local repo config).
- **No `Co-Authored-By: Claude` or any AI attribution lines** in commits or PRs.
- GitHub account: **Taggart-Thomson** only. Never any other account.
- Commit or push only when Taggart asks.

## Security

- No API keys in the repo, ever. Keys live in the host's environment variables and a git-ignored local `.env`.
- Taggart creates and pastes all keys. Never ask for a key in chat.
- Site defaults to `noindex, nofollow` (one setting to flip later). No analytics unless Taggart approves a cookieless option.
