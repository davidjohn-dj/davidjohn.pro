---
title: "Dark Mode with CSS Custom Properties, Done Right"
date: "2021-05-13"
category: "CSS"
excerpt: "Semantic design tokens, prefers-color-scheme with a manual override, and avoiding the flash of wrong theme."
---

Dark mode went from novelty to expectation fast. The clean implementation is two layers of CSS custom properties: raw palette values, and *semantic tokens* that flip per theme.

## Semantic tokens, not color names

```css
:root {
  --surface: #ffffff;
  --surface-raised: #f4f4f5;
  --ink: #18181b;
  --ink-muted: #52525b;
  --accent: #4f46e5;
}

[data-theme="dark"] {
  --surface: #09090b;
  --surface-raised: #18181b;
  --ink: #fafafa;
  --ink-muted: #a1a1aa;
  --accent: #818cf8;
}
```

Components only reference semantic names — `background: var(--surface)` — never hex values. Naming tokens by role (`--surface`, `--ink`) instead of appearance (`--white`, `--gray-100`) is what makes the flip possible: "white" can't become black, but "surface" can.

## Respect the OS, allow an override

Default to the system preference, let the user override, persist the choice:

```js
const stored = localStorage.getItem("theme");
const system = matchMedia("(prefers-color-scheme: dark)").matches
  ? "dark" : "light";
document.documentElement.dataset.theme = stored ?? system;
```

## Kill the flash of wrong theme

If that JS runs after first paint, dark-mode users get a white flash. The fix: run it as a tiny inline `<script>` in `<head>`, *before* the stylesheet applies — it's render-blocking by design and takes well under a millisecond.

## The details people forget

```css
:root { color-scheme: light dark; }
```

`color-scheme` makes native UI — scrollbars, form controls, the default canvas — follow your theme. Also add a `<meta name="theme-color">` per theme for the mobile browser chrome, and transition thoughtfully: `transition: background-color 200ms` on the body feels polished, but apply it *after* first load or the initial theme application animates too.

Two token layers, one inline script, `color-scheme` — that's the whole architecture. Everything else is choosing good colors, which is the actually hard part.
