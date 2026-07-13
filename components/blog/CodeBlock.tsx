"use client";

import {
  Children,
  isValidElement,
  useState,
  type ComponentProps,
  type ReactNode,
} from "react";
import type { ExtraProps } from "react-markdown";

function extractText(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (isValidElement<{ children?: ReactNode }>(node)) {
    return extractText(node.props.children);
  }
  return "";
}

export default function CodeBlock({
  children,
  node,
  ...rest
}: ComponentProps<"pre"> & ExtraProps) {
  void node; // react-markdown extra — must not reach the DOM element
  const [copied, setCopied] = useState(false);

  const codeEl = Children.toArray(children).find(
    (el): el is React.ReactElement<{ className?: string; children?: ReactNode }> =>
      isValidElement(el)
  );
  const language =
    codeEl?.props.className?.match(/language-([\w+-]+)/)?.[1] ?? "code";

  async function copy() {
    try {
      await navigator.clipboard.writeText(extractText(children).trimEnd());
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard unavailable — leave the button as-is
    }
  }

  return (
    <div className="not-prose group my-7 overflow-hidden rounded-xl border border-line bg-surface-raised">
      <div className="flex items-center justify-between border-b border-line/70 bg-surface-overlay px-4 py-2">
        <span className="flex items-center gap-2 font-mono text-xs text-ink-faint">
          <span className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-400/50" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400/50" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/50" />
          </span>
          <span className="ml-2 uppercase tracking-wider">{language}</span>
        </span>
        <button
          type="button"
          onClick={copy}
          className={`rounded-md border px-2.5 py-1 text-xs transition-colors ${
            copied
              ? "border-accent/50 text-accent"
              : "border-line text-ink-faint hover:border-accent/40 hover:text-ink"
          }`}
          aria-label="Copy code to clipboard"
        >
          {copied ? "Copied ✓" : "Copy"}
        </button>
      </div>
      <pre
        {...rest}
        className="overflow-x-auto p-4 font-mono text-[0.85rem] leading-relaxed text-ink"
      >
        {children}
      </pre>
    </div>
  );
}
