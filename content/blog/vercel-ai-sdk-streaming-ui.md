---
title: "The Vercel AI SDK: Streaming Chat UIs in an Afternoon"
date: "2024-02-15"
category: "AI Engineering"
excerpt: "useChat handles the streaming, state, and abort logic you were hand-rolling. Provider-agnostic backends and the patterns for production chat."
---

I've written the SSE-parsing, state-appending, abort-handling chat plumbing from scratch at least four times. The Vercel AI SDK packages exactly that layer — and having migrated a production copilot to it, I'm not writing it a fifth time.

## The whole frontend

```tsx
"use client";
import { useChat } from "ai/react";

export function Copilot() {
  const { messages, input, handleInputChange, handleSubmit,
          isLoading, stop } = useChat({ api: "/api/chat" });

  return (
    <div>
      {messages.map((m) => (
        <Message key={m.id} role={m.role} content={m.content} />
      ))}
      <form onSubmit={handleSubmit}>
        <input value={input} onChange={handleInputChange} />
        {isLoading && <button type="button" onClick={stop}>Stop</button>}
      </form>
    </div>
  );
}
```

Streaming state, message history, input binding, cancellation — the hook owns all of it. Messages update token-by-token as the stream arrives.

## The whole backend

```ts
// app/api/chat/route.ts
import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";

export async function POST(req: Request) {
  const { messages } = await req.json();
  const result = await streamText({
    model: openai("gpt-4-turbo"),
    system: "You are a support copilot for Acme. Cite doc links.",
    messages,
  });
  return result.toAIStreamResponse();
}
```

The provider abstraction is the strategic part: `openai(...)` swaps for `anthropic(...)` or a local model with one line, and the wire protocol stays identical. Model routing stops being a frontend concern entirely.

## Production notes from the migration

**Persist on finish**: the `onFinish` callback server-side is where completed messages go to the database — don't trust the client to report back. **Tool calls stream too**: `streamText` surfaces tool invocations mid-stream, so you can render "Searching orders…" states as the model works. **Rate-limit by user before the model call**, not after — streaming responses make post-hoc limits awkward. And keep your system prompt server-side always; the client sends only user messages.

The hand-rolled version taught me how streaming works. The SDK version is 80% less code and handles the edge cases (chunk boundaries, abort mid-tool-call) that mine didn't. Learn it once by hand, then use the library.
