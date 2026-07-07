---
title: "Debounce vs. Throttle: Pick the Right Tool"
date: "2020-07-28"
category: "JavaScript"
excerpt: "Search inputs want debounce, scroll handlers want throttle, and both are ten lines of code. A practical guide with implementations."
---

Every frontend developer eventually types "debounce vs throttle" into a search engine at 6pm on a deadline. Here's the version I wish I'd read first.

## The one-line distinction

- **Debounce**: run the function once, *after the calls stop* for N ms. Good for "wait until the user is done".
- **Throttle**: run the function *at most once every* N ms while calls continue. Good for "keep up, but at a sane rate".

## Debounce for search-as-you-type

```js
function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

searchInput.addEventListener(
  "input",
  debounce((e) => fetchSuggestions(e.target.value), 300)
);
```

Each keystroke resets the timer, so the API call only fires 300ms after the user pauses. Ten keystrokes, one request.

## Throttle for scroll and resize

```js
function throttle(fn, interval) {
  let last = 0;
  return function (...args) {
    const now = Date.now();
    if (now - last >= interval) {
      last = now;
      fn.apply(this, args);
    }
  };
}

window.addEventListener(
  "scroll",
  throttle(updateProgressBar, 100)
);
```

A debounced scroll handler would only fire when scrolling *stops* — useless for a reading-progress bar. Throttle keeps it updating smoothly at 10fps instead of hammering it at every scroll event.

## Choosing in practice

Ask: do I care about the *final* state (debounce) or the *ongoing* state (throttle)? Autosave: debounce. Infinite-scroll position check: throttle. Window resize re-layout: usually debounce, because you only care where it lands. And if you're already shipping lodash, `_.debounce` and `_.throttle` handle edge cases (leading/trailing invocation) that these minimal versions skip.
