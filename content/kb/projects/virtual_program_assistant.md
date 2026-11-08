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

The real data can't be shown. The project page has a small interactive demo built on invented, clearly fictional webinar snippets, showing the raw transcript, the cleaned version, the failed rules-based extraction and the LLM extraction side by side. Ask Taggart, the assistant on this site, is a live example of the same retrieval pattern.
