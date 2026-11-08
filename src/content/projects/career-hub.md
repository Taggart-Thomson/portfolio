---
title: "Career Hub"
kicker: "Student tool"
summary: "One place for job search support, with a live jobs feed and a placement tracker that gave leadership a KPI it never had."
order: 6
where: "Think Tank Training Centre"
stack: [Python, GitHub Actions, Flask, SQLite, Greenhouse and Lever APIs]
demo: guided
demoNote: "A generic Career Hub demo with invented studios and job listings: see how the jobs feed is filtered, filter the studio list, use the checklist and try the placement form. The form shows a success message but stores nothing."
status: "The school's first central place for job search support."
preview: "/previews/career-hub.webp"
---

## What I built

A self-contained Career Hub page that gives students and graduates one place for job search support. It was the school's first central place for it. It includes:

- curated job boards,
- a filterable list of studios to target,
- a live jobs feed,
- a resume and cover letter guide with an interactive checklist,
- an AI assistant.

## The jobs feed

A Python scraper pulls postings from studios' official, public Greenhouse and Lever APIs. It doesn't scrape sites that forbid it. It filters for relevant junior roles, writes a `jobs.json` file, and runs on a schedule with GitHub Actions.

## The placement tracker

A "Landed a job? Tell us" form feeds a small Flask backend. The storage layer is isolated so SQLite can be swapped for Postgres. There is a public count endpoint, records are protected by an admin token, and personal data is never stored in Git.

## Result

The placement tracker gave leadership a KPI it never had: 8 in 10 graduates from the past 2 years now work in the industry.
