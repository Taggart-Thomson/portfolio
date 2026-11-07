---
title: "Mentor Assessment Automation"
kicker: "Automation"
summary: "Generates a scoring form and workbook for each of about 72 mentors every term. Setup that took about 20 hours by hand now runs on its own."
order: 5
where: "Think Tank Training Centre"
stack: [Google Apps Script, Google Forms, Google Sheets]
demo: diagram
demoNote: "A diagram of the data flow, from forms to the master file to each mentor's workbook, with an illustrative screenshot using fake names."
status: "Runs every term."
---

## The problem

Each term, about 72 mentors give weekly scores and feedback to their students. Setting up the forms and score sheets for every mentor took about 20 hours of manual work.

## What I built

A Google Apps Script system that runs every term. It generates a Google Form for each mentor, pre-filled with that mentor's students and the term's weeks, with a rubric grid scoring five criteria from 0 to 5.

All responses flow into one master data file, with one tab per mentor. It also creates a scoring workbook for each mentor, with a tab per student that pulls their weekly scores and calculates a running grade.

## What went wrong, and what I changed

One term, the response tabs ended up one position out of line with the mentors they belonged to. A rename step fired out of sync during rapid form creation. Left alone, it would have attached scores to the wrong people.

I first wrote a read-only diagnostic to confirm exactly which tabs were affected. Then I wrote a two-pass repair: rename every affected tab to a temporary name first, then rename each to its correct name, read from its linked form. After that I changed the setup process so it can't happen again.
