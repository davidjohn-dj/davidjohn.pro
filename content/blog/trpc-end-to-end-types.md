---
title: "tRPC: End-to-End Type Safety Without Writing a Schema"
date: "2022-05-26"
category: "TypeScript"
excerpt: "Define a procedure on the server, call it from the client, and TypeScript knows the types across the wire. How tRPC works and when to choose it over REST or GraphQL."
---

The chronic frontend/backend problem: the API changes, the client doesn't, and you find out at runtime. GraphQL solves it with a schema and codegen. tRPC's bet: if both ends are TypeScript, *the types themselves are the contract* — no schema, no codegen, no drift.

## Server: procedures are just functions

```ts
import { initTRPC } from "@trpc/server";
import { z } from "zod";

const t = initTRPC.create();

export const appRouter = t.router({
  projectById: t.procedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => db.project.findUnique({ where: input })),

  createProject: t.procedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(({ input }) => db.project.create({ data: input })),
});

export type AppRouter = typeof appRouter;
```

Note the export: it's a *type*, not code. The client imports zero server runtime.

## Client: fully typed calls

```ts
const project = await trpc.projectById.query({ id: "p_123" });
//    ^? { id: string; name: string; createdAt: Date } — inferred

trpc.createProject.mutate({ name: "" });
// runtime: Zod rejects it; compile time: typo'd fields error immediately
```

Rename a field in the Prisma schema and every client usage turns red *in the editor*. That feedback loop — server refactor to client compile error in seconds — is the entire product, and it's glorious.

## The React Query integration

`@trpc/react-query` wraps procedures in typed hooks: `trpc.projectById.useQuery({ id })` gives you caching, invalidation, and optimistic updates with inferred types throughout.

## Honest scoping

tRPC is for *TypeScript monorepos where you own both ends* — a Next.js app with API routes is the sweet spot. It's the wrong tool for public APIs (no language-neutral contract), mobile/multi-platform consumers, or teams where backend and frontend deploy on different cadences from different repos (you've just built implicit coupling). Within its lane, though, it deletes an entire category of integration bugs and an entire layer of DTO boilerplate.
