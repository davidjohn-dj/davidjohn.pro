---
title: "Multi-Agent Systems: Orchestrate, Don't Emerge"
date: "2024-07-18"
category: "AI Engineering"
excerpt: "Planner-executor, generator-critic, and explicit handoffs beat autonomous agent swarms. Patterns from building a working document pipeline."
---

"Multi-agent" conjures images of AI teams autonomously collaborating. What ships in production is much more boring and much more reliable: **workflow engines where some steps are LLM calls with distinct roles**. After building a document-processing pipeline this quarter, here are the patterns that held up.

## Planner-executor: separate thinking from doing

One call plans; code orchestrates; focused calls execute:

```ts
const plan = await generateObject({
  model: openai("gpt-4o"),
  schema: z.object({
    steps: z.array(z.object({
      task: z.enum(["extract_parties", "extract_dates",
                    "summarize_obligations", "flag_risks"]),
      relevant_sections: z.array(z.string()),
    })),
  }),
  prompt: `Plan the analysis for this contract:\n${overview}`,
});

for (const step of plan.steps) {
  results[step.task] = await executors[step.task](step.relevant_sections);
}
```

Each executor has a narrow prompt, its own schema, and — this is the unlock — its own *eval set*. When risk-flagging regresses, you debug one focused prompt, not an entangled mega-agent.

## Generator-critic: the second opinion that works

The most reliable quality improvement per dollar I know:

```ts
const draft = await generate(input);
const critique = await critic(draft, rubric);   // different role, fresh context
if (critique.verdict === "revise") {
  return await generate(input, critique.issues); // one revision pass
}
```

A critic with a rubric catches what the generator can't see from inside its own context. One revision cycle captures most of the gain; more cycles mostly burn tokens.

## Handoffs must be schemas

Agent A's output is Agent B's input — make that contract explicit with Zod, exactly like a service boundary. Freeform text handoffs are where multi-agent systems rot: ambiguity compounds at every hop.

## The anti-pattern: emergent autonomy

Agents messaging each other in loops, deciding among themselves who does what — demos beautifully, debugs never. Error attribution becomes archaeology; costs become weather. The rule I've settled on: **the orchestration graph lives in code you can read; intelligence lives inside the nodes.** If you can't draw your system's control flow on a whiteboard, you don't have a multi-agent system — you have a séance.
