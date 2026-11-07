---
title: "Lastro"
kicker: "Personal project"
summary: "An AI investing dashboard for Brazilian markets. It suggests, I decide. Every recommendation must resolve to something I can actually buy."
order: 4
where: "Personal project"
stack: [Python, Flask, Anthropic API, prompt caching, GridStack, brapi.dev, CoinGecko]
demo: guided
demoNote: "A guided demo on invented sample data: a made-up portfolio, sample prices and headlines, and a sample advisor conversation. Not financial advice."
status: "Version 1 works end to end. I haven't used it much day to day yet, so it has no track record."
---

## The name

Lastro is Portuguese for what backs a currency, and for a ship's ballast. The tagline is "Decisões com lastro," or "Advice with ballast": the reasoning and sources sit next to every recommendation.

## The idea

A personal decision-support dashboard for investing in Brazil. It pulls market data and news, runs an AI analysis pass, and shows buy and sell suggestions with the specific ticker, alongside charts, a news feed and the portfolio.

It covers B3 stocks, ETFs, real estate funds (FIIs), BDRs, indexes, Brazilian government bonds (Tesouro Direto) and a little crypto.

It is not autonomous. It never places trades and never connects to a brokerage. I execute in my broker app and update the portfolio afterward.

## How it's built

A Python pipeline fetches B3 quotes (brapi.dev), crypto prices in BRL (CoinGecko) and Brazilian market news (RSS). It runs hourly on weekdays during B3 trading hours, and the schedule is a setting. A Flask app serves the dashboard, and the AI layer uses Claude through the Anthropic API.

## Guarantees enforced in code

**Every recommendation must resolve to a B3 ticker or a Tesouro Direto bond.** The prompt asks for this and a validator enforces it. Anything that fails, like a US-only stock, is rejected before it reaches the database and reported by name. One bad ticker doesn't throw away the rest of the analysis.

**The allocation math never reads free text.** If I tell the advisor "only investing 10k this month," that becomes a structured budget override with a month attached, and the original sentence is kept beside it so I can see what was understood.

## Cost control

The long, stable system prompt is cached, and prices, news and the portfolio go after the cache point. A test checks that the system prompt is byte-identical between calls, because one changing value like a timestamp would break the cache and roughly triple the cost of each hourly pass. Every run records its token counts and cost, including failed runs.

## The advisor's memory

The advisor keeps three separate kinds of memory: every conversation turn, so I can ask months later why a decision was made; standing instructions such as risk limits and exclusions; and free-text notes that reach the analysis only as background, never as rules.

## Testing

333 offline tests cover the pure logic, plus live checks for each data source that fail loudly when an API goes down or changes.

## Not built yet

A Tesouro Direto price fetcher, so bonds can be valued and not only recommended. Charts for Tesouro instruments. A retention policy for stored raw data.
