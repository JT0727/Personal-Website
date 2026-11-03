# Positioning — keep this narrative

Single public story for [jarrodtran.com](https://jarrodtran.com). Do not fragment it into audience-specific pages, headlines, or toggles.

## Core Direction

Position Jarrod Tran as an AI product leader who takes work from early use case to adoption.

Emphasize:

- AI product leadership
- Business results

Tone: polished, confident, corporate. Company names, official job titles, and proven impact numbers stay factual.

The site should communicate one focus, not a menu of industries and role types.

## Single coherent narrative

There is one headline, one value proposition, and one About story. Do not add audience-specific variants or per-bullet audience tags to the content model.

Keep improving that one story. Do not create Tech / VC / Consulting / Startup forks of the page.

Say each thing once. `pnpm test` fails when a five-word phrase without a figure appears in more than one visitor-facing string.

## Factory-language ban

Visitor-facing copy must not use factory, manufacturing, or heavy operational framing.

Banned tokens (case-insensitive): `factory`, `manufacturing`, `manufactured`, `mass production`, `shop floor`, `GWh`, `unit cost`, `cost per unit`, `supplier`, `logistics`, `battery-cell`, `Energy Manufacturing`.

`operator` is requested positioning, not a ban. Official titles (e.g. Lead, AI Enablement & Factory Strategy) stay; the current one is set once as `currentTitle` in `content/site.ts`. Recast mechanisms as product, strategy, investment, and organizational decisions. Keep the proof points; change the language around them.

Copy lives in [`content/site.ts`](content/site.ts) and section headings on `site.sections`. The contract is enforced by `pnpm test`.

## Number ledger

Every figure on the site (highlights, role bullets, case studies, principles, bio) must appear in the committed résumé, [`public/resume.pdf`](public/resume.pdf). `tests/metric-ledger.test.ts` reads the text in that PDF and fails on any figure it does not contain, except figures with a recorded source. `tests/copy-contract.test.ts` pins the file to sha256 `0933308be9e1d33db155a2eb0c0dc2a2494311f1b3f926dae2ba3f5c1796e164`, so a new résumé means updating that pin in the same PR. To add a number, put it in the résumé PDF first.

---

## Plan-mode prompt (paste into Cursor)

```
Plan a change to this personal site. Do not implement until the plan is approved.

Core Direction: Position Jarrod Tran as an AI product leader who takes work from early use case to adoption and can show business results. Keep one public narrative and one clear role focus.

Working style: one coherent public narrative — not four audience-specific stories or pages. Prefer concrete copy rewrites in content/site.ts (and site.sections for headings). Keep employers, official titles, and impact numbers; recast mechanisms as product, strategy, investment, and organizational decisions.

Factory-language ban: do not use factory, manufacturing, manufactured, mass production, shop floor, GWh, unit cost, cost per unit, supplier, logistics, battery-cell, or Energy Manufacturing in visitor-facing copy. Flag any drift back toward operational/factory language.

Non-goals unless I ask: visual redesign, new routes, audience-switcher UI, rewriting the résumé PDF, DNS, or Formspree.

Read POSITIONING.md and content/site.ts first. Propose the smallest copy (and only necessary code) change that keeps the live site aligned with this brief.
```

## Build prompt (paste after plan approval)

```
Implement the approved plan against this personal site.

Keep one clear AI product leadership narrative. Emphasize shipped work, adoption, and business results in concise, factual language.

Edit content/site.ts (and site.sections) in place. Do not add audience-specific headline or bullet branches. Do not invent employers, titles, or metrics.

Factory-language ban — visitor-facing copy must not contain: factory, manufacturing, manufactured, mass production, shop floor, GWh, unit cost, cost per unit, supplier, logistics, battery-cell, Energy Manufacturing.

After copy changes: pnpm test (copy-contract), pnpm check, pnpm build. Fix anything that fails before you stop.
```
