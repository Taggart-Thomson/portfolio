---
title: "Virtual Program Assistant"
kicker: "AI and retrieval"
summary: "An AI assistant that supports Think Tank students from their first week to well after graduation, answering from the school's own teaching and program material. I built the prototype and took it to launch with engineering."
order: 1
where: "Think Tank Training Centre"
stack: [Python, Flask, RAG, LLM extraction, TF-IDF, sentence-transformers]
demo: guided
demoNote: "A guided demo on invented content: ask the assistant a question beside an invented course page, then go behind the scenes to see how a webinar recording becomes something it can answer from, on 8 invented snippets: the raw transcript, the cleaned version, the failed rules-based extraction and the LLM extraction side by side. The cleaner and the rules run live in your browser; the LLM extraction is precomputed."
status: "Live for all students and graduates."
preview: "/previews/virtual-program-assistant.webp"
---

## What it is

Synapse is the school's virtual program assistant. Students ask it about anything to do with their studies: their courses, how the program works, what's expected of them and where to find help. Graduates keep using it for their careers after they finish. It's now one of the main support systems at the school.

It started as a career assistant and grew to cover the whole student journey.

## What it knows

It answers from the school's own material: the curriculum, course content, program guides and the library of recorded webinars, from orientations to mentor talks and recruiter visits. Advice that used to sit in hours of video or scattered documents is now one question away, and every answer comes from what the school actually teaches.

## What I built

I built the first version, from the data pipeline to the retrieval layer, then worked alongside the school's engineering team to refine the knowledge base until it was ready to ship.

**Turning recordings into knowledge.** A rules-based cleaner strips the timestamps from raw webinar transcripts, rebuilds them into readable text grouped by speaker, and anonymizes speaker labels: known hosts become "Instructor" and everyone else becomes "Participant." A second stage pulls out the questions and answers.

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

It's live for every student and graduate, and it's one of the main ways the school supports them. The assistant on this site uses the same retrieval pattern.
