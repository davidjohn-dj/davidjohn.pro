---
title: "Server Actions: Forms Without the API Route"
date: "2024-01-25"
category: "Next.js"
excerpt: "Mutations as plain functions, progressive enhancement for free, and useFormStatus for pending UI. Also: they're public endpoints - validate accordingly."
---

Next.js 14 stabilized Server Actions, completing the App Router's missing half: mutations. The pattern deletes a surprising amount of code — the API route, the fetch wrapper, the loading-state plumbing — and replaces it with a function call across the network.

## The shape

```tsx
// app/invoices/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

const InvoiceSchema = z.object({
  client: z.string().min(1),
  amount: z.coerce.number().positive(),
});

export async function createInvoice(formData: FormData) {
  const session = await auth();                    // check auth ALWAYS
  if (!session) throw new Error("Unauthorized");

  const parsed = InvoiceSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { errors: parsed.error.flatten() };

  await db.invoice.create({ data: { ...parsed.data, userId: session.user.id } });
  revalidatePath("/invoices");
}
```

```tsx
// The form — works before JavaScript loads
<form action={createInvoice}>
  <input name="client" />
  <input name="amount" type="number" />
  <SubmitButton />
</form>
```

## Pending states without prop-drilling

```tsx
"use client";
import { useFormStatus } from "react-dom";

function SubmitButton() {
  const { pending } = useFormStatus();
  return <button disabled={pending}>{pending ? "Saving…" : "Save"}</button>;
}
```

`useFormStatus` reads the enclosing form's state — no `isLoading` threading. And because the form uses native `action`, it works with JavaScript disabled or still loading: progressive enhancement that SPAs abandoned a decade ago, back for free.

## The security framing that matters

Here's the mental model to enforce in review: **a Server Action is a public, unauthenticated HTTP endpoint** that happens to look like a function. The compiler wires the plumbing, not the protection. Every action needs its own auth check and input validation — the proximity to your component is ergonomic, not a trust boundary. Treat "looks like a local function call" as the ergonomics win it is, and never as a security assumption.

Between actions, `revalidatePath`/`revalidateTag`, and `useFormStatus`, the read-mutate-refresh loop is now fully framework-native. It's the first React mutation story that's both simpler *and* more robust than what it replaced.
