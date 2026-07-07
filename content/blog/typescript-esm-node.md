---
title: "Shipping ESM in Node Without Breaking Everyone: A TS 4.7 Guide"
date: "2022-06-16"
category: "Node.js"
excerpt: "TypeScript 4.7 landed nodenext module resolution. What moduleResolution, exports maps, and .mts actually do, and a sane migration path."
---

TypeScript 4.7 shipped `module: "nodenext"`, the last missing piece for writing native ES modules in Node with TypeScript. The ecosystem transition is still messy; here's the working configuration and the traps.

## The tsconfig that works

```json
{
  "compilerOptions": {
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "target": "ES2022",
    "strict": true
  }
}
```

And in `package.json`:

```json
{ "type": "module" }
```

Now `.ts` files compile to ESM `.js`. The immediate surprise: **relative imports need explicit `.js` extensions** — yes, `.js` even in `.ts` source, because you're writing the *output* path:

```ts
import { parseOrders } from "./orders/parse.js"; // resolves parse.ts
```

It reads wrong and works right. Editors auto-import correctly with the config above.

## Dual packages via exports maps

Publishing a library that serves both worlds:

```json
{
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.cjs",
      "types": "./dist/index.d.ts"
    }
  }
}
```

Build twice (esbuild makes this painless: one `format=esm`, one `format=cjs`). The `exports` map also *encapsulates* your package — deep imports of un-exported paths now fail, which is a feature, but announce it as a breaking change.

## The interop traps

- A CJS dependency imported from ESM gets only a default export in some cases — `import pkg from "cjs-thing"; const { x } = pkg;` is the reliable pattern.
- `__dirname` doesn't exist in ESM: use `new URL(".", import.meta.url).pathname`.
- Jest still fights ESM; Vitest doesn't. This pushed us to Vitest and we haven't looked back.

## My migration advice

Apps: switch when your framework does (Next, Remix handle it for you). Libraries: ship dual now via exports maps. Internal tools: go pure ESM today and enjoy top-level await. And whatever you do, decide *per package*, not per file — mixed-mode packages are where the weird bugs live.
