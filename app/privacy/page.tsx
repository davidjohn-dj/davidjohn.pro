import type { Metadata } from "next";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy",
  description: "Privacy policy for davidjohn.pro.",
};

export default function PrivacyPage() {
  return (
    <section className="mx-auto max-w-3xl px-5 py-20">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Privacy</h1>
      <p className="mt-3 text-lg text-ink-muted">
        Let&apos;s be clear! It&apos;s my utmost concern!
      </p>

      <div className="prose prose-invert mt-10 max-w-none prose-headings:tracking-tight prose-a:text-accent">
        <p>
          I respect the privacy of my clients. Therefore, my approach to
          privacy and data protection goes beyond legal compliance. Privacy is
          one of the important parts of my culture and business value
          proposition. Protection of your privacy is one of my fundamental
          responsibilities; hence, it is imperative to me.
        </p>
        <p>
          I ensure not to use your contact data such as your name and email
          address for personal use. Once you fill my registration form, I use
          your contact information only for sending my legal information to
          you. I am publishing this privacy policy statement in order to show
          my commitment to safeguarding the privacy of information that you
          share with us.
        </p>

        <h2>The Information I Collect</h2>
        <p>
          When you order or request my services, I need to know your name,
          email address, IP address, phone number, etc. I may use this
          information to acknowledge your interest and requirements, process
          your order, notify you regarding your order&apos;s status, and
          provide you with better services.
        </p>

        <h2>How I Use the Information</h2>
        <p>
          I use your personal information or the information that you provide
          me to complete your requirement/order. I do not sell, rent or share
          this information with any third party except to the extent essential
          to accomplish that requirement/order.
        </p>
        <p>
          If you show interest in my services and products and register with me
          on a contract, I may use your email address or other contact
          information to inform you about my services and new products. To
          update my website and improve its design, I may use non-identifying
          information.
        </p>

        <h2>Changes in the Privacy Policy</h2>
        <p>
          If any changes are made to this privacy policy, you will see those
          changes on this web page. Therefore, you will always stay aware of
          how I collect and utilize your information. I reserve all rights to
          change or modify this privacy policy anytime without prior
          notification. Thus, I advise you to review this privacy policy
          regularly.
        </p>

        <h2>Web Servers</h2>
        <p>
          With my web servers, I record and receive information from your
          browser automatically. This information includes your IP address, the
          time you visited my website, information about the page you
          requested, etc.
        </p>

        <h2>Cookies</h2>
        <p>
          I may use cookies to gather aggregate information about site
          interaction and traffic to improve the user experience of the site. I
          may also take help from third parties to track this information on my
          behalf.
        </p>

        <h2>Third-party Links</h2>
        <p>
          You may find links to other sites on this website; I am not
          responsible for the privacy practices and content of these
          third-party sites. This privacy statement solely applies to
          information gathered by this site.
        </p>

        <h2>Copyrights and Trademarks</h2>
        <p>
          The material available on this website is current and accurate.
          Except for some of the blog&apos;s content, the remainder is the sole
          property of David John Thammineni. I do not allow anyone to reprint the material
          available on this site without prior written permission.
        </p>
        <p>
          If you have any query regarding this privacy policy, please contact
          me at <a href={`mailto:${site.email}`}>{site.email}</a>.
        </p>
      </div>
    </section>
  );
}
