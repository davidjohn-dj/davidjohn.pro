---
title: "Semantic Search with Embeddings: Beyond Keyword Matching"
date: "2023-03-23"
category: "AI Engineering"
excerpt: "Embeddings turn text into vectors where distance means similarity. Building search that understands 'reset my password' matches 'can't log in' - with cosine similarity from scratch."
---

Keyword search fails at the exact moment users need it: they search "can't log in" and your help article is titled "Resetting your password." Zero shared keywords, identical meaning. Embeddings fix this — they map text into a vector space where *meaning* is geometry.

## Generating embeddings

```ts
const response = await openai.embeddings.create({
  model: "text-embedding-ada-002",
  input: "How do I reset my password?",
});
const vector = response.data[0].embedding; // 1536 numbers
```

Texts with similar meaning produce nearby vectors. "Can't log in" and "password reset" end up close; "pricing plans" ends up far. That's the entire trick.

## Search in 30 lines

Index your documents once:

```ts
const docs = await loadHelpArticles();
const embedded = await Promise.all(
  docs.map(async (d) => ({
    ...d,
    vector: await embed(d.title + "\n" + d.body),
  }))
);
```

Query with cosine similarity:

```ts
function cosine(a: number[], b: number[]) {
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] ** 2;
    magB += b[i] ** 2;
  }
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

async function search(query: string, k = 5) {
  const qv = await embed(query);
  return embedded
    .map((d) => ({ ...d, score: cosine(qv, d.vector) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}
```

For a few thousand documents, this brute-force loop is *fine* — single-digit milliseconds. Don't reach for a vector database until scale forces you.

## Practical tuning notes

Embed title and body together (titles carry disproportionate signal). Chunk long documents — ada-002 handles 8K tokens, but retrieval works better on focused ~500-token passages. Cache embeddings keyed on content hash; they only change when the text does. And set a similarity floor (~0.75 for ada-002) below which you show "no results" instead of confidently wrong ones.

This same primitive — embed, compare, retrieve — is the foundation of the retrieval-augmented generation patterns everyone's building right now. Master it small before you scale it.
