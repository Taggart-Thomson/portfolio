---
title: Mentor and supervisor assessment automation
project_id: mentor_assessments
tags: [AI, feedback analysis, student surveys, supervisor scoring, matching, student experience, Google Apps Script, Google Forms, Google Sheets, automation, data integrity]
page_url: /projects/mentor-assessments
---

# Mentor Assessment Automation

## Supervisor scores from student feedback

Students fill in a survey twice a term, at the middle and at the end. Their feedback on each supervisor goes into the tool Taggart built, where an AI process reads the written comments alongside the ratings and gives each supervisor a score. This shows each supervisor's strengths, helps the school match students with the supervisor who fits them best, and surfaces problems mid-term while there is still time to act. The goal is the best possible experience for every student.

## Mentor scoring

The project also covers mentor scoring. Each term, about 72 mentors give weekly scores and feedback to their students. Taggart built a Google Apps Script system that generates a Google Form for each mentor, pre-filled with that mentor's students and the term's weeks, with a rubric grid scoring five criteria from 0 to 5. All responses flow into one master data file, with one tab per mentor. The system also creates a scoring workbook for each mentor, with a tab per student that pulls their weekly scores and calculates a running grade.

## Results

Setup that took about 20 hours of manual work each term now runs automatically. Supervisors are scored from real student feedback twice a term.

## What went wrong and what he changed

One term, the response tabs ended up one position out of line with the mentors they belonged to. A rename step fired out of sync during rapid form creation. Left alone, it would have attached scores to the wrong people.

Taggart first wrote a read-only diagnostic to confirm exactly which tabs were affected. Then he wrote a two-pass repair: rename every affected tab to a temporary name first, then rename each to its correct name, read from its linked form. He then changed the setup process so the problem can't happen again.

## Demo

The project page has a guided, hands-on demo that runs entirely in the visitor's browser on invented data: 6 fictional supervisors across 3 example paths and the invented students in their groups. A step-by-step tour walks through it, with skip, back and restart, and visitors can explore freely.

The visitor brings in the mid-term survey responses (example ratings from 1 to 5 plus a written comment from each student), then runs the AI analysis, which gives each supervisor a score out of 5, strengths, anything to watch, and the quotes it leaned on. In the demo, one supervisor's ratings average 3.8, but every one of their students mentions slow replies or moved sessions, so the analysis scores them lower and flags it mid-term. After the end-of-term survey, that supervisor's score is up. The visitor then matches an invented incoming student to a supervisor on their path, ranked on the strengths the student needs. A short last part shows mentor scoring: a form generated per mentor, responses landing in a master file with one tab per mentor, and a per-student running grade in each mentor's workbook.

The AI analysis results in the demo are precomputed and written for the demo; no model is called from the page. The survey questions, rubric criteria and strength categories in the demo are examples, not the school's real ones.
