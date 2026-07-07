---
title: "Zustand: State Management Without the Ceremony"
date: "2022-04-14"
category: "React"
excerpt: "A store in four lines, selector-based subscriptions, no providers. Why Zustand became my default for client state."
---

My state-management journey: Redux everywhere, then Context everywhere, and now — for client state that's genuinely global — mostly Zustand. It's 1KB, has no provider wrapper, and re-renders exactly the components that read what changed.

## A store in four lines

```js
import create from "zustand";

const useCartStore = create((set) => ({
  items: [],
  add: (item) => set((s) => ({ items: [...s.items, item] })),
  remove: (id) =>
    set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
}));
```

Use it anywhere — no `<Provider>`:

```jsx
function CartBadge() {
  const count = useCartStore((s) => s.items.length);
  return <Badge>{count}</Badge>;
}
```

## Selectors are the performance model

`CartBadge` subscribes to `items.length` — it re-renders only when the *length* changes, not when an item's quantity updates. This is the granularity Context can't offer (any value change re-renders all consumers) without splitting contexts endlessly. The rule: select the smallest slice you need, and pass `shallow` for object selections:

```jsx
import shallow from "zustand/shallow";
const { add, remove } = useCartStore(
  (s) => ({ add: s.add, remove: s.remove }),
  shallow
);
```

## It works outside React

Because the store isn't trapped in the component tree, non-React code can read and write it — analytics, WebSocket handlers, imperative bridges:

```js
socket.on("price", (p) => useCartStore.getState().updatePrice(p));
```

This is quietly the killer feature for real apps.

## Where it sits in the stack

My current defaults: **server cache** in React Query (it's not client state!), **local component state** in `useState`, **cross-cutting client state** — cart, UI preferences, wizard progress — in Zustand. Redux still makes sense for teams that want strict action logs and time-travel debugging on complex flows. But most apps' "global state" is two stores and a dozen actions, and Zustand prices that correctly.
