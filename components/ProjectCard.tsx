import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/lib/projects";

export default function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group overflow-hidden rounded-2xl border border-line bg-surface-raised transition-all duration-300 hover:-translate-y-1 hover:border-accent/50"
    >
      <div className="relative h-52 overflow-hidden border-b border-line bg-surface-overlay">
        <Image
          src={project.image}
          alt={project.imageAlt}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </div>
      <div className="p-6">
        <p className="text-xs font-medium uppercase tracking-widest text-accent">
          {project.task}
        </p>
        <h3 className="mt-2 text-lg font-semibold tracking-tight">
          {project.client}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-ink-muted">
          {project.summary}
        </p>
      </div>
    </Link>
  );
}
