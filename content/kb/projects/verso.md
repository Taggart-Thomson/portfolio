---
title: "Verso: contracts, invoicing and collection app with an AI assistant, for a public art organization"
project_id: verso
tags: [Django, SQL, workflow, contracts, invoicing, roles, AI assistant, tool use, Anthropic API, prototype, testing, data privacy]
page_url: /projects/verso
---

# Verso

## What it is

Verso is an internal web app Taggart built for a public art organization. It brings the organization's contracts, invoicing and art collection into one place, with an AI assistant for the collection.

## Contracts and invoicing

The organization works through 3 legal entities. Verso handles contractor contracts and invoices across all three, with 4 roles: a contractor submits an invoice, a reviewer for the right entity approves it or returns it, accounting records the payment, and admins manage accounts. Invoices and records export to PDF and Excel.

## The collection and the AI assistant

The collection holds 257 works, imported from a confidential spreadsheet. An AI assistant answers the team's questions about it in plain language. Taggart designed it so it can't make things up: the model never sees the catalogue, only a search tool. It decides what to look up, the app runs the query, and only the matching records go back to it, so every figure it quotes comes straight from the data. Cost, insured value and owner are never sent to the model; asked for a valuation, it says it doesn't have access. Under each answer, a short line shows the search it ran and how many records matched, so anyone can check its work.

## How it is built

Django and SQL, with email-based accounts, PDF and Excel exports, and the Anthropic API with tool use for the assistant. It has 24 passing tests.

## What changed after user review

After reviewing the prototype with the client, Taggart redesigned the workflow.

## Status

Verso is a working prototype and is not yet deployed. The client's data is confidential, so the project page will show a guided demo on an invented collection.
