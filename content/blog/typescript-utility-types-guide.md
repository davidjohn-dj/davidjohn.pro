---
title: "The Six TypeScript Utility Types I Use Every Week"
date: "2020-10-08"
category: "TypeScript"
excerpt: "Partial, Pick, Omit, Record, ReturnType, and Readonly - with the real-world scenario where each one earns its place."
---

TypeScript ships with a standard library of type transformations, and six of them cover almost everything I do in application code.

## Partial — update payloads

```ts
interface User {
  id: string;
  name: string;
  email: string;
}

function updateUser(id: string, changes: Partial<User>) { /* ... */ }

updateUser("u1", { email: "new@example.com" }); // valid
```

Every PATCH endpoint wants this. All fields optional, no duplicate interface.

## Pick and Omit — narrowing for components

```ts
type UserCardProps = Pick<User, "name" | "email">;
type PublicUser = Omit<User, "email">;
```

A component that renders a card doesn't need the whole entity. `Pick` documents exactly what it consumes; `Omit` is perfect for stripping sensitive fields from API responses.

## Record — typed dictionaries

```ts
type Status = "todo" | "doing" | "done";

const columnTitles: Record<Status, string> = {
  todo: "Backlog",
  doing: "In Progress",
  done: "Shipped",
};
```

The compiler now enforces that every status has a title. Add a new status to the union and every `Record<Status, ...>` in the codebase becomes a helpful compile error until you handle it.

## ReturnType — deriving instead of duplicating

```ts
function createStore() {
  return { subscribe, dispatch, getState };
}

type Store = ReturnType<typeof createStore>;
```

When the source of truth is a function, derive the type from it rather than maintaining a parallel interface that drifts.

## Readonly — freeze your config

```ts
const config: Readonly<AppConfig> = loadConfig();
config.apiUrl = "oops"; // compile error
```

The pattern behind all of these: describe a type *in terms of another type*. When the base changes, the derived types follow automatically — that's the difference between types that help you refactor and types that fight you.
