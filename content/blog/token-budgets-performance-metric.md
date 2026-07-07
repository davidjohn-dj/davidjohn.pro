---
title: "Tokens per Interaction: The Web Vital Nobody Is Tracking Yet"
date: "2026-04-16"
category: "AI Engineering"
excerpt: "We track bytes, milliseconds, and layout shift - but AI products burn tokens invisibly. Instrumenting TPI, setting budgets per feature, and the regressions we caught."
---

Frontend engineering matured when we started *measuring* — bundle budgets, Core Web Vitals, performance CI. AI products are at the pre-measurement stage: everyone watches the monthly bill, almost nobody can answer "how many tokens does one user interaction cost, and is that number drifting?" We've been treating **tokens per interaction (TPI)** as a first-class metric for two quarters. It's caught four regressions the bill couldn't localize.

## Instrument the unit that maps to value

The monthly invoice aggregates everything; TPI attributes cost to the thing you actually ship — an interaction:

```ts
telemetry.record({
  feature: "search.answer",
  interaction_id,
  tokens: { in: usage.prompt_tokens, out: usage.completion_tokens,
            cached: usage.cached_tokens },
  model, latency_ms,
  outcome: "success" | "retry" | "escalated" | "abandoned",
});
```

Dashboard it as p50/p95 TPI per feature. The distribution matters: our search-answer p50 was a healthy 3.1K, but p95 was 41K — a tail of pathological sessions (one user pasting entire documents into search) that averages completely hid.

## Budgets catch what reviews don't

Each feature gets a TPI budget and CI-adjacent alerting, exactly like bundle-size checks:

```yaml
budgets:
  search.answer:   { p50: 4000,  p95: 15000 }
  reply.draft:     { p50: 6000,  p95: 20000 }
```

The regressions we caught: a retrieval change that doubled chunk count (quality-neutral, cost-doubling — reverted), a system-prompt edit that broke the cache prefix (cached-token ratio dropped from 78% to 4% overnight — the graph screamed before the bill did), a retry loop retrying *successes* due to an inverted check, and a model swap whose verbose default style inflated output tokens 60% until we tightened the format instruction.

## TPI changes design conversations

Once visible, the metric reshapes decisions the way LCP reshaped image handling. "Should the assistant recap the conversation every turn?" stops being aesthetic — it's +900 tokens per interaction, measurable against retention. Features get *token-efficient designs*: structured outputs over prose, rolling summaries over full history, retrieval tuned to five chunks not fifteen because the eval says quality holds.

The web performance lesson replays exactly: what you don't measure silently regresses; what you budget stays honest; and the teams that instrument first build intuitions the spreadsheet-quarterly teams never develop. Tokens are the new milliseconds. Start counting.
