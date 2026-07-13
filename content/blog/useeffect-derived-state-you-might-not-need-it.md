---
title: "The useEffect Chain Reaction: Derived State and the Effects You Don't Need"
date: "2026-07-13"
category: "React"
excerpt: "An analytics filter panel re-rendered eleven times per click, flashed stale charts, and had a bug nobody could reproduce twice. The root cause: state that should have been math, wired together with effects."
image: "/images/blog/covers/useeffect-derived-state-you-might-not-need-it.svg"
---

There's a React anti-pattern so common it feels like idiom: something changes, so you write a `useEffect` to update some state in response. One effect is fine. But effects that set state which other effects depend on form chains — and chains of effects are how a click becomes eleven renders, a flash of stale UI, and a bug report that starts with "sometimes."

> [!STORY] Eleven renders per click
> The trigger for this post was an analytics dashboard I audited for a retail client — a filter panel (date range, region, product category) driving a grid of charts. Users reported the charts "flickering through wrong values" when changing filters quickly, and one un-reproducible bug where the CSV export contained *different numbers than the charts*. I dropped a render counter into the filter panel: a single region click produced **eleven renders**. The React DevTools profiler showed why: a relay race of five effects, each `setState` passing the baton to the next.

## The chain, reconstructed

Simplified from the real code, but structurally faithful:

```tsx
function FilterPanel({ region, dateRange }: Props) {
  const [stores, setStores] = useState<Store[]>([]);
  const [validStores, setValidStores] = useState<Store[]>([]);
  const [selection, setSelection] = useState<string[]>([]);
  const [query, setQuery] = useState<AnalyticsQuery | null>(null);

  useEffect(() => {                                  // 1: region → stores
    fetchStores(region).then(setStores);
  }, [region]);

  useEffect(() => {                                  // 2: stores → validStores
    setValidStores(stores.filter((s) => isOpenDuring(s, dateRange)));
  }, [stores, dateRange]);

  useEffect(() => {                                  // 3: validStores → fix selection
    setSelection((sel) => sel.filter((id) => validStores.some((s) => s.id === id)));
  }, [validStores]);

  useEffect(() => {                                  // 4: everything → query
    setQuery(buildQuery(region, dateRange, selection));
  }, [region, dateRange, selection]);
  // ...and effect 5 in a child fired the fetch when query changed
}
```

Each effect is individually defensible — that's what makes the pattern survive code review. The composite is the problem:

- **Render storms.** Each effect runs *after* a committed render, sets state, and causes another. Five effects → up to six renders per input change, more when they interleave.
- **Stale intermediate frames.** Between effects 1 and 3, the UI commits with new stores but old selection. Users saw those frames as flicker — charts briefly rendering deselected stores.
- **Ordering bugs.** The CSV-export mismatch: export read `query` (effect 4's output) while a chain was mid-flight — new region, old selection. "Sometimes wrong numbers" was literally a race between the user's click cadence and the chain's settling time.

![A setState relay race vs. render-time derivation](/images/blog/diagrams/useeffect-derived-state-you-might-not-need-it.svg)

## The unwinding: most state is math

The question that dissolves the chain: **can this value be computed from things I already have?** If yes, it isn't state — it's a derivation, and it belongs in render:

```tsx
function FilterPanel({ region, dateRange }: Props) {
  const [selection, setSelection] = useState<string[]>([]);
  const { data: stores = [] } = useQuery({
    queryKey: ["stores", region],
    queryFn: () => fetchStores(region),
  });

  // ✅ was effect 2 — now just math, always consistent with inputs
  const validStores = useMemo(
    () => stores.filter((s) => isOpenDuring(s, dateRange)),
    [stores, dateRange]
  );

  // ✅ was effect 3 — derive the *effective* selection instead of correcting stored state
  const effectiveSelection = selection.filter((id) =>
    validStores.some((s) => s.id === id)
  );

  // ✅ was effect 4 — a query description is pure math too
  const query = buildQuery(region, dateRange, effectiveSelection);
  // ...
}
```

Three effects deleted. Note the subtle move on selection: instead of *storing* a corrected selection (which requires an effect to watch for invalidation), we store the raw user intent and derive the effective value. Storing intent and deriving consequences is the pattern that kills most "sync state with other state" effects. There's a bonus: if the user switches back to the previous region, their old selection is still there — the "correction" never destroyed data.

Render-time derivation cannot present a stale frame: every commit is consistent with its inputs, by construction. Eleven renders became two (one for the click, one when the store fetch resolved). The flicker was unrepresentable, and the CSV export — now reading the same derived `query` the charts used — could no longer disagree with them.

## The effects that remain (and the ones that were never effects)

After unwinding, ask what's left. Legitimately effects: synchronizing with *external* systems — subscriptions, imperative DOM APIs, analytics beacons. Our fetches moved to a query library (render-declarative, not effect-imperative). Two common stragglers deserve their named replacements:

**"Reset state when a prop changes"** — that's `key`, not an effect:

```tsx
<FilterPanel key={region} region={region} />  // remounts with fresh state, zero effects
```

**"Respond to a user action"** — that's the event handler. If the code runs *because the user clicked*, it belongs in the click handler, not in an effect watching state the handler set:

```tsx
// ❌ setExporting(true) in handler + useEffect(..., [exporting]) to do the export
// ✅ the handler just... exports
async function onExportClick() {
  const blob = await exportCsv(query);
  downloadBlob(blob, `analytics-${region}.csv`);
}
```

> [!WARNING]
> Expensive derivations are the one honest objection to "just compute it in render" — and the answer is `useMemo` (or, increasingly, the React Compiler doing it for you), not a `useState` + `useEffect` cache. A memo is a derivation with a performance annotation; an effect-maintained copy is a second source of truth that can drift.

> [!TIP]
> Audit heuristic for your own codebase: grep for effects whose body is *only* `setSomething(...)`. Each one is a candidate derivation. My rough tally across audits: two-thirds of them delete cleanly, and the deleted ones take a class of consistency bug with them.

> [!TAKEAWAYS]
> - Effects that set state form chains; chains produce render storms, stale frames, and timing-dependent bugs.
> - If a value is computable from existing props/state, derive it in render — don't store and sync it.
> - Store user *intent*, derive *consequences*; corrections stop needing effects and stop destroying data.
> - `key` for reset-on-prop-change; event handlers for respond-to-action; `useMemo` for expensive math.
> - Reserve `useEffect` for what it's for: synchronizing with systems outside React.

The dashboard's filter panel ended the audit with exactly one effect (an analytics beacon). The client asked whether removing code was really what they'd hired a consultant for. Eleven renders to two, and the un-reproducible bug became un-writable — best deletion-to-value ratio of my year.
