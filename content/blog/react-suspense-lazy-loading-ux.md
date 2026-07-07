---
title: "Suspense Boundaries: Designing Loading States That Don't Flicker"
date: "2021-07-08"
category: "React"
excerpt: "Where you place Suspense boundaries is a UX decision. Nested boundaries, skeleton hierarchies, and avoiding the spinner cascade."
---

`React.lazy` and `Suspense` make code splitting easy. What they don't do is make it *feel* good — that part is boundary placement, and most apps get it wrong in one of two directions.

## The two failure modes

**One giant boundary**: a single `<Suspense>` around the router means any navigation blanks the whole screen to a spinner. Brutal.

**A boundary per component**: every widget pops in independently — the spinner cascade. The page assembles like a slot machine and layout shifts everywhere.

## Boundaries follow layout, not components

The shell (header, nav, sidebar) should never suspend. Content regions get their own boundaries:

```jsx
function App() {
  return (
    <Layout>                          {/* always instant */}
      <Suspense fallback={<PageSkeleton />}>
        <Routes />                     {/* route-level chunk */}
      </Suspense>
    </Layout>
  );
}

function ReportsPage() {
  return (
    <>
      <PageHeader title="Reports" />   {/* renders immediately */}
      <Suspense fallback={<ChartSkeleton />}>
        <HeavyChartPanel />            {/* heavy lib, own chunk */}
      </Suspense>
    </>
  );
}
```

Navigation swaps content inside a stable shell; within a page, only the genuinely heavy part suspends behind a skeleton that matches its final dimensions.

## Skeletons over spinners

A skeleton that mirrors the real layout (same heights, same grid) reads as "almost there"; a centered spinner reads as "who knows". The dimension-matching matters more than the shimmer — it's what prevents layout shift when content arrives.

## The flicker fix

Fast connections have the opposite problem: a skeleton that flashes for 50ms feels *broken*. Delay the fallback's appearance:

```css
.skeleton { animation: appear 0ms 150ms both; }
@keyframes appear { from { opacity: 0 } to { opacity: 1 } }
```

If content lands within 150ms, users never see the skeleton at all. React's upcoming concurrent features will give us better primitives here (`useTransition` keeps old UI visible during updates), but boundary placement will still be the foundation.
