import type { Metadata } from "next";
import ProjectCard from "@/components/ProjectCard";
import { projects } from "@/lib/projects";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Web/UI design and development projects on modern web technologies by David John.",
};

export default function ProjectsPage() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-20">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Projects</h1>
      <p className="mt-3 max-w-xl text-lg text-ink-muted">
        I specialise in Web/UI design and development on modern web
        technologies.
      </p>
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((p) => (
          <ProjectCard key={p.slug} project={p} />
        ))}
      </div>
    </section>
  );
}
