---
title: "Term Scheduler: cost-aware group placement"
project_id: term_scheduler
tags: [scheduling, optimization, AI assistant, human in the loop, FastAPI, React, TypeScript, SQLite, testing]
page_url: /projects/term-scheduler
---

# Term Scheduler: cost-aware group placement

## The problem

Each term, roughly 500 online students across many time zones have to be placed into small supervised groups. Each placement has to balance cost, the students' local session times, supervisors' availability and limits, and the impact on supervisors' contracts. It was done by hand.

## What it does

The Term Scheduler imports the term's students and supervisor availability. It works out the lowest-cost group structure for each program path, ranks supervisors and session slots by cost and time zone fit, places students, and flags any change that would affect a supervisor's contract.

It runs in ranking mode, not auto-assign: it surfaces the options and a person decides.

## The fit rule

A session that starts between 8am and 9pm in the student's local time is "ideal." One that starts between 6am and 8am is "OK." Anything else is "not OK." Day preferences are encoded too: midweek is preferred, and weekends are never used.

## The AI layer

The scheduler has a tool-using AI assistant built on one principle: deterministic engines compute, the model reasons over the results, and a person approves every change through Apply cards.

The assistant has read tools (term overview, group lookup, move costs and name reconciliation) and write tools that only make proposals. Nothing changes until a person approves it.

## What went wrong and what he changed

Real-world data was messy. Supervisors typed their names differently on different forms, so Taggart added matching for name variants. Several placement bugs only appeared at real scale, with a full term of students. He also rewrote the error messages so each one names the specific person and the cause, instead of a generic failure.

## Stack and testing

FastAPI backend, React and TypeScript frontend, and SQLite. It has 22 automated tests, including characterization tests pinned to a real term so changes can't silently alter known-good results.

## Results

For the October 2026 term, the scheduler placed just over 220 students into 24 supervisor groups. Checked against a past term, its fit rule agreed with 265 of 266 human-assigned labels.

Taggart rebuilt the scheduler himself as a FastAPI and React app with 22 tests, then handed it to the school's engineering team, who own it now.

## Demo

The case study page has a guided, hands-on demo that runs entirely in the visitor's browser on an invented term: 40 fictional students across 4 time zone regions (Americas West, Americas East, Europe, Asia Pacific) and 3 program paths (Characters, Environments, Effects), and 8 fictional supervisors with made-up availability and prices in "credits," not real money. A step-by-step tour highlights where to click, with skip, back and restart controls, and visitors can also explore on their own.

The demo runs a real engine written from scratch for the portfolio, not the school's code or data. It applies the fit rule (8am to 9pm local is ideal, 6 to 8am is OK, anything else is not OK; midweek preferred, weekends never), ranks each supervisor's slots by fit, day and price, works out the cheapest group structure for each path, and places the pickiest students first. The tour then shows a late roster change (a student moves time zones and lands at a bad local time), a canned assistant reply whose numbers come from the engine, and an Apply card that flags a contract change because the student's new group crosses a size band. Nothing changes until the visitor approves it. Visitors can also move students by hand and see the cost and contract impact of each option.

The assistant in the demo is canned (no model call); the real tool uses a live language model with tools.
