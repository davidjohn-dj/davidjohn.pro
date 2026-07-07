---
title: "Model Routing in Anger: A Production Architecture"
date: "2026-01-22"
category: "AI Engineering"
excerpt: "Route by task class, escalate on verification failure, and treat model choice as config. The router that cut our costs 68% without a quality regression."
---

Model routing graduated from optimization to architecture for us this year: five model tiers, one seam, and every product feature declaring *what it needs* instead of *which model it wants*. This is the design, with the decisions that mattered.

## Tasks declare requirements, not models

The unit of routing is a task class with declared needs:

```ts
const TASK_PROFILES = {
  "ticket.classify":  { needs: "extraction",  latency: "realtime", risk: "low" },
  "reply.draft":      { needs: "generation",  latency: "streaming", risk: "medium" },
  "contract.analyze": { needs: "deep_reasoning", latency: "async",  risk: "high" },
} as const;

// the router owns the mapping; features never name models
const model = router.resolve(TASK_PROFILES[taskId]);
```

Model names live in *config*, not code. When a better/cheaper model ships, we update one mapping, run the eval suite per task class, and roll it out behind a percentage flag. Model upgrades went from sprint-sized to afternoon-sized.

## Escalation is verification-driven

The cascade only works if something decides an output is insufficient — and that something can't be the model grading itself:

```ts
const result = await run(model, task);
const check = await verify(result, task);   // schema, citations, checks
if (!check.ok && profile.risk !== "low") {
  return run(router.escalate(model), task, { hint: check.failures });
}
```

Cheap deterministic verification (does it parse, are required fields present, do cited sources exist, do numbers reconcile) catches most quality failures. The escalation *hint* — telling the bigger model what the smaller one got wrong — measurably beats a blind retry.

## The numbers and the surprises

After a full quarter: 68% cost reduction versus flagship-everywhere, quality flat on every task-class eval, p50 latency *down* 40% (small models are fast). The surprises: the mini tier handled more than we predicted (classification and extraction are basically solved at the cheap tier), and the escalation rate itself became our best quality signal — when a task class's escalation rate creeps up, something upstream changed (input drift, prompt rot) before any user complains.

The principle underneath: **model choice is an infrastructure concern, like instance sizing.** Product code declares requirements; the platform resolves them against the current market. Teams still hardcoding model names into features are accumulating a peculiar new kind of tech debt — one that compounds with every price drop they can't absorb.
