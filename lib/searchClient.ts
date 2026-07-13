import type { SearchDoc } from "./searchIndex";

export type SearchHit = {
  doc: SearchDoc;
  score: number;
  /** Body snippet around the first match, empty if the match was title-only */
  snippet: string;
};

export function tokenize(query: string): string[] {
  return query
    .toLowerCase()
    .split(/[^a-z0-9.+#-]+/)
    .filter((t) => t.length > 0);
}

function countOccurrences(haystack: string, needle: string): number {
  let count = 0;
  let i = haystack.indexOf(needle);
  while (i !== -1 && count < 20) {
    count++;
    i = haystack.indexOf(needle, i + needle.length);
  }
  return count;
}

/** Word-boundary-ish check: the match starts a word (or the string). */
function startsWord(haystack: string, index: number): boolean {
  return index === 0 || /[^a-z0-9]/.test(haystack[index - 1]);
}

function scoreDoc(doc: SearchDoc, tokens: string[], phrase: string): number {
  const title = doc.title.toLowerCase();
  const excerpt = doc.excerpt.toLowerCase();
  const tag = doc.tag.toLowerCase();
  const body = doc.body.toLowerCase();

  let score = 0;
  for (const token of tokens) {
    let tokenScore = 0;

    const ti = title.indexOf(token);
    if (ti !== -1) tokenScore += startsWord(title, ti) ? 10 : 5;

    const gi = tag.indexOf(token);
    if (gi !== -1) tokenScore += 6;

    const ei = excerpt.indexOf(token);
    if (ei !== -1) tokenScore += startsWord(excerpt, ei) ? 4 : 2;

    const occurrences = countOccurrences(body, token);
    if (occurrences > 0) tokenScore += 1 + Math.min(occurrences, 8) * 0.5;

    if (tokenScore === 0) return 0; // AND semantics: every token must match
    score += tokenScore;
  }

  // Phrase bonuses for multi-word queries
  if (tokens.length > 1) {
    if (title.includes(phrase)) score += 14;
    else if (body.includes(phrase) || excerpt.includes(phrase)) score += 6;
  }

  return score;
}

function makeSnippet(doc: SearchDoc, tokens: string[]): string {
  const body = doc.body;
  const lower = body.toLowerCase();
  let first = -1;
  for (const token of tokens) {
    const i = lower.indexOf(token);
    if (i !== -1 && (first === -1 || i < first)) first = i;
  }
  if (first === -1) return doc.excerpt;

  const RADIUS = 70;
  let start = Math.max(0, first - RADIUS);
  let end = Math.min(body.length, first + RADIUS * 2);
  // snap to word boundaries
  if (start > 0) {
    const sp = body.indexOf(" ", start);
    if (sp !== -1 && sp < first) start = sp + 1;
  }
  if (end < body.length) {
    const sp = body.lastIndexOf(" ", end);
    if (sp > first) end = sp;
  }
  return (
    (start > 0 ? "…" : "") + body.slice(start, end) + (end < body.length ? "…" : "")
  );
}

export function search(
  docs: SearchDoc[],
  query: string,
  limit = 20
): SearchHit[] {
  const tokens = tokenize(query);
  if (tokens.length === 0) return [];
  const phrase = tokens.join(" ");

  const hits: SearchHit[] = [];
  for (const doc of docs) {
    const score = scoreDoc(doc, tokens, phrase);
    if (score > 0) hits.push({ doc, score, snippet: "" });
  }

  hits.sort(
    (a, b) => b.score - a.score || (a.doc.date < b.doc.date ? 1 : -1)
  );
  const top = hits.slice(0, limit);
  for (const hit of top) hit.snippet = makeSnippet(hit.doc, tokens);
  return top;
}

/** Split text into [plain, match, plain, match, ...] pieces for <mark> rendering. */
export function highlightParts(
  text: string,
  tokens: string[]
): { text: string; match: boolean }[] {
  if (tokens.length === 0 || !text) return [{ text, match: false }];
  const pattern = tokens
    .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .sort((a, b) => b.length - a.length)
    .join("|");
  const splitter = new RegExp(`(${pattern})`, "gi");
  const exact = new RegExp(`^(${pattern})$`, "i"); // fresh, stateless test
  return text
    .split(splitter)
    .filter((piece) => piece !== "")
    .map((piece) => ({ text: piece, match: exact.test(piece) }));
}
