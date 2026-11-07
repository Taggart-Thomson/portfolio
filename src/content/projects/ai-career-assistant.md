---
title: "AI Career Assistant"
kicker: "AI and retrieval"
summary: "An assistant that answers students' career questions from 80 webinar transcripts. Engineering adopted it as the model for the production feature."
order: 1
where: "Think Tank Training Centre"
stack: [Python, Flask, RAG, LLM extraction, TF-IDF, sentence-transformers]
demo: guided
demoNote: "A guided walk-through on invented webinar snippets, showing a raw transcript, the cleaned version, the failed rules-based extraction and the LLM extraction side by side."
status: "Prototype adopted. The production version is live to students."
---

## What I built

I prototyped an AI career assistant that answers students' and graduates' career questions from the school's recorded webinars. Its knowledge layer is retrieval over 80 anonymized webinar transcripts, cleaned and split into 5,780 searchable passages.

## The pipeline

**Stage 1 is a rules-based cleaner.** It strips VTT timestamps, rebuilds readable transcripts grouped by speaker, and anonymizes speaker labels: known hosts become "Instructor" and everyone else becomes "Participant."

**Stage 2 extracts questions and answers** from the cleaned transcripts.

## What went wrong, and what I changed

My first question-and-answer extractor was rules-based, and it failed on real transcripts. Students typed their questions into the Zoom Q&A box, and the host read and answered them inside one speaking turn. Sometimes the host read the question word for word, sometimes paraphrased it, and sometimes only implied it. Rules couldn't separate the question from the answer.

I switched to an LLM-based extractor, which could. The lesson I took from it: know which problems need rules and which need a model.

## Architecture

- A Flask backend holds the API key server-side, so the web page never sees it.
- The model call is isolated in one file, so the model can be swapped without touching the rest of the code.
- A separate retrieval service exposes `POST /api/retrieve`.
- The embedding layer switches between TF-IDF for demos and sentence-transformers for production.

The raw transcripts and the built knowledge base were never committed to GitHub.

## Result

The school's engineering team adopted my prototype as the model for the production feature, which is now live to students. The assistant on this site uses the same retrieval pattern.
