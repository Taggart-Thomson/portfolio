---
title: AI Career Assistant
project_id: ai_career_assistant
tags: [AI, RAG, retrieval, LLM extraction, Flask, transcripts, production]
page_url: /projects/ai-career-assistant
---

# AI Career Assistant

## The problem

<!-- REVIEW: this framing is inferred, not from the fact sheet. Confirm or reword. -->
Students and graduates of a global online art school needed career guidance, and much of the school's best advice was locked inside recorded webinars: orientations, mentor talks and recruiter visits. Nobody could search them.

## What Taggart built

Taggart built an AI career assistant, called Synapse inside the school, that answers students' career questions from those webinars, from the first prototype through to launch. Its knowledge layer is retrieval over 80 anonymized webinar transcripts, cleaned and split into 5,780 searchable passages.

## The pipeline

Stage 1 is a rules-based cleaner. It strips VTT timestamps, rebuilds readable transcripts grouped by speaker, and anonymizes speaker labels: known hosts become "Instructor" and everyone else becomes "Participant."

Stage 2 extracts questions and answers from the cleaned transcripts.

## What went wrong and what he changed

Taggart's first question-and-answer extractor was rules-based, and it failed on real transcripts. Students typed their questions into the Zoom Q&A box, and the host read and answered them inside one speaking turn. Sometimes the host read the question word for word, sometimes paraphrased it, and sometimes only implied it. Rules couldn't separate the question from the answer.

He switched to an LLM-based extractor, which could. The lesson he took from it: know which problems need rules and which need a model.

## Architecture

A Flask backend holds the API key server-side, so the web page never sees it. The model call is isolated in one file, so the model can be swapped without touching the rest of the code. A separate retrieval service exposes `POST /api/retrieve`. The embedding layer can be switched between TF-IDF for demos and sentence-transformers for production.

## Privacy

The raw transcripts and the built knowledge base were never committed to GitHub.

## Results

Taggart built the prototype, then worked alongside the school's engineering team to refine the retrieval knowledge base so it could ship. It is now fully operational and one of the main support systems in place for students. His involvement ran from the first prototype through to launch, not just a hand-off.

## Demo

The real data can't be shown, so the case study page has a guided, hands-on demo built on 8 short, invented webinar snippets about generic art-career topics (demo reels, portfolio size, art tests, applying without studio experience, portfolio sites, what recruiters look at, following up after applying, generalist or specialist). The speakers are fictional. A step-by-step tour walks through it, and visitors can click through every snippet on their own.

For each snippet the visitor sees four stages: the raw Zoom caption file (VTT), the cleaned and anonymized transcript, the rules-based question extractor's output, and the LLM extraction, plus a side-by-side comparison. The cleaner and the rules-based extractor are rewritten from scratch for the demo and run live in the browser. The LLM extraction is precomputed for the demo; no model is called from the page.

Each snippet shows a different way questions appear in a webinar: read out word for word, paraphrased, only implied, asked out loud by a participant, two questions read together, rhetorical questions in a presentation, a question taken from the chat, and a question finished by a co-host. Across all 8, the rules find 8 question and answer pairs, of which only 2 are usable; the precomputed model extraction finds 8 real pairs and skips the presentation that had no questions.

Ask Taggart, the assistant on this site, is a live example of the same retrieval pattern.
