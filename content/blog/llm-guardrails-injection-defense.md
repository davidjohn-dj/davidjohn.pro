---
title: "Guardrails in Depth: Designing for Prompt Injection"
date: "2025-11-13"
category: "AI Engineering"
excerpt: "Injection isn't solved and won't be. The lethal trifecta, capability-based defenses, and the layers that make attacks expensive instead of impossible."
---

Every month someone demonstrates a new prompt-injection path: instructions hidden in a résumé, in an email an agent summarizes, in white-on-white webpage text. The uncomfortable truth after three years: **injection is not solvable at the model layer.** Models follow instructions; attackers write instructions. Security comes from architecture that assumes the model *will* be compromised. Here's the defense-in-depth we run.

## Name the lethal trifecta

An agent becomes dangerous when it combines three things: access to private data, exposure to untrusted input, and the ability to exfiltrate (send messages, make requests, write files). Remove any leg and injection downgrades from breach to nuisance. This framing turns vague worry into a design checklist per agent: *which legs does this one have, and which can I remove?*

```
Email summarizer:   private data ✓  untrusted input ✓  exfiltration ✗ (read-only, renders locally)
Support agent:      private data ✓  untrusted input ✓  exfiltration ✓ ← needs the full treatment
```

## Capabilities, not instructions

Telling the model "never reveal other customers' data" is a suggestion. Not *having* the data is a control:

```ts
// tenant scoping enforced in the tool, invisible to the model
async ({ query }, ctx) => {
  return db.search(query, { tenantId: ctx.session.tenantId });
}
```

Same for actions: irreversible operations (send, pay, delete) route through human-approval gates rendered from *structured arguments* — the human approves what will actually happen, not the model's description of it.

## Contain, detect, and rehearse

The remaining layers: **mark untrusted content** structurally (documents wrapped in delimiters with a standing instruction that content inside is data, not directives — imperfect, still worth having), **scan outputs** for signals like URLs with query strings assembled from private context (a classic exfiltration channel), and **red-team on a schedule** — our quarterly exercise plants injections in test documents and measures which layers catch them. Layer catch-rates, not vibes, decide where hardening effort goes.

The goal isn't an uninjectable system — nobody has one. It's making the attack *expensive* and the blast radius *small*: an attacker who succeeds gets one tenant's read-scope for one session, logged. Design for the failure, and the failure stops being a headline.
