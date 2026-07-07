---
title: "Template Literal Types: Typing the Strings You Compose"
date: "2021-10-21"
category: "TypeScript"
excerpt: "TypeScript 4.1+ can type route paths, event names, and CSS values built from string composition. Practical patterns, not type golf."
---

Template literal types let the compiler understand strings you build by composition. The feature invites party tricks, but a few patterns are genuinely load-bearing in application code.

## Typed event names

```ts
type Entity = "user" | "project" | "invoice";
type Action = "created" | "updated" | "deleted";

type EventName = `${Entity}:${Action}`;
// "user:created" | "user:updated" | ... 9 combinations

function emit(event: EventName, payload: unknown) { /* ... */ }

emit("invoice:created", data);  // ok
emit("invoice:destroyed", data); // compile error
```

Nine valid names, zero maintained by hand. Add `"payment"` to `Entity` and the event space grows correctly everywhere.

## Typed route builders

```ts
type Route = "/users/:id" | "/projects/:id/tasks/:taskId";

type Params<T extends string> =
  T extends `${string}:${infer P}/${infer Rest}`
    ? P | Params<`/${Rest}`>
    : T extends `${string}:${infer P}`
      ? P
      : never;

function buildPath<T extends Route>(
  route: T,
  params: Record<Params<T>, string>
): string {
  return route.replace(/:(\w+)/g, (_, k) => params[k as Params<T>]);
}

buildPath("/projects/:id/tasks/:taskId", { id: "1", taskId: "9" }); // ok
buildPath("/projects/:id/tasks/:taskId", { id: "1" }); // error: taskId missing
```

`infer` inside a template literal pattern extracts the parameter names *from the route string itself*. Forgetting a param is now a compile error, not a 404 in staging.

## Key remapping for derived APIs

```ts
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
};

type UserGetters = Getters<{ name: string; age: number }>;
// { getName: () => string; getAge: () => number }
```

## Know when to stop

The heuristic I use: template literal types are worth it when they eliminate a *runtime* failure class (bad event name, missing route param). If the type exists only to impress reviewers, it will cost more in error-message archaeology than it saves. The best advanced types are the ones consumers never notice — autocomplete just works and invalid code just doesn't compile.
