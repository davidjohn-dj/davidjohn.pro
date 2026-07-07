import type { Metadata } from "next";
import PostCard from "@/components/PostCard";
import { posts } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "A mix of thoughts, tutorials, and news on design and coding by David John.",
};

export default function BlogPage() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-20">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Blog</h1>
      <p className="mt-3 max-w-xl text-lg text-ink-muted">
        A mix of thoughts, tutorials, and news.
      </p>
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((p) => (
          <PostCard key={p.slug} post={p} />
        ))}
      </div>
    </section>
  );
}
