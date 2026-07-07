export type Capability = {
  title: string;
  description: string;
  items: string[];
};

export const capabilities: Capability[] = [
  {
    title: "AI & LLM Engineering",
    description:
      "Designing and shipping AI-native product experiences — from model integration to the interaction layer users actually feel.",
    items: [
      "LLM integration & prompt orchestration",
      "RAG pipelines & vector search",
      "Agentic workflows & tool calling",
      "Streaming UX, evals & guardrails",
    ],
  },
  {
    title: "Frontend Architecture",
    description:
      "14+ years architecting design systems, monorepos, and high-traffic applications for global enterprises.",
    items: [
      "React, Next.js, Vue, TypeScript",
      "Design systems & micro frontends",
      "Nx monorepos — 40% faster builds",
      "Performance engineering & Core Web Vitals",
    ],
  },
  {
    title: "Full Stack & Cloud",
    description:
      "Scalable services and infrastructure that keep AI products fast, reliable, and affordable at scale.",
    items: [
      "Node.js, WebSockets, microservices",
      "AWS, GCP, Azure, Docker, CI/CD",
      "Supabase, MongoDB, event queues",
      "SEO & conversion optimization",
    ],
  },
  {
    title: "Data & Immersive Visualization",
    description:
      "Turning complex data into interfaces people understand — dashboards, 3D, and interactive storytelling.",
    items: [
      "D3.js data visualization",
      "Three.js & 3D medical animation",
      "Interactive financial dashboards",
      "Figma-to-production design flow",
    ],
  },
];

export const stats = [
  { value: "14+", label: "Years of experience" },
  { value: "$14M", label: "New monthly revenue unlocked at Standard Chartered" },
  { value: "44+", label: "Markets launched" },
  { value: "60%", label: "Performance uplift on enterprise platforms" },
];

export const companies = [
  "Enercare",
  "Pinnacle (Cresendo Technology)",
  "Autodesk",
  "Standard Chartered",
  "Ernst & Young",
  "Accion Labs",
  "Indegene",
  "Brady Corp",
];
