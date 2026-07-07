---
title: "A Service Worker Caching Strategy That Won't Bite You"
date: "2020-12-10"
category: "Performance"
excerpt: "Cache-first for static assets, network-first for API calls, and the cache-versioning step everyone forgets until their users are stuck on old code."
---

Service workers make offline support and instant repeat loads possible — and they're also the only browser feature that can serve your users month-old code forever if you get caching wrong. Strategy matters more than syntax.

## Two strategies, applied by request type

**Cache-first** for fingerprinted static assets (JS, CSS, fonts): they're immutable, so cache hits are always safe.

**Network-first** for API calls and HTML: freshness matters, cache is only the offline fallback.

```js
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open("api-v1").then((c) => c.put(request, copy));
          return res;
        })
        .catch(() => caches.match(request))
    );
  } else if (url.pathname.startsWith("/static/")) {
    event.respondWith(
      caches.match(request).then((hit) => hit ?? fetch(request))
    );
  }
});
```

## The versioning step everyone forgets

Bump the cache name on deploy and delete old caches on activate — otherwise stale assets accumulate forever:

```js
const CACHE = "app-v42";

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
});
```

## Or skip hand-rolling entirely

Honestly: for production apps I now reach for Workbox, which encodes these strategies (`StaleWhileRevalidate`, `NetworkFirst`, precache manifests with automatic versioning) as tested primitives. Hand-rolled service workers are how you learn; Workbox is how you ship. Either way, never cache-first your HTML unless you enjoy explaining to users why refresh doesn't fix anything.
