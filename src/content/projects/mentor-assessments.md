---
title: "Mentor Assessment Automation"
kicker: "Automation"
summary: "Turns students' written survey feedback into a score for every supervisor, using AI to read the comments, so the school can see each supervisor's strengths and match students to the right one. It also runs mentor scoring every term, replacing about 20 hours of manual setup."
order: 3
where: "Think Tank Training Centre"
stack: [Google Apps Script, Google Forms, Google Sheets, AI analysis]
demo: guided
demoNote: "A guided demo with invented supervisors and survey answers: see feedback come in at mid-term and end of term, watch the AI turn written comments into a score and strengths for each supervisor, then use them to match a student."
status: "Runs every term."
---

## The problem

Students are the best judges of how their supervision is going, but their feedback comes in as survey answers, much of it written comments. Read by hand, it's hard to compare supervisors fairly or use it when placing students in groups.

## What I built

**Supervisor scores from student feedback.** Students fill in a survey twice a term, at the middle and at the end. Their feedback on each supervisor goes into the tool, where an AI process reads the written comments alongside the ratings and gives each supervisor a score.

That turns a pile of opinions into something the school can act on:

- **Each supervisor's strengths are visible**, so it's clear who is strongest at what.
- **Better matches for students.** When students are placed into groups, we can match them with the supervisor who fits them best.
- **Problems surface mid-term**, while there's still time to fix them, instead of after the term ends.

The goal is simple: the best possible experience for every student.

**Mentor scoring that runs itself.** The project also covers the other side of assessment. Each term, about 72 mentors give weekly scores and feedback to their students. A Google Apps Script system generates a Google Form for each mentor, pre-filled with their students and the term's weeks, with a rubric grid scoring five criteria from 0 to 5. All responses flow into one master file, with one tab per mentor, and each mentor gets a scoring workbook with a tab per student that calculates a running grade. Setup that took about 20 hours by hand every term now runs on its own.

## What went wrong, and what I changed

One term, the response tabs ended up one position out of line with the mentors they belonged to. A rename step fired out of sync during rapid form creation. Left alone, it would have attached scores to the wrong people.

I first wrote a read-only diagnostic to confirm exactly which tabs were affected. Then I wrote a two-pass repair: rename every affected tab to a temporary name first, then rename each to its correct name, read from its linked form. After that I changed the setup process so it can't happen again.
