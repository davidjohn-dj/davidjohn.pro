---
title: "Working with Coding Agents: A Senior Engineer's Workflow"
date: "2025-02-20"
category: "AI Engineering"
excerpt: "Agentic coding tools now handle multi-file tasks with a plan-review-execute loop. What to delegate, what to keep, and how code review changes."
---

Coding assistants crossed a threshold this winter: from autocomplete to *agents* that take a task, form a plan, edit across files, run tests, and iterate on failures. After three months of daily agentic work, my workflow has restructured — and the restructuring, not the tool, is the productivity story.

## The skill moved to specification

Vague prompts produce plausible-looking wrong code. The tasks that succeed read like good tickets:

```
Add rate limiting to the public API routes.

Requirements:
- Token bucket per API key: 100 req/min, burst of 20
- Redis-backed (client exists in src/lib/redis.ts)
- 429 with Retry-After header on limit
- Exclude /health and /webhooks/*
- Add tests following the pattern in tests/middleware/

Don't touch the auth middleware; it's mid-refactor on another branch.
```

Constraints, pointers into the codebase, explicit non-goals. Two minutes of specification saves twenty minutes of correcting — the ratio that decides whether agents net-help.

## Delegate by verifiability, not difficulty

My rule: delegate tasks whose success I can *check cheaply* — tests pass, types compile, behavior matches a spec. Migrations, test backfills, well-scoped features, dependency upgrades: excellent. Tasks where verification is the hard part — subtle concurrency, security-sensitive flows, architectural decisions — stay hands-on, with the agent as a研究 assistant rather than an author.

## Review changes character

Agent PRs invert the review economics: writing is cheap, so the review is the bottleneck. Two adaptations help. First, demand the *plan* before the diff — reviewing an approach in prose is 10x faster than reverse-engineering it from changes. Second, review tests first: if the tests encode the right behavior, the implementation review can be lighter; if the tests are weak, stop reading the implementation.

## The trap to name

The failure mode isn't bad code — modern agents write decent code. It's **erosion of ownership**: merging changes nobody on the team can explain. Our countermeasure is a standing rule: whoever merges an agent-written PR must be able to answer for it in the postmortem, same as hand-written code. Agents amplify engineering judgment; they don't replace the accountability that makes it matter.
