import type { Metadata } from "next";
import { LegalLayout } from "@/components/layout/legal-layout";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Milktree collects, uses and protects your data, including the analytics and advertising tools we use.",
};

const UPDATED = "24 June 2026";

export default function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy" updated={UPDATED}>
      <p>
        This Privacy Policy explains how <strong>Milktree</strong> (&ldquo;we&rdquo;,
        &ldquo;us&rdquo;) collects, uses and protects information when you visit{" "}
        <strong>milktreeagency.com</strong> (the &ldquo;Site&rdquo;) or book a free brand
        audit with us. We are a UK-based brand &amp; design studio and act as the data
        controller for the personal data described here.
      </p>

      <h2>Information we collect</h2>
      <ul>
        <li>
          <strong>Booking details</strong> — when you book a brand audit, the name, email
          and any details you provide through our scheduling provider (Cal.com).
        </li>
        <li>
          <strong>Usage &amp; device data</strong> — pages viewed, clicks, approximate
          location, browser and device type, and similar analytics data.
        </li>
        <li>
          <strong>Advertising identifiers</strong> — marketing click IDs and parameters
          present in the URL when you arrive (for example Meta&rsquo;s <code>fbclid</code>
          and UTM tags), stored in your browser to attribute enquiries to the campaign that
          referred you.
        </li>
        <li>
          <strong>Technical data shared with advertising platforms</strong> — to measure ad
          performance we may send a hashed (pseudonymised) version of identifiers such as
          your IP address and user-agent to Meta via its Conversions API. These are hashed
          before transmission and used only for conversion matching.
        </li>
      </ul>

      <h2>Cookies &amp; tracking technologies</h2>
      <p>We use the following third-party tools, each of which may set cookies or use local storage:</p>
      <ul>
        <li>
          <strong>Meta Pixel &amp; Conversions API</strong> (Meta Platforms, Inc.) — to
          measure and optimise our Facebook/Instagram advertising. The Pixel (browser) and
          Conversions API (server) are deduplicated via a shared event ID.
        </li>
        <li>
          <strong>Google Analytics 4</strong> (Google LLC) — to understand how the Site is
          used.
        </li>
        <li>
          <strong>Microsoft Clarity</strong> (Microsoft Corporation) — for aggregated
          usage analytics and session insights.
        </li>
        <li>
          <strong>Cal.com</strong> — to schedule and manage your brand-audit booking.
        </li>
      </ul>

      <h2>How we use your information</h2>
      <ul>
        <li>To respond to enquiries and deliver the free brand audit you request.</li>
        <li>To measure, attribute and improve our advertising and the Site.</li>
        <li>To operate, secure and improve our services.</li>
      </ul>

      <h2>Legal bases (UK GDPR)</h2>
      <p>
        We rely on <strong>consent</strong> for non-essential analytics and advertising
        cookies, <strong>legitimate interests</strong> for running and securing the Site and
        measuring our marketing, and <strong>performance of a contract / pre-contract
        steps</strong> when you book an audit. You can withdraw consent at any time.
      </p>

      <h2>Sharing</h2>
      <p>
        We share data with the service providers named above (Meta, Google, Microsoft,
        Cal.com) acting as processors or independent controllers for the limited purposes
        described. We do not sell your personal data.
      </p>

      <h2>Retention</h2>
      <p>
        We keep booking and enquiry data for as long as needed to provide our services and
        meet legal obligations, and analytics/advertising data in line with each
        provider&rsquo;s standard retention periods.
      </p>

      <h2>Your rights</h2>
      <p>
        You have the right to access, correct, delete or restrict processing of your
        personal data, to object to processing, and to data portability. You can also opt
        out of ad tracking through your browser settings or the platforms&rsquo; own tools,
        and complain to the UK Information Commissioner&rsquo;s Office (ICO).
      </p>

      <h2>Contact</h2>
      <p>
        For any privacy request or question, email{" "}
        <a href="mailto:info@milktreeagency.com">info@milktreeagency.com</a>.
      </p>
    </LegalLayout>
  );
}
