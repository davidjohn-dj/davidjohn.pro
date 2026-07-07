---
title: "Upgrading to React 18: createRoot, StrictMode, and the Double-Effect Surprise"
date: "2022-03-31"
category: "React"
excerpt: "React 18 is out. The upgrade is two lines - and then StrictMode runs your effects twice in dev and your bugs surface. That's a feature."
---

React 18 shipped this week. The mechanical upgrade is genuinely two lines, but the behavioral changes deserve attention before you flip the switch on a large app.

## The two lines

```jsx
// Before
import { render } from "react-dom";
render(<App />, document.getElementById("root"));

// After
import { createRoot } from "react-dom/client";
createRoot(document.getElementById("root")).render(<App />);
```

Keeping the old `render` API works but opts you out of every React 18 feature — concurrent rendering, automatic batching, transitions. Don't half-upgrade.

## Automatic batching (a quiet perf win)

Pre-18, multiple `setState` calls batched only inside React event handlers. In promises, timeouts, and native handlers, each caused its own render:

```jsx
fetch("/api/user").then(() => {
  setUser(u);      // React 17: render
  setLoading(false); // React 17: render again
});                  // React 18: one render, batched
```

Most apps get faster for free. If you truly need a synchronous commit between updates, `flushSync` exists — treat it as an escape hatch with a code comment explaining why.

## StrictMode now double-invokes effects

The one that generates the bug reports: in development, StrictMode mounts, unmounts, and remounts every component — so `useEffect` runs, cleans up, and runs again. Effects written without cleanup break visibly:

```jsx
useEffect(() => {
  const ws = new WebSocket(url);     // now opens twice in dev
  return () => ws.close();           // ...unless you clean up properly
}, [url]);
```

This isn't React being annoying — it's simulating the reusable-state future (preserving state when components unmount/remount, e.g. back navigation). Every effect that breaks under double-invocation was already subtly wrong. We found four real leaks in our codebase this way.

## Upgrade order that worked for us

1. Upgrade react/react-dom, keep legacy `render` — confirm nothing breaks.
2. Switch to `createRoot` with StrictMode off — check batching-sensitive code.
3. Enable StrictMode, fix every effect that misbehaves.
4. *Then* start adopting `useTransition` and `Suspense` features deliberately.
