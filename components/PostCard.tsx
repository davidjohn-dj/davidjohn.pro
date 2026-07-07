import Image from "next/image";
import Link from "next/link";
import type { PostMeta } from "@/lib/posts";

export default function PostCard({ post }: { post: PostMeta }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group overflow-hidden rounded-2xl border border-line bg-surface-raised transition-all duration-300 hover:-translate-y-1 hover:border-accent/50"
    >
      <div className="relative h-44 overflow-hidden border-b border-line bg-surface-overlay">
        <Image
          src={post.image}
          alt={post.title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </div>
      <div className="p-6">
        <div className="flex items-center gap-3 text-xs text-ink-faint">
          <span className="font-medium uppercase tracking-widest text-accent">
            {post.category}
          </span>
          <span>{post.dateLabel}</span>
          <span>{post.readingTime}</span>
        </div>
        <h3 className="mt-2 text-lg font-semibold tracking-tight">
          {post.title}
        </h3>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink-muted">
          {post.excerpt}
        </p>
      </div>
    </Link>
  );
}
