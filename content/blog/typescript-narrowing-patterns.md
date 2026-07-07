---
title: "TypeScript Narrowing: Discriminated Unions Over Boolean Flags"
date: "2022-12-08"
category: "TypeScript"
excerpt: "Model states as a union with a discriminant and impossible states stop compiling. The pattern, exhaustiveness checking, and typed API results."
---

The most impactful TypeScript habit I teach isn't a fancy type — it's modeling state as a discriminated union so that impossible states don't compile.

## The boolean-flags trap

```ts
interface RequestState {
  isLoading: boolean;
  error?: Error;
  data?: Report[];
}
```

This type permits `{ isLoading: true, error: ..., data: ... }` — loading *and* errored *and* holding data. Every consumer needs defensive checks against combinations that should never exist.

## The discriminated union

```ts
type RequestState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; error: Error }
  | { status: "success"; data: Report[] };
```

`status` is the discriminant. Now narrowing is automatic:

```ts
function render(state: RequestState) {
  switch (state.status) {
    case "loading": return <Spinner />;
    case "error":   return <Alert error={state.error} />; // error exists here
    case "success": return <Table data={state.data} />;   // data exists here
    case "idle":    return null;
  }
}
```

Inside each branch, TypeScript knows exactly which fields exist. `state.data` in the error branch is a compile error, not a runtime `undefined`.

## Exhaustiveness: the free regression test

```ts
default: {
  const _exhaustive: never = state;
  throw new Error(`Unhandled: ${_exhaustive}`);
}
```

Add a `"retrying"` variant next quarter and every switch missing it fails to compile. This is the pattern's superpower: state machine changes *find* their consumers.

## Apply it at the API boundary

```ts
type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: string; message: string } };

const result = await fetchReport(id);
if (!result.ok) return showError(result.error); // typed error
processReport(result.data);                     // typed data
```

No thrown exceptions across layers, no `data?.maybe`. Callers *must* handle failure to reach the data — the type system enforcing the code review comment you're tired of writing.
