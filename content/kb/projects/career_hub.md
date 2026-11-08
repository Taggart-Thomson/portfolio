---
title: "Career Hub: job search support and a placement tracker"
project_id: career_hub
tags: [career hub, jobs feed, Python, GitHub Actions, Flask, KPI, placement tracking]
page_url: /projects/career-hub
---

# Career Hub: job search support and a placement tracker

## The problem

<!-- REVIEW: "scattered" is inferred. The fact sheet only says it was the first central place. -->
An online art school's students and graduates had no central place for job search support. Advice, job boards and studio lists were scattered.

## What Taggart built

He built a self-contained Career Hub page that gives students and graduates one place for job search support. It includes curated job boards, a filterable list of studios to target, a live jobs feed, a resume and cover letter guide with an interactive checklist, and an AI assistant. It was the school's first central place for job search support.

## The jobs feed

A Python scraper pulls postings from studios' official, public Greenhouse and Lever APIs. It doesn't scrape sites that forbid it. It filters for relevant junior roles, writes a `jobs.json` file, and runs on a schedule with GitHub Actions.

## The placement tracker

A "Landed a job? Tell us" form feeds a small Flask backend. The storage layer is isolated so SQLite can be swapped for Postgres. There is a public count endpoint, records are protected by an admin token, and personal data is never stored in Git.

## Results

The placement tracker gave leadership a KPI it never had: 8 in 10 graduates from the past 2 years now work in the industry.

## Demo

The case study page has a generic, hands-on "Career Hub demo" that runs in the visitor's browser on invented data, with no school name and no original artwork, banners, fonts or logos (neutral placeholder shapes only). A step-by-step tour walks through it, with skip, back and restart, and visitors can explore freely.

It shows job board tips; a jobs feed of invented postings from 10 invented studios, with a "How this feed is built" view where 12 sample postings go through the same kind of filter as the real one (keep art roles, drop senior, lead and principal roles and non-art roles), leaving 7; a studio list filterable by discipline, region and whether the studio hires juniors; a resume and cover letter checklist with progress; and the "Landed a job? Tell us" placement form, prefilled with made-up details. Submitting shows a success message, but the demo sends and stores nothing.
