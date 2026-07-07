import fs from "node:fs";
import path from "node:path";

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

export const posts: PostMeta[] = [
  {
    slug: "designing-ai-native-interfaces",
    title: "Designing AI-Native Interfaces",
    date: "2026-06-24",
    dateLabel: "24 Jun 2026",
    category: "AI Engineering",
    readingTime: "6 min read",
    image: "/images/blog/designing-ai-native-interfaces.svg",
    excerpt:
      "The chat box was AI's MVP. The real work is the interface around the model: streaming as a design material, agents that render state instead of messages, and provenance as a UI affordance.",
  },
  {
    slug: "rag-to-agents-llm-stack-2026",
    title: "From RAG to Agents: The LLM Product Stack in 2026",
    date: "2026-05-12",
    dateLabel: "12 May 2026",
    category: "AI Engineering",
    readingTime: "7 min read",
    image: "/images/blog/rag-to-agents-llm-stack-2026.svg",
    excerpt:
      "Model routers, hybrid retrieval, agentic state machines, and evals-as-CI — a working map of the modern LLM stack, and why the experience layer is the moat.",
  },
  {
    slug: "react-vs-angular",
    title: "React vs. Angular",
    date: "2020-03-23",
    dateLabel: "23 Mar 2020",
    category: "General",
    readingTime: "11 min read",
    image: "/images/blog/react-vs-angular.png",
    excerpt:
      "React and AngularJS are both advanced, widely adopted JavaScript technologies for building interactive single-page applications. An in-depth comparison of componentization, data binding, performance, and more.",
  },
  {
    slug: "prismic-vs-wordpress",
    title: "Prismic vs. WordPress",
    date: "2020-03-18",
    dateLabel: "18 Mar 2020",
    category: "General",
    readingTime: "3 min read",
    image: "/images/blog/prismic-vs-wordpress.png",
    excerpt:
      "Are you a WordPress developer? Wondering what makes prismic.io a more suitable CMS backend for you? Six reasons to consider the switch.",
  },
  {
    slug: "new-javascript-features-for-2020",
    title: "New JavaScript features for 2020",
    date: "2020-03-18",
    dateLabel: "18 Mar 2020",
    category: "General",
    readingTime: "3 min read",
    image: "/images/blog/new-javascript-features-for-2020.jpg",
    excerpt:
      "In 2020 JavaScript got some exciting new features: Object.fromEntries, dynamic imports, String.matchAll, Promise.allSettled, and more.",
  },
];

export function getPost(slug: string) {
  return posts.find((p) => p.slug === slug);
}

export function getPostContent(slug: string): string {
  const file = path.join(process.cwd(), "content", "blog", `${slug}.md`);
  return fs.readFileSync(file, "utf-8");
}
