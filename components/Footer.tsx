import Link from "next/link";
import { site } from "@/lib/site";

const social = [
  { label: "LinkedIn", href: site.social.linkedin },
  { label: "GitHub", href: site.social.github },
  { label: "Behance", href: site.social.behance },
  { label: "Dribbble", href: site.social.dribbble },
  { label: "YouTube", href: site.social.youtube },
];

export default function Footer() {
  return (
    <footer className="border-t border-line/60">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold tracking-tight">
            David<span className="text-accent">John</span>
          </p>
          <p className="mt-1 text-sm text-ink-faint">
            © {new Date().getFullYear()} David John. All rights reserved.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-ink-muted">
          {social.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-accent"
            >
              {label}
            </a>
          ))}
          <span className="hidden text-line sm:inline">|</span>
          <Link href="/disclaimer" className="transition-colors hover:text-accent">
            Disclaimer
          </Link>
          <Link href="/privacy" className="transition-colors hover:text-accent">
            Privacy
          </Link>
        </div>
      </div>
    </footer>
  );
}
