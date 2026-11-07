---
title: "Verso"
kicker: "Client web app"
summary: "An internal app for a public art organization, combining a 257-work collection with an invoicing workflow across 3 legal entities."
order: 6
where: "Built for a public art organization"
stack: [Django, SQL, PDF and Excel exports]
demo: diagram
demoNote: "The client's data is confidential, so Verso is shown only as a diagram of the workflow."
status: "Working prototype, not yet deployed."
---

## What it is

An internal web app I built for a public art organization. It combines a searchable artwork collection with a contractor invoicing workflow.

## The collection

257 works, imported from a confidential spreadsheet.

## The invoicing workflow

The workflow spans 3 legal entities and 4 roles. A contractor submits an invoice, an entity reviewer approves it or sends it back, accounting records the payment, and admins manage accounts.

## How it's built

Django and SQL, with email-based accounts and PDF and Excel exports. It has 24 passing tests.

## What changed after review

After reviewing the prototype with the client, I redesigned the workflow.
