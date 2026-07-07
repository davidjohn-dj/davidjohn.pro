---
title: "Agent Memory: Checkpointing State for Long-Running Work"
date: "2025-10-16"
category: "AI Engineering"
excerpt: "Agents that work for hours need durable state, resumability, and memory that survives the context window. The checkpoint architecture that works."
---

Short agent tasks fit in a context window and a prayer. But the agents we're deploying now — migration runners, research pipelines, ops workflows — run for hours, survive process restarts, and outlive their own context windows. That takes actual state architecture. Here's what ours looks like after two quarters of iteration.

## Separate the three kinds of state

The mistake is treating "the conversation" as the state. Long-running agents have three distinct stores:

- **Execution state** — the plan, completed steps, pending steps, tool results. Structured, durable, the source of truth for resumption.
- **Working memory** — what's in the context window right now. A *rendering* of execution state, rebuilt as needed, never authoritative.
- **Long-term memory** — facts worth keeping across tasks ("this codebase uses pnpm", "customer prefers CSV exports"), stored retrievably.

```ts
type Checkpoint = {
  runId: string;
  step: number;
  plan: PlanStep[];
  completed: { step: number; toolCalls: ToolCall[]; summary: string }[];
  workingFacts: Fact[];       // distilled, not raw transcripts
  nextAction: PlanStep;
};

await checkpoints.save(runId, snapshot);  // after every completed step
```

## Resume from state, not transcript

When a run resumes — crash, deploy, human pause — we don't replay the conversation. We *render a fresh context* from the checkpoint: the goal, the plan with checkmarks, distilled summaries of completed steps, and the next action. This is the insight that fixed our reliability: **replaying transcripts accumulates noise; re-rendering from structured state stays clean at step 5 and step 85.** Context windows stopped being the limiting factor entirely.

## Distill aggressively, keep receipts

Raw tool outputs (a 400-line diff, a full API response) go to blob storage, referenced by ID. What enters the checkpoint is a summary plus the reference — the agent can re-fetch details when a later step genuinely needs them:

```
completed[12]: "Migrated orders table; 3 columns renamed (details: blob:a41f)"
```

This keeps checkpoints small, resumption cheap, and — the underrated benefit — gives humans a legible activity log for free. The run page showing plan-with-checkmarks and per-step summaries became our most-used debugging *and* trust-building surface.

Durable execution engines (Temporal and kin) pair naturally with this — steps as activities, checkpoints as workflow state. The agent is, after all, just a workflow whose next step is chosen by a model.
