---
title: "React Server Components: The Mental Model That Finally Clicked"
date: "2023-01-19"
category: "React"
excerpt: "Stop thinking 'SSR but different.' Server Components are a component-granular split of your app across the network boundary."
---

After two months in the Next.js App Router, Server Components finally clicked for me — and the click was realizing they're not "SSR, improved." SSR renders your client app to HTML once, then hydrates all of it. Server Components split your *component tree itself* across the network: some components exist only on the server, forever.

## The two component species

**Server Components** (the default): run at request/build time, can be async, can touch the database, ship zero JS to the browser. They render to a serialized tree description, not HTML.

**Client Components** (`"use client"`): the React you already know — state, effects, event handlers, hydrated in the browser.

```tsx
// Server Component: async, direct DB access, 0KB shipped
export default async function InvoiceList() {
  const invoices = await db.invoice.findMany();
  return (
    <ul>
      {invoices.map((inv) => (
        <li key={inv.id}>
          {inv.number} — <PayButton invoiceId={inv.id} />
        </li>
      ))}
    </ul>
  );
}
```

```tsx
"use client";
export function PayButton({ invoiceId }: { invoiceId: string }) {
  const [paying, setPaying] = useState(false);
  /* interactivity lives here, and only here */
}
```

## The boundary rules that confuse everyone

1. `"use client"` marks a *boundary*, not a file preference — everything a client component imports becomes client code too.
2. Server Components can render Client Components; the reverse works only via `children`. A client layout can *contain* server-rendered content it receives as props, but can't import and instantiate a Server Component.
3. Props crossing the boundary must serialize: no functions, no Dates without care, no class instances.

Rule 3 is the design pressure: it forces the interactive surface of your app to be explicit and thin.

## How to decide what goes where

My working heuristic: start everything as a Server Component; add `"use client"` at the *leaves*, only where an event handler or effect forces it. When a client boundary wants data, fetch in the server parent and pass it down. Your bundle becomes proportional to your interactivity, not your page count — which is the entire point.
