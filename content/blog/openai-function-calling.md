---
title: "Function Calling: GPT as an Intent Parser, Not a Guesser"
date: "2023-06-15"
category: "AI Engineering"
excerpt: "OpenAI's function calling turns 'parse the user's request' into a schema contract. Structured extraction, tool dispatch, and the validation you still need."
---

Until this month, getting structured data out of GPT meant prompt-begging ("respond ONLY with valid JSON") and praying. OpenAI's new function calling changes the contract: you declare schemas, the model returns arguments that fit them.

## The core loop

```ts
const tools = [{
  name: "create_calendar_event",
  description: "Schedule a meeting on the user's calendar",
  parameters: {
    type: "object",
    properties: {
      title: { type: "string" },
      start: { type: "string", format: "date-time" },
      duration_minutes: { type: "number" },
      attendees: { type: "array", items: { type: "string" } },
    },
    required: ["title", "start"],
  },
}];

const res = await openai.chat.completions.create({
  model: "gpt-3.5-turbo-0613",
  messages: [{ role: "user",
    content: "set up 30 min with sara and raj tuesday at 2 about the Q3 roadmap" }],
  functions: tools,
});

const call = res.choices[0].message.function_call;
// { name: "create_calendar_event",
//   arguments: '{"title":"Q3 Roadmap","start":"2023-06-20T14:00:00", ...}' }
```

The model decides *whether* to call, *which* function, and extracts arguments from freeform language. Execute the function, append the result as a `function` role message, call the model again for the natural-language wrap-up — that's the whole tool-use loop.

## It's also the best structured-extraction API

Even with no function to execute, declare a schema and get typed extraction from unstructured text — contact details from an email, line items from an invoice description. It's dramatically more reliable than JSON-by-prompt because the model was fine-tuned for the format.

## Validate anyway

The arguments are *usually* schema-valid. Usually. Parse with Zod, not trust:

```ts
const parsed = EventSchema.safeParse(JSON.parse(call.arguments));
if (!parsed.success) {
  // feed the validation errors back to the model and retry once
}
```

The retry-with-errors pattern fixes most failures — the model corrects itself well when shown what was wrong.

## Design guidance from three weeks in

Fewer, well-described functions beat many overlapping ones (description quality *is* accuracy). Keep parameters flat where possible — deep nesting degrades extraction. And treat every call as a proposal: consequential actions (sending, deleting, paying) get a human confirmation step rendered from the parsed arguments. The model parses intent; your product still owns the decision.
