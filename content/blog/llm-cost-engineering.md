---
title: "LLM Cost Engineering After DeepSeek: Cheap Is a Capability"
date: "2025-01-30"
category: "AI Engineering"
excerpt: "DeepSeek-R1 reset the price of reasoning. Cascade routing, output-token discipline, and the cost dashboard every AI product needs."
---

DeepSeek-R1 landed this month with reasoning-model performance at a fraction of frontier prices, and whatever you think of the geopolitics, the engineering signal is unambiguous: intelligence is getting cheap *fast*, and cost architecture is becoming a core competency. Here's the playbook we've converged on.

## The cascade: cheapest model that clears the bar

Most requests don't need your best model. Route by attempt, escalate on failure:

```ts
const CASCADE = ["gpt-4o-mini", "gpt-4o", "o1"] as const;

async function complete(task: Task): Promise<Result> {
  for (const model of CASCADE) {
    const result = await run(model, task);
    if (await passesChecks(result, task.acceptance)) return result;
  }
  return escalateToHuman(task);
}
```

The unlock is `passesChecks`: cheap deterministic validation (schema parses, required fields present, citations resolve) that decides whether to escalate. On our extraction pipeline, 84% of requests never leave the mini tier — the blended cost per request dropped 71% against flagship-everything, with quality flat on the eval suite.

## Output tokens are the expensive ones

Everyone optimizes prompts; output tokens cost 3–5x more and get ignored. Concrete wins: ask for terse formats (`"respond with only the JSON"` — no preamble to pay for), set honest `max_tokens` ceilings per task, and for classification, ask for the label instead of the essay. We cut one summarization endpoint's cost 40% by changing the requested format from prose paragraphs to structured bullets — same information, half the tokens.

## Make cost visible per feature

The dashboard that changed our decisions plots **cost per successful outcome** — not per request — by feature, model, and day:

```
tokens_in, tokens_out, model, feature, cache_hit, success
```

Tag every call with that tuple. Within a week you'll find a surprise: ours was a retry loop on a flaky parser silently tripling one feature's spend, and a "quick" internal tool outspending a customer-facing product.

Prices will keep falling, and that's the point: the winners of the cheap-intelligence era are the teams whose architecture *converts* price drops into margin automatically — routing, caching, cascades already in place. Build the plumbing now; every price cut becomes free money.
