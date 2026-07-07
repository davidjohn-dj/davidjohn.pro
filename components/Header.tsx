"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { site } from "@/lib/site";

const links = [
  { href: "/projects", label: "Projects" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-line/60 bg-surface/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link
          href="/"
          className="font-semibold tracking-tight text-ink transition-colors hover:text-accent"
          onClick={() => setOpen(false)}
        >
          David<span className="text-accent">John</span>
        </Link>

        <nav className="hidden items-center gap-1 sm:flex">
          {links.map(({ href, label }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
                  active
                    ? "bg-accent-soft text-accent"
                    : "text-ink-muted hover:bg-surface-overlay hover:text-ink"
                }`}
              >
                {label}
              </Link>
            );
          })}
          <a
            href={site.resume}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-3 rounded-full border border-line px-4 py-1.5 text-sm text-ink-muted transition-colors hover:border-accent hover:text-accent"
          >
            Resume
          </a>
        </nav>

        <button
          type="button"
          aria-label="Toggle menu"
          className="flex h-9 w-9 items-center justify-center rounded-md text-ink-muted hover:text-ink sm:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
            {open ? (
              <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            ) : (
              <path d="M3 6h14M3 10h14M3 14h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <nav className="border-t border-line/60 px-5 py-3 sm:hidden">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="block rounded-md px-3 py-2 text-sm text-ink-muted hover:bg-surface-overlay hover:text-ink"
              onClick={() => setOpen(false)}
            >
              {label}
            </Link>
          ))}
          <a
            href={site.resume}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-md px-3 py-2 text-sm text-ink-muted hover:bg-surface-overlay hover:text-ink"
          >
            Resume
          </a>
        </nav>
      )}
    </header>
  );
}
