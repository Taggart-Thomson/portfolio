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

Verso is a working prototype and is not yet deployed.

## Demo

The client's data is confidential, so the project page has a guided, hands-on demo that runs entirely in the visitor's browser on invented data: a made-up organization with 3 invented legal entities, 24 invented artworks by invented artists, 3 invented contractors with their contracts, and invented reviewers, accounting and admin staff (all emails use example.com). It is rebuilt from scratch for the portfolio and contains nothing from the client. A step-by-step tour walks through it, with skip, back and restart, and visitors can explore freely.

In the demo, visitors browse and search the collection and open a record, where cost, insured value and owner are shown as fields kept in the app and never sent to the assistant. They ask the collection assistant sample questions. Each question runs a real search over the invented records in the page, and under each answer the demo shows the search it ran and how many records matched, plus an exact view of what the model received, with cost, insured value and owner stripped out. Asked for an insured value, it says it doesn't have access. The assistant's wording is canned for the demo; no model is called from the page.

Visitors then submit an invoice as a contractor, switch to the reviewer for the right entity to approve it (or return it with a reason), switch to accounting to record the payment, and see the full history on the invoice. The admin view shows accounts and access.
