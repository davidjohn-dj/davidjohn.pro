---
title: "htmx and the Case for Hypermedia: Not Every App Needs a SPA"
date: "2023-10-12"
category: "JavaScript"
excerpt: "Attributes on HTML, partials from the server, and a 14KB budget. Where the hypermedia model beats the SPA - and where it doesn't."
---

htmx had a moment this year, and the backlash-to-the-backlash discourse buried the practical question: *when* is server-rendered hypermedia the right architecture? Having shipped an internal tool with it, here's my grounded take.

## The model in one example

htmx extends HTML with attributes that swap fragments from the server:

```html
<input type="search" name="q"
       hx-get="/contacts/search"
       hx-trigger="input changed delay:300ms"
       hx-target="#results" />

<tbody id="results">
  <!-- server returns <tr> rows, htmx swaps them in -->
</tbody>
```

The server endpoint returns HTML partials, not JSON:

```python
@app.get("/contacts/search")
def search(q: str):
    contacts = Contact.search(q)
    return render_template("partials/contact_rows.html",
                           contacts=contacts)
```

Search-as-you-type with debouncing, no JSON API, no client state, no build step — 14KB of library total. The mental shift: state lives on the server, and the browser displays it. Which is to say: how the web worked, plus surgical updates.

## Where it genuinely wins

Internal tools, admin panels, CRUD-heavy dashboards, content sites with islands of interactivity — anywhere the interaction pattern is "user acts, server responds, view updates." For our ops tool: no bundler config, no state-synchronization bugs (there's one state, on the server), new developers productive in an hour, and the thing is *fast* because it ships no framework.

## Where it doesn't

Optimistic UI, offline capability, complex client-side interactions (drag-and-drop builders, collaborative editing, anything canvas-based), or interfaces where round-tripping per interaction is unacceptable. And if your team's server side is a thin proxy over microservices returning JSON, generating HTML partials means building a rendering layer you don't have.

## The real lesson

The htmx conversation is valuable less for the library than for the recalibration: the SPA became a default, and defaults deserve auditing. My heuristic now — count the interactions that genuinely need client-side state. If it's a handful, hypermedia plus a sprinkle of vanilla JS is less code, fewer bugs, and no hydration bill. If it's the whole product, keep React and use it well.
