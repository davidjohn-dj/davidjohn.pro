import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProject, projects } from "@/lib/projects";
import { site } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  return {
    title: `${project.client}: ${project.title}`,
    description: project.summary,
  };
}

function Section({ title, paragraphs }: { title: string; paragraphs: string[] }) {
  return (
    <section className="mt-12">
      <h2 className="text-xl font-bold tracking-tight sm:text-2xl">{title}</h2>
      {paragraphs.map((p) => (
        <p key={p.slice(0, 40)} className="mt-4 leading-relaxed text-ink-muted">
          {p}
        </p>
      ))}
    </section>
  );
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const others = projects.filter((p) => p.slug !== project.slug);

  return (
    <article className="mx-auto max-w-4xl px-5 py-20">
      <p className="text-sm font-medium uppercase tracking-[0.25em] text-accent">
        {project.client}
      </p>
      <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
        {project.title}
      </h1>

      <dl className="mt-8 grid grid-cols-3 gap-4 rounded-2xl border border-line bg-surface-raised p-6 text-sm">
        {[
          ["Client", project.client],
          ["Task", project.task],
          ["Duration", project.duration],
        ].map(([label, value]) => (
          <div key={label}>
            <dt className="text-xs uppercase tracking-widest text-ink-faint">
              {label}
            </dt>
            <dd className="mt-1 font-medium">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-10 overflow-hidden rounded-2xl border border-line">
        <Image
          src={project.image}
          alt={project.imageAlt}
          width={1920}
          height={1080}
          className="max-h-[36rem] w-full object-cover object-top"
          priority
        />
      </div>

      <Section title="Background" paragraphs={project.background} />
      <Section title="Process" paragraphs={project.process} />
      <Section title="Result" paragraphs={project.result} />

      {project.tagline && (
        <p className="mt-8 border-l-2 border-accent pl-4 text-lg italic text-ink-muted">
          {project.tagline}
        </p>
      )}

      <section className="mt-16 border-t border-line/60 pt-10">
        <h2 className="text-lg font-bold tracking-tight">More Projects</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {others.map((p) => (
            <Link
              key={p.slug}
              href={`/projects/${p.slug}`}
              className="rounded-xl border border-line bg-surface-raised p-5 transition-colors hover:border-accent/50"
            >
              <p className="text-xs uppercase tracking-widest text-accent">
                {p.client}
              </p>
              <p className="mt-1 font-medium">{p.title}</p>
            </Link>
          ))}
        </div>
        <a
          href={`mailto:${site.email}`}
          className="mt-10 inline-block rounded-full bg-accent px-8 py-3 text-sm font-semibold text-[#052e22] transition-transform hover:scale-[1.03]"
        >
          Start Project
        </a>
      </section>
    </article>
  );
}
