---
title: "Migrating from Create React App to Vite"
date: "2021-04-22"
category: "Tooling"
excerpt: "Cold starts went from 28 seconds to under a second. The migration steps, the gotchas, and why native ESM makes it possible."
---

Our largest CRA app took 28 seconds to cold-start the dev server and 4 seconds to reflect a change. After migrating to Vite: under 1 second cold start, sub-100ms hot updates. Same app, same code.

## Why it's fast

Webpack bundles your entire app before serving anything. Vite serves source files over native ES modules — the browser requests only what the current page imports, and esbuild pre-bundles dependencies (written in Go, roughly 100x faster than JS-based bundlers). Dev-server cost becomes proportional to the code you *view*, not the code you *have*.

## The migration, step by step

```bash
npm install vite @vitejs/plugin-react --save-dev
npm uninstall react-scripts
```

```js
// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
});
```

Then the mechanical changes:

1. Move `public/index.html` to the project root, and reference the entry directly: `<script type="module" src="/src/index.jsx"></script>`
2. Rename env vars: `REACT_APP_API_URL` becomes `VITE_API_URL`, read via `import.meta.env.VITE_API_URL`
3. Files with JSX need `.jsx`/`.tsx` extensions — esbuild won't parse JSX in `.js`
4. Update scripts: `"dev": "vite", "build": "vite build", "preview": "vite preview"`

## The gotchas

- Anything reading `process.env` at runtime breaks; use `import.meta.env` or `define` in the config.
- Jest doesn't understand `import.meta` — we moved to Vitest later; short-term a small shim works.
- CommonJS-only packages occasionally need `optimizeDeps.include`.

Total effort for a 300-component app: about a day and a half, most of it renaming env vars and chasing `.js`-with-JSX files. For the feedback-loop improvement it's the best day and a half I've spent on tooling in years.
