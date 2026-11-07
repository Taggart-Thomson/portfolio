---
title: "Term Scheduler"
kicker: "Operations tool"
summary: "Places about 500 online students into supervised groups each term, balancing cost, local time and supervisor contracts. A person approves every change."
order: 2
where: "Think Tank Training Centre"
stack: [FastAPI, React, TypeScript, SQLite, Anthropic API, tool use]
demo: guided
demoNote: "A guided demo on an invented term of about 40 fictional students across 4 time zone regions and 3 program paths, with 8 fictional supervisors priced in credits, not real money."
status: "Handed to the school's engineering team."
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

For one real term, the scheduler placed all 88 students who needed a group, 83 of them at ideal local times. I handed the rebuilt version to the school's engineering team.
