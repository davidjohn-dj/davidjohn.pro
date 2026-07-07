---
title: "App Router Data Fetching: Cache Semantics You Need to Internalize"
date: "2023-07-27"
category: "Next.js"
excerpt: "fetch caching, revalidate, dynamic rendering, and parallel data loading - the four decisions behind every fast App Router page."
---

The App Router replaces `getServerSideProps`/`getStaticProps` with something better and stranger: caching semantics attached to `fetch` itself. Once these click, page performance becomes a set of deliberate choices instead of accidents.

## The default: cached until told otherwise

```tsx
// Static by default — fetched at build, served from cache
const res = await fetch("https://api.example.com/plans");

// Revalidate: static, refreshed in background every 5 min
const res = await fetch("https://api.example.com/prices", {
  next: { revalidate: 300 },
});

// Dynamic: fetched per-request
const res = await fetch("https://api.example.com/cart", {
  cache: "no-store",
});
```

This is per-*request* granularity: one page can mix a statically cached plans list, a five-minute price feed, and a per-user cart. The old model forced the whole page to the strictest requirement; now each data source pays only its own cost.

## Parallel by default, or you'll wait in line

The classic App Router performance bug is sequential awaits:

```tsx
// Waterfall: total = a + b
const user = await getUser(id);
const orders = await getOrders(id);

// Parallel: total = max(a, b)
const [user, orders] = await Promise.all([getUser(id), getOrders(id)]);
```

Better still, push awaits *down* into separate components and let Suspense stream them independently:

```tsx
<Suspense fallback={<OrdersSkeleton />}>
  <Orders id={id} />   {/* awaits inside */}
</Suspense>
```

The page shell renders immediately; slow panels stream in when ready.

## Revalidating after mutations

`revalidatePath` and `revalidateTag` invalidate on demand — tag your fetches and bust precisely:

```tsx
fetch(url, { next: { tags: ["invoices"] } });
// after a mutation:
revalidateTag("invoices");
```

Tag-based invalidation is the pattern to standardize on early; path-based gets clumsy as pages multiply.

## The debugging reality

When a page shows stale data, work the checklist: is the fetch cached (default!), does something opt the whole route dynamic (`cookies()`, `headers()` do), and did the mutation revalidate the right tag? Ninety percent of App Router confusion is one of those three.
