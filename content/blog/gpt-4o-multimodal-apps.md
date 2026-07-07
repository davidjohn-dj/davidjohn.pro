---
title: "GPT-4o and Practical Multimodal: Beyond the Demo"
date: "2024-05-23"
category: "AI Engineering"
excerpt: "Half the latency, half the price, and vision that's finally production-grade. Real use cases: document extraction, UI understanding, and screenshot-driven support."
---

GPT-4o's launch demos were all voice — flirty assistant, real-time translation. The production story for most of us is quieter and better: GPT-4-class intelligence at half the price and half the latency, with vision good enough to build on.

## Vision that earns its keep

The use case that immediately paid off for a client: document extraction that OCR pipelines have fumbled for years. Receipts, invoices, handwritten forms — photographed badly, skewed, coffee-stained:

```ts
const res = await openai.chat.completions.create({
  model: "gpt-4o",
  messages: [{
    role: "user",
    content: [
      { type: "text",
        text: "Extract line items as JSON: {description, qty, unit_price}. Flag any field you can't read clearly." },
      { type: "image_url",
        image_url: { url: `data:image/jpeg;base64,${photo}` } },
    ],
  }],
  response_format: { type: "json_object" },
});
```

The old pipeline was OCR, then regex, then heuristics, then a human anyway — brittle at every stage. The model reads layout, tables, and handwriting *in context*: it knows the smudged number next to "Total" should roughly equal the sum of the lines. Our extraction accuracy went from 81% (OCR pipeline) to 96%, measured on the same 500-document eval set.

## Screenshot-driven support

Second win: letting users attach screenshots to support chat. The model identifies the screen, the error state, and often the misconfiguration directly — "your webhook URL is missing the https://" from a settings-page screenshot. Support resolution time for config issues dropped by half.

## Practical constraints

Cost scales with image detail — use `detail: "low"` (fixed ~85 tokens) for classification tasks, high detail only for reading fine print. Latency lands around 2–4s for a photo, fine for async flows, tight for real-time. And vision hallucinates like text does: it will confidently read a blurry 8 as 3, so keep confidence flags in the prompt ("flag any field you can't read") and route flagged extractions to human review.

The pattern to internalize: multimodal isn't a new product category — it's the removal of the preprocessing layer between the messy world and your existing pipelines.
