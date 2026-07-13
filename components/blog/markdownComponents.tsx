import {
  Children,
  isValidElement,
  type ComponentProps,
  type ReactElement,
  type ReactNode,
} from "react";
import type { Components, ExtraProps } from "react-markdown";
import Callout, { type CalloutType } from "./Callout";
import CodeBlock from "./CodeBlock";

const MARKER = /^\[!(NOTE|TIP|WARNING|DANGER|STORY|TAKEAWAYS)\]([^\n]*)\n?/;

type Parsed = { type: CalloutType; title: string; body: ReactNode[] };

/**
 * Recognizes GitHub-alert-style blockquotes:
 *
 *   > [!STORY] The night the dashboard froze
 *   > It started with a Slack ping at 2am...
 *
 * Plain blockquotes (no marker) render as normal quotes.
 */
function parseCallout(children: ReactNode): Parsed | null {
  const items = Children.toArray(children);
  const pIndex = items.findIndex(
    (el) => isValidElement(el) && el.type === "p"
  );
  if (pIndex === -1) return null;

  const p = items[pIndex] as ReactElement<{ children?: ReactNode }>;
  const pChildren = Children.toArray(p.props.children);
  const first = pChildren[0];
  if (typeof first !== "string") return null;

  const match = first.match(MARKER);
  if (!match) return null;

  const restOfFirst = first.slice(match[0].length);
  const remainder = [restOfFirst, ...pChildren.slice(1)].filter(
    (c) => c !== ""
  );
  const body: ReactNode[] = [];
  if (remainder.length > 0) body.push(<p key="callout-p0">{remainder}</p>);
  body.push(...items.slice(pIndex + 1));

  return {
    type: match[1].toLowerCase() as CalloutType,
    title: match[2].trim(),
    body,
  };
}

function Blockquote({
  children,
  node,
  ...rest
}: ComponentProps<"blockquote"> & ExtraProps) {
  void node; // react-markdown extra — must not reach the DOM element
  const parsed = parseCallout(children);
  if (parsed) {
    return (
      <Callout type={parsed.type} title={parsed.title || undefined}>
        {parsed.body}
      </Callout>
    );
  }
  return <blockquote {...rest}>{children}</blockquote>;
}

export const markdownComponents: Components = {
  blockquote: Blockquote,
  pre: CodeBlock,
};
