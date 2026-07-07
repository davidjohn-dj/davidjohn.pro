import type { Metadata } from "next";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with David John Thammineni for AI product engineering, frontend architecture, or consulting inquiries.",
};

const channels = [
  { label: "E-Mail", href: `mailto:${site.email}`, value: site.email },
  { label: "LinkedIn", href: site.social.linkedin, value: "davidjohnt" },
  { label: "GitHub", href: site.social.github, value: "davidjohn-dj" },
  { label: "YouTube", href: site.social.youtube, value: "Hostreck" },
];

export default function ContactPage() {
  return (
    <section className="mx-auto max-w-4xl px-5 py-20">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Contact</h1>
      <p className="mt-3 max-w-2xl text-lg text-ink-muted">
        I&apos;m happy to hear from you — whether you have an AI product to
        ship, an architecture problem to untangle, or just want to talk shop.
      </p>

      <div className="mt-12 grid gap-10 md:grid-cols-5">
        <div className="md:col-span-3">
          <h2 className="text-xl font-bold tracking-tight">
            Hi! I&apos;m David John Thammineni — Lead Frontend Architect building
            AI-native products.
          </h2>
          <p className="mt-4 leading-relaxed text-ink-muted">
            Over 14+ years I&apos;ve architected and shipped web platforms for
            Autodesk, Standard Chartered Bank, Ernst &amp; Young, and the
            global pharmaceutical industry — design systems powering 8+
            consumer apps, funds platforms serving 320K monthly visitors across
            44+ markets, and monorepo architectures that cut build times by
            40%.
          </p>
          <p className="mt-4 leading-relaxed text-ink-muted">
            Today my focus is the AI layer: integrating LLMs into real
            products, building retrieval-augmented experiences, agentic
            workflows, and the streaming, latency-aware interfaces they demand.
            I bridge the gap between model capability and product reality —
            conception, design, and engineering, end to end.
          </p>
          <p className="mt-4 leading-relaxed text-ink-muted">
            Based in {site.location}. Open to leadership roles, architecture
            consulting, and ambitious AI product work.
          </p>
          <a
            href={site.resume}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-block rounded-full bg-accent px-8 py-3 text-sm font-semibold text-[#052e22] transition-transform hover:scale-[1.03]"
          >
            Resume / Curriculum Vitae
          </a>
        </div>

        <div className="md:col-span-2">
          <div className="rounded-2xl border border-line bg-surface-raised p-6">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-ink-faint">
              Reach me at
            </h3>
            <ul className="mt-4 space-y-3">
              {channels.map(({ label, href, value }) => (
                <li key={label}>
                  <a
                    href={href}
                    target={href.startsWith("mailto:") ? undefined : "_blank"}
                    rel="noopener noreferrer"
                    className="group flex items-baseline justify-between gap-3 text-sm"
                  >
                    <span className="text-ink-muted">{label}</span>
                    <span className="font-medium text-ink transition-colors group-hover:text-accent">
                      {value}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
