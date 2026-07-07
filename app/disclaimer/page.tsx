import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Disclaimer",
  description: "Disclaimer for davidjohn.pro.",
};

export default function DisclaimerPage() {
  return (
    <section className="mx-auto max-w-3xl px-5 py-20">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
        Disclaimer
      </h1>
      <p className="mt-3 text-lg text-ink-muted">
        Take your time to get to know me better.
      </p>

      <div className="prose prose-invert mt-10 max-w-none prose-headings:tracking-tight prose-a:text-accent">
        <p>
          David John offers top-notch IT services including web design,
          development, mobile app development, e-commerce solutions and digital
          marketing. Some parts of this website showcase client projects and
          logos. These materials are copyright of their respective proprietors
          and David John does not assume any responsibility for logos or
          ventures, suggested or otherwise, unless specifically stated.
        </p>

        <h2>No Warranties</h2>
        <p>
          This website is presented &ldquo;as is&rdquo; without any warranties
          and representations, implied or express. David John makes no
          warranties or any representation in association with the information
          or material available on this website. Without prejudice to the prior
          statement, David John does not warrant that this site will be always
          accessible, or that the information/material available on this site
          is correct, accurate, complete and non-misleading.
        </p>

        <h2>Limitations of Liability</h2>
        <p>
          David John will not be liable to any client or any other party
          (whether under the law of torts, contract or otherwise) in
          association with the content available on this website or use of, or
          otherwise in any relationship with, this website. In no event will
          David John be responsible for any direct, incidental, indirect,
          consequential or punitive loss or damage of any kind whatsoever in
          connection with his services, products and information available on
          this site. He is not liable for any revenue loss, business loss, loss
          of reputation, loss of profits, income and revenue, or corruption of
          data or information. Hereby, you acknowledge that reliance on any
          material associated with or available on this site will be at your
          own risk. He will not accept any liability regarding compatibility
          issues with any error or code, or failing or omission of produced
          software code.
        </p>

        <h2>Reasonableness</h2>
        <p>
          By using this website, you indicate that you agree with the
          information mentioned in the privacy policy and disclaimer. If you
          think the information is not reasonable for you, you must stop using
          this website immediately.
        </p>

        <h2>Other Parties</h2>
        <p>
          This site may contain links to other sites which are not associated
          with David John. He is not responsible for such links or the
          information, content or material available on those sites. The
          inclusion of third-party links on this site doesn&apos;t indicate any
          endorsement or recommendation. You agree that you will not make any
          claim against David John with respect to losses you suffer in
          connection with his site, services and products.
        </p>
      </div>
    </section>
  );
}
