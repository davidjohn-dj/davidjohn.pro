---
title: "Context Engineering: The Discipline Formerly Known as Prompting"
date: "2026-02-19"
category: "AI Engineering"
excerpt: "The prompt was never the hard part - the context is. Budgeting tokens like a performance budget, structuring for salience, and measuring what the model actually uses."
---

"Prompt engineering" always undersold the job. The instruction paragraph is maybe 5% of what the model sees; the other 95% — retrieved documents, tool results, history, schemas — is assembled by your code, and *that assembly* is where quality lives or dies. The field has started calling this **context engineering**, and it deserves the engineering treatment: budgets, structure, and measurement.

## Budget tokens like you budget performance

Every context has a spending plan. Ours, for the support copilot:

```
system + tools:        1,200 tokens  (cached, stable-first)
user profile + state:    400
retrieved knowledge:   3,000  (top-5 chunks, headers included)
conversation window:   2,400  (recent turns + rolling summary)
current message:         ~200
response reserve:      1,800
────────────────────────────
budget:                9,000 of 128K available
```

Yes, the window fits 128K. No, you shouldn't use it: cost scales linearly, latency grows, and — the finding that keeps replicating — models attend *worse* in bloated contexts. Middle-of-context information gets lost; irrelevant chunks actively degrade answers by offering plausible wrong material. A disciplined 9K context beats a lazy 60K one on our evals, every time we've tested it.

## Structure for salience

Order and framing are levers, not aesthetics: stable content first (cache-friendly), the *most relevant* retrieved chunk closest to the question, explicit section delimiters the model can navigate (`<knowledge>`, `<history>`), and a one-line task restatement at the very end — the position models attend to most. When an answer misuses context, the fix is usually *placement*, not more instructions.

## Measure usage, not just outcomes

The context-engineering equivalent of a profiler: for each eval case, check which context sections the answer actually drew from (citation tracking makes this cheap). We consistently find dead weight — a "helpful" metadata block that no answer ever referenced, costing 600 tokens per call. Delete, re-run evals, confirm no regression, keep the savings. Context, like code, accumulates cruft that only measurement reveals.

The framing that stuck with our team: the model is a brilliant contractor who reads your brief once, at speed. Everything depends on what you put in the brief — and briefs are written, structured, budgeted, and revised. That's not prompt whispering. That's engineering.
