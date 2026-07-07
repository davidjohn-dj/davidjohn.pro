---
title: "Generative UI: Streaming Components, Not Markdown"
date: "2025-08-14"
category: "AI Engineering"
excerpt: "The model picks the component, your code renders it. Tool-call-driven UI with streamUI, schema-constrained props, and where to draw the line."
---

Chat products are hitting the ceiling of the markdown wall — asking for a flight and receiving a bulleted list is a search result cosplaying as an assistant. The next step is **generative UI**: the model composes an interface from your component library, streamed into the conversation. Having shipped this for a booking flow, here's the architecture.

## The model picks components, not pixels

The mechanism is tool calls. Each renderable component is a tool with a Zod-schema for props; the model "calls" it, and your code renders the real component:

```tsx
import { streamUI } from "ai/rsc";

const result = await streamUI({
  model: openai("gpt-4o"),
  prompt: userMessage,
  text: ({ content }) => <Prose>{content}</Prose>,
  tools: {
    showFlights: {
      description: "Display flight options for a route and date",
      parameters: z.object({
        flights: z.array(FlightSchema).max(5),
        highlight: z.string().optional()
          .describe("flight id to recommend, if any"),
      }),
      generate: async function* ({ flights, highlight }) {
        yield <FlightsSkeleton count={flights.length} />;
        const enriched = await addLivePricing(flights);
        return <FlightGrid flights={enriched} highlight={highlight} />;
      },
    },
  },
});
```

The critical property: **the model never generates markup.** It selects components and fills schema-validated props; your design system renders. Brand consistency, accessibility, and interaction behavior stay in code you own — the model contributes judgment about *what to show*.

## Interactions re-enter the loop

The rendered `FlightGrid` is a real client component — its "Select" button doesn't paste text into the chat; it dispatches state and appends a structured event the model sees on the next turn (`user selected flight BA-117`). The conversation becomes a mixed-initiative loop: prose when talking, components when choosing, both sharing one context.

## Where to draw the line

Lessons from production: keep the component vocabulary *small* (we shipped six; the model uses them well — at twenty it would misfire), constrain props aggressively (`max(5)` flights isn't decoration, it's the defense against a 40-row dump), and always stream a skeleton first — perceived latency is the whole game. And keep plain text as the fallback for everything outside the vocabulary; a model forced to use a component when none fits will abuse the closest one.

The interface layer is becoming a negotiation between model judgment and design-system constraint. Get the contract right and it genuinely feels like the product thinks.
