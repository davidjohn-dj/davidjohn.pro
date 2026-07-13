---
title: "The Search Box That Showed the Wrong Results: Effect Race Conditions"
date: "2026-07-08"
category: "React"
excerpt: "In a 3D asset library search, typing 'bracket' sometimes showed results for 'brack'. Out-of-order responses are the most-shipped bug in React data fetching — here's the anatomy and the three-tier fix."
image: "/images/blog/covers/react-effect-race-conditions-abortcontroller.svg"
---

Some bugs are rare enough to ignore and common enough to ship. The fetch race condition is the king of that category: it passes every local test, works in every demo, and then misbehaves for real users on real networks a few times a day, eroding trust in your product one confusing search result at a time.

> [!STORY] "bracket" vs "brack"
> During my years building design-tool frontends, I owned the search experience for a cloud 3D asset library — hundreds of thousands of CAD parts, mechanical fasteners, fixtures. Telemetry showed a weird pattern: a small but steady stream of sessions where users typed a full query, *then immediately re-typed it*. We eventually reproduced it on a throttled connection: type "brack", pause, finish typing "bracket". The request for "brack" — a broader query hitting more of the index — was *slower* than the request for "bracket". Its response landed last, so it won. Users searching for brackets were shown results for "brack" under a search box that said "bracket". They weren't re-typing for fun; they were correcting us.

## The anatomy: last response wins, not last request

Nothing about `fetch` guarantees responses return in request order. Combine that with the naive effect and you get a state machine with a hole in it:

```tsx
function AssetSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Asset[]>([]);

  useEffect(() => {
    if (!query) return;
    searchAssets(query).then((data) => {
      setResults(data); // ❌ whoever resolves LAST writes state,
    });                 //    regardless of which query is CURRENT
  }, [query]);
  // ...
}
```

Two renders, two in-flight promises, one `results` slot. The effect for "brack" was cleaned up long ago, but its promise doesn't know that — it resolves happily and clobbers state.

![Out-of-order responses clobbering state](/images/blog/diagrams/react-effect-race-conditions-abortcontroller.svg)

## Tier 1: The ignore flag — minimum viable correctness

The cleanup function runs before the next effect (and at unmount). A boolean in the closure marks the previous request's response as unwelcome:

```tsx
useEffect(() => {
  if (!query) return;
  let ignore = false;
  searchAssets(query).then((data) => {
    if (!ignore) setResults(data); // ✅ stale responses are dropped
  });
  return () => {
    ignore = true;
  };
}, [query]);
```

This is the pattern the React docs themselves bless, and it fixes the *correctness* bug completely. What it doesn't fix: the stale request still runs to completion, occupying one of the browser's per-origin connection slots and your search cluster's CPU. For a typeahead firing on every keystroke, that's real waste.

## Tier 2: AbortController — cancel, don't just ignore

```tsx
useEffect(() => {
  if (!query) return;
  const controller = new AbortController();

  searchAssets(query, { signal: controller.signal })
    .then((data) => setResults(data))
    .catch((err) => {
      if (err.name === "AbortError") return; // expected — not an error
      setError(err);
    });

  return () => controller.abort();
}, [query]);
```

Now a superseded request is actually torn down: the browser drops the connection, and a well-behaved backend can stop working on it. Two production notes from shipping this at scale:

- **Swallow `AbortError` and nothing else.** The single most common regression I've seen in code review is a `catch` that routes aborts into the user-facing error state — every keystroke briefly flashes "Search failed."
- **Pass the signal all the way down.** If `searchAssets` internally fans out to a suggestions endpoint and a facets endpoint, both need the signal, or you've only half-cancelled.

> [!WARNING]
> The race isn't only in fetching — it's in *any* async effect: dynamic `import()`, IndexedDB reads, geolocation lookups, wasm module loads. If an effect awaits anything and then calls `setState`, it needs the ignore/abort treatment. The fetch version is just the one you'll get paged about.

## Tier 3: Stop hand-rolling it

The honest conclusion after fixing this bug for the nth time: request lifecycle management is infrastructure, and infrastructure shouldn't be re-implemented per component. Three structurally different escapes:

**A query library.** TanStack Query (or SWR) keys the cache by query and only exposes data matching the *current* key — races are handled by design, plus you get dedup, retries, and caching:

```tsx
const { data: results = [] } = useQuery({
  queryKey: ["assets", query],
  queryFn: ({ signal }) => searchAssets(query, { signal }),
  enabled: query.length > 0,
  placeholderData: keepPreviousData, // no flash of empty results while typing
});
```

**`useDeferredValue` + Suspense** in newer React, where the framework holds back rendering of stale content instead of you policing responses.

**Move it off the client entirely.** In App Router, a search page keyed by `searchParams` re-renders on the server per query — the "which response wins" problem disappears because rendering is request-scoped. (You trade it for the caching questions I wrote about earlier this week, so pick your poison consciously.)

For the asset library we landed on TanStack Query with `keepPreviousData` — the previous results stay visible, slightly dimmed, until fresh ones arrive. Perceived speed went *up* even though we changed nothing about the backend.

> [!TIP]
> Test for races deliberately: in your mock server, add `?delay=` support and write one test where the first query resolves *after* the second. This is a five-line test that would have caught our bug two years before telemetry did:
>
> ```ts
> resolveSearch("brack", { delayMs: 300 });
> resolveSearch("bracket", { delayMs: 50 });
> await screen.findByText("Results for \"bracket\"");
> expect(screen.queryByTestId("result-row")).toHaveTextContent(/bracket/);
> ```

> [!TAKEAWAYS]
> - Responses don't return in request order. Any `await` + `setState` effect has a race unless proven otherwise.
> - Minimum fix: the `ignore` flag in effect cleanup. Better: `AbortController`, swallowing only `AbortError`.
> - Best: don't hand-roll — query libraries make the race unrepresentable and throw in caching for free.
> - Watch the UX during transitions: `keepPreviousData` beats flashing an empty list.
> - Write at least one out-of-order-response test for every search/autocomplete surface you ship.

The re-type telemetry signature disappeared the week we shipped the fix. If you have a search box in production and you've never checked for that signature, I'd go look — it's the sound of users silently correcting your race condition for you.
