---
title: "Core Web Vitals: A Field Guide to the Metrics That Now Rank You"
date: "2021-12-16"
category: "Performance"
excerpt: "Google's page experience rollout made LCP, FID, and CLS ranking signals. What each one actually measures and the fixes that move them."
---

This year Google finished rolling Core Web Vitals into search ranking, which means performance stopped being an engineering nicety and became an SEO line item. Having spent the year getting client sites green, here's what actually moves each metric.

## LCP: Largest Contentful Paint (target < 2.5s)

When the biggest above-the-fold element renders. It's almost always a hero image or headline, and the fixes are unglamorous:

```html
<link rel="preload" as="image" href="/hero.webp"
      imagesrcset="/hero-800.webp 800w, /hero-1600.webp 1600w" />
<img src="/hero.webp" fetchpriority="high" ... />
```

- Don't lazy-load the LCP element (the most common self-inflicted wound).
- Serve modern formats (WebP), sized to the viewport via `srcset`.
- Cut server response time — a 900ms TTFB eats a third of the budget before a byte of image arrives.

## FID: First Input Delay (target < 100ms)

How long the main thread makes the user's *first* interaction wait. It's a JavaScript-quantity problem: long tasks from parsing and executing bundles. Code-split routes, defer third-party scripts (`defer`, or load analytics after `load`), and break up long tasks:

```js
async function processItems(items) {
  for (const chunk of chunkArray(items, 50)) {
    render(chunk);
    await new Promise((r) => setTimeout(r, 0)); // yield to input
  }
}
```

## CLS: Cumulative Layout Shift (target < 0.1)

The rage-inducing one. Every fix is a reservation:

- `width`/`height` on every image and iframe (browsers derive aspect ratio).
- `min-height` on ad slots and dynamic embeds.
- `font-display: optional` or metric-matched fallbacks so web fonts don't reflow text.
- Never insert banners above existing content post-load.

## Measure in the field, not just the lab

Lighthouse is a lab under ideal conditions; ranking uses *field* data (CrUX). Wire up real-user monitoring:

```js
import { getLCP, getFID, getCLS } from "web-vitals";
getLCP(sendToAnalytics); getFID(sendToAnalytics); getCLS(sendToAnalytics);
```

The p75 of real users on real phones is the number Google sees. Optimize for that, and the Lighthouse score follows.
