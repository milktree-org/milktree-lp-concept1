import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    qualities: [75, 80],
  },
  async redirects() {
    return [
      // Live Meta ads point at /audit on the production domain. The new site's
      // booking funnel lives at /book, so keep that ad traffic working after the
      // domain cutover. Query strings (UTMs, fbclid) are forwarded automatically.
      { source: "/audit", destination: "/book", permanent: false },
      { source: "/audit/thank-you", destination: "/book", permanent: false },
      // Old Vite site served legal at /privacy-policy; keep indexed/bookmarked links alive.
      { source: "/privacy-policy", destination: "/privacy", permanent: true },
    ];
  },
};

export default nextConfig;
