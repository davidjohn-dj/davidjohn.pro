---
title: "Choosing a Vector Database: pgvector Until It Hurts"
date: "2023-05-25"
category: "AI Engineering"
excerpt: "Pinecone, Weaviate, Chroma, pgvector - the honest decision tree, plus the metadata-filtering and hybrid-search details that matter more than the benchmark."
---

Every RAG tutorial jumps straight to a dedicated vector database, and every architecture review I do this year asks "which one?" My answer, boringly often: Postgres.

## pgvector until it hurts

If your embeddings live where your application data already lives, an entire class of sync problems disappears:

```sql
CREATE EXTENSION vector;

CREATE TABLE chunks (
  id bigserial PRIMARY KEY,
  document_id bigint REFERENCES documents(id),
  content text,
  embedding vector(1536)
);

-- top-5 nearest by cosine distance, filtered by tenant
SELECT content, 1 - (embedding <=> $1) AS score
FROM chunks
WHERE document_id IN (SELECT id FROM documents WHERE org_id = $2)
ORDER BY embedding <=> $1
LIMIT 5;
```

Notice the `WHERE` clause: filtering by tenant/permissions *in the same query* as similarity. In a separate vector DB, that's metadata-filter APIs, dual writes, and eventual-consistency bugs between your source of truth and your index. Below a few million vectors, pgvector with an IVFFlat index handles it with latency indistinguishable from the dedicated players.

## When it starts to hurt

Real reasons to graduate: tens of millions of vectors, heavy write throughput with immediate searchability needs, or recall requirements that demand tuned HNSW at scale. Then the shortlist:

- **Pinecone** — managed, boring, expensive; the "we don't want to operate this" pick.
- **Weaviate/Qdrant** — self-hostable, strong filtering, hybrid search built in.
- **Chroma** — great for local dev and prototypes; embed it like SQLite.

## The two features that actually matter

Benchmarks obsess over queries-per-second; production cares about different things. **Metadata filtering**: nearly every real query is "similar to X, *where* user has access and doc is current" — evaluate how each store handles filtered search, because naive post-filtering silently ruins recall. **Hybrid search**: pure vectors miss exact identifiers (SKUs, error codes, names); combining BM25 keyword scores with vector similarity fixes the demo-day embarrassment of searching an invoice number and getting philosophy back.

Start with pgvector, instrument recall on your actual queries, and migrate when data — not fashion — tells you to.
