import type { Metadata } from "next";
import { LegalLayout } from "@/components/layout/legal-layout";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Milktree collects, uses and protects your data, including the analytics and advertising tools we use.",
  alternates: {
    canonical: "/privacy",
  },
};

const UPDATED = "4 July 2026";

export default function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy" updated={UPDATED}>
      <p>
        This Privacy Policy explains how <strong>Milktree</strong> (&ldquo;we&rdquo;,
        &ldquo;us&rdquo;) collects, uses and protects information when you visit{" "}
        <strong>milktreeagency.com</strong> (the &ldquo;Site&rdquo;), submit an enquiry or
        book an intro call with us. We are a UK-based brand &amp; design studio and act as
        the data controller for the personal data described here.
      </p>

      <h2>Information we collect</h2>
      <ul>
        <li>
          <strong>Enquiry details</strong> — when you complete our &ldquo;Get
          started&rdquo; form or Brand Score: your name, work email, phone
          (optional), company name, website, team size, budget band and your quiz
          answers. These are stored securely in our database (Supabase, hosted in the
          UK/EU) so we never lose your enquiry.
        </li>
        <li>
          <strong>Booking details</strong> — when you book an intro call, the name, email
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
          <strong>Technical data shared with advertising platforms</strong> — where you have
          consented, we send conversion data to Meta via its Conversions API. Direct
          identifiers such as your email address, phone number and name are hashed
          (SHA-256) before transmission and are used only for conversion matching. Your IP
          address and user-agent are transmitted in their original form, because Meta
          requires them unhashed in order to match an event; they are not used by us for
          any other purpose. Data is transferred to Meta, Google and Microsoft in the United
          States under the UK Extension to the EU&ndash;US Data Privacy Framework and/or
          the UK International Data Transfer Addendum.
        </li>
      </ul>

      <h2>Cookies &amp; tracking technologies</h2>
      <p>
        We ask for your consent before setting any non-essential cookie. Until you accept,
        Microsoft Clarity is not loaded at all, the Meta Pixel is held in a revoked-consent
        state that writes no cookies, and Google Analytics runs in a cookieless mode that
        stores nothing on your device. You can change or withdraw your choice at any time
        using the cookie button in the bottom-left corner of any page.
      </p>
      <p>Subject to your consent, we use the following third-party tools, each of which may set cookies or use local storage:</p>
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
          <strong>Cal.com</strong> — to schedule and manage your intro-call booking.
        </li>
        <li>
          <strong>Resend</strong> — to send transactional email (your plan options or
          your Brand Score) and, only where you have ticked the consent box,
          occasional marketing emails. Every email includes a way to opt out.
        </li>
        <li>
          <strong>Supabase</strong> — secure storage of form and quiz submissions.
        </li>
      </ul>

      <h2>Brand Score data</h2>
      <p>
        When you request a Brand Score we look up publicly available
        information to build it: live Google search results for search terms relevant
        to your sector and region (via Apify), and publicly visible brand elements —
        colours, typography, headlines — from your website and the top-ranking
        competitor websites (via Firecrawl). Search results are cached for up to 7 days
        and brand extractions for up to 30 days. Where any figure is an estimate, the
        report says so.
      </p>

      <h2>How we use your information</h2>
      <ul>
        <li>To respond to enquiries and deliver anything you request from us — including
          your Brand Score, which we send by email regardless of marketing
          consent because it&apos;s what you asked for.</li>
        <li>To send occasional brand tips and marketing email <strong>only where you
          have opted in</strong> (the consent box is never pre-ticked). You can
          unsubscribe at any time.</li>
        <li>To measure, attribute and improve our advertising and the Site.</li>
        <li>To operate, secure and improve our services.</li>
      </ul>

      <h2>Legal bases (UK GDPR)</h2>
      <p>
        We rely on <strong>consent</strong> for non-essential analytics and advertising
        cookies, <strong>legitimate interests</strong> for running and securing the Site and
        measuring our marketing, and <strong>performance of a contract / pre-contract
        steps</strong> when you make an enquiry or book a call. You can withdraw consent at
        any time.
      </p>

      <h2>Sharing</h2>
      <p>
        We share data with the service providers named above (Meta, Google, Microsoft,
        Cal.com, Resend, Supabase, Apify, Firecrawl) acting as processors or independent
        controllers for the limited purposes described. We do not sell your personal
        data.
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
