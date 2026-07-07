---
title: "RAG Quality Is Chunking Quality"
date: "2023-08-17"
category: "AI Engineering"
excerpt: "Retrieval fails at the chunk level long before the model sees anything. Structure-aware splitting, overlap, context headers, and how to evaluate."
---

Teams debugging a bad RAG answer instinctively tune the prompt or upgrade the model. In my experience the failure is upstream ~70% of the time: the right information existed but was chunked so badly it couldn't be retrieved, or arrived shredded of context.

## Why naive chunking fails

Fixed 1000-character windows chop mid-sentence, split tables from their headers, and orphan pronouns from their antecedents. A chunk reading "It must be submitted within 30 days" retrieves poorly for "when is the warranty claim deadline?" — the word "warranty" lives in the *previous* chunk.

## Split on structure first

Documents have hierarchy — use it:

```python
def chunk_document(doc):
    sections = split_by_headings(doc)          # H1/H2/H3 boundaries
    chunks = []
    for section in sections:
        if token_len(section.text) <= 500:
            chunks.append(section)
        else:
            # fall back: paragraphs, then sentences
            chunks.extend(split_recursive(section, max_tokens=500,
                                          overlap_tokens=75))
    return chunks
```

Headings, paragraphs, list items — chunks that align with how the *author* organized meaning retrieve dramatically better than arithmetic windows. Overlap (~15%) insures against boundary straddling.

## Prepend the breadcrumb

The single highest-ROI trick I know: give every chunk its ancestry.

```
[Employee Handbook > Benefits > Parental Leave]
Eligible employees receive 16 weeks of paid leave...
```

That header travels with the chunk into both the embedding (better retrieval — "parental leave" now matches even if the paragraph says "this benefit") and the prompt (better grounding — the model can cite *where* the fact lives).

## Evaluate retrieval separately

Build a small golden set — 30 real questions mapped to the chunks that answer them — and measure recall@k on retrieval *alone*, before any generation:

```python
hits = sum(1 for q in golden if any(c in retrieve(q.text, k=5)
                                    for c in q.expected_chunks))
```

If recall@5 is 60%, no prompt engineering will save you; fix chunking and re-measure. Chunk size, overlap, headers, structure-awareness — each becomes a measurable experiment instead of a vibe. The teams with great RAG all converged on this loop; the ones without it are tuning prompts against upstream noise.
