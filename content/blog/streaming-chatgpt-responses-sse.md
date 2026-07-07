---
title: "Streaming LLM Responses with Server-Sent Events"
date: "2023-02-09"
category: "AI Engineering"
excerpt: "A 5-second wall of latency becomes a live typing effect. Wiring OpenAI streaming through SSE to a React frontend, with cancellation."
---

The difference between an AI feature that feels broken and one that feels alive is streaming. Total generation time might be five seconds either way — but tokens appearing at 300ms reframe the wait entirely. Here's the full pipeline.

## Server: proxy the stream over SSE

Never call OpenAI from the browser (your key leaks). Proxy it, forwarding chunks as Server-Sent Events:

```ts
// pages/api/chat.ts
export default async function handler(req: Request) {
  const stream = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: req.body.messages,
    stream: true,
  });

  const encoder = new TextEncoder();
  return new Response(
    new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content ?? "";
          if (text) controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ text })}\n\n`)
          );
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      },
    }),
    { headers: { "Content-Type": "text/event-stream" } }
  );
}
```

## Client: append as you receive

```tsx
async function streamChat(messages, onToken, signal) {
  const res = await fetch("/api/chat", {
    method: "POST",
    body: JSON.stringify({ messages }),
    signal,
  });
  const reader = res.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    for (const line of decoder.decode(value).split("\n\n")) {
      const data = line.replace(/^data: /, "").trim();
      if (!data || data === "[DONE]") continue;
      onToken(JSON.parse(data).text);
    }
  }
}
```

In React, `onToken` appends to state — and render the growing text with a blinking caret; users read along as it generates.

## The details that separate demo from product

**Cancellation**: pass an `AbortController.signal` and wire a stop button — users bail on bad generations constantly, and every abandoned stream you keep generating is money. **Chunk boundaries**: SSE frames can split across network chunks; buffer partial lines instead of assuming one event per read. **Autoscroll**: pin to bottom while streaming, but stop pinning the moment the user scrolls up — nothing is more hostile than fighting the scrollbar. Small things; they're the product.
