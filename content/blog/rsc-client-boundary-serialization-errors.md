---
title: "\"Functions Cannot Be Passed to Client Components\": Surviving the RSC Boundary"
date: "2026-07-07"
category: "Next.js"
excerpt: "Migrating a 200-component design system to Server Components turned one cryptic error into a daily ritual. Here's the mental model of the serialization boundary — and the composition patterns that make it stop hurting."
image: "/images/blog/covers/rsc-client-boundary-serialization-errors.svg"
---

`Error: Functions cannot be passed directly to Client Components unless you explicitly expose it by marking it with "use server".`

If your team is adopting the App Router, this error is a rite of passage. So are its cousins: class instances that arrive as empty objects, `Date` props that used to be strings, and the moment someone slaps `"use client"` on a layout file and your bundle gains 200KB.

> [!STORY] Two hundred components, one boundary
> Last year I led a migration of an enterprise design system — about 200 components serving a dozen internal apps at a large consulting firm — from a Pages-era architecture to App Router with Server Components. Week one, the error above appeared 47 times in CI. The team's first instinct was to mark everything `"use client"` and move on. That "fix" would have quietly deleted every benefit we were migrating *for*. Understanding why the error exists turned out to be the whole migration.

## The boundary is a network, even when it isn't

The mental shift: props crossing from a Server Component into a Client Component are **serialized** — turned into data, embedded in the RSC payload, shipped to the browser, and revived there. It doesn't matter that both components live in one repo and might render in one process. Architecturally, that prop crossing is a network hop.

![What survives the server → client serialization boundary](/images/blog/diagrams/rsc-client-boundary-serialization-errors.svg)

Serializable: primitives, plain objects and arrays, `Date`, `Map`, `Set`, `FormData`, typed arrays, promises of serializable things, and JSX. **Not serializable: functions, class instances, symbols.** A function is code plus captured scope; there's no honest way to mail that to a browser.

## The three shapes of the bug

### Shape 1: The callback prop

Pages-era muscle memory — fetch in a server context, pass `onSelect` down:

```tsx
// app/reports/page.tsx (Server Component)
export default async function ReportsPage() {
  const reports = await getReports();
  return (
    <ReportTable
      reports={reports}
      onRowSelect={(id) => trackSelection(id)} // ❌ function across the boundary
    />
  );
}
```

The fix is to *move the owner of the interaction*, not to convert the page. The table's interactivity lives in a client component; the server passes data and, when the "callback" is really a mutation, a Server Action:

```tsx
// ReportTable.tsx
"use client";
export function ReportTable({
  reports,
  archiveReport, // ✅ Server Actions are the one legal "function prop"
}: {
  reports: Report[];
  archiveReport: (id: string) => Promise<void>;
}) { /* ... */ }

// actions.ts
"use server";
export async function archiveReport(id: string) {
  await db.reports.archive(id);
  revalidatePath("/reports");
}
```

Server Actions get away with it because they don't serialize the function — they serialize a *reference* to it, and invocation becomes an RPC back to the server.

### Shape 2: The class instance that arrives hollow

The design system's date-range picker took a `DateRange` class instance with methods like `.overlaps()`. Across the boundary, it arrived as `{ start: ..., end: ... }` — data survives, prototype doesn't. Nothing crashes until someone calls `range.overlaps()` and gets `TypeError: range.overlaps is not a function` — at *runtime*, possibly in production, because TypeScript has no idea the boundary exists.

The durable fix is a rule: **DTOs cross the boundary; behavior lives on each side.** Plain types in, pure functions where needed:

```ts
type DateRangeDTO = { start: string; end: string };
export function rangesOverlap(a: DateRangeDTO, b: DateRangeDTO): boolean { /* ... */ }
```

> [!WARNING]
> This failure mode is *silent*. Serialization strips methods without warning, and your types still claim they exist. If you take one rule from this post: never let a class instance touch a client component prop.

### Shape 3: `"use client"` creep

The seductive fix for both shapes above is marking the parent `"use client"`. But the directive doesn't mark *a file* — it marks a **boundary**, and everything that file imports becomes client-bundled too, transitively. Mark a layout and you've effectively opted your subtree out of Server Components.

The counter-pattern is composition: a client component can't *import* server components, but it can *render* them via `children`:

```tsx
// ThemePanel.tsx — client shell, knows nothing about data
"use client";
export function ThemePanel({ children }: { children: React.ReactNode }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <section data-expanded={expanded}>
      <button onClick={() => setExpanded((e) => !e)}>Toggle</button>
      {children} {/* ✅ server-rendered content passes through */}
    </section>
  );
}

// page.tsx — server, composes them
export default async function Page() {
  const usage = await getComponentUsageStats(); // stays on the server
  return (
    <ThemePanel>
      <UsageReport data={usage} />
    </ThemePanel>
  );
}
```

The server content is rendered *on the server* and threaded through the client shell as an already-materialized slot. This one pattern resolved most of our 47 CI failures.

> [!TIP]
> Audit trick: run your bundle analyzer before and after any PR that adds a `"use client"` directive. We gated CI on client-bundle size during the migration; it caught three accidental boundary explosions in the first month, each within minutes instead of at the quarterly performance review.

## The rules we ended up painting on the wall

By the end of the migration these five rules were literally in the PR template:

1. Props crossing to `"use client"` must be **data**, not behavior. DTOs only.
2. Mutations cross as **Server Actions**, never as callbacks.
3. Interactivity goes in **leaf components**; push the boundary down, not up.
4. Client shells receive server content via **`children`**, not imports.
5. Every new `"use client"` directive names its reason in the PR description.

> [!TAKEAWAYS]
> - The server→client prop crossing is serialization: treat it like a network hop that happens to be invisible.
> - Functions, class instances, and symbols don't cross. `Date`, `Map`, `Set`, plain objects, and JSX do.
> - Server Actions are serialized *references* — the sanctioned function-shaped thing.
> - `"use client"` marks a boundary, and it's transitive through imports. Push it toward the leaves.
> - The `children` pass-through pattern lets client shells wrap server-rendered content.

Six months post-migration, the design system serves both worlds from one codebase, and the error count for the boundary is roughly zero per week. The boundary stopped hurting exactly when the team stopped fighting it and started designing *for* it.
