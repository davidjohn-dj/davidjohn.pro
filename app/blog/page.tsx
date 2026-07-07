import type { Metadata } from "next";
import PostCard from "@/components/PostCard";
import { posts } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Tutorials and field notes on AI engineering, React, TypeScript, performance, and modern frontend - published since 2020.",
};

export default function BlogPage() {
  const byYear = new Map<string, typeof posts>();
  for (const post of posts) {
    const year = post.date.slice(0, 4);
    if (!byYear.has(year)) byYear.set(year, []);
    byYear.get(year)!.push(post);
  }

  return (
    <section className="mx-auto max-w-6xl px-5 py-20">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Blog</h1>
      <p className="mt-3 max-w-xl text-lg text-ink-muted">
        {posts.length} posts on AI engineering, React, TypeScript, and the
        craft of modern frontend — published since 2020.
      </p>

      {[...byYear.entries()].map(([year, yearPosts]) => (
        <div key={year} className="mt-14 first-of-type:mt-12">
          <div className="flex items-baseline gap-4">
            <h2 className="text-2xl font-bold tracking-tight text-accent">
              {year}
            </h2>
            <span className="text-sm text-ink-faint">
              {yearPosts.length} {yearPosts.length === 1 ? "post" : "posts"}
            </span>
            <div className="h-px flex-1 bg-line" />
          </div>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {yearPosts.map((p) => (
              <PostCard key={p.slug} post={p} />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
