---
title: "Lazy Loading Images with Intersection Observer"
date: "2020-09-17"
category: "Performance"
excerpt: "Scroll-listener lazy loading is obsolete. IntersectionObserver does it better in 15 lines, plus the new native loading=lazy attribute."
---

Image weight is still the number one thing slowing down the pages I audit. Lazy loading below-the-fold images is the highest-leverage fix, and it no longer requires scroll listeners.

## The IntersectionObserver approach

```js
const observer = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        observer.unobserve(img);
      }
    }
  },
  { rootMargin: "200px" }
);

document.querySelectorAll("img[data-src]").forEach((img) => {
  observer.observe(img);
});
```

```html
<img data-src="/photos/hero-4x.jpg" alt="Product hero"
     width="800" height="450" />
```

Two details matter. `rootMargin: "200px"` starts the load 200px before the image enters the viewport, so it's usually ready when the user arrives. And explicit `width`/`height` attributes reserve the space, preventing layout shift when the image pops in.

## The native option

Browsers are shipping it built-in — Chrome since 76, Firefox 75:

```html
<img src="/photos/hero-4x.jpg" loading="lazy" alt="Product hero" />
```

No JavaScript at all. Safari doesn't support it yet, so today my recommendation is: use `loading="lazy"` as the baseline and layer the IntersectionObserver fallback only if your Safari traffic justifies it. For most sites, native lazy loading plus properly sized images gets you 90% of the win.

## Don't lazy load everything

Above-the-fold images should load eagerly — lazy loading your hero image *adds* latency because the browser's preload scanner would have fetched it earlier. Audit with the Coverage and Network panels: lazy below the fold, eager above, and set dimensions everywhere.
