---
title: "Stale Closures: Why Your WebSocket Handler Sees State From the Past"
date: "2026-07-05"
category: "React"
excerpt: "A clinical-trial monitoring dashboard kept alerting on thresholds users had already changed. The culprit: every long-lived callback in React is a time capsule, and ours were sealed at mount."
image: "/images/blog/covers/react-stale-closures-realtime-dashboards.svg"
---

There's a class of React bug where the code reads correctly, reviews correctly, and behaves wrongly in a way users describe as "haunted." The app *sort of* reacts to what they did three interactions ago. Nine times out of ten, that's a stale closure: a long-lived function that captured state at creation time and has been reading from the past ever since.

> [!STORY] The alert that wouldn't update
> I spent part of my pharma years building a monitoring dashboard for clinical-trial sites — vitals streaming in over WebSocket, with per-metric alert thresholds the on-site coordinators could tune. QA filed a bug I'll never forget: *"Changed heart-rate threshold from 120 to 150. Alerts still fire at 120. Refreshing the page fixes it."* The handler code looked flawless. It was flawless — for the values that existed when the socket connected.

## Closures capture values, not variables

Every render of a function component creates fresh local bindings. A callback you create during render closes over *that render's* values. If the callback lives longer than the render — socket handler, interval, event listener, anything registered once — it keeps reading those frozen values forever.

Here's the distilled version of our bug:

```tsx
function VitalsMonitor({ siteId }: { siteId: string }) {
  const [threshold, setThreshold] = useState(120);
  const [readings, setReadings] = useState<Reading[]>([]);

  useEffect(() => {
    const ws = new WebSocket(`${WS_URL}/sites/${siteId}/vitals`);
    ws.onmessage = (event) => {
      const reading = JSON.parse(event.data);
      setReadings((prev) => [...prev.slice(-99), reading]);
      if (reading.heartRate > threshold) {
        // ❌ `threshold` is whatever it was when this effect ran: 120. Forever.
        raiseAlert(reading);
      }
    };
    return () => ws.close();
  }, [siteId]); // threshold intentionally omitted "to avoid reconnecting" — the trap
  // ...
}
```

Whoever wrote it knew adding `threshold` to the dependency array would tear down and reopen the WebSocket on every slider change — genuinely bad for a medical monitoring stream. So they omitted it, the linter warning got suppressed, and the handler became a time capsule.

![How a long-lived callback gets pinned to an old render](/images/blog/diagrams/react-stale-closures-realtime-dashboards.svg)

> [!DANGER]
> Every `eslint-disable-next-line react-hooks/exhaustive-deps` is a stale closure with a countdown timer. Sometimes it's fine. But the suppression means *"I promise this callback doesn't need fresh values"* — and the promise silently breaks the day someone adds a state read inside.

## Fix 1: The ref escape hatch (right for this case)

When a long-lived subscription needs *current* state without re-subscribing, split the concern: the connection depends on connection identity; the handler reads live values through a ref.

```tsx
function VitalsMonitor({ siteId }: { siteId: string }) {
  const [threshold, setThreshold] = useState(120);
  const thresholdRef = useRef(threshold);
  thresholdRef.current = threshold; // updated every render, read at event time

  useEffect(() => {
    const ws = new WebSocket(`${WS_URL}/sites/${siteId}/vitals`);
    ws.onmessage = (event) => {
      const reading = JSON.parse(event.data);
      setReadings((prev) => [...prev.slice(-99), reading]);
      if (reading.heartRate > thresholdRef.current) {
        // ✅ reads the value at message time, not at subscribe time
        raiseAlert(reading);
      }
    };
    return () => ws.close();
  }, [siteId]); // honest deps: the socket only depends on siteId
}
```

This is exactly the pattern React's experimental `useEffectEvent` formalizes — an "event" function that always sees latest props and state but never triggers re-subscription. Until it's stable in your React version, the ref pattern is the reliable spelling. Wrap it once and name it:

```tsx
function useLatest<T>(value: T) {
  const ref = useRef(value);
  ref.current = value;
  return ref;
}
```

## Fix 2: Functional updates (when the state you need is the state you're setting)

Notice `setReadings((prev) => ...)` above was never buggy. Functional updates don't read the closure at all — React hands you the current value. A shocking number of stale-closure bugs dissolve by converting `setCount(count + 1)` into `setCount((c) => c + 1)`. The interval counter that sticks at 1 is the canonical example:

```tsx
useEffect(() => {
  const id = setInterval(() => {
    setElapsed((e) => e + 1); // ✅ no dependency on `elapsed` needed at all
  }, 1000);
  return () => clearInterval(id);
}, []);
```

## Fix 3: Restructure so the closure is short-lived

The deepest fix is often to stop having long-lived closures over state. In the dashboard rewrite, we moved threshold *checking* out of the socket handler entirely — the handler only appends readings; a plain render-time derivation decides what's alerting:

```tsx
const activeAlerts = readings.filter(
  (r) => r.receivedAt > lastAckAt && r.heartRate > threshold
);
```

Render-time code can't be stale — it re-runs with fresh values by construction. The socket handler shrank to one line, and an entire category of bug became unrepresentable. (Side-effectful alerting — sounds, pages to the on-call nurse — subscribed to `activeAlerts` changes in a small dedicated effect.)

> [!TIP]
> Interview question I ask when hiring senior React engineers: "What does this log after three clicks in one second?" —
>
> ```tsx
> const [n, setN] = useState(0);
> const onClick = () => {
>   setTimeout(() => setN(n + 1), 1000);
> };
> ```
>
> If they immediately say "1, because all three timeouts captured n=0" *and* can name two fixes, they've debugged this in anger.

## Where stale closures hide

After years of reviewing React code across banking, pharma, and design-tools teams, my checklist of places to look:

- `setInterval` / `setTimeout` callbacks
- WebSocket / EventSource / SDK event handlers registered in a mount-only effect
- `window.addEventListener` in effects with `[]`
- Debounced/throttled functions created with `useMemo(() => debounce(...), [])`
- Callbacks stored in refs or passed to imperative libraries (maps, charts, editors) at init
- `useCallback` with deliberately-narrowed deps, passed into anything that caches it

> [!TAKEAWAYS]
> - A closure captures the render it was born in. If it outlives the render, it can go stale.
> - Functional `setState` updates need no dependencies — prefer them in any deferred code.
> - For long-lived subscriptions, split identity (effect deps) from data reads (refs / `useEffectEvent`).
> - Move logic from handlers to render-time derivation where possible; render code is never stale.
> - Treat every `exhaustive-deps` suppression as a bug report scheduled for later.

The QA ticket closed with a two-line diff. The design review that followed moved four other dashboards off the same pattern before they could file their own haunted-app tickets — that's the part I actually count as the fix.
