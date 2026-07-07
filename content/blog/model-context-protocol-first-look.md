---
title: "MCP: A USB Port for AI Context"
date: "2024-11-28"
category: "AI Engineering"
excerpt: "Anthropic's Model Context Protocol standardizes how assistants reach tools and data. Building a server in 40 lines, and why the M-by-N problem needed this."
---

Anthropic released the Model Context Protocol this week, and it targets the exact pain every AI team has: M assistants times N data sources equals M×N bespoke integrations. MCP's bet is the USB move — one protocol between any client and any capability server, written once, usable everywhere.

## The model

An **MCP server** exposes three things over a standard transport (stdio locally, SSE remote): *tools* (functions the model can invoke), *resources* (data it can read), and *prompts* (reusable templates). Any **MCP client** — Claude Desktop today, presumably many hosts tomorrow — can connect, discover capabilities, and use them. The client doesn't know it's talking to Postgres or GitHub or your internal CRM; it sees typed tools.

## A real server in 40 lines

```ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({ name: "orders", version: "1.0.0" });

server.tool(
  "lookup_order",
  "Find an order by ID or customer email",
  { query: z.string().describe("Order ID like ORD-1234, or an email") },
  async ({ query }) => {
    const order = await db.orders.search(query);
    return { content: [{ type: "text", text: JSON.stringify(order) }] };
  }
);

await server.connect(new StdioServerTransport());
```

Register it in Claude Desktop's config, and Claude can look up orders mid-conversation — with your code controlling exactly what's reachable. The schema-first tool definitions will feel familiar; it's function calling, standardized across the wire.

## Why the standard matters more than the SDK

Without MCP, connecting your order system to Claude, your internal copilot, and next year's agent framework means three integrations drifting apart. With it: one server, three clients — and the *server* side owns auth, filtering, and audit, where it belongs. The early catalog (filesystem, GitHub, Postgres, Slack) suggests where this goes: an ecosystem of composable capabilities instead of per-app plugin walled gardens.

Open questions are real — remote auth is underspecified, and OpenAI hasn't signed on. But the shape is right, and the integration tax is universal. I've moved our internal tools to MCP servers; worst case, it's a clean plugin architecture. Best case, it's the standard.
