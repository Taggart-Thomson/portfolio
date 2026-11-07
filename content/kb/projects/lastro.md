---
title: "Lastro: AI investing dashboard for Brazilian markets"
project_id: lastro
tags: [personal project, investing, dashboard, AI analysis, prompt caching, memory, Python, Flask, testing, Brazil]
page_url: /projects/lastro
---

# Lastro: AI investing dashboard for Brazilian markets

## Status

Lastro is a personal project. Version 1 is built end to end: the data pipeline fetches, the AI layer analyzes, and the dashboard renders it. Taggart has not used it much day to day yet, so it has no track record as an investing tool. The demo on this site runs on invented sample data.

## The name

Lastro is Portuguese for what backs a currency, and for a ship's ballast. The tagline is "Decisões com lastro," or in English, "Advice with ballast": grounded advice, with the reasoning and sources shown next to every recommendation.

## The idea

Lastro is a personal decision-support dashboard for investing in Brazilian markets. It pulls Brazilian market data and news, runs an AI analysis pass, and shows buy and sell suggestions with the specific ticker, alongside charts, a news feed and the portfolio.

It covers B3 stocks, ETFs, real estate funds (FIIs), BDRs, indexes, Brazilian government bonds (Tesouro Direto) and a little crypto. International exposure comes through instruments that trade in Brazil, such as BDRs and ETFs.

## Not autonomous

Lastro suggests and Taggart decides. It never places trades and never connects to a brokerage. He executes in his broker app and updates the portfolio afterward.

## How it is built

A Python pipeline with fetchers for B3 quotes (brapi.dev), crypto prices in BRL (CoinGecko) and Brazilian market news (RSS). It runs hourly on weekdays during B3 trading hours; how often it runs is a setting, not a fixed schedule. A Flask web app serves the dashboard. The AI layer uses Claude through the Anthropic API.

## Guarantees enforced in code

Every recommendation must resolve to a B3 ticker or a Tesouro Direto bond. The prompt asks for this, and a validator enforces it: anything that fails, like a US-only stock or an index that can't be bought, is rejected before it reaches the database and reported by name. One bad ticker doesn't throw away the rest of the analysis.

The allocation math never reads free text. If Taggart tells the advisor "only investing 10k this month," that becomes a structured budget override with a month attached, and the original sentence is kept beside it so he can see what was understood.

## Cost control

The long, stable system prompt is cached, and prices, news and the portfolio go after the cache point. A test checks that the system prompt is byte-identical between calls, because a single changing value like a timestamp would break the cache and roughly triple the cost of each hourly pass. Every run records its token counts and cost, including failed runs, and a command totals the month.

## The dashboard

A dockable workspace built on GridStack: six panels that can be dragged, resized, closed and toggled, with saved layouts. Panels include charts, suggestions, news, the portfolio, an advisor chat and a monthly report.

## The monthly budget and report

Lastro asks for the monthly investing budget once a month and produces a monthly allocation report based on a split Taggart sets each month.

## The advisor and its memory

The advisor chat has permanent memory, kept in three separate forms: every conversation turn (so he can ask months later why a decision was made), standing instructions such as risk limits and exclusions, and free-text context notes that reach the analysis only as background, never as rules.

## How past advice is judged

Charts show the whole portfolio, an asset class, a single instrument, or how a month's suggestions have performed since they were made. Portfolio history is derived from the trade history and historical prices rather than stored snapshots, so adding a forgotten trade corrects the whole curve.

## Testing

Lastro has 333 offline tests covering the pure logic, plus live checks for each data source that fail loudly when an API goes down or changes.

## Privacy

Portfolio positions, trade history and all market data stay on Taggart's machine and are never committed to Git.

## Not built yet

A Tesouro Direto price fetcher (so bonds can be valued, not only recommended), charts for Tesouro instruments, and a retention policy for stored raw data.

## Demo

The demo runs entirely on invented sample data: a made-up portfolio, sample market data, sample headlines and a sample advisor conversation. It shows a banner: "Demo with sample data. Not financial advice."
