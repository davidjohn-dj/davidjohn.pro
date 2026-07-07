---
title: "ES2021: The Features Worth Adopting Today"
date: "2021-01-14"
category: "JavaScript"
excerpt: "replaceAll, Promise.any, logical assignment operators, and numeric separators - small additions that clean up everyday code."
---

ES2021 is a small release, but three of its features immediately replaced utility code in my projects.

## String.prototype.replaceAll

No more regex-with-global-flag for simple substring replacement:

```js
"2021-01-14".replaceAll("-", "/");  // "2021/01/14"

// Before: "2021-01-14".replace(/-/g, "/") — and everyone forgot
// that .replace("-", "/") only hits the first occurrence
```

## Logical assignment operators

`||=`, `&&=`, and `??=` combine logic with assignment:

```js
// Set a default only if the value is null/undefined
options.timeout ??= 5000;

// Before
options.timeout = options.timeout ?? 5000;
```

`??=` is the star: perfect for defaulting config objects without clobbering legitimate falsy values like `0` or `false`.

## Promise.any

Resolves with the *first fulfilled* promise, ignoring rejections until all fail:

```js
const fastest = await Promise.any([
  fetch("https://cdn-eu.example.com/data.json"),
  fetch("https://cdn-us.example.com/data.json"),
]);
```

This is the racing-mirrors pattern. `Promise.race` would reject if the first settled promise rejects; `Promise.any` keeps waiting for a success. If everything fails you get an `AggregateError` with all the reasons.

## Numeric separators

Pure readability:

```js
const budget = 1_000_000;
const bytes = 0xFF_FF_FF_FF;
```

## Support status

Chrome 85+, Firefox 79+ (replaceAll 77+), Safari 14+ cover all of it. For older targets, `@babel/preset-env` with the right browserslist handles the transforms. These are the kind of features you can adopt in an afternoon — update your lint config (`es2021: true` in ESLint env) and start deleting utility functions.
