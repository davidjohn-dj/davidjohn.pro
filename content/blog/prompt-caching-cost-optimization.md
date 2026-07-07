---
title: "Prompt Caching: The Easiest 80% Cost Cut You'll Ship This Year"
date: "2024-08-22"
category: "AI Engineering"
excerpt: "Anthropic's prompt caching discounts repeated context by 90%. Structuring prompts for cache hits, and the ordering rule that makes or breaks it."
---

Anthropic shipped prompt caching this month, and it's the rare optimization that's both dramatic and nearly free to adopt: cached input tokens cost 90% less and process ~4x faster. If your app re-sends the same system prompt, tool definitions, or document context every call — and it does — this is found money.

## How it works

You mark a prefix of your prompt as cacheable; the provider stores the processed representation for ~5 minutes, refreshed on each hit:

```ts
const res = await anthropic.messages.create({
  model: "claude-3-5-sonnet-20240620",
  system: [
    {
      type: "text",
      text: longSystemPrompt + toolInstructions + styleGuide, // ~8K tokens
      cache_control: { type: "ephemeral" },
    },
  ],
  messages: conversationSoFar,
});
```

First call pays a 25% premium to write the cache; every subsequent call within the window reads it at 10% of the price. For a support copilot making thousands of calls per hour against an 8K-token static prefix, the arithmetic is transformative — our bill for that service dropped 73%.

## The ordering rule that decides everything

Caching matches *prefixes*. One rule drives all prompt structure now: **stable content first, volatile content last.**

```
[system prompt]          <- never changes: cache
[tool definitions]       <- never changes: cache
[knowledge/documents]    <- changes per session: cache breakpoint
[conversation history]   <- grows per turn
[current user message]   <- always new
```

Anything dynamic injected *above* static content — a timestamp in the system prompt, a user name in the instructions — invalidates everything below it. We found a `Current date: ${new Date()}` line at the top of a system prompt was silently costing us the entire cache. Move dynamics down or out.

## Design consequences

Long few-shot example blocks and fat tool schemas stop being cost problems — cached, they're nearly free, so you can afford *better* prompts. RAG changes too: for documents queried repeatedly in a session, stuffing them in a cached prefix can beat per-query retrieval. OpenAI's equivalent (automatic, no markup) landed shortly after, with the same prefix rule. Restructure once, save indefinitely.
