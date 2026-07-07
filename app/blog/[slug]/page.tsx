import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getPost, getPostContent, posts } from "@/lib/posts";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return { title: post.title, description: post.excerpt };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const content = getPostContent(slug);
  const index = posts.findIndex((p) => p.slug === slug);
  const others = [
    ...posts.slice(index + 1, index + 3),
    ...posts.slice(Math.max(0, index - 2), index),
  ].slice(0, 4);

  return (
    <article className="mx-auto max-w-3xl px-5 py-20">
      <div className="flex flex-wrap items-center gap-3 text-sm text-ink-faint">
        <span className="font-medium uppercase tracking-widest text-accent">
          {post.category}
        </span>
        <span>{post.dateLabel}</span>
        <span>{post.readingTime}</span>
      </div>
      <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
        {post.title}
      </h1>

      <div className="relative mt-8 h-64 overflow-hidden rounded-2xl border border-line sm:h-80">
        <Image
          src={post.image}
          alt={post.title}
          fill
          sizes="(max-width: 768px) 100vw, 768px"
          className="object-cover"
          priority
        />
      </div>

      <div className="prose prose-invert mt-10 max-w-none prose-headings:tracking-tight prose-a:text-accent prose-blockquote:border-accent prose-code:before:content-none prose-code:after:content-none prose-pre:border prose-pre:border-line prose-pre:bg-surface-raised prose-img:rounded-xl prose-img:border prose-img:border-line">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
      </div>

      <section className="mt-16 border-t border-line/60 pt-10">
        <h2 className="text-lg font-bold tracking-tight">Keep Reading</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {others.map((p) => (
            <Link
              key={p.slug}
              href={`/blog/${p.slug}`}
              className="rounded-xl border border-line bg-surface-raised p-5 transition-colors hover:border-accent/50"
            >
              <p className="text-xs text-ink-faint">{p.dateLabel}</p>
              <p className="mt-1 font-medium">{p.title}</p>
            </Link>
          ))}
        </div>
      </section>
    </article>
  );
}
