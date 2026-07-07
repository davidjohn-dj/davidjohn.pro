import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export type PostMeta = {
  slug: string;
  title: string;
  date: string;
  dateLabel: string;
  category: string;
  readingTime: string;
  image: string;
  excerpt: string;
};

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00:00Z");
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function loadPosts(): PostMeta[] {
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((file) => {
      const slug = file.replace(/\.md$/, "");
      const raw = fs.readFileSync(path.join(BLOG_DIR, file), "utf-8");
      const { data, content } = matter(raw);
      const words = content.split(/\s+/).filter(Boolean).length;
      return {
        slug,
        title: data.title as string,
        date: data.date as string,
        dateLabel: formatDate(data.date as string),
        category: (data.category as string) ?? "General",
        readingTime: `${Math.max(2, Math.ceil(words / 160))} min read`,
        image: (data.image as string) ?? `/images/blog/covers/${slug}.svg`,
        excerpt: (data.excerpt as string) ?? "",
      };
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export const posts: PostMeta[] = loadPosts();

export function getPost(slug: string) {
  return posts.find((p) => p.slug === slug);
}

export function getPostContent(slug: string): string {
  const raw = fs.readFileSync(path.join(BLOG_DIR, `${slug}.md`), "utf-8");
  return matter(raw).content;
}
