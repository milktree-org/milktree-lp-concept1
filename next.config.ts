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
    ];
  },
};

export default nextConfig;
