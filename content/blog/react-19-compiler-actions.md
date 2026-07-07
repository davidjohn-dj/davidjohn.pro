---
title: "React 19 RC: The Compiler Retires useMemo"
date: "2024-10-17"
category: "React"
excerpt: "Automatic memoization, Actions with useActionState, use(), and ref as a prop. What React 19 deletes from your codebase."
---

React 19 hit RC this month, and its theme is deletion: whole categories of code we've written for years — memoization boilerplate, form-state plumbing, `forwardRef` ceremony — become unnecessary. A tour of what you get to remove.

## The compiler ends the memoization era

React Compiler (now powering instagram.com) analyzes your components and auto-memoizes at build time. This code:

```jsx
const filtered = useMemo(
  () => products.filter((p) => p.category === category),
  [products, category]
);
const handleSelect = useCallback((id) => onSelect(id), [onSelect]);
```

becomes this code:

```jsx
const filtered = products.filter((p) => p.category === category);
const handleSelect = (id) => onSelect(id);
```

The compiler inserts equivalent (usually better) memoization automatically — it never forgets a dependency and never misses one. The years of `useCallback`-or-not code review debates just... end. It requires following the Rules of React (the ESLint plugin verifies), and it's opt-in for now, but this is clearly the future default.

## Actions and useActionState

Async transitions get first-class form support:

```jsx
const [state, submitAction, isPending] = useActionState(
  async (prev, formData) => {
    const err = await updateProfile(formData);
    return err ?? { ok: true };
  },
  null
);

<form action={submitAction}>
  <input name="displayName" />
  <button disabled={isPending}>Save</button>
  {state?.error && <p role="alert">{state.error}</p>}
</form>
```

Pending state, error state, and optimistic updates (`useOptimistic`) — the plumbing every form hand-rolls, now built in, and shared with the Server Actions model.

## Small deletions that add up

`use(promise)` reads promises in render (with Suspense integration) and — unlike hooks — works conditionally. `ref` is now a regular prop: every `forwardRef` wrapper in your design system can be unwrapped. `<Context>` renders as a provider directly. Document metadata (`<title>`, `<meta>`) hoists automatically from any component.

Migration reality: 19 itself is a mild upgrade (codemods cover the breaking changes), and the compiler can be adopted incrementally, file by file. Start with the ESLint plugin today — it flags the rule violations you'd need to fix anyway, and your future self will merge the compiler PR with a grin.
