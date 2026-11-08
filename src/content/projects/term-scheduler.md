---
title: "Term Scheduler"
kicker: "Operations tool"
summary: "Places online students into supervised groups each term, balancing cost, local time and supervisor contracts. It placed just over 220 students into 24 groups for October 2026."
order: 2
where: "Think Tank Training Centre"
stack: [FastAPI, React, TypeScript, SQLite, Anthropic API, tool use]
demo: guided
demoNote: "A guided demo on an invented term: 40 fictional students across 4 time zone regions and 3 program paths, and 8 fictional supervisors priced in credits, not real money. Build a draft, handle a late change, and approve the assistant's proposal. It all runs in your browser."
status: "Rebuilt by me, now owned by the school's engineering team."
preview: "/previews/term-scheduler.webp"
---

## The problem

Each term, roughly 500 online students across many time zones have to be placed into small supervised groups. Every placement balances cost, the students' local session times, supervisors' availability and limits, and the effect on supervisors' contracts. It was done by hand.

## What it does

The scheduler imports the term's students and supervisor availability. It works out the lowest-cost group structure for each program path, ranks supervisors and session slots by cost and time zone fit, places students, and flags any change that would affect a supervisor's contract.

It ranks options rather than auto-assigning. It shows the choices and a person decides.

## The fit rule

A session that starts between 8am and 9pm in the student's local time is **ideal**. One that starts between 6am and 8am is **OK**. Anything else is **not OK**. Midweek is preferred, and weekends are never used.

## The AI layer

The scheduler has a tool-using assistant built on one principle: deterministic engines compute, the model reasons over the results, and a person approves every change through Apply cards.

It has read tools (term overview, group lookup, move costs and name reconciliation) and write tools that only make proposals. Nothing changes until someone approves it.

## What went wrong, and what I changed

Real data was messy. Supervisors typed their names differently on different forms, so I added matching for name variants. Several placement bugs only showed up at real scale, with a full term of students. I also rewrote the error messages so each one names the specific person and the cause, instead of a generic failure.

## Testing

22 automated tests, including characterization tests pinned to a real term, so changes can't silently alter known-good results.

## Result

For the October 2026 term, the scheduler placed just over 220 students into 24 supervisor groups. Checked against a past term, its fit rule agreed with 265 of 266 human-assigned labels.

I rebuilt it myself as a FastAPI and React app, then handed it to the school's engineering team, who own it now.
