"use client";

import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import type { SearchDoc } from "@/lib/searchIndex";
import { highlightParts, search, tokenize, type SearchHit } from "@/lib/searchClient";

let indexPromise: Promise<SearchDoc[]> | null = null;
function loadIndex(): Promise<SearchDoc[]> {
  indexPromise ??= fetch("/search-index.json")
    .then((res) => {
      if (!res.ok) throw new Error(`search index: HTTP ${res.status}`);
      return res.json() as Promise<SearchDoc[]>;
    })
    .catch((err) => {
      indexPromise = null; // allow retry on next open
      throw err;
    });
  return indexPromise;
}

const TYPE_ORDER: SearchDoc["type"][] = ["Blog", "Project", "Page"];

function Highlighted({ text, tokens }: { text: string; tokens: string[] }) {
  return (
    <>
      {highlightParts(text, tokens).map((part, i) =>
        part.match ? (
          <mark key={i} className="rounded-sm bg-accent-soft px-0.5 text-accent">
            {part.text}
          </mark>
        ) : (
          <span key={i}>{part.text}</span>
        )
      )}
    </>
  );
}

/**
 * Mounted only while open (see Header) — per-open state resets via fresh mount.
 */
export default function SearchDialog({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [docs, setDocs] = useState<SearchDoc[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  // Load the index on mount (module-level promise caches across opens)
  useEffect(() => {
    let cancelled = false;
    loadIndex()
      .then((d) => {
        if (!cancelled) setDocs(d);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Lock body scroll while open
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  const tokens = useMemo(() => tokenize(query), [query]);
  const hits: SearchHit[] = useMemo(
    () => (docs && query.trim() ? search(docs, query) : []),
    [docs, query]
  );

  // Recent posts shown before the user types
  const recent = useMemo(
    () =>
      (docs ?? [])
        .filter((d) => d.type === "Blog")
        .sort((a, b) => (a.date < b.date ? 1 : -1))
        .slice(0, 5),
    [docs]
  );

  const grouped = useMemo(() => {
    const groups: { type: SearchDoc["type"]; hits: SearchHit[] }[] = [];
    for (const type of TYPE_ORDER) {
      const inType = hits.filter((h) => h.doc.type === type);
      if (inType.length) groups.push({ type, hits: inType });
    }
    return groups;
  }, [hits]);

  // Flat list in display order for keyboard navigation
  const flat: SearchHit[] = useMemo(
    () => grouped.flatMap((g) => g.hits),
    [grouped]
  );
  const showingRecent = query.trim() === "" && recent.length > 0;
  const navigable = showingRecent
    ? recent.map((doc) => ({ doc, score: 0, snippet: "" }))
    : flat;

  const go = useCallback(
    (doc: SearchDoc) => {
      onClose();
      router.push(doc.url);
    },
    [onClose, router]
  );

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive((a) => Math.min(a + 1, navigable.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive((a) => Math.max(a - 1, 0));
      } else if (e.key === "Enter" && navigable[active]) {
        e.preventDefault();
        go(navigable[active].doc);
      }
    },
    [onClose, navigable, active, go]
  );

  // Keep the active row visible while arrowing
  useEffect(() => {
    listRef.current
      ?.querySelector(`[data-index="${active}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [active]);

  let row = -1;

  // Portal to <body>: the header's backdrop-filter would otherwise become
  // the containing block for this fixed-position overlay and clip it.
  return createPortal(
    <div
      className="fixed inset-0 z-[60] overflow-y-auto bg-black/60 p-4 pt-[10vh] backdrop-blur-sm sm:pt-[14vh]"
      role="dialog"
      aria-modal="true"
      aria-label="Site search"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="mx-auto max-w-xl overflow-hidden rounded-2xl border border-line bg-surface-raised shadow-2xl shadow-black/50"
        onKeyDown={onKeyDown}
      >
        <div className="flex items-center gap-3 border-b border-line/70 px-4">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-4 w-4 shrink-0 text-ink-faint"
            aria-hidden
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" strokeLinecap="round" />
          </svg>
          <input
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            placeholder="Search posts, projects, pages…"
            aria-label="Search the site"
            className="h-14 w-full bg-transparent text-base text-ink outline-none placeholder:text-ink-faint"
          />
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-md border border-line px-1.5 py-0.5 font-mono text-[10px] uppercase text-ink-faint transition-colors hover:border-accent/40 hover:text-ink"
          >
            esc
          </button>
        </div>

        <div ref={listRef} className="max-h-[55vh] overflow-y-auto overscroll-contain p-2">
          {failed && (
            <p className="px-3 py-8 text-center text-sm text-ink-muted">
              Couldn&apos;t load the search index. Check your connection and try
              again.
            </p>
          )}

          {!failed && !docs && (
            <p className="px-3 py-8 text-center text-sm text-ink-faint">
              Loading index…
            </p>
          )}

          {docs && query.trim() !== "" && flat.length === 0 && (
            <p className="px-3 py-8 text-center text-sm text-ink-muted">
              No results for{" "}
              <span className="font-medium text-ink">“{query}”</span>
            </p>
          )}

          {showingRecent && (
            <section>
              <h3 className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-widest text-ink-faint">
                Recent posts
              </h3>
              {recent.map((doc) => {
                row++;
                const index = row;
                return (
                  <ResultRow
                    key={doc.url}
                    doc={doc}
                    index={index}
                    active={active === index}
                    tokens={[]}
                    snippet=""
                    onHover={setActive}
                    onSelect={go}
                  />
                );
              })}
            </section>
          )}

          {grouped.map((group) => (
            <section key={group.type}>
              <h3 className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-widest text-ink-faint">
                {group.type === "Blog" ? "Blog posts" : `${group.type}s`}
              </h3>
              {group.hits.map((hit) => {
                row++;
                const index = row;
                return (
                  <ResultRow
                    key={hit.doc.url}
                    doc={hit.doc}
                    index={index}
                    active={active === index}
                    tokens={tokens}
                    snippet={hit.snippet}
                    onHover={setActive}
                    onSelect={go}
                  />
                );
              })}
            </section>
          ))}
        </div>

        <div className="flex items-center gap-4 border-t border-line/70 px-4 py-2 text-[11px] text-ink-faint">
          <span>
            <kbd className="font-mono">↑↓</kbd> navigate
          </span>
          <span>
            <kbd className="font-mono">↵</kbd> open
          </span>
          <span className="ml-auto">
            {docs ? `${docs.length} pages indexed` : ""}
          </span>
        </div>
      </div>
    </div>,
    document.body
  );
}

function ResultRow({
  doc,
  index,
  active,
  tokens,
  snippet,
  onHover,
  onSelect,
}: {
  doc: SearchDoc;
  index: number;
  active: boolean;
  tokens: string[];
  snippet: string;
  onHover: (index: number) => void;
  onSelect: (doc: SearchDoc) => void;
}) {
  return (
    <button
      type="button"
      data-index={index}
      onMouseMove={() => onHover(index)}
      onClick={() => onSelect(doc)}
      className={`block w-full rounded-lg px-3 py-2.5 text-left transition-colors ${
        active ? "bg-surface-overlay" : ""
      }`}
    >
      <span className="flex items-baseline gap-2">
        <span
          className={`truncate text-sm font-medium ${
            active ? "text-accent" : "text-ink"
          }`}
        >
          <Highlighted text={doc.title} tokens={tokens} />
        </span>
        <span className="ml-auto shrink-0 rounded-full border border-line px-2 py-px text-[10px] uppercase tracking-wider text-ink-faint">
          {doc.tag}
        </span>
      </span>
      {(snippet || doc.excerpt) && (
        <span className="mt-0.5 line-clamp-2 block text-xs leading-relaxed text-ink-muted">
          <Highlighted text={snippet || doc.excerpt} tokens={tokens} />
        </span>
      )}
    </button>
  );
}
