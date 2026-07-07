---
title: "Designing AI-Native Interfaces"
date: "2026-06-24"
category: "AI Engineering"
image: "/images/blog/designing-ai-native-interfaces.svg"
excerpt: "The chat box was AI's MVP. The real work is the interface around the model: streaming as a design material, agents that render state instead of messages, and provenance as a UI affordance."
---

The chat box was AI's MVP — the minimum viable interface that proved large language models could be useful. But in 2026, shipping "a chatbot" is no longer product design; it's a placeholder for it. The teams winning right now are the ones treating the model as an engine and investing everything in the interface around it.

After a decade and a half of building enterprise frontends, I've come to believe AI-native design is the biggest interface shift since responsive design. Here's what it demands from us.

## Latency is a design material

Traditional frontends taught us to hide latency: skeleton loaders, optimistic updates, prefetching. LLM-powered products invert the problem — generation takes seconds, and users *watch it happen*.

That makes streaming a first-class design element, not a technical detail:

- **Stream tokens immediately.** Time-to-first-token matters more than total generation time for perceived speed. A response that starts in 300ms and finishes in 6 seconds feels faster than one that appears whole at 4 seconds.
- **Structure the stream.** Don't just pipe raw text. Stream into typed UI regions — a title slot, a summary block, a table that fills row by row. Vercel's AI SDK and React Server Components have made generative UI patterns like this genuinely practical.
- **Design the interruption.** Users should be able to stop, redirect, or refine mid-generation. A stop button is table stakes; steerable generation is the differentiator.

## From conversations to outcomes

The second shift: the industry is moving from *chat* to *agents* — systems that plan, call tools, and complete multi-step work. That changes the interface contract entirely.

A conversation renders messages. An agent needs to render **state**: what it's doing, what it did, what it wants permission to do next. The best agentic products expose a legible execution trace — tool calls, retrieved sources, intermediate reasoning summaries — without drowning users in noise.

My working rules for agent UX:

1. **Show the plan before the work** when the action is consequential; act silently when it's reversible.
2. **Make every claim inspectable.** If the answer cites a document, link the document. Grounding isn't just a retrieval strategy, it's a UI affordance.
3. **Escalate to a human with context.** The handoff moment — "I'm blocked, here's why, here's what I tried" — is where trust is won or lost.

## Retrieval is the new state management

RAG (retrieval-augmented generation) pipelines quietly became the backbone of every serious AI product: embed the corpus, retrieve what's relevant, ground the generation. As frontend architects we spent years mastering client state — Redux, TanStack Query, server cache invalidation. The new discipline is *context state*: what the model knows right now, where it came from, and how fresh it is.

This shows up in the interface as provenance. Users trust AI products that show their sources inline, distinguish retrieved fact from generated prose, and degrade gracefully when the corpus has no answer. "I don't know" — rendered honestly — converts better than a confident hallucination.

## Evals are the new tests

You wouldn't ship a frontend without tests; don't ship an AI feature without evals. Golden datasets, LLM-as-judge scoring, regression suites for prompts — this is CI for intelligence. The teams that treat prompt changes like schema migrations (versioned, tested, reviewed) ship faster precisely because they can change things without fear.

## The craft still matters most

Models will keep leapfrogging each other. The durable advantage is everything around them: information architecture, latency budgets, trust affordances, accessibility, performance. In other words — the same craft frontend engineers have been honing for twenty years, pointed at a new material.

The interface is where intelligence becomes a product. That's the layer I build.
