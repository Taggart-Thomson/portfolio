---
title: "Verso"
kicker: "Client web app"
summary: "An internal app that runs contracts and invoicing across 3 legal entities for a public art organization, and manages its 257-work collection with an AI assistant that only answers from real records."
order: 4
where: "Built for a public art organization"
stack: [Django, SQL, Anthropic API, tool use, PDF and Excel exports]
demo: guided
demoNote: "The client's data is confidential, so this guided demo uses an invented organization, collection and contractors. Browse the collection, ask the assistant and see the search it ran, then submit an invoice and take it through review and payment as each role. It all runs in your browser."
status: "Working prototype, not yet deployed."
preview: "/previews/verso.webp"
---

## What it is

An internal web app I built for a public art organization. It brings the organization's contracts, invoicing and art collection into one place.

## Contracts and invoicing

The organization works through 3 legal entities, and every contractor's paperwork has to land in the right one. Verso handles contracts and invoices across all three, with 4 roles:

- A contractor submits an invoice.
- A reviewer for the right entity approves it or sends it back with a reason.
- Accounting records the payment.
- Admins manage accounts and access.

Invoices and records export to PDF and Excel.

## The collection, and an AI assistant on top of it

The app holds the organization's 257-work collection, imported from a confidential spreadsheet and fully searchable.

On top of it sits an AI assistant the team can ask in plain language ("what do we have in bronze?", "which works are over two meters tall?"). I designed it so it can't make things up:

- **The model never sees the catalog.** It gets a search tool. It decides what to look up, the app runs the query, and only the matching records go back to it. Every figure it quotes comes straight from the data.
- **Sensitive fields never leave the app.** Cost, insured value and owner are never sent to the model. Asked for a valuation, it says it doesn't have access.
- **It shows its work.** Under each answer, a short line shows the search it ran and how many records matched, so anyone can check it.

## How it's built

Django and SQL, with email-based accounts, PDF and Excel exports, and the Anthropic API for the assistant. It has 24 passing tests.

## What changed after review

After reviewing the prototype with the client, I redesigned the workflow.
