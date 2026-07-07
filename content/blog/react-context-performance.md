---
title: "React Context Without the Re-Render Tax"
date: "2020-11-19"
category: "React"
excerpt: "Context re-renders every consumer on every value change. Split contexts, memoize values, and know when you have outgrown it."
---

Context is React's built-in dependency injection, and it's great — until a fast-changing value starts re-rendering half your tree. The mechanics are simple once stated plainly: **when a Provider's `value` changes identity, every consumer re-renders.**

## Mistake 1: the inline object

```jsx
// Every render of App creates a new object -> all consumers re-render
<AuthContext.Provider value={{ user, login, logout }}>
```

Fix with `useMemo`:

```jsx
const value = useMemo(() => ({ user, login, logout }), [user]);
<AuthContext.Provider value={value}>
```

(`login`/`logout` should themselves be stable via `useCallback`.)

## Mistake 2: one mega-context

If theme, auth, and a rapidly-updating notification count live in one context, toggling the notification badge re-renders every theme consumer. Split by change frequency:

```jsx
<ThemeContext.Provider value={theme}>        {/* changes rarely */}
  <AuthContext.Provider value={auth}>        {/* changes on login */}
    <NotificationsContext.Provider value={n}> {/* changes constantly */}
      <App />
```

Consumers subscribe only to the slice they read. This one refactor fixed a client app where typing in a form stuttered because keystrokes updated a context consumed by the entire shell.

## Mistake 3: state and dispatch together

Components that only *trigger* actions shouldn't re-render when state changes:

```jsx
const StateContext = createContext();
const DispatchContext = createContext();

// A button that only dispatches never re-renders on state change
const dispatch = useContext(DispatchContext);
```

## When to move on

If you're memoizing aggressively and still fighting re-renders, the data is probably app state, not contextual environment. Libraries like Redux (with selector-based subscriptions) re-render only components whose *selected slice* changed — which is precisely the granularity Context can't give you today.
