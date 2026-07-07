---
title: "AI Features on a Static Site: Edge Functions and Client Models"
date: "2026-03-19"
category: "Performance"
excerpt: "You don't need a server to ship AI features. Edge streaming proxies, WebGPU embeddings in the browser, and keeping the static-site speed you paid for."
---

This site is statically exported — HTML on a CDN, no server, deliberately. But "static" no longer means "dumb": between edge functions and in-browser models, you can ship real AI features without surrendering the architecture. Here's the pattern set.

## Edge functions as the AI seam

The one thing a static site can't do is hold an API key. A minimal edge function fixes that without a server fleet:

```ts
// edge/chat.ts — runs at the CDN edge, cold-starts in ms
export default async function handler(req: Request) {
  const { messages } = await req.json();

  if (await rateLimit.exceeded(getClientId(req)))
    return new Response("Slow down", { status: 429 });

  const result = await streamText({
    model: openai("gpt-4o-mini"),
    system: SITE_ASSISTANT_PROMPT,
    messages: messages.slice(-8),   // static site, stateless window
  });
  return result.toTextStreamResponse();
}
```

The static pages stay static — the function exists only for the AI call, streams tokens from a location near the user, and scales to zero. Ship the key server-side, the rate limit at the edge, and nothing else changes.

## Embeddings in the browser: search without a backend

The quieter unlock is WebGPU. Small embedding models (30–120MB) now run client-side fast enough for real search:

```ts
import { pipeline } from "@huggingface/transformers";

const embed = await pipeline("feature-extraction",
  "Xenova/all-MiniLM-L6-v2", { device: "webgpu" });

// index built at deploy time, shipped as a static JSON file
const results = rank(await embed(query), prebuiltIndex);
```

The index is generated in CI from your content — for a few hundred pages it's under a megabyte, cached like any asset. Semantic search over the whole site with zero per-query cost, zero servers, and it works offline. Lazy-load the model on first focus of the search box and the reading experience pays nothing.

## Keep the performance contract

The rules that keep this honest: AI features load *after* interaction intent (focus, click — never on page load), the model download shows real progress, and every feature degrades — search falls back to the prebuilt keyword index, the assistant to a contact link. Core Web Vitals shouldn't know your AI exists. Static-site discipline was always about respecting the reader's time and bandwidth; AI features earn their place by honoring the same contract.
