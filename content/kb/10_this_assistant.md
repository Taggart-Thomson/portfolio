---
title: How Ask Taggart works
project_id: ask_taggart
tags: [this assistant, RAG, retrieval, tools, guardrails, evals, architecture]
page_url: /
---

# How Ask Taggart works

## What it is

Ask Taggart is the AI assistant on this site. Taggart built it to answer questions about his experience and projects, and it is itself one of his portfolio projects. The code is public on GitHub at github.com/Taggart-Thomson/portfolio.

## Where its answers come from

It answers only from a knowledge base of Markdown files that Taggart wrote and reviewed. If the answer isn't in the knowledge base, it says so and suggests emailing him. Each answer shows source links to the pages the facts came from.

## How retrieval works

When the site is built, the knowledge base is split into 122 short passages by heading. For each question, a keyword search (BM25) picks the most relevant passages, using the latest question and the one before it so follow-ups keep their context. A small set of core facts about Taggart is always included. A second, meaning-based search using text embeddings is planned, so questions phrased in different words find the right passages too.

## The model and cost

Answers come from Claude Haiku, a fast and low-cost Claude model, through the Anthropic API. The fixed instructions are cached to cut cost and response time. Usage is capped by message length limits, a limit on conversation length, a per-visitor hourly limit, a daily cap, and a monthly spend limit.

## What it can show

Answers stream in as they are written, with links to the relevant project pages and source links underneath. Richer cards for projects and demos are planned.

## Guardrails

It ignores instructions that try to change its role or reveal its instructions. It declines off-topic requests in one friendly sentence. It does not discuss salary, personal life, family, health, politics or religion. It does not invent employers, dates, numbers or skills, and it does not claim titles Taggart hasn't held.

## Fallback

If the API is down or the daily cap is reached, the chat says so plainly and points to the project pages and the email button, so the page never looks broken.

## Privacy

Conversations are not stored.

## How it is tested

Taggart tests it with recruiter-style questions for different roles, questions it should decline, and attempts to make it break its rules. An automated evaluation set is being built next: each case lists facts the answer must include, facts it must not include, and the passages retrieval should find, with a stronger Claude model checking that every claim is supported. Results will be published on the site.
