---
title: How Ask Taggart works
project_id: ask_taggart
tags: [this assistant, RAG, retrieval, tools, guardrails, evals, architecture]
page_url: /projects/ask-taggart
---

# How Ask Taggart works

## What it is

Ask Taggart is the AI assistant on this site. Taggart built it to answer questions about his experience and projects, and it is itself one of his portfolio projects. The code is public on GitHub at github.com/Taggart-Thomson/portfolio.

## Where its answers come from

It answers only from a knowledge base of Markdown files that Taggart wrote and reviewed. If the answer isn't in the knowledge base, it says so and suggests emailing him. Each answer shows source chips that link to the page the facts came from.

## How retrieval works

When the site is built, the knowledge base is split into short passages by heading. For each question, two searches run: a keyword search (BM25) that catches names and numbers, and a meaning search using small text embeddings that catches questions phrased in different words. The scores are combined and the top few passages are sent to the model with the question.

## The model and cost

Answers come from Claude Haiku, a fast and low-cost Claude model, through the Anthropic API. The fixed instructions are cached to cut cost and response time. Usage is capped by message length limits, a limit on conversation length, a per-visitor hourly limit, a daily cap, and a monthly spend limit.

## Tools

The assistant can call tools that show cards in the chat: a project card, a demo link with tips on what to try, the resume link, contact details, and this explanation of how it works.

## Guardrails

It ignores instructions that try to change its role or reveal its instructions. It declines off-topic requests in one friendly sentence. It does not discuss salary, personal life, family, health, politics or religion. It does not invent employers, dates, numbers or skills, and it does not claim titles Taggart hasn't held.

## Fallback

If the API is down or the daily cap is reached, the chat switches to written answers to the most common questions, so the page never looks broken.

## Privacy

Conversations are not stored.

## How it is tested

Taggart wrote an evaluation set of 40 or more test questions. Each case lists facts the answer must include, facts it must not include, and the passages retrieval should find. The suite measures retrieval hit rate, faithfulness (a stronger Claude model checks that every claim appears in the retrieved passages), required and forbidden facts, and whether trick questions are refused correctly. Results, including failures, are published on the evals page.
