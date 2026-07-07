---
title: "MCP Servers in Production: Auth, Scoping, and Audit"
date: "2025-03-13"
category: "AI Engineering"
excerpt: "OpenAI adopted MCP and the protocol won. Now the real work: building capability servers that are safe to point an agent at."
---

OpenAI adopted MCP this month, which settles the standards question — the Model Context Protocol is how agents will reach tools and data. The prototype phase is over; the engineering question now is making capability servers *safe to point an agent at*. Three lessons from moving ours to production.

## Tools are an attack surface — scope like one

An agent connected to your MCP server will eventually be driven by attacker-influenced input (a malicious email it's summarizing, a poisoned document). Design tools assuming hostile invocation:

```ts
server.tool(
  "search_tickets",
  "Search support tickets by keyword",
  {
    query: z.string().max(200),
    // NOT: org_id as a parameter the model supplies
  },
  async ({ query }, ctx) => {
    const orgId = ctx.session.orgId;   // tenant from authenticated session
    const results = await db.tickets.search(query, { orgId, limit: 20 });
    return asContent(redactPII(results));
  }
);
```

The rule: **identity and tenancy come from the session, never from tool arguments.** A model that can pass `org_id` is a model that can be prompt-injected into passing someone else's. Same for write scopes — separate read servers from write servers so a compromised session has a blast radius, not a kingdom.

## Read-only by default, capabilities by grant

We ship every server with a capability manifest resolved at connection time: this session gets `tickets:read` and `kb:read`; the escalation workflow adds `tickets:write` after human approval. It mirrors OAuth scopes because it *is* the same problem — delegated authority for a principal that can be socially engineered.

## Audit everything, because the agent can't testify

Every tool invocation logs: session principal, tool, arguments, result size, and the conversation ID that triggered it. When someone asks "why did the agent close ticket 4412?", the audit trail is the only witness. This log turned out to have a second life: it's the best dataset we have for improving tool descriptions — you can see exactly where the model chose the wrong tool or malformed arguments.

The protocol made connection trivial. The moat is now the unglamorous part: servers with real authz, real observability, and interfaces designed for a caller that is brilliant, literal-minded, and occasionally hijacked.
