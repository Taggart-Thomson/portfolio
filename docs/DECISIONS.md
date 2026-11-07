# Decisions

Answers to BRIEF Section 10, recorded in Phase 0. These override the BRIEF where they differ.

| # | Question | Decision |
|---|---|---|
| 1 | Hosting | **Cloudflare** (Workers with static assets) for the site and the agent, built with **Astro + React islands**. Replaces Vercel throughout the BRIEF. |
| 2 | Domain | **Buying one now.** Plan the hookup early (Cloudflare Registrar sells at cost and connects with no DNS setup). |
| 3 | Relocation wording | **Canada, no city or date.** "Canadian citizen, relocating to Canada. Open to remote roles in Canada and the Americas, and hybrid roles in Canada." |
| 4 | Contact | Email behind a **click to reveal** button. **No phone number.** |
| 5 | Lastro | Free to use the repo and brand assets. Taggart hasn't used the tool much yet, so the demo must be populated with invented sample data (portfolio, budget, chat history, usage costs) so it looks lived in. The case study must stay honest: an in-progress personal build, not a tool with a track record. Build state still to be confirmed from the repo. |
| 6 | Scheduler demo | **In-browser guided demo** (see "Demo style" below). |
| 7 | Career Hub demo name | **No invented school name.** Label it "Career Hub demo." |
| 8 | Conversation logging | **Off.** Nothing stored. Can revisit later. |
| 9 | Design | No references. **Show 4 color and style options** to choose from (Phase 1). |
| 10 | Photo | **No headshot.** |
| 11 | Env vars | `ANTHROPIC_API_KEY`, `CHAT_MODEL` (default `claude-haiku-5-5`), `JUDGE_MODEL` (default `claude-opus-5-5`). |

## Demo style (applies to every project demo)

Each demo is a guided, Figma-prototype-style walkthrough that runs entirely in the browser on synthetic data:

- A step-by-step overlay highlights where to click next, with a short note on what the visitor is seeing.
- The visitor can click around a little, but the path is guided so they get the gist of the whole tool in a couple of minutes.
- Skip, back and restart controls. Works on mobile and desktop.
- No separate servers, no real data, nothing to keep running.
- Built as one shared tour component reused across demos.
- Demo UIs are rebuilt from scratch for the portfolio. Nothing is copied from private repos without Taggart's say-so.
