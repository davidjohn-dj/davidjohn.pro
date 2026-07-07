---
title: "Playwright: E2E Tests That Don't Cry Wolf"
date: "2022-08-11"
category: "Testing"
excerpt: "Auto-waiting assertions, user-facing locators, and trace files that make failures debuggable. The patterns behind a flake-free suite."
---

Every team I've joined had an E2E suite people ignored, because it failed randomly and nobody trusted it. We rebuilt ours on Playwright this year, and after four months the flake count is effectively zero. The tool matters, but the patterns matter more.

## Auto-waiting kills the sleep()

Playwright assertions retry until they pass or time out — the `sleep(2000)` era is over:

```ts
import { test, expect } from "@playwright/test";

test("invoice appears after creation", async ({ page }) => {
  await page.goto("/invoices");
  await page.getByRole("button", { name: "New invoice" }).click();
  await page.getByLabel("Client").fill("Acme Corp");
  await page.getByRole("button", { name: "Save" }).click();

  await expect(page.getByRole("cell", { name: "Acme Corp" }))
    .toBeVisible(); // retries until the row renders
});
```

Every `click` also auto-waits for the element to be visible, stable, and enabled. Most flake was always timing; auto-waiting removes the class of bug.

## Locators: test what users see

`getByRole`, `getByLabel`, `getByText` — locating by accessible semantics instead of CSS selectors has a double payoff: tests survive refactors (a class rename can't break them), and they *fail* when accessibility breaks (a button without an accessible name is now unfindable — good). Reserve `data-testid` for genuinely ambiguous cases.

## Isolation by API, not UI

The slowest, flakiest way to arrange test state is clicking through the UI. Do setup through the API and reserve the UI for the behavior under test:

```ts
test.beforeEach(async ({ request }) => {
  await request.post("/api/test/seed", { data: { fixture: "invoices" } });
});
```

Combined with per-test browser contexts (Playwright gives you a clean profile each time), tests run parallel and order-independent.

## Traces: the debugging superpower

```ts
use: { trace: "on-first-retry" }
```

A failed CI run attaches a trace file — DOM snapshots, network log, console, screencast — that you scrub through locally like a time machine. "Cannot reproduce locally" stopped being a sentence we say. That, more than anything, is why the team trusts the suite again.
