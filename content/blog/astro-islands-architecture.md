---
title: "Astro and Islands: Shipping Zero JavaScript by Default"
date: "2022-09-15"
category: "Performance"
excerpt: "Astro 1.0 renders everything to HTML and hydrates only the components you mark interactive. The islands model, client directives, and where it fits."
---

Astro 1.0 shipped this summer with a premise that sounds obvious and isn't: most of a content site doesn't need JavaScript, so don't ship any — hydrate only the *islands* that are actually interactive.

## The islands model

A page is static HTML by default. Interactive components opt in with a client directive:

```astro
---
import Header from "../components/Header.astro";
import ProductGallery from "../components/ProductGallery.jsx";
import NewsletterForm from "../components/NewsletterForm.jsx";
---
<Header />                                   <!-- HTML only, 0 JS -->
<ProductGallery client:load products={items} /> <!-- hydrates now -->
<NewsletterForm client:visible />            <!-- hydrates when scrolled to -->
```

`client:visible` is the quiet star: below-the-fold widgets cost nothing until the user approaches them. Compare that with the SPA default — hydrate the entire page, including the footer nobody scrolls to.

## Bring your framework (or several)

Islands can be React, Vue, Svelte, or Solid — Astro renders them all server-side and hydrates independently. Practically, this means reusing your existing design-system components for the interactive 10% while the other 90% compiles down to plain HTML. (Resist the party trick of mixing three frameworks in one site. Portable, but chaotic.)

## The numbers from a real migration

We moved a marketing site from Next.js to Astro: JavaScript payload went from 210KB to 14KB (one search island and a carousel), Lighthouse performance from 78 to 100, LCP from 3.1s to 1.2s on 4G. Nothing about the *content* changed — we just stopped paying hydration tax on static pages.

## Where it fits — and doesn't

Astro is for content-heavy sites: marketing, docs, blogs, portfolios. The moment your site is mostly *application* — shared client state across routes, complex interactions everywhere — you're fighting the model, and Next/Remix serve you better. The decision heuristic: count your interactive components. If you can name them all, it's an Astro site.
