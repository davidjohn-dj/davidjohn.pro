---
title: "Building Dashboard Layouts with CSS Grid Areas"
date: "2020-06-11"
category: "CSS"
excerpt: "grid-template-areas turns dashboard layout from a div-nesting exercise into something you can read like ASCII art — and rearrange per breakpoint in one place."
---

I've built more admin dashboards than I can count, and CSS Grid's `grid-template-areas` is the single biggest quality-of-life improvement in years. Your layout becomes a picture in your stylesheet.

## The layout as ASCII art

```css
.dashboard {
  display: grid;
  grid-template-areas:
    "sidebar header header"
    "sidebar main   main"
    "sidebar main   main"
    "sidebar footer footer";
  grid-template-columns: 240px 1fr 1fr;
  grid-template-rows: 64px 1fr 1fr 48px;
  min-height: 100vh;
}

.sidebar { grid-area: sidebar; }
.header  { grid-area: header; }
.main    { grid-area: main; }
.footer  { grid-area: footer; }
```

The markup is flat — no wrapper divs for rows and columns. Each child just declares which named area it occupies.

## Responsive rearrangement in one place

The killer feature: at a breakpoint, you redraw the picture instead of overriding a dozen properties:

```css
@media (max-width: 768px) {
  .dashboard {
    grid-template-areas:
      "header"
      "main"
      "footer";
    grid-template-columns: 1fr;
  }
  .sidebar { display: none; }
}
```

The sidebar collapses, everything stacks, and no child element needed a single media query of its own.

## Cards inside the main area

For the widget grid inside `main`, `auto-fit` with `minmax` gives you responsive cards with zero breakpoints:

```css
.widgets {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}
```

Cards wrap naturally as the viewport narrows. Combined with grid areas for the shell, an entire dashboard layout fits in about thirty lines of CSS — and the next developer can understand it by looking at it.
