---
title: "React 19's use() Hook: Suspense-First Data in Client Components"
date: "2025-04-24"
category: "React"
excerpt: "use() reads promises in render, works conditionally, and pairs with server-started promises for clean streaming. Patterns and the pitfall."
---

React 19 is stable, and `use()` is the piece reshaping client-side data flow. It reads a promise during render, suspending until it settles — and unlike hooks, you can call it conditionally. The patterns worth adopting:

## Stream from server, resolve in client

The headline pattern: a Server Component *starts* a fetch and passes the pending promise down; a Client Component `use()`s it:

```tsx
// Server Component — don't await!
export default function Page() {
  const reviewsPromise = getReviews(productId); // starts immediately
  return (
    <>
      <ProductHeader />                          {/* renders now */}
      <Suspense fallback={<ReviewsSkeleton />}>
        <Reviews reviewsPromise={reviewsPromise} />
      </Suspense>
    </>
  );
}
```

```tsx
"use client";
export function Reviews({ reviewsPromise }) {
  const reviews = use(reviewsPromise);  // suspends until resolved
  const [filter, setFilter] = useState("all"); // full interactivity
  /* ... */
}
```

The page shell ships immediately; reviews stream in when ready; the client component keeps its state and handlers. This replaces both the `useEffect` fetch (waterfall, spinner management) and awaiting in the server component (blocks the whole page).

## Conditional reads are legal

```tsx
function Details({ detailsPromise, expanded }) {
  if (!expanded) return <Summary />;
  const details = use(detailsPromise); // fine inside a condition!
  return <FullDetails data={details} />;
}
```

Because `use()` isn't a hook, the rules-of-hooks restrictions don't apply. Data that's only needed sometimes is only *awaited* sometimes.

## The pitfall: promise identity

`use()` resubscribes per promise instance. Create the promise *in render* and every render creates a new fetch — an infinite suspend loop:

```tsx
const data = use(fetchThing(id));        // BUG: new promise every render
```

Promises must come from outside the render cycle: a Server Component prop, a cache, or a memoized source. In practice this means `use()` complements rather than replaces the data libraries — TanStack Query's caching plus a `promise` option feeding `use()` is emerging as the clean combination: library owns identity and invalidation, React owns coordination and streaming.
