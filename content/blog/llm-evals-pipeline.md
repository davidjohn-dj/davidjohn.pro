---
title: "Building an Eval Pipeline Before You Need It"
date: "2024-04-11"
category: "AI Engineering"
excerpt: "Prompt changes without evals are refactors without tests. Golden datasets, LLM-as-judge with rubrics, and wiring it all into CI."
---

Here's a failure mode I've now watched three teams hit: an innocent prompt tweak improves the case someone complained about and silently degrades two others. Nobody notices for weeks. The fix is the same discipline we apply to code — regression tests — adapted for non-deterministic outputs. Evals.

## Start with a golden dataset

Thirty real examples beat three hundred synthetic ones. Pull from production logs: the queries that worked, the ones that embarrassed you, the edge cases support escalated.

```ts
type EvalCase = {
  id: string;
  input: string;
  context?: string;         // for RAG: the retrieved docs
  expectations: string[];   // facts the answer must contain
  mustNotContain?: string[]; // hallucination tripwires
};
```

## Score with checks first, judge second

Cheap deterministic checks catch a lot: required facts present, format valid, length in bounds, forbidden content absent. For the subjective remainder — tone, helpfulness, groundedness — use LLM-as-judge with a *rubric*, not a vibe:

```ts
const judgment = await judge({
  model: "gpt-4-turbo",   // judge should outclass the system under test
  rubric: `Score 1-5:
    5: fully answers, all claims grounded in the provided context
    3: partially answers, no fabrications
    1: fabricates facts or ignores the question`,
  input: c.input, context: c.context, output,
});
```

Two rules make judges trustworthy: pin the judge model version (a judge upgrade shifts every score), and periodically hand-label 20 cases to measure agreement with the judge. Ours agrees with humans ~85% of the time — good enough for regression detection, not for absolute quality claims.

## Wire it into CI like tests

```yaml
- name: Run evals
  run: npm run evals -- --baseline=main
  # fails if mean score drops >3% or any must-pass case regresses
```

Every prompt change, model swap, or retrieval tweak runs the suite and diffs against baseline. The report answers the only question that matters: *what got worse?*

The meta-point: evals feel like overhead until the first time they catch a regression pre-deploy — for us, week two, a "harmless" system-prompt edit that broke date formatting in every summary. Now the rule is simple: no eval, no merge.
