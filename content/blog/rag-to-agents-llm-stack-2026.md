---
title: "From RAG to Agents: The LLM Product Stack in 2026"
date: "2026-05-12"
category: "AI Engineering"
image: "/images/blog/rag-to-agents-llm-stack-2026.svg"
excerpt: "Model routers, hybrid retrieval, agentic state machines, and evals-as-CI - a working map of the modern LLM stack, and why the experience layer is the moat."
---

Two years ago, "adding AI" to a product meant wrapping a completion API in a text area. Today the stack has matured into distinct, composable layers — and knowing where each concern lives is the difference between a demo and a durable product. Here's the map I use when architecting LLM systems in 2026.

## Layer 1: The model tier is now a portfolio

Nobody serious runs on a single model anymore. Production systems route across a portfolio:

- **Frontier models** for complex reasoning, planning, and code — where quality justifies cost.
- **Small, fast models** for classification, extraction, routing, and summarization — often 10–50x cheaper with negligible quality loss on narrow tasks.
- **Embedding models** as standalone infrastructure for search and retrieval.

The architectural pattern that emerged is the **model router**: a thin service that classifies each request and dispatches it to the cheapest model that clears the quality bar. Treat model choice like you treat CDN caching — an optimization layer, invisible to the product.

## Layer 2: Retrieval grew up

RAG stopped being a hackathon trick and became a data engineering discipline:

- **Hybrid retrieval** (dense vectors + keyword/BM25 + reranking) beats pure vector search on virtually every real corpus.
- **Chunking is product-specific.** Legal contracts, medical protocols, and codebases all demand different segmentation strategies. The naive fixed-window chunk is almost always the wrong answer.
- **Freshness pipelines matter more than index size.** A retrieval system that's a week stale erodes trust faster than one that's slightly less comprehensive.

The mental model I give teams: retrieval is your application's working memory, and it deserves the same rigor as your database schema.

## Layer 3: Agents are workflow engines

The agentic layer — models that plan, call tools, and iterate — is where 2026's most interesting products live. But the engineering reality is unglamorous in the best way: an agent is a state machine with an LLM deciding the transitions.

What production agents need:

1. **Typed tool contracts.** Every tool call validated against a schema; every failure fed back to the model as structured context, not a stack trace.
2. **Checkpointing and resumability.** Long-running agents fail mid-flight. Persist state at every step so recovery doesn't mean starting over.
3. **Budgets.** Token budgets, tool-call budgets, wall-clock budgets. An agent without limits is a cost incident waiting to happen.
4. **Human-in-the-loop gates** for consequential actions — deploys, payments, external communications.

Protocols like MCP (Model Context Protocol) are standardizing how agents discover and call tools, which is quietly doing for AI what REST did for services: making integrations boring, in the best possible way.

## Layer 4: The experience layer is the moat

Everything below this layer is being commoditized at a startling pace. What isn't commoditized: the product experience built on top.

- **Streaming-first UI** — time-to-first-token as a core web vital.
- **Generative interfaces** — model output rendered as structured, interactive components rather than markdown walls.
- **Provenance and trust** — sources inline, confidence signaled honestly, "I don't know" as a designed state.
- **Graceful degradation** — when the model is slow, wrong, or down, the product still works.

This is where frontend architecture becomes AI architecture. The skills transfer directly: state management becomes context management, API design becomes tool design, and performance budgets now include tokens per interaction.

## The uncomfortable truth about evals

Every team says they'll add evals later. Later never comes, and then a prompt tweak silently breaks a workflow that customers depend on. Evals-as-CI — golden datasets, automated scoring, regression gates on every prompt and model change — is the single highest-leverage practice in AI engineering today. Start there, not with the fancy agent.

## Where this goes

The trajectory is clear: models keep getting cheaper and more capable, the middle layers keep standardizing, and the premium keeps shifting to teams who can turn raw intelligence into products people trust. That's an interface problem, an architecture problem, and a craft problem — and it's exactly where I like to work.
