---
title: "LangChain in Production: What to Use, What to Skip"
date: "2023-04-13"
category: "AI Engineering"
excerpt: "After a quarter building with LangChain: the loaders and splitters earn their keep, the chains and agents you should probably write yourself."
---

LangChain is the fastest-moving library I've ever depended on — new abstractions weekly, docs perpetually one version behind. After a quarter of production use, my take: it's two libraries wearing one trench coat. One of them is great.

## The great one: data plumbing

Document loaders, text splitters, and integration glue are genuinely valuable — boring code someone else maintains:

```python
from langchain.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter

docs = PyPDFLoader("contract.pdf").load()
chunks = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=150,
    separators=["\n\n", "\n", ". ", " "],
).split_documents(docs)
```

`RecursiveCharacterTextSplitter` alone justifies the dependency: it splits on paragraph, then sentence, then word boundaries, respecting structure instead of chopping mid-sentence. Add the vector-store adapters (one interface over Pinecone/Chroma/FAISS, easy to swap in tests) and the retrieval half of a RAG pipeline assembles in an afternoon.

## The skippable one: chains and agents

Here's a "chain" for question-answering:

```python
qa = RetrievalQA.from_chain_type(llm=llm, retriever=retriever)
```

One line! Which expands, internally, to a prompt template you didn't write, retrieval parameters you didn't choose, and context assembly you can't see. The moment output quality disappoints — and it will — you're spelunking through framework source to find *what prompt actually ran*. The equivalent explicit code is ~20 lines: retrieve, format context, call the model. Twenty lines you can read, log, test, and tune.

Agents amplify this: `initialize_agent` with a tool list produces demos instantly and debugging sessions eternally. The ReAct loop inside is ~50 lines of concept — own it.

## My working split

Use LangChain for: loaders, splitters, vector-store adapters, and quick prototypes to explore what's possible. Hand-write: prompts (in versioned template files), the retrieval-to-context assembly, model calls, and any agent loop. The heuristic underneath: **abstractions earn their keep in proportion to how little you need to inspect them** — and in LLM work, the prompt and context are precisely the things you inspect most.
