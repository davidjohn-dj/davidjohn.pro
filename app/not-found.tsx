import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto flex max-w-6xl flex-col items-center px-5 py-32 text-center">
      <p className="text-sm font-medium uppercase tracking-[0.25em] text-accent">
        404
      </p>
      <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
        Page not found
      </h1>
      <p className="mt-3 max-w-md text-ink-muted">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-full bg-accent px-8 py-3 text-sm font-semibold text-[#052e22] transition-transform hover:scale-[1.03]"
      >
        Back Home
      </Link>
    </section>
  );
}
