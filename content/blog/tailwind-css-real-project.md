---
title: "Adopting Tailwind CSS in a Real Project: A Month In"
date: "2021-02-25"
category: "CSS"
excerpt: "Utility-first looked like inline styles with extra steps. A month later the design system config and the deleted CSS files convinced me."
---

I was a Tailwind skeptic. `class="flex items-center gap-2 px-4 py-2"` looked like inline styles wearing a trench coat. Then I used it for a client dashboard for a month, and I'm mostly converted. Here's what changed my mind, and what still bugs me.

## The config is the design system

The turning point was realizing `tailwind.config.js` *is* the style guide:

```js
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: { 500: "#6366f1", 600: "#4f46e5" },
      },
      spacing: { 18: "4.5rem" },
    },
  },
};
```

Every `text-brand-500` and `p-4` in the codebase draws from this palette. Junior developers physically cannot introduce a 17th shade of gray or a 9px padding — the constraint that style guides always promise and never enforce.

## No more naming, no more dead CSS

The two chronic diseases of CSS at scale: inventing names (`card__header--compact-alt`) and fear-driven append-only stylesheets, because nobody knows what's safe to delete. Utilities kill both. Styles live with markup, so deleting a component deletes its styles. Our main stylesheet went from 4,200 lines to a config file.

## Extract components, not classes

The instinct is to use `@apply` everywhere to make CSS classes again. Resist it. The right unit of reuse is the *component*:

```jsx
function Button({ children }) {
  return (
    <button className="rounded-lg bg-brand-500 px-4 py-2 font-medium
                       text-white hover:bg-brand-600">
      {children}
    </button>
  );
}
```

Repeated utility strings belong in a React/Vue component, not a CSS abstraction.

## What still bugs me

Long class strings are genuinely hard to scan, and conditional classes need a helper like `clsx`. And you must set up PurgeCSS correctly or you'll ship 3MB of utilities. But a month in: I'm shipping UI faster and arguing about class names never.
