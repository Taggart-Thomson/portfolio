---
title: Virtual Program Assistant
project_id: virtual_program_assistant
tags: [AI, RAG, retrieval, LLM extraction, Flask, transcripts, production, student support, career assistant, Synapse]
page_url: /projects/virtual-program-assistant
---

# Virtual Program Assistant

## What it is

The Virtual Program Assistant, called Synapse inside Think Tank Training Centre, is an AI assistant that supports students through their whole time at the school and after they graduate. Students ask it about their courses, how the program works and where to find help. Graduates keep using it for career questions. It is live for all students and graduates and is one of the main support systems at the school.

It started as an AI career assistant and grew into a virtual program assistant covering the whole student journey. Earlier descriptions call it the AI Career Assistant; it is the same project.

## What it knows

It answers from the school's own material: the curriculum, course content, program guides and the library of recorded webinars (orientations, mentor talks and recruiter visits). Advice that used to sit in hours of video or scattered documents is now searchable.

## What Taggart built

Taggart built the first version, from the data pipeline to the retrieval layer, then worked alongside the school's engineering team to refine the knowledge base until it could ship. His involvement ran from the first prototype through to launch, not just a hand-off. The first version's knowledge layer was retrieval over 80 anonymized webinar transcripts, cleaned and split into 5,780 searchable passages.

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

## Demo

The real data can't be shown, so the project page has a guided, hands-on demo on invented content, styled after the production assistant: a dark course page with an icon rail and a week selector, and the assistant docked on the right with its greeting, suggested questions, a "Computing..." state and answers. The course, its instructor, lessons and thumbnails are invented. No logos or platform names appear. A step-by-step tour walks through it, with skip, back and restart, and visitors can explore freely.

First, the visitor asks the assistant a question (for example, how long a demo reel should be). The canned answer comes from a question and answer pair extracted from an invented webinar snippet. Then "Behind the scenes" shows how a recording becomes something the assistant can answer from, as terminal output, the way the scripts actually ran. It uses 8 short, invented webinar snippets about generic art-career topics (demo reels, portfolio size, art tests, applying without studio experience, portfolio sites, what recruiters look at, following up after applying, generalist or specialist), with fictional speakers.

For each snippet the visitor sees the raw Zoom caption file (VTT), the cleaned and anonymized transcript, the rules-based question extractor's output, and the LLM extraction, plus a side-by-side comparison. The cleaner and the rules-based extractor are rewritten from scratch for the demo and run live in the browser. The LLM extraction and the assistant's answers are precomputed for the demo; no model is called from the page.

Each snippet shows a different way questions appear in a webinar: read out word for word, paraphrased, only implied, asked out loud by a participant, two questions read together, rhetorical questions in a presentation, a question taken from the chat, and a question finished by a co-host. Across all 8, the rules find 8 question and answer pairs, of which only 2 are usable; the precomputed model extraction finds 8 real pairs and skips the presentation that had no questions.

The demo covers only the recordings. The real assistant also answers from the curriculum, course content and program guides. Ask Taggart, the assistant on this site, is a live example of the same retrieval pattern.
