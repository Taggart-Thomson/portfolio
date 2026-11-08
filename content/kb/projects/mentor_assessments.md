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

The project page will have a guided demo on invented supervisors and survey answers.
