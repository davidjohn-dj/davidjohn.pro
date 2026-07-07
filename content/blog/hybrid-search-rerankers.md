---
title: "Hybrid Retrieval and Rerankers: The RAG Upgrade With Receipts"
date: "2025-05-15"
category: "AI Engineering"
excerpt: "Vectors miss exact matches, BM25 misses paraphrases, and RRF fusion plus a reranker fixes both. Measured on our eval set: recall@5 from 64% to 89%."
---

Our support copilot's retrieval was "fine" — until we measured it: 64% recall@5 on a golden set of 80 real queries. Two upgrades later it's at 89%, and neither touched the LLM. This is the hybrid-plus-reranker recipe, with the numbers at each step.

## Why single-method retrieval caps out

Dense vectors capture *meaning*: "app crashes on launch" matches "application fails to start." But they blur *exactness* — searching `ERR_CONN_5321` retrieves conceptually-similar error docs instead of the one containing that literal string. Keyword search (BM25) has precisely the opposite profile. Real query streams contain both types, so either method alone leaves a chunk of your corpus effectively unreachable.

## Step 1: fuse with RRF (+17 points)

Run both searches, merge with Reciprocal Rank Fusion — no score normalization needed, just ranks:

```python
def rrf(result_lists, k=60):
    scores = defaultdict(float)
    for results in result_lists:
        for rank, doc_id in enumerate(results):
            scores[doc_id] += 1.0 / (k + rank + 1)
    return sorted(scores, key=scores.get, reverse=True)

candidates = rrf([vector_search(q, n=25), bm25_search(q, n=25)])
```

RRF is embarrassingly simple and hard to beat: a document ranked well by *either* method surfaces. Recall@5 went 64% → 81%.

## Step 2: rerank the candidates (+8 more)

First-stage retrieval optimizes for speed over a huge corpus; a **cross-encoder reranker** reads the actual query-document pairs and re-orders the shortlist:

```python
ranked = cohere.rerank(query=q, documents=top_25, top_n=5)
```

It's too slow to run over millions of chunks but perfect for 25 candidates (~80ms). This is where "mentions the error code" beats "vaguely about errors." 81% → 89%, and the answers' citation quality visibly improved — the model grounds on the *right* chunk, not a cousin.

## The meta-lesson

Every step was measured against the same golden set before shipping. Retrieval upgrades without an eval harness are indistinguishable from retrieval *changes* — and half of plausible-sounding tweaks (we tried query expansion; it hurt) make things worse. Build the 80-query harness first; it converts architecture debates into an afternoon of experiments.
