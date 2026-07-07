---
title: "React 18's useTransition: Concurrent Rendering You Can Feel"
date: "2022-01-20"
category: "React"
excerpt: "Mark updates as non-urgent and React keeps the UI responsive while heavy renders happen in the background. Where transitions help and where they don't."
---

React 18's headline feature is concurrent rendering, and `useTransition` is where you feel it. The pitch: some state updates are urgent (typing, clicking) and some aren't (filtering 10,000 rows). Tell React which is which.

## The laggy filter, fixed

The classic jank: an input that filters a big list. Every keystroke triggers an expensive re-render, so typing stutters.

```jsx
function ProductSearch({ products }) {
  const [query, setQuery] = useState("");
  const [filtered, setFiltered] = useState(products);
  const [isPending, startTransition] = useTransition();

  function handleChange(e) {
    setQuery(e.target.value);            // urgent: keep input snappy
    startTransition(() => {              // non-urgent: can be interrupted
      setFiltered(expensiveFilter(products, e.target.value));
    });
  }

  return (
    <>
      <input value={query} onChange={handleChange} />
      <div style={{ opacity: isPending ? 0.6 : 1 }}>
        <ProductList items={filtered} />
      </div>
    </>
  );
}
```

The input update commits immediately. The list update renders *concurrently* — and if another keystroke arrives mid-render, React throws away the stale render and starts over with fresh state. Typing stays at 60fps even with a heavy list.

## isPending replaces the spinner

Note what `isPending` enables: the *old* list stays visible, slightly dimmed, while the new one computes. That's a fundamentally better loading state than unmounting to a spinner — context is preserved.

## When transitions don't help

Transitions make rendering interruptible; they don't make it faster. If your filter itself blocks the main thread for 200ms (the computation, not the render), you need `useMemo`, a worker, or a better algorithm. And don't wrap urgent updates: marking a checkbox toggle as a transition just makes it feel delayed.

Also worth knowing: `useDeferredValue` is the sibling for when you don't control the state setter — same interruption semantics, applied to a value you receive. Between them, most "debounce the render" hacks in existing codebases can now be deleted.
