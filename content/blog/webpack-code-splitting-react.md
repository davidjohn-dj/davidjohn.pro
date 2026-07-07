---
title: "Code Splitting a React App: From 1.2MB to 280KB"
date: "2020-08-06"
category: "Performance"
excerpt: "Route-level React.lazy, vendor chunking, and bundle analysis - the exact steps that cut our initial bundle by 76%."
---

A client's React dashboard shipped 1.2MB of JavaScript (gzipped!) to render a login page. Here's the process that got initial load down to 280KB.

## Step 1: Measure before touching anything

```bash
npm install --save-dev webpack-bundle-analyzer
```

```js
// webpack.config.js
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");
plugins: [new BundleAnalyzerPlugin()]
```

The treemap showed the usual suspects: a charting library, moment with all locales, and every route's code in one chunk.

## Step 2: Split at the route level

`React.lazy` plus `Suspense` is all you need for most apps:

```jsx
import React, { lazy, Suspense } from "react";

const Reports = lazy(() => import("./pages/Reports"));
const Settings = lazy(() => import("./pages/Settings"));

<Suspense fallback={<PageSkeleton />}>
  <Switch>
    <Route path="/reports" component={Reports} />
    <Route path="/settings" component={Settings} />
  </Switch>
</Suspense>
```

Webpack turns each `import()` into its own chunk, loaded on first navigation. The heavy charting library now lives only in the Reports chunk — users who never open Reports never download it.

## Step 3: Kill the moment locales

The infamous fix, worth 160KB in our case:

```js
new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/);
```

(Or migrate to date-fns, which tree-shakes properly.)

## Step 4: Stable vendor chunk

```js
optimization: {
  splitChunks: {
    chunks: "all",
    cacheGroups: {
      vendor: { test: /node_modules/, name: "vendors" },
    },
  },
},
```

Vendors change rarely, so returning users hit cache for the biggest chunk even after you deploy app code changes.

Result: 280KB initial, and the biggest win — time-to-interactive on 3G dropped from 11s to under 4s. Measure, split routes, audit dependencies. In that order.
