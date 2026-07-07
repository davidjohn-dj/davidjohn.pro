---
title: "Running LLMs Locally with Ollama: What's Actually Usable"
date: "2023-12-07"
category: "AI Engineering"
excerpt: "Mistral 7B on a MacBook is genuinely useful. Setup in two commands, the OpenAI-compatible dev loop, and honest expectations by model size."
---

A year ago local LLMs were a research curiosity. This December, `ollama run mistral` gives you a genuinely useful 7B model on a MacBook in about ninety seconds. Here's what local models are actually good for right now.

## Setup is two commands

```bash
curl -fsSL https://ollama.ai/install.sh | sh
ollama run mistral
```

Ollama handles model download, quantization (GGUF, 4-bit by default), and GPU/Metal acceleration. Mistral 7B runs at ~30 tokens/sec on an M1 Pro — chat-speed. It also exposes an HTTP API:

```bash
curl http://localhost:11434/api/generate -d '{
  "model": "mistral",
  "prompt": "Explain database indexing to a junior dev in 3 sentences."
}'
```

## The killer use case: a free dev loop

My actual daily use isn't chat — it's development. Building an LLM feature means hundreds of iteration calls while you tune prompts, parsing, and streaming. Pointing that loop at localhost costs nothing and works on a plane:

```ts
const client = new OpenAI({
  baseURL: "http://localhost:11434/v1",  // OpenAI-compatible endpoint
  apiKey: "unused",
});
```

Develop against Mistral locally; flip the base URL to OpenAI for staging. The prompt that works on a 7B usually works *better* on GPT-4 — the reverse migration is painless.

## Honest expectations by size

**7B (Mistral)**: solid summarization, classification, extraction, simple Q&A; wobbly at multi-step reasoning and strict formats. **13B**: noticeably better instruction-following if you have 16GB+. **34B/70B**: approaching GPT-3.5 quality but need serious hardware. The pattern: narrow, well-scoped tasks locally; frontier reasoning stays in the cloud.

## Why this matters beyond hobbyists

Privacy-sensitive workloads (medical, legal — data never leaves the machine), offline/edge deployments, and cost-free evaluation pipelines. The gap to frontier models is real but shrinking monthly, and Mistral 7B outperforming last year's much larger models suggests where this goes. Local inference is becoming a legitimate tier in the architecture, not a toy.
