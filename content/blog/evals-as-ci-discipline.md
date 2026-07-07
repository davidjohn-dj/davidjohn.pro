---
title: "Evals Are CI: The Discipline That Separates AI Teams"
date: "2025-07-17"
category: "AI Engineering"
excerpt: "Prompt edits, model swaps, retrieval tweaks - every change runs the eval suite or it doesn't merge. The maturity ladder from vibes to regression gates."
---

Two years into the LLM product era, the teams shipping reliably and the teams firefighting share the same models, the same frameworks, the same patterns — except one. The reliable teams treat evals the way software teams treat CI: **no change touches production behavior without passing the suite.** Here's the maturity ladder as I've watched teams climb it.

## Level 0 → 1: from vibes to a golden set

Level 0 is checking a few favorite prompts by hand after each change. The move to Level 1 is mechanical: collect 50–100 real cases (from logs, from support escalations, from the demo that failed), pair each with acceptance criteria, and script the loop:

```bash
npm run evals
# 94/100 passed | mean score 4.31 | $1.87 | 3m12s
```

This alone changes team dynamics — "I think the new prompt is better" becomes "plus four on the suite, minus one on date formatting, here's the diff."

## Level 2: gate the merge

Wire it into CI with a baseline comparison. The key design choice: **fail on regression, not on absolute score.**

```yaml
- run: npm run evals -- --baseline=main --fail-on-regression=2%
```

Absolute thresholds rot; relative gates catch exactly what you care about — did *this change* make something worse? Include must-pass cases (the CEO demo query, the compliance-sensitive answers) that individually block merge regardless of averages.

## Level 3: production is the eval source

Mature teams close the loop: sampled production traffic gets scored continuously (cheap checks on everything, LLM-judge on a sample), and every human correction or thumbs-down becomes a candidate eval case. The golden set stops being a curated museum and becomes a living document of what your users actually ask. This is also your model-upgrade insurance: when the next model version drops, you know in an hour whether it's an upgrade *for you*.

## The cultural shift underneath

The hard part isn't tooling — a serviceable harness is a weekend of work. It's the norm that prompts are code: versioned, reviewed, tested, revertable. The teams that internalize this ship model swaps in a day and prompt improvements continuously. The ones that don't are one enthusiastic edit away from their next incident, and they know it — you can tell, because they're afraid to touch anything.
