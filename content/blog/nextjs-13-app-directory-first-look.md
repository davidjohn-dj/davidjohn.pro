---
title: "Next.js 13's App Directory: A First Look at the New Mental Model"
date: "2022-10-27"
category: "Next.js"
excerpt: "Server Components by default, layouts that don't re-render, and colocation of data with UI. What the beta gets right and what to wait on."
---

Next.js 13 landed this week with the beta `app/` directory — the biggest re-think of the framework since `getServerSideProps`. I've spent the week porting a side project. The mental model is genuinely better; the beta is genuinely a beta.

## Server Components by default

Every component in `app/` is a React Server Component unless marked otherwise. Server Components render on the server and ship **zero JavaScript** — and they can just... fetch:

```tsx
// app/projects/page.tsx — no getServerSideProps, no useEffect
export default async function ProjectsPage() {
  const projects = await db.project.findMany();
  return <ProjectList projects={projects} />;
}
```

Data fetching colocated with the component that needs it, executed on the server, with direct database access. Interactive components opt into the client:

```tsx
"use client";
export function FilterBar() {
  const [query, setQuery] = useState("");
  /* ... */
}
```

The discipline this enforces — interactivity is the exception, marked explicitly — pushes bundles the right direction by default.

## Layouts that persist

```
app/
  layout.tsx        # shell: renders once
  projects/
    layout.tsx      # projects sidebar
    page.tsx
    [id]/page.tsx
```

Navigating between projects re-renders only `page.tsx`; layouts above it keep their state (scroll position, expanded nav). The old `_app.tsx` acrobatics for persistent layouts are simply gone. Add `loading.tsx` and `error.tsx` per segment and you get route-level Suspense and error boundaries by convention.

## What to wait on

Being honest from a week inside it: many libraries break under Server Components (anything touching `useContext` at import time needs a client wrapper); the `fetch`-cache semantics take relearning; and mutations don't have a real story yet — you'll still write API routes. Vercel says stable next year.

My recommendation: learn the model now on something small, because it *is* the direction React itself is going — but migrate the production app when the ecosystem catches up.
