---
title: "Multi-Model Strategy: What Claude 3 Changes"
date: "2024-03-21"
category: "AI Engineering"
excerpt: "Claude 3 ends the single-vendor era: 200K context, vision, and Haiku's price point. The provider-abstraction layer every LLM product now needs."
---

Anthropic shipped the Claude 3 family this month — Opus, Sonnet, Haiku — and for the first time, GPT-4 has a peer (and on some of our workloads, better than a peer). The engineering consequence isn't "switch vendors"; it's that single-vendor architectures are now leaving money and quality on the table.

## What moved

Three things stand out from our evaluations. **Opus** matches or beats GPT-4 on long-document analysis and nuanced writing. **The 200K context window** is real and usable — we fed entire contract sets that previously needed RAG plumbing. And **Haiku** is the sleeper: near-instant, extremely cheap, and *good enough* for classification, routing, extraction, and summarization — the workhorse tier where most production tokens are actually spent.

## The abstraction layer is now mandatory

If your code calls `openai.chat.completions` directly in fifty places, every model decision is a refactor. The fix is one seam:

```ts
type LLMRequest = {
  system: string;
  messages: Message[];
  tools?: ToolDef[];
  maxTokens?: number;
};

interface LLMProvider {
  complete(req: LLMRequest): Promise<LLMResponse>;
  stream(req: LLMRequest): AsyncIterable<Chunk>;
}

// providers/anthropic.ts, providers/openai.ts implement it
const provider = providers[route(task)];  // decided per task, not per app
```

With the seam in place, routing becomes policy: Haiku for the extraction pipeline, Sonnet for chat, Opus/GPT-4 for the hard reasoning paths. Our cost per feature dropped ~60% moving the high-volume tiers to Haiku with no measurable quality loss — that's the concrete payoff.

## Migration notes worth knowing

The APIs are annoyingly different in small ways: Anthropic separates `system` from the messages array, requires `max_tokens`, and handles tool results as user-role content blocks. Prompts don't transfer verbatim either — Claude responds better to XML-tagged structure (`<document>...</document>`) where GPT tolerates looser formatting. Budget a day of prompt re-tuning per migrated workload, and run your eval set against both before flipping any route.

The era of "we're an OpenAI shop" is over. The era of *model portfolios* — routed, evaluated, priced per task — starts now.
