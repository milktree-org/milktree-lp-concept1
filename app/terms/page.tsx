import type { Metadata } from "next";
import { LegalLayout } from "@/components/layout/legal-layout";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms governing your use of the Milktree website.",
};

const UPDATED = "24 June 2026";

export default function TermsPage() {
  return (
    <LegalLayout title="Terms of Service" updated={UPDATED}>
      <p>
        These terms govern your use of <strong>milktreeagency.com</strong> (the
        &ldquo;Site&rdquo;), operated by <strong>Milktree</strong>, a UK-based brand &amp;
        design studio. By using the Site you agree to these terms.
      </p>

      <h2>Use of the Site</h2>
      <p>
        The Site and its content are provided for general information about our services.
        You may not misuse the Site, attempt to disrupt it, or use it for any unlawful
        purpose.
      </p>

      <h2>Bookings &amp; enquiries</h2>
      <p>
        Booking a free brand audit is a request for an introductory consultation and does
        not create a binding engagement. Any paid work is governed by a separate written
        agreement. Scheduling is handled by our provider, Cal.com.
      </p>

      <h2>Intellectual property</h2>
      <p>
        All trademarks, logos, copy, designs and portfolio work shown on the Site are owned
        by Milktree or its clients and may not be reproduced without permission.
      </p>

      <h2>No warranties &amp; limitation of liability</h2>
      <p>
        The Site is provided &ldquo;as is&rdquo; without warranties of any kind. To the
        fullest extent permitted by law, Milktree is not liable for any indirect or
        consequential loss arising from your use of the Site.
      </p>

      <h2>Changes</h2>
      <p>We may update these terms from time to time; the latest version always applies.</p>

      <h2>Contact</h2>
      <p>
        Questions about these terms? Email{" "}
        <a href="mailto:info@milktreeagency.com">info@milktreeagency.com</a>.
      </p>
    </LegalLayout>
  );
}
