import type { ReactNode } from "react";

export type CalloutType =
  | "note"
  | "tip"
  | "warning"
  | "danger"
  | "story"
  | "takeaways";

const STYLES: Record<
  CalloutType,
  { label: string; border: string; bg: string; text: string; icon: ReactNode }
> = {
  note: {
    label: "Note",
    border: "border-sky-400/40",
    bg: "bg-sky-400/5",
    text: "text-sky-300",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8h.01M11 12h1v4h1" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  tip: {
    label: "Tip",
    border: "border-emerald-400/40",
    bg: "bg-emerald-400/5",
    text: "text-emerald-300",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
        <path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.6.6 1 1.5 1 2.5h6c0-1 .4-1.9 1-2.5A6 6 0 0 0 12 3Z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  warning: {
    label: "Watch out",
    border: "border-amber-400/40",
    bg: "bg-amber-400/5",
    text: "text-amber-300",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
        <path d="M12 4 2.5 20h19L12 4ZM12 10v4M12 17h.01" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  danger: {
    label: "The trap",
    border: "border-rose-400/40",
    bg: "bg-rose-400/5",
    text: "text-rose-300",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
        <path d="M12 2c1 3-1 4-1 6a3 3 0 0 0 6 .6C18.5 10.5 20 13 20 15a8 8 0 1 1-16 0c0-2.4 1.3-4.6 2.7-6.2C8.2 7 9 5 9 3c1.5.5 2.6 1.4 3-1Z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  story: {
    label: "From the trenches",
    border: "border-fuchsia-400/40",
    bg: "bg-fuchsia-400/5",
    text: "text-fuchsia-300",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
        <circle cx="12" cy="12" r="9" />
        <path d="m15.5 8.5-2 5-5 2 2-5 5-2Z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  takeaways: {
    label: "Key takeaways",
    border: "border-accent/40",
    bg: "bg-accent-soft",
    text: "text-accent",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
        <path d="m5 12 5 5L20 7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
};

export default function Callout({
  type,
  title,
  children,
}: {
  type: CalloutType;
  title?: string;
  children: ReactNode;
}) {
  const s = STYLES[type];
  return (
    <aside
      className={`not-prose my-7 rounded-xl border ${s.border} ${s.bg} p-5`}
    >
      <p
        className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-widest ${s.text}`}
      >
        {s.icon}
        {title || s.label}
      </p>
      <div className="mt-3 space-y-3 text-[0.95rem] leading-relaxed text-ink-muted [&_a]:text-accent [&_a]:underline [&_code]:rounded [&_code]:bg-surface-overlay [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.85em] [&_code]:text-ink [&_li]:ml-4 [&_strong]:text-ink [&_ul]:list-disc [&_ul]:space-y-1.5">
        {children}
      </div>
    </aside>
  );
}
