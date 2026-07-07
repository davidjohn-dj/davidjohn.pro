---
title: "Container Queries: Components That Respond to Their Container"
date: "2022-02-10"
category: "CSS"
excerpt: "Media queries know the viewport; components live in containers. @container finally lets a card adapt to the space it is actually given."
---

The oldest lie in responsive design is that the viewport tells you how much space a component has. A card in a full-width hero and the same card in a 300px sidebar share a viewport — and need different layouts. Container queries, now shipping behind flags and landing in Chrome 105 later this year, fix this at the platform level.

## The syntax

First, declare an element as a container:

```css
.card-grid > * {
  container-type: inline-size;
  container-name: card;
}
```

Then style descendants based on the *container's* width:

```css
.card { display: flex; flex-direction: column; }

@container card (min-width: 400px) {
  .card {
    flex-direction: row;   /* image beside text when space allows */
  }
  .card__image { width: 40%; }
}
```

The same `.card` component is vertical in a narrow sidebar and horizontal in a wide content area — *simultaneously, on the same page*. No props, no JS measurement, no `.card--horizontal` variant that someone has to remember to apply.

## Why this changes component libraries

Design systems have been faking this forever: `size` props threaded through React, ResizeObserver hooks, duplicate variants. That's component-level responsibility for a layout-level concern. With container queries the component owns its own adaptation, and the *page* just decides how much room to give it. Truly portable components.

## Container units

Alongside queries come container-relative units — `cqw`, `cqi` (1% of container inline size):

```css
.card__title { font-size: clamp(1rem, 4cqi, 1.5rem); }
```

Typography that scales with the component, not the screen.

## Using them today

Chrome/Edge ship this fall, Safari 16 is close, Firefox is in progress. There's a solid polyfill (`container-query-polyfill`) for the basic `inline-size` cases. My plan: new components get container queries with sensible non-query fallbacks (the vertical layout is fine everywhere), and the polyfill covers the gap. This is the biggest change to how I'll structure CSS since Grid.
