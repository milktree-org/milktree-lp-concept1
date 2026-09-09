import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    qualities: [75, 80],
  },
  // sharp ships native binaries; keep it out of the server bundle so the
  // Brand Score logo analysis (lib/server/logo.ts) works in production.
  serverExternalPackages: ["sharp"],
  // sharp's platform binary dlopens libvips from a sibling package at runtime,
  // which file tracing can't see, so the deployment shipped the binary without
  // its library and every logo read failed. Include it explicitly for the
  // routes that reach the benchmark.
  outputFileTracingIncludes: {
    "/api/quiz/start": ["./node_modules/@img/sharp-libvips-linux-x64/**"],
    "/api/audit/start": ["./node_modules/@img/sharp-libvips-linux-x64/**"],
    "/api/doc/rebenchmark": ["./node_modules/@img/sharp-libvips-linux-x64/**"],
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
      // Studio relaunch (MILKTREE-STUDIO.md §4): retired pages fold into the
      // nearest product page so old ad, email and search links keep working.
      { source: "/hire-calculator", destination: "/subscription", permanent: true },
      { source: "/brand-audit", destination: "/brand-report", permanent: true },
      { source: "/lp/creative-department", destination: "/sprint", permanent: false },
      { source: "/lp/:path*", destination: "/sprint", permanent: false },
      { source: "/concept-2", destination: "/", permanent: true },
      { source: "/concept-3", destination: "/", permanent: true },
      { source: "/ads", destination: "/work", permanent: true },
      { source: "/plans", destination: "/pricing", permanent: true },
    ];
  },
};

export default nextConfig;
