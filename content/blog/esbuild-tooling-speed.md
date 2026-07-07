---
title: "esbuild: Why Your Next Build Tool Is Written in Go"
date: "2021-08-19"
category: "Tooling"
excerpt: "esbuild bundles in milliseconds what webpack does in minutes. Where to adopt it today - and where its trade-offs say wait."
---

I benchmarked our mid-size React app: webpack 5 production build, 74 seconds. esbuild: 1.1 seconds. That's not an optimization, that's a category change — and it's why esbuild is quietly becoming the engine inside everyone else's tools.

## Why it's this fast

Three boring, compounding reasons: it's written in Go and compiled to native code (no JIT warm-up, real parallelism across cores); it parses each file once into one AST instead of the parse-transform-reparse relay that Babel-based pipelines run; and everything from resolving to minifying happens in one tool with no inter-plugin string passing.

## Using it directly

```bash
esbuild src/index.tsx --bundle --minify --sourcemap \
  --target=es2018 --outfile=dist/app.js
```

Or the API:

```js
require("esbuild").build({
  entryPoints: ["src/index.tsx"],
  bundle: true,
  minify: true,
  splitting: true,
  format: "esm",
  outdir: "dist",
  define: { "process.env.NODE_ENV": '"production"' },
});
```

TypeScript and JSX are handled natively — no loaders, no presets, no `.babelrc`.

## The trade-offs, honestly

- **It strips types, it doesn't check them.** Run `tsc --noEmit` in CI as a separate step.
- **No type-aware transforms**: `emitDecoratorMetadata` (NestJS, older Angular DI) doesn't work.
- **Down-leveling stops at ES6** — if you truly need ES5 for old browsers, esbuild isn't your minifier.
- **The plugin API is deliberately minimal.** If your webpack config is a small civilization of loaders, you won't port it 1:1.

## Where to adopt it now

The pragmatic path: keep your bundler, swap the slow parts. Use esbuild as the TS/JSX transformer and minifier (`esbuild-loader` for webpack), or adopt Vite, which already uses esbuild for dev pre-bundling. Full esbuild bundling is great for libraries, CLIs, lambdas, and internal tools today. For the flagship app, give the ecosystem another year — but the direction is unmistakable.
