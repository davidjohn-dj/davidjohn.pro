export type Project = {
  slug: string;
  client: string;
  title: string;
  task: string;
  duration: string;
  image: string;
  imageAlt: string;
  summary: string;
  background: string[];
  process: string[];
  result: string[];
  tagline?: string;
};

export const projects: Project[] = [
  {
    slug: "united-techmind-corp",
    client: "United Techmind Corp",
    title: "Corporate website for software development and consulting firm",
    task: "Corporate Website",
    duration: "1 Month",
    image: "/images/projects/united-techmind-corp.webp",
    imageAlt: "United Techmind Corp website — www.unitedtechmindcorp.com",
    summary:
      "Brand identity and a fast, responsive corporate website for an IT staffing and consulting firm.",
    background: [
      "United Techmind Corp is carving a niche in the IT staffing industry with its quality-driven staffing solutions and services. The client was on the lookout to establish a brand, and a full brand identity package was preferred.",
      "They needed a logo, business cards, and a letterhead for their office needs. Along with these, they needed a fast, responsive website to present and update their corporate data and information.",
    ],
    process: [
      "The project first focused on the logo and the choice of colour. The logo should display the power of the organisation in obtaining IT talent, staffing, and other services from around the world. In the course of the iterations, the final design emerged.",
      "After the logo and colour scheme were finalised, first low-fidelity, then high-fidelity prototypes were created — the latter with the help of InVision. Prototypes are an important tool in the design process to get an early feel for the design and the user experience. The final prototype went through several revisions, but in the end provided a solid foundation to begin front-end work.",
      "Due to the wide range of content to be presented, along with a good ability to customise it, Bootstrap was chosen as the front-end framework, with WordPress/PHP for the back-end.",
    ],
    result: [
      "United Techmind Corp was given custom-built security to solve the problem of hacking on WordPress. For the items and buttons, I chose red and blue colours to give the otherwise minimalist design a fresh look. Thanks to the responsive foundation, the website displays properly on all devices without losing any functionality.",
    ],
  },
  {
    slug: "iprmentlaw",
    client: "IPRMENTLAW",
    title: "Portal for law news",
    task: "Law News Portal",
    duration: "4 Months",
    image: "/images/projects/iprmentlaw.webp",
    imageAlt: "IPRMENTLAW website — iprmentlaw.com",
    summary:
      "Brand identity and a news portal covering Intellectual Property Rights, Media and Entertainment law.",
    tagline: "IPRMENTLAW — Where IP meets media & entertainment",
    background: [
      "IPRMENTLAW is a medium through which the client covers the latest updates, judgements, blogs, and contractual knowledge in the IPRMENT sector (Intellectual Property Rights, Media and Entertainment). The client was on the lookout to establish a brand and a portal to publish regular news.",
      "It needed a logo, business cards, and a letterhead for office needs, along with a fast, responsive website to publish updates online.",
    ],
    process: [
      "The project first focused on the logo and the choice of colour. The logo should display the variety of social objects reaching into a human's brain. In the course of the iterations, the final design emerged.",
      "After the logo and colour scheme were finalised, first low-fidelity, then high-fidelity prototypes were created with the help of InVision, going through several revisions before front-end work began.",
      "Due to the wide range of content to be presented, along with a good ability to customise it, Bootstrap was chosen as the front-end framework, with WordPress/PHP for the back-end.",
    ],
    result: [
      "IPRMENTLAW was given custom-built security to solve the problem of hacking on WordPress. For the items and buttons, I chose white and black colours to give the otherwise minimalist design a fresh look. The website displays properly on all devices without losing any functionality.",
    ],
  },
  {
    slug: "amerinntech",
    client: "American Innovative Technologies",
    title: "Corporate website for a consulting firm",
    task: "Brand Identity",
    duration: "2 Months",
    image: "/images/projects/amerinntech.png",
    imageAlt: "American Innovative Technologies website — amerinntech.com",
    summary:
      "Brand identity and online presence for a growing consulting startup, built around a modern flat design.",
    background: [
      "American Innovative Technologies is a popular startup that was on the lookout to establish its brand and online presence. A full brand identity package was preferred by the client.",
      "It needed a logo, business cards, and a letterhead for office needs, along with a fast, responsive website to present the brand online.",
    ],
    process: [
      "The project first focused on the logo and the choice of colour. The logo should be reminiscent of the American colours, but independent enough — and at the same time neutral, not committing to a particular theme. In the course of the iterations, the final design emerged.",
      "After the logo and colour scheme were finalised, first low-fidelity, then high-fidelity prototypes were created with the help of InVision, going through several revisions before front-end work began.",
      "Due to the wide range of content to be presented, along with a good ability to customise it, Bootstrap was chosen as the front-end framework, with WordPress/PHP for the back-end.",
    ],
    result: [
      "Amerinntech solves the problem with a modern Flat 2.0 design, restrained background colours, and an immediate possibility to try out the platform on the start page. For the items and buttons, I chose dark colours to give the otherwise minimalist design a fresh look. The website displays properly on all devices without losing any functionality.",
    ],
  },
];

export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug);
}
