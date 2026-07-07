---
title: "Optional Chaining and Nullish Coalescing in Production Code"
date: "2020-05-21"
category: "JavaScript"
excerpt: "ES2020's ?. and ?? finally shipped in all major browsers. Where they shine, where they hide bugs, and how to configure Babel for older targets."
---

ES2020's optional chaining (`?.`) and nullish coalescing (`??`) are now in Chrome, Firefox, Safari, and the new Edge. After migrating a large dashboard codebase to them, here's my field guide.

## Replace the && chains

This pattern is everywhere in React apps:

```js
const street = user && user.address && user.address.street;
```

It becomes:

```js
const street = user?.address?.street;
```

Beyond brevity, `?.` is more correct: the `&&` version returns `false`, `0`, or `""` if any link is falsy, while `?.` only short-circuits on `null` and `undefined`.

## ?? is not ||

This distinction pays rent. `||` falls back on *any* falsy value; `??` only on null/undefined:

```js
const pageSize = settings.pageSize || 25;  // 0 becomes 25 — bug!
const pageSize = settings.pageSize ?? 25;  // 0 stays 0
```

Any numeric or boolean setting where zero/false is a legitimate value should use `??`. I found three real bugs in our codebase during the migration, all of this shape.

## Don't chain past your data contract

A word of caution: `?.` makes it painless to be defensive everywhere, and that's a smell. If your API guarantees `user.address` exists, writing `user?.address?.street` hides violations of that contract instead of surfacing them. Use optional chaining at genuine optionality boundaries, not as seatbelts on every property access.

## Babel setup

For older targets, add `@babel/plugin-proposal-optional-chaining` and `@babel/plugin-proposal-nullish-coalescing-operator`, or just bump `@babel/preset-env` to 7.8+, which includes both by default. TypeScript users need 3.7 or later.
