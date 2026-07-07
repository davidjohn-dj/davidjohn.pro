---
title: "Incremental Static Regeneration: Static Speed, Fresh Data"
date: "2021-09-09"
category: "Next.js"
excerpt: "ISR rebuilds pages one at a time, on demand, in the background. How revalidate works, what stale-while-revalidate means for users, and fallback strategies."
---

Static sites are fast but stale; server rendering is fresh but slow and expensive. Next.js's Incremental Static Regeneration is the middle path that actually works: serve static HTML, regenerate it *per page, in the background* after a timeout.

## The core API is one property

```jsx
export async function getStaticProps() {
  const products = await getProducts();
  return {
    props: { products },
    revalidate: 60, // seconds
  };
}
```

The first request after 60 seconds still gets the cached page instantly — but triggers a background rebuild. The *next* visitor gets the fresh version. That's stale-while-revalidate semantics: no user ever waits for generation, and pages are at most `revalidate` seconds behind.

## fallback: the catalog problem

You can't pre-build 50,000 product pages. Build the top 100 and let the rest generate on first request:

```jsx
export async function getStaticPaths() {
  const top = await getTopProducts(100);
  return {
    paths: top.map((p) => ({ params: { slug: p.slug } })),
    fallback: "blocking",
  };
}
```

`fallback: "blocking"` server-renders the first hit to an unbuilt page (then caches it as static); `fallback: true` shows a skeleton while generating. I default to `"blocking"` — no layout shift, no skeleton flash, and crawlers always see full HTML.

## What ISR replaced for us

A client's e-commerce site ran full rebuilds on every CMS edit: 40 minutes, and editors deployed several times a day. With ISR (`revalidate: 300` on catalog pages), builds dropped to 90 seconds for the shell, content updates appear within five minutes, and Lighthouse stayed at 99 because everything is still served as static HTML from the CDN.

## Honest limitations

Revalidation is time-based, not event-based — an editor's fix takes up to `revalidate` seconds to appear (on-demand revalidation is on Vercel's roadmap). And remember it's per-page: one hot page regenerating doesn't refresh its siblings. Pick `revalidate` per route: 60s for landing pages, hours for archives.
