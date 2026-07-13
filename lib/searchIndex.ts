import { capabilities } from "./capabilities";
import { posts, getPostContent } from "./posts";
import { projects } from "./projects";
import { site } from "./site";

export type SearchDoc = {
  /** Where the result navigates to */
  url: string;
  type: "Blog" | "Project" | "Page";
  title: string;
  /** Short line shown under the title */
  excerpt: string;
  /** Category / kicker chip */
  tag: string;
  /** Plain text used for matching and snippets */
  body: string;
  /** ISO date for blogs, empty otherwise */
  date: string;
};

/** Strip markdown down to plain, searchable text. */
function stripMarkdown(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, " ") // fenced code blocks
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ") // images
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") // links → label
    .replace(/^>\s*\[!\w+\]\s*/gm, "") // callout markers
    .replace(/^#{1,6}\s+/gm, "") // heading hashes
    .replace(/[*_~`>|]/g, " ") // inline markup / blockquote chevrons
    .replace(/\s+/g, " ")
    .trim();
}

const MAX_BODY = 6000;

function buildIndex(): SearchDoc[] {
  const blogDocs: SearchDoc[] = posts.map((p) => ({
    url: `/blog/${p.slug}/`,
    type: "Blog",
    title: p.title,
    excerpt: p.excerpt,
    tag: p.category,
    body: stripMarkdown(getPostContent(p.slug)).slice(0, MAX_BODY),
    date: p.date,
  }));

  const projectDocs: SearchDoc[] = projects.map((p) => ({
    url: `/projects/${p.slug}/`,
    type: "Project",
    title: p.title,
    excerpt: p.summary,
    tag: p.client,
    body: [p.task, p.tagline ?? "", ...p.background, ...p.process, ...p.result]
      .join(" ")
      .slice(0, MAX_BODY),
    date: "",
  }));

  const pageDocs: SearchDoc[] = [
    {
      url: "/",
      type: "Page",
      title: "Home",
      excerpt: site.description,
      tag: "About",
      body: [
        site.name,
        site.role,
        site.description,
        site.location,
        ...capabilities.flatMap((c) => [c.title, c.description, ...c.items]),
      ].join(" "),
      date: "",
    },
    {
      url: "/projects/",
      type: "Page",
      title: "Projects",
      excerpt: "Selected client work — brand identity, portals, and product builds.",
      tag: "Section",
      body: "projects portfolio case studies client work",
      date: "",
    },
    {
      url: "/blog/",
      type: "Page",
      title: "Blog",
      excerpt:
        "Tutorials and field notes on AI engineering, React, TypeScript, performance, and modern frontend.",
      tag: "Section",
      body: "blog articles posts tutorials field notes writing",
      date: "",
    },
    {
      url: "/contact/",
      type: "Page",
      title: "Contact",
      excerpt: `Get in touch — ${site.email}`,
      tag: "Section",
      body: `contact email reach out hire consulting ${site.email} ${site.location}`,
      date: "",
    },
    {
      url: "/privacy/",
      type: "Page",
      title: "Privacy Policy",
      excerpt: "How this site handles your data.",
      tag: "Legal",
      body: "privacy policy data cookies analytics legal",
      date: "",
    },
    {
      url: "/disclaimer/",
      type: "Page",
      title: "Disclaimer",
      excerpt: "Opinions are my own; content provided as-is.",
      tag: "Legal",
      body: "disclaimer legal liability opinions",
      date: "",
    },
  ];

  return [...blogDocs, ...projectDocs, ...pageDocs];
}

export const searchIndex: SearchDoc[] = buildIndex();
