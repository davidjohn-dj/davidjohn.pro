---
title: "useEffect Cleanup Patterns You Actually Need"
date: "2020-04-09"
category: "React"
excerpt: "Memory leaks from subscriptions and stale async calls are the most common hooks bug. Three cleanup patterns that fix 90% of them."
---

Since hooks landed, the bug I see most in code reviews is the missing cleanup. An effect subscribes, fetches, or schedules something — and nobody tells it to stop when the component unmounts.

## The subscription leak

If your effect subscribes to anything — a WebSocket, an event emitter, a resize listener — return a cleanup function:

```js
useEffect(() => {
  const socket = new WebSocket("wss://api.example.com/feed");
  socket.addEventListener("message", handleMessage);

  return () => {
    socket.removeEventListener("message", handleMessage);
    socket.close();
  };
}, []);
```

React calls the returned function before re-running the effect and on unmount. No cleanup means every remount stacks another live socket.

## The stale fetch

Async calls can resolve after the component is gone, triggering the classic "can't perform a React state update on an unmounted component" warning. Use a cancelled flag:

```js
useEffect(() => {
  let cancelled = false;

  fetchUser(userId).then((user) => {
    if (!cancelled) setUser(user);
  });

  return () => {
    cancelled = true;
  };
}, [userId]);
```

Note this also handles the *race* case: if `userId` changes quickly, the old request's result is discarded instead of overwriting the new one.

## The timer

Timers are the sneakiest because they fail silently:

```js
useEffect(() => {
  const id = setInterval(tick, 1000);
  return () => clearInterval(id);
}, []);
```

## The rule of thumb

Every effect that starts something ongoing must return the way to stop it. If you can't say what your effect's cleanup is, either it genuinely has none (a one-shot DOM measurement) or you've just found your next bug.
