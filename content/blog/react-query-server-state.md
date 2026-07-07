---
title: "React Query: Stop Putting Server Data in Redux"
date: "2021-03-18"
category: "React"
excerpt: "Server state has different problems than client state - caching, staleness, refetching. React Query solves them in a way Redux never did."
---

For years the default was: fetch in a thunk, normalize into Redux, select it back out, and hand-roll loading flags. React Query's insight is that **server state is a cache, not state** — and caches want different tools.

## The before and after

Before, per endpoint: an action triple (`REQUEST/SUCCESS/FAILURE`), a reducer slice, a thunk, a selector, and manual `isLoading` flags. After:

```jsx
import { useQuery } from "react-query";

function Projects() {
  const { data, isLoading, error } = useQuery(
    ["projects"],
    () => fetch("/api/projects").then((r) => r.json())
  );

  if (isLoading) return <Skeleton />;
  if (error) return <ErrorState error={error} />;
  return <ProjectList projects={data} />;
}
```

Caching, deduplication (ten components can call this hook, one request fires), background refetching on window focus, and retry logic — all included.

## Staleness is the core concept

```jsx
useQuery(["projects"], fetchProjects, {
  staleTime: 60_000,   // fresh for 1 min: no refetch on remount
  cacheTime: 300_000,  // keep unused data 5 min before GC
});
```

`staleTime` is the knob people miss. Default is 0 — every remount refetches. For data that changes rarely, a generous `staleTime` eliminates request storms while keeping the instant-render-from-cache behavior.

## Mutations with optimistic updates

```jsx
const mutation = useMutation(updateProject, {
  onMutate: async (next) => {
    await queryClient.cancelQueries(["projects"]);
    const prev = queryClient.getQueryData(["projects"]);
    queryClient.setQueryData(["projects"], (old) =>
      old.map((p) => (p.id === next.id ? next : p))
    );
    return { prev };
  },
  onError: (_e, _next, ctx) =>
    queryClient.setQueryData(["projects"], ctx.prev),
  onSettled: () => queryClient.invalidateQueries(["projects"]),
});
```

Optimistic UI with rollback in fifteen lines.

Redux still earns its place for genuinely client-side state machines. But every `usersById` slice with a `loading` flag is React Query waiting to be adopted — we deleted about 40% of our Redux code and the app got *more* responsive, not less.
