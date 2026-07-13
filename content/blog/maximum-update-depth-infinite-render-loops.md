---
title: "Maximum Update Depth Exceeded: A Field Guide to Infinite Render Loops"
date: "2026-07-09"
category: "React"
excerpt: "A drag-and-drop form builder froze the browser tab every time two specific widgets coexisted. Tracing it taught me the four species of infinite render loop — and the object-identity discipline that prevents all of them."
image: "/images/blog/covers/maximum-update-depth-infinite-render-loops.svg"
---

"Maximum update depth exceeded" is React pulling the emergency brake: something scheduled a state update, which caused a render, which scheduled the same update again — fifty times, until React gave up. When it's a `setState` called directly in render, the fix takes thirty seconds. When it's an identity feedback loop threaded through three components, a context, and a memo, it can eat a sprint.

> [!STORY] The two widgets that couldn't share a page
> For an insurance client, my team built a drag-and-drop form builder — underwriters composing quote forms from a widget palette. One sprint-review demo, a producer dropped a "Premium Calculator" widget onto a page that already had a "Rate Table" widget, and the tab froze. Hard. Every time, but *only* with both widgets present. The error was our headline, and the stack trace pointed — as it always does — at React internals rather than at either widget. What followed was the most instructive three days of debugging that project produced.

## The four species

After that hunt, and a dozen shorter ones since, every infinite render loop I've seen falls into one of four species.

### Species 1: setState during render

```tsx
function Widget({ config }: { config: WidgetConfig }) {
  const [layout, setLayout] = useState(defaultLayout);
  if (config.compact) {
    setLayout("dense"); // ❌ render → setState → render → ...
  }
  // ...
}
```

The direct form is rare in experienced codebases, but its disguises aren't: `onChange={handleChange(id)}` (calling, not creating, a handler — if it sets state, that's a set during render), or a `useMemo` that "derives" state by calling a setter. If a value is derivable from props, *derive it* — `const layout = config.compact ? "dense" : defaultLayout` — no state, no loop. If it must reset on a prop change, use `key` to remount instead of syncing.

### Species 2: effect updates its own dependency

```tsx
useEffect(() => {
  setFields([...fields, ...injectedFields]); // writes fields...
}, [fields, injectedFields]);                // ...and depends on fields
```

Fix with a functional update and drop the self-dependency, or better, question whether the effect should exist. Most "sync state to other state" effects are derived state in disguise.

### Species 3: unstable references in dependencies

This was half of our form-builder bug. Objects and arrays created during render are *new* every render — `{} !== {}` — so they re-trigger anything that depends on them:

```tsx
function RateTable({ filters = {} }) {   // ❌ default {} is new each render
  const query = useRates(filters);       //    → refetch → state → render → new {}
}
```

The default-prop version is nasty because the *caller* looks innocent. Hoist defaults to module scope (`const NO_FILTERS = {}`), memoize computed objects, and treat any object literal in JSX props feeding a hook as a suspect.

### Species 4: the cross-component feedback loop

And here's the other half — the reason it took *two* widgets. Each widget reported its computed height to a shared layout context so the canvas could reflow:

```tsx
// Inside each widget
useEffect(() => {
  reportSize(widgetId, measureDOM(ref.current)); // updates context
}, [layoutVersion]); // context bump → re-measure → report → context bump → ...
```

The Rate Table's height changed by 1px when the Premium Calculator's reflow shifted its column widths — which bumped `layoutVersion`, which re-measured the calculator, which shifted the table again. Two springs, coupled, oscillating forever. Neither component had a bug *in isolation* — the loop only existed in the composition.

![A cross-component feedback loop through shared state](/images/blog/diagrams/maximum-update-depth-infinite-render-loops.svg)

The fix for feedback loops is a fixed point: **make re-reporting an unchanged value a no-op.**

```tsx
function reportSize(id: string, size: Size) {
  setSizes((prev) => {
    const current = prev[id];
    if (current?.h === size.h && current?.w === size.w) {
      return prev; // ✅ same object back — React bails out, loop terminates
    }
    return { ...prev, [id]: size };
  });
}
```

Returning the *same reference* from a state updater makes React skip the re-render entirely. We also rounded measurements to integers — sub-pixel jitter from `getBoundingClientRect` had been defeating the equality check. Convergence guaranteed, demo un-frozen.

> [!DANGER]
> `JSON.stringify`-comparing dependencies, or `useDeepCompareEffect`, treats the symptom while hiding the disease. If your dependencies churn identity every render, the churn also defeats every `memo` and `useMemo` downstream — you've silently lost memoization everywhere, not just where it loops.

## Finding the loop when the stack trace won't help

The error's stack trace points at React's scheduler, not your code. What actually works:

1. **React DevTools Profiler** — record the freeze (or the moments before the brake), and look at *"why did this render?"* on the components rendering hundreds of times. The commit list turns the invisible cycle into a visible drumbeat.
2. **Bisect by unmounting.** Our two-widget clue was gold: loops of species 4 need all their participants. Remove components until the loop dies; the last removal names a participant.
3. **Log identity, not value.** `console.log(filters === lastFilters.current)` in the suspect component. Values that look identical but compare `false` are your unstable references.
4. **Audit every `eslint-disable` for exhaustive-deps** in the render path. (Recurring theme in this series: those suppressions are where the bodies are buried.)

> [!TIP]
> The React Compiler's lint rules (and the classic `exhaustive-deps` rule before them) catch species 1–3 statically most of the time. Species 4 — the coupled-springs loop — cannot be caught by any local analysis, because no single file contains the bug. Composition-level loops are found by profiling and prevented by the no-op-update discipline.

## The discipline that prevents all four

One habit unifies the fixes: **updates must converge.** Any code path that sets state in reaction to rendering — effects that measure, callbacks that report, contexts that fan out — must reach a state where re-running it changes nothing. Derive instead of sync; return `prev` when nothing changed; keep reference identity stable for anything a hook depends on.

> [!TAKEAWAYS]
> - Four species: setState-in-render, self-dependent effects, unstable references, and cross-component feedback loops.
> - Derived state should be *derived* — most looping effects shouldn't be effects at all.
> - Bail out by returning `prev` unchanged from updaters; round noisy measurements before comparing.
> - Unstable object identity doesn't just cause loops — it silently disables memoization everywhere.
> - Composition-level loops need profiling and bisection; no lint rule will find them for you.

The form builder shipped with a layout system that converges in at most two passes, enforced by a unit test that mounts every widget pair and asserts the render count stays under a ceiling. Paranoid? The demo freeze happened in front of the client's steering committee. Paranoid is fine.
