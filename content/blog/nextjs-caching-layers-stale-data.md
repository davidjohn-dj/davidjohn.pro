---
title: "Next.js Served Yesterday's Prices: Untangling the Four Caching Layers"
date: "2026-07-05"
category: "Next.js"
excerpt: "A pharma ordering portal showed stale prices for 19 hours after a repricing event. The bug wasn't in our code — it was in the four overlapping caches between the database and the pixel."
image: "/images/blog/covers/nextjs-caching-layers-stale-data.svg"
---

The hardest Next.js bugs aren't crashes. Crashes have stack traces. The hardest ones are the quiet lies — pages that render perfectly, pass every test, and show data that stopped being true hours ago.

> [!STORY] The 19-hour-old price list
> One of my longest engagements was a B2B ordering portal for a global pharma distributor — hospital pharmacies ordering against negotiated contract prices. Finance ran a repricing job nightly at 2am. One morning, a hospital in Ontario placed a six-figure order at *yesterday's* prices. The backend validated against current prices, rejected the order, and the pharmacy's procurement lead escalated to the VP within the hour. Our API was returning correct prices. Our database was correct. The page was wrong. That's when I learned to stop saying "the cache" as if there were only one.

## There is no "the cache" — there are four

Between your data source and the user's screen, App Router Next.js can interpose four distinct caches, each with its own scope, lifetime, and invalidation story:

![The four caching layers between your data and the user](/images/blog/diagrams/nextjs-caching-layers-stale-data.svg)

1. **Request memoization** — deduplicates identical `fetch` calls *within a single render pass*. Harmless; dies with the request.
2. **Data Cache** — persists `fetch` responses on the server *across requests and deployments*. This one outlives your intuitions.
3. **Full Route Cache** — stores the rendered HTML + RSC payload of statically rendered routes at build time.
4. **Router Cache** — a *client-side* cache of RSC payloads, per session, so back/forward navigation is instant.

Our stale prices were a stack of three of them. The price list was fetched with a plain `fetch()` (cached in the Data Cache), on a route that was statically rendered at the last deploy (Full Route Cache), and traders— pharmacists navigating back to it got the client Router Cache copy. Three layers, all confidently serving the same stale answer.

## Layer by layer: how the truth escapes

### The Data Cache doesn't care about your deploy

The bit that surprised everyone in the incident review: the Data Cache **persists across deployments**. Redeploying does not flush cached `fetch` responses. If you assumed "we deploy nightly, so nothing is more than a day old" — no. A cached fetch with no revalidation config can outlive the code that made it.

The fix is to be explicit about freshness on every fetch that matters:

```tsx
// Time-based: acceptable staleness is a business decision, write it down
const res = await fetch(`${API}/contract-prices/${accountId}`, {
  next: { revalidate: 300, tags: [`prices-${accountId}`] },
});
```

And then make the repricing job *push* the invalidation instead of praying to the timer:

```ts
// app/api/reprice-webhook/route.ts
import { revalidateTag } from "next/cache";

export async function POST(req: Request) {
  const { accountIds } = await verifySignedPayload(req);
  for (const id of accountIds) {
    revalidateTag(`prices-${id}`);
  }
  return Response.json({ revalidated: accountIds.length });
}
```

We wired the 2am repricing job to call this webhook when it finished. Tag-based invalidation turned "prices are stale for up to N hours" into "prices are stale for the duration of one HTTP round trip."

> [!DANGER]
> The silent killer: `fetch` inside a statically rendered route defaults to cached, and a route with no dynamic APIs (`cookies()`, `headers()`, `searchParams`) defaults to static. You can write a completely normal-looking page that is frozen at build time and never notice in dev, because **dev renders everything dynamically**. Production is the first place this bug can exist.

### The Full Route Cache freezes the whole page

Even with fresh data-layer fetches, a statically rendered route serves its build-time HTML until revalidated. For the ordering portal, prices were per-account anyway — the page had no business being static:

```tsx
// app/(portal)/catalog/page.tsx
import { connection } from "next/server";

export default async function CatalogPage() {
  await connection(); // opt this route out of static rendering
  const prices = await getContractPrices();
  return <Catalog prices={prices} />;
}
```

(`export const dynamic = "force-dynamic"` does the same job as route-level config; the newer `connection()` API expresses it at the point of use. Check which your Next version supports — this API has moved around between majors.)

### The Router Cache lies to people who navigate

The client-side Router Cache made our bug *sticky*: a pharmacist who visited the catalog, went to their cart, and came back got the cached RSC payload without a server round trip. After any mutation that changes what other pages show, purge it:

```tsx
"use server";

export async function addToCart(formData: FormData) {
  await persistCartLine(formData);
  revalidateTag(`prices-${formData.get("accountId")}`);
  revalidatePath("/catalog"); // also refreshes the client router cache entry
}
```

> [!TIP]
> Build yourself a staleness debug header early. We added `X-Rendered-At: ${new Date().toISOString()}` to the page and an equivalent field in the API payload. When someone says "the data looks old," you want to answer *which layer* is old in thirty seconds, not thirty minutes.

## The mental model that sticks

The framing that finally made this click for my team: **caching in Next.js is opt-out at the layers you don't see, and opt-in at the layers you do.** You see your `fetch` calls, so you remember to think about them. You don't *see* the Full Route Cache or the Router Cache — there's no line of code to review — so they're where stale data hides.

For every route, answer three questions in the PR description:

1. Is this route static or dynamic — and did I *choose* that, or did the heuristics choose for me?
2. For every fetch: what invalidates it, and is that a timer or an event?
3. After every mutation: which paths and tags does it revalidate?

> [!TAKEAWAYS]
> - Four caches: request memoization, Data Cache, Full Route Cache, client Router Cache. Diagnose staleness by naming *which one* you're fighting.
> - The Data Cache survives deployments. Redeploying is not cache invalidation.
> - Dev renders dynamically — static-freshness bugs are invisible until production.
> - Prefer event-driven `revalidateTag` over timer-based `revalidate` for data with a real source of truth.
> - After mutations, `revalidatePath`/`revalidateTag` or the client keeps showing the old world.

The portal incident closed with a one-page "cache contract" doc per route. It felt bureaucratic. It has also prevented every recurrence since, which is more than I can say for most architecture documents I've written.
