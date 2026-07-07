---
title: "Tailwind CSS v4: CSS-First Config and the 100x Faster Engine"
date: "2025-09-11"
category: "CSS"
excerpt: "The JS config file is gone, design tokens live in @theme, and builds are near-instant. Migration notes and the details that surprised us."
---

We migrated our design system to Tailwind v4 this month. The headline features — the Oxide engine and CSS-first configuration — are real improvements, and the migration was smoother than the v2→v3 jump, with a few surprises worth flagging.

## Configuration is CSS now

`tailwind.config.js` is gone. Design tokens live in your stylesheet under `@theme`:

```css
@import "tailwindcss";

@theme {
  --color-brand-500: oklch(0.65 0.2 275);
  --color-brand-600: oklch(0.58 0.22 275);
  --font-display: "Cal Sans", sans-serif;
  --spacing-18: 4.5rem;
  --breakpoint-3xl: 120rem;
}
```

Every token automatically becomes both a utility (`bg-brand-500`, `font-display`) *and* a plain CSS variable (`var(--color-brand-500)`) usable anywhere — inline styles, other stylesheets, JS. That second part quietly ends the "how do I read a Tailwind color in my chart library" problem; the tokens are just custom properties now.

## The engine is absurdly fast

Full rebuilds dropped from ~2.5s to ~90ms on our largest app; incremental updates are effectively instant. Content detection is automatic (no more `content` array maintenance, no more "why isn't my class generated" because a path was missing). Vite integration is first-party. The build step stopped being a thing anyone thinks about.

## Migration realities

The `npx @tailwindcss/upgrade` codemod handled ~90% mechanically. What needed hands: deprecated utilities (`bg-opacity-*` is gone — the slash syntax `bg-black/50` is the way), a handful of renamed scales (`shadow-sm` → `shadow-xs`), and our custom plugins — the JS plugin API still exists, but most of ours became unnecessary because `@theme` + native CSS covers them. Browser floor is Chrome 111+/Safari 16.4+, which is fine for us but worth checking if you support long-tail enterprise browsers.

## The strategic read

v4 leans hard into the modern CSS platform: native cascade layers, `@property`, `color-mix()`, container query utilities out of the box. The framework is shrinking toward being a thin, fast token-to-utility compiler over standard CSS — which is exactly the direction a styling tool should shrink. Less framework, more platform.
