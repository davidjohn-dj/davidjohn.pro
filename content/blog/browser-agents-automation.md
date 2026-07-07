---
title: "Browser Agents: Automating the Web That Has No API"
date: "2025-06-19"
category: "AI Engineering"
excerpt: "Computer-use models can drive real UIs now. Where browser agents beat RPA, the reliability engineering they need, and the guardrails they demand."
---

A meaningful chunk of every enterprise's workflow runs through web UIs with no API: supplier portals, government forms, legacy admin panels. This year's computer-use models — agents that perceive screens and drive mouse and keyboard — finally make that automatable without brittle RPA scripts. We shipped our first production browser agent this quarter; notes from the trenches.

## Why this beats selector-based RPA

Traditional automation breaks when the DOM changes — a renamed class, a reordered form, and the script dies. Agent-driven automation navigates by *semantics*: "find the invoice upload section, attach the PDF, submit." When the portal redesigns, the agent adapts because it reads the page like a human, not like a query selector. Our supplier-portal integration survived two vendor redesigns that would have each killed the old Selenium version.

## The reliability engineering is the product

Raw agents wander. Production agents run inside a harness:

```ts
const run = await browserAgent.execute({
  goal: "Submit invoice INV-2211 on the Acme supplier portal",
  checkpoints: [
    { after: "login", assert: "dashboard visible" },
    { after: "upload", assert: "INV-2211 appears in attachments list" },
    { before: "final submit", require: "human_approval" },
  ],
  budget: { maxSteps: 40, maxMinutes: 8 },
  onDrift: "pause_and_snapshot",
});
```

Checkpoints turn a 30-step black box into verifiable segments. Budgets prevent the infinite-loop failure mode (agents *will* retry a broken button forever). And the drift handler — screenshot plus state dump when the agent's plan stops matching the page — is what makes failures debuggable instead of mysterious.

## Guardrails are non-negotiable

An agent with your credentials in a real browser can do real damage. Ours run with: dedicated low-privilege accounts per integration, an allowlist of domains the session can touch, human approval gates before any irreversible action (submissions, payments, deletions), and full session recordings for audit. Treat the agent like a new hire on their first day: capable, supervised, and nowhere near the production database.

The honest scorecard: 92% unattended success on our portal workflow, with failures paused for human pickup rather than silently wrong. That's not full automation — it's a 10x reduction in human minutes per invoice, which is the metric that actually matters.
