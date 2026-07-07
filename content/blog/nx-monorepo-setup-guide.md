---
title: "Structuring a Frontend Monorepo with Nx"
date: "2021-11-11"
category: "Tooling"
excerpt: "Apps thin, libs fat, boundaries enforced by lint rules, and affected-only CI. The Nx setup that scaled to five apps and forty libraries."
---

I've now led two Nx monorepo migrations. The tooling is good; the *structure* is what determines whether you get code sharing or a distributed mud-ball. Here's the shape that worked.

## Apps thin, libs fat

Applications should be deployment shells — routing, config, composition. Everything real lives in libraries:

```
apps/
  customer-portal/
  admin-dashboard/
libs/
  shared/ui/            # design system components
  shared/data-access/   # API clients, auth
  portal/feature-billing/
  admin/feature-reports/
```

The naming convention (`scope/type-name`) isn't cosmetic — it drives boundary enforcement.

## Boundaries as lint rules

Tag each library in `project.json` (`scope:shared`, `scope:admin`, `type:ui`, `type:feature`), then enforce the dependency rules:

```json
"@nrwl/nx/enforce-module-boundaries": ["error", {
  "depConstraints": [
    { "sourceTag": "scope:shared",
      "onlyDependOnLibsWithTags": ["scope:shared"] },
    { "sourceTag": "type:ui",
      "onlyDependOnLibsWithTags": ["type:ui", "type:util"] }
  ]
}]
```

Now a shared UI component importing from an app-specific feature is a lint error, not a code-review argument. This rule set is the single highest-value thing Nx gives you.

## Affected-only CI

Nx knows the dependency graph, so CI only builds and tests what a change touches:

```bash
nx affected --target=test --base=origin/main
nx affected --target=build --base=origin/main
```

A change to `admin/feature-reports` doesn't run the customer portal's e2e suite. Combined with computation caching (identical inputs return cached outputs, and Nx Cloud shares that cache across machines), our CI went from 24 minutes to about 6 for a typical PR — and 40% builds finished in seconds because the cache hit.

## The honest costs

Generators and executors have a learning curve; upgrading Nx itself is a project-wide event (`nx migrate` helps); and a monorepo makes *undisciplined* sharing easier too — without the boundary tags, you'll couple everything to everything within a quarter. Set the tags on day one.
