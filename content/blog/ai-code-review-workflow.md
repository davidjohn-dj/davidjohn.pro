---
title: "AI Code Review That Developers Don't Ignore"
date: "2024-12-12"
category: "AI Engineering"
excerpt: "LLM reviewers drown PRs in nitpicks unless you design against it. Diff-scoped context, confidence thresholds, and measuring the signal-to-noise ratio."
---

We added an LLM review pass to our pull-request pipeline in September. The first version got muted by every developer within two weeks — a nitpick firehose. The current version gets thanked in standup. The difference was treating reviewer *credibility* as the design goal, not coverage.

## Failure mode one: the nitpick flood

An LLM asked to "review this code" will always find twenty things, because it can't not. Fifteen are style preferences your linter already governs. The fix is scope discipline in the prompt:

```
Review this diff for issues a senior engineer would flag:
- bugs and logic errors
- security problems (injection, authz gaps, secrets)
- breaking changes to public interfaces
- concurrency hazards

Do NOT comment on: formatting, naming preferences, or anything
a linter enforces. If the diff looks correct, say so and stop.

Rate each finding: confidence (high/medium/low) and severity.
```

Then filter: we only post high-confidence findings as PR comments; medium goes to a collapsed summary; low is discarded. Volume dropped 80%, and the comments that remain get acted on.

## Failure mode two: context starvation

A diff alone can't reveal that the function being modified has six other callers. We assemble review context programmatically: the diff, full text of changed files, signatures of everything that calls into the changed code (from the language server), and the PR description. That last one matters more than expected — the model flags *mismatches between stated intent and actual change*, which is exactly what tired human reviewers miss.

## Measure it like a product

The metric that matters is action rate: what fraction of AI comments lead to a change? We track it per category. Security findings: ~70% action rate — genuinely catching things. Logic errors: ~40%. When any category drops under 20%, its prompt gets tightened or the category gets cut. Reviewer credibility is a budget; every ignored comment spends it.

## Where it lands

The AI pass runs pre-human: it catches the mechanical stuff so human review starts from "is this the right approach?" instead of "line 74 leaks a connection." It doesn't replace the second pair of eyes — it upgrades what those eyes spend attention on. That framing, communicated explicitly to the team, is what got the buy-in back.
