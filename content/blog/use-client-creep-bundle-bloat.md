---
title: "\"use client\" Creep: How Our Server-First App Quietly Became a 1.2MB SPA"
date: "2026-07-11"
category: "Next.js"
excerpt: "Nobody decides to ship a megabyte of JavaScript — it happens one convenient directive at a time. Auditing a customer portal that drifted from server-first to client-everything, and the boundary discipline that reversed it."
image: "/images/blog/covers/use-client-creep-bundle-bloat.svg"
---

No one on the team ever proposed shipping 1.2MB of JavaScript to render a mostly-static customer portal. There was no meeting where we decided that. It happened the way most architectural erosion happens: one reasonable-looking `"use client"` at a time.

> [!STORY] The audit that started with a lighthouse score
> A wealth-management client brought me in because their new App Router portal — rebuilt specifically for performance — was scoring *worse* on mobile than the legacy app it replaced. First thing I ran wasn't Lighthouse; it was the bundle analyzer. First-load JS: 1.21MB compressed. For a portfolio summary page whose interactivity was two dropdowns and a logout button. `git log -S '"use client"'` told the story: 9 directives at launch, 74 eight months later. Every single one had a plausible PR justification. The sum of plausible was a megabyte.

## How creep happens: the four ratchets

Watching that history unfold in the git log, the additions clustered into four recurring moves — each locally sensible, each ratcheting the boundary upward.

**Ratchet 1: the error-message shortcut.** You hit `useState is not defined in Server Components` or the function-prop serialization error, and the fastest green build is `"use client"` at the top of the *current* file — which is often a section or layout, not the button that needed it.

**Ratchet 2: the shared-file trap.** Someone adds a `usePathname()` call to a utility component in `components/shared/`. Every server component importing anything from that barrel file now pulls a client module — and because the directive is transitive through imports, whole subtrees silently switch sides.

**Ratchet 3: the library import.** A dev imports a chart library, a date picker, an animation lib — client-only, hooks inside — into an otherwise-server page, then marks the page client to make it compile.

**Ratchet 4: copy-paste inheritance.** New files start as copies of old files. If the template file has the directive, its descendants do too, needed or not. Eleven of our 74 directives had *no client-only APIs in the file at all*.

![The boundary drifting upward, one directive at a time](/images/blog/diagrams/use-client-creep-bundle-bloat.svg)

## Why this costs more than kilobytes

The bundle size is the visible symptom, but the deeper losses compound:

- **Data fetching moves client-side.** Components that cross the boundary can't be async, can't touch the database, can't read secrets — so fetching migrates into effects and route handlers, resurrecting the waterfalls and loading spinners App Router was adopted to kill.
- **Everything hydrates.** Server-rendered HTML for a client component still ships its JS and re-executes on the client. A megabyte of hydration on mid-tier mobile hardware was ~1.9s of main-thread time in our traces — that was the Lighthouse regression, not network.
- **The boundary stops meaning anything.** When 90% of the tree is client, "is this safe to put secrets/queries in?" has no quick answer, and review burden goes up everywhere.

## Reversing it: the mechanical part

The cleanup was less clever than you'd hope, which is the good news — it's repeatable.

**Step 1: find directives that do nothing.** We scripted it: for each file with the directive, grep for client-only signals (`useState`, `useEffect`, event handlers, `window`, browser APIs). No hits → remove the directive, run the build. Eleven directives deleted in an afternoon.

**Step 2: push the rest toward the leaves.** For each remaining boundary, extract the interactive core into its own small file and un-mark the parent:

```tsx
// Before: entire 400-line PortfolioSection is client for one toggle
"use client";
export function PortfolioSection({ holdings }: Props) { /* ... */ }

// After: server section, client leaf
// portfolio-section.tsx (server — data, layout, 390 lines)
export async function PortfolioSection({ accountId }: Props) {
  const holdings = await getHoldings(accountId);
  return (
    <section>
      <HoldingsTable holdings={holdings} />
      <CurrencyToggle /> {/* the only client bit */}
    </section>
  );
}

// currency-toggle.tsx (client — 20 lines)
"use client";
export function CurrencyToggle() {
  const [ccy, setCcy] = useState<"CAD" | "USD">("CAD");
  // ...
}
```

**Step 3: break the shared-barrel contagion.** Split `components/shared/index.ts` exports so server-safe and client modules don't travel together. A barrel file that re-exports one client component clientifies every consumer of the barrel.

**Step 4: use the `children` pass-through** for client shells that wrap server content (context providers, animation wrappers, collapsibles) — the pattern I covered in the RSC boundary post. Providers were our biggest single win: the theme + analytics provider stack at the root had been marking *everything below it* as its import graph; restructured to accept `children`, the tree below went back to being server-rendered.

> [!WARNING]
> Watch your `Providers.tsx`. Wrapping `{children}` in a client provider is fine — children pass through as serialized content. But every component the provider file *imports* joins the client bundle. Keep provider files import-light; a fat providers file is a bundle-wide tax.

## Keeping it reversed: the ratchet in the other direction

Erosion resists one-time fixes, so the durable half of the engagement was CI:

```json
// budget checked in CI against the build manifest
{ "route": "/portfolio", "maxFirstLoadKB": 220 }
```

Plus one process rule — any PR adding `"use client"` states in its description *which browser API or hook* requires it. Not approval theatre; just forcing the one-sentence justification that distinguishes ratchet 1 from a real need.

Eight weeks later: first-load JS 287KB (from 1.21MB), mobile LCP down 41%, and — my favourite metric — data fetching back in server components, which deleted about 900 lines of loading-state boilerplate.

> [!TAKEAWAYS]
> - Bundle bloat in App Router apps is usually boundary drift, not big dependencies. Audit directives before dependencies.
> - `"use client"` is transitive through imports — barrels and provider files are the super-spreaders.
> - Fix mechanically: delete no-op directives, extract interactive leaves, split barrels, pass server content through `children`.
> - The costs beyond kilobytes: client-side data fetching returns, hydration eats main-thread time, the security boundary blurs.
> - Hold the line with per-route bundle budgets in CI and a one-sentence justification per new directive.

The git log now shows directives being *removed* in ordinary feature PRs — the team's default flipped back. Architecture is what the defaults do when nobody's watching.
