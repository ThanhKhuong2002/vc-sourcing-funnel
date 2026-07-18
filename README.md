# VC Sourcing Funnel

An open-source workflow for VC teams to turn public startup directories into a reviewable pipeline. It scans approved sources, applies transparent fit heuristics, prepares founder-outreach drafts, and produces a preliminary investment memo.

> Outreach is draft-only by design. A person must review and approve every message before it is sent.

## What it does

- Maintains a curated list of approved public startup sources.
- Imports a small tested seed set from Iterative, Plug and Play APAC, and Unikorn.
- Scores opportunities using configurable sector, stage, and signal rules.
- Produces personalized email drafts and concise screening memos.
- Keeps the decision trail visible: source, signal, score, and open diligence questions.

## Quick start

Requires Node.js 18 or later.

```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000). The app starts with seed records gathered from public listings; use **Run scan** to refresh a selected approved source.

## Source adapters

Source definitions live in [`config/sources.json`](config/sources.json). Every adapter must be explicitly enabled. The starter sources are:

- [Iterative Companies](https://www.iterative.vc/companies)
- [Plug and Play APAC Startups](https://www.plugandplayapac.com/our-startups)
- [Unikorn AI & Automation](https://unikorn.vn/categories/ai-automation)

The lightweight built-in extractor is deliberately conservative. For production use, add a source-specific adapter, fixtures, and a rate limit before enabling automated refreshes.

## Safety and compliance

- Scan only public sources that you are entitled to access.
- Review source terms, robots.txt, and applicable data-protection and anti-spam laws.
- The application does not discover personal emails, enrich private data, or transmit outreach.
- Treat the score and memo as a research aid, not an investment recommendation.

## Roadmap

- Source-specific extractors with fixtures
- CRM export and reviewed-send integrations
- Configurable investment thesis and scoring weights
- Memo export to Markdown/PDF

## License

[MIT](LICENSE)
