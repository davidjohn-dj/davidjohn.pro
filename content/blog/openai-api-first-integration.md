---
title: "Integrating GPT-3 into a Product: Lessons from the First Build"
date: "2022-11-17"
category: "AI Engineering"
excerpt: "We added GPT-3 drafting to a client's CRM. Prompt design, cost control, latency UX, and the failure modes nobody warns you about."
---

We just shipped our first LLM feature: GPT-3-powered email drafting inside a client's CRM. It works, users like it, and almost everything I assumed at the start was wrong. Notes for the next team.

## The API is easy; the product is not

The integration is genuinely trivial:

```js
const completion = await openai.createCompletion({
  model: "text-davinci-003",
  prompt: buildPrompt(contact, dealStage, userNotes),
  max_tokens: 400,
  temperature: 0.7,
});
```

Everything hard lives around this call: what goes in the prompt, what you do when the output is wrong, and who pays for it.

## Prompts are code — treat them like it

Our prompt went through eleven revisions. What moved the needle: giving the model a role and constraints ("You write concise, warm sales follow-ups. Never invent facts about the customer. 120 words max."), injecting *structured* context rather than raw notes, and showing one example of the desired output format. We keep prompts in versioned template files with the variables explicit — prompt changes go through code review like anything else.

## Latency is a UX problem you must design for

Completions take 2–6 seconds. A spinner that long feels broken. We stream tokens instead (`stream: true`, Server-Sent Events) and render text as it arrives — perceived latency dropped from "is it stuck?" to "it's typing." Also: always provide an escape hatch. Users edit every draft; the feature is autocomplete, not automation.

## Cost control from day one

davinci is ~$0.02 per 1K tokens and enthusiastic users generate a *lot* of drafts. We added: per-org monthly quotas, `max_tokens` caps, prompt truncation for long histories, and logging of token usage per request into the analytics pipeline. The first week's bill informed the pricing tier — do this math before launch, not after.

## Failure modes to expect

The model occasionally fabricates details (a discount that doesn't exist), so we banner every draft as AI-generated and require human send. Rate limits (429s) need retry-with-backoff. And prompt injection is real: user notes containing "ignore previous instructions" genuinely worked until we sandboxed inputs. This technology is going to be everywhere — worth learning its sharp edges now.
