---
title: "Structured LLM Outputs: Zod as the Contract"
date: "2024-06-13"
category: "AI Engineering"
excerpt: "Schema-first generation with generateObject, retry-with-errors, and why your LLM boundary should look exactly like your API boundary."
---

The most fragile line in any LLM integration is `JSON.parse(response)`. The most robust version of that line doesn't parse at all — it *validates against a schema the model was constrained by*. Here's the pattern that's become my default boundary.

## Schema-first with the AI SDK

```ts
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

const TicketTriage = z.object({
  category: z.enum(["billing", "bug", "feature_request", "account"]),
  severity: z.enum(["low", "medium", "high", "critical"]),
  summary: z.string().max(200),
  customer_sentiment: z.number().min(1).max(5),
  needs_human: z.boolean(),
});

const { object } = await generateObject({
  model: openai("gpt-4o"),
  schema: TicketTriage,
  prompt: `Triage this support ticket:\n${ticketBody}`,
});

// object is typed AND validated: TicketTriage
```

The schema does triple duty: it constrains generation (converted to the provider's structured-output mode under the hood), validates the result at runtime, and types it at compile time. One definition, three guarantees.

## Design schemas for models, not databases

Lessons from a year of this: **enums beat free strings** everywhere you can enumerate — `z.enum([...])` turns classification drift into impossibility. **Descriptions are prompts**: `.describe("1=furious, 5=delighted")` on a field measurably improves that field's accuracy. **Flat beats nested** — extraction quality degrades with depth, so prefer two shallow calls over one deep schema. And **make uncertainty representable**: an `unclear: z.boolean()` or nullable fields with "use null if not stated" beats forcing the model to fabricate.

## The retry that fixes most failures

Even with structured output modes, validation occasionally fails. Feed the errors back:

```ts
catch (e) {
  if (e instanceof ZodError && attempt < 2) {
    prompt += `\nPrevious attempt failed validation:\n${e.message}\nCorrect these issues.`;
    return retry(prompt, attempt + 1);
  }
  throw e; // then dead-letter queue, not silent default
}
```

One retry with explicit errors resolves ~90% of failures in our logs. The framing to leave with: treat the model like any external API — typed contract at the boundary, validation on every response, and explicit failure handling. The magic stays inside the box; the box has a schema.
