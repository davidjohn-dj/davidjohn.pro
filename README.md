# davidjohn.pro

Personal portfolio and blog for David John Thammineni — full stack developer & graphic designer.

Rebuilt as a modern [Next.js](https://nextjs.org) App Router site with a static export, ready to deploy to Firebase Hosting. All content (projects, blog posts, images, resume) was recovered from the previously deployed Gatsby site.

## Stack

- Next.js 16 (App Router, static export)
- React 19
- Tailwind CSS 4 (+ typography plugin)
- Blog posts stored as Markdown in `content/blog/`, rendered with `react-markdown`

## Development

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Build & Deploy

The site builds to a fully static export in `out/`:

```bash
npm run build
```

Deploy to Firebase Hosting (the included `firebase.json` serves `out/` with long-lived caching for static assets):

```bash
firebase login
firebase use <your-project-id>
firebase deploy --only hosting
```

## Structure

- `app/` — routes: home, `/projects`, `/projects/[slug]`, `/blog`, `/blog/[slug]`, `/contact`, `/privacy`, `/disclaimer`
- `components/` — header, footer, project/post cards
- `content/blog/` — recovered blog posts as Markdown
- `lib/` — site config, project data, post metadata
- `public/images/` — recovered project screenshots and blog images
- `public/files/` — recovered resume PDF
