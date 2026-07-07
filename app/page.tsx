import Link from "next/link";
import ProjectCard from "@/components/ProjectCard";
import PostCard from "@/components/PostCard";
import { projects } from "@/lib/projects";
import { posts } from "@/lib/posts";
import { site } from "@/lib/site";
import { capabilities, companies, stats } from "@/lib/capabilities";

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="hero-grid absolute inset-0" aria-hidden />
        <div
          className="absolute -top-40 left-1/2 h-96 w-[42rem] -translate-x-1/2 rounded-full bg-accent/10 blur-3xl"
          aria-hidden
        />
        <div className="relative mx-auto max-w-6xl px-5 py-28 sm:py-36">
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-accent">
            Lead Frontend Architect · AI-Native Product Engineer
          </p>
          <h1 className="mt-5 max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-6xl">
            I build AI-native products where intelligence meets interface.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-muted">
            14+ years architecting frontends for Autodesk, Standard Chartered,
            EY, and global pharma — now applying that craft to LLM-powered
            experiences: retrieval-augmented copilots, agentic workflows, and
            streaming interfaces that make AI feel effortless.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/projects"
              className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-[#052e22] transition-transform hover:scale-[1.03]"
            >
              View Work
            </Link>
            <Link
              href="/contact"
              className="rounded-full border border-line px-6 py-3 text-sm font-semibold text-ink transition-colors hover:border-accent hover:text-accent"
            >
              Get in Touch
            </Link>
          </div>

          <div className="mt-16 grid grid-cols-2 gap-6 sm:grid-cols-4">
            {stats.map(({ value, label }) => (
              <div key={label}>
                <p className="text-3xl font-bold tracking-tight text-accent">
                  {value}
                </p>
                <p className="mt-1 text-sm leading-snug text-ink-muted">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Companies */}
      <section className="border-y border-line/60 bg-surface-raised/40">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-10 gap-y-3 px-5 py-6">
          <span className="text-xs uppercase tracking-widest text-ink-faint">
            Trusted by teams at
          </span>
          {companies.map((c) => (
            <span key={c} className="text-sm font-medium text-ink-muted">
              {c}
            </span>
          ))}
        </div>
      </section>

      {/* Capabilities */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          What I Do
        </h2>
        <p className="mt-2 max-w-2xl text-ink-muted">
          From model to interface — I ship the full surface area of modern AI
          products, grounded in enterprise-scale engineering discipline.
        </p>
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {capabilities.map((cap) => (
            <div
              key={cap.title}
              className="rounded-2xl border border-line bg-surface-raised p-7 transition-colors hover:border-accent/50"
            >
              <h3 className="text-lg font-semibold tracking-tight text-accent">
                {cap.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                {cap.description}
              </p>
              <ul className="mt-4 grid gap-2 text-sm text-ink-muted sm:grid-cols-2">
                {cap.items.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Projects */}
      <section className="border-t border-line/60">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Selected Projects
              </h2>
              <p className="mt-2 max-w-lg text-ink-muted">
                Brand, design, and engineering — end to end.
              </p>
            </div>
            <Link
              href="/projects"
              className="hidden text-sm font-medium text-accent hover:underline sm:block"
            >
              All projects →
            </Link>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <ProjectCard key={p.slug} project={p} />
            ))}
          </div>
        </div>
      </section>

      {/* Blog */}
      <section className="border-t border-line/60">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Writing
              </h2>
              <p className="mt-2 max-w-lg text-ink-muted">
                Notes on AI engineering, LLM-powered interfaces, and the craft
                of modern frontend.
              </p>
            </div>
            <Link
              href="/blog"
              className="hidden text-sm font-medium text-accent hover:underline sm:block"
            >
              All posts →
            </Link>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.slice(0, 3).map((p) => (
              <PostCard key={p.slug} post={p} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-line/60">
        <div className="mx-auto max-w-6xl px-5 py-20 text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Building something AI-native?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-ink-muted">
            Whether it&apos;s an LLM copilot, an agentic workflow, or an
            enterprise frontend that needs to scale — let&apos;s talk.
          </p>
          <a
            href={`mailto:${site.email}`}
            className="mt-8 inline-block rounded-full bg-accent px-8 py-3 text-sm font-semibold text-[#052e22] transition-transform hover:scale-[1.03]"
          >
            Start a Conversation
          </a>
        </div>
      </section>
    </>
  );
}
