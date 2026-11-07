---
title: Mentor assessment automation
project_id: mentor_assessments
tags: [Google Apps Script, Google Forms, Google Sheets, automation, data integrity]
page_url: /projects/mentor-assessments
---

# Mentor assessment automation

## The problem

Each term, about 72 mentors give weekly scores and feedback to their students. Setting up the forms and score sheets for every mentor took about 20 hours of manual work each term.

## What Taggart built

He built a Google Apps Script system that runs every term. It generates a Google Form for each mentor, pre-filled with that mentor's students and the term's weeks, with a rubric grid scoring five criteria from 0 to 5.

All responses flow into one master data file, with one tab per mentor. The system also creates a scoring workbook for each mentor, with a tab per student that pulls their weekly scores and calculates a running grade.

## Results

Setup that took about 20 hours of manual work each term now runs automatically.

## What went wrong and what he changed

One term, the response tabs ended up one position out of line with the mentors they belonged to. A rename step fired out of sync during rapid form creation. Left alone, it would have attached scores to the wrong people.

Taggart first wrote a read-only diagnostic to confirm exactly which tabs were affected. Then he wrote a safe two-pass repair: rename every affected tab to a temporary name first, then rename each to its correct name, read from its linked form. <!-- REVIEW: reason for two passes is inferred. --> Doing it in two passes avoided name collisions mid-repair. He then changed the setup process so the problem can't happen again.

## Demo

There is no live demo. The case study page shows a diagram of the data flow (forms, then the master file, then the per-mentor workbooks) and an illustrative screenshot built with fake names.
