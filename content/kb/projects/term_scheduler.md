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

For one real term, the scheduler placed all 88 students who needed a group, 83 of them at ideal local times. Taggart handed the rebuilt version to the school's engineering team.

## Demo

The case study page has a guided demo on an invented dataset: about 40 fictional students across 4 time zone regions and 3 program paths, and 8 fictional supervisors with made-up availability and costs in "credits," not real money.
