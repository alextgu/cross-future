import type { NextConfig } from "next";

export const legacyRedirects = [
  /* Most former subject pages collapsed into home-page sections. Speakers and
     interviews now have permanent archives, so their legacy URLs resolve to
     those routes instead of bouncing visitors back to the homepage. */
  { source: "/assembly", destination: "/", permanent: true },
  { source: "/about", destination: "/#about", permanent: true },
  { source: "/agenda", destination: "/program", permanent: true },
  { source: "/partners", destination: "/#partners", permanent: true },
  { source: "/contact", destination: "/#contact", permanent: true },
  { source: "/register", destination: "/#contact", permanent: true },
  {
    source: "/interviews",
    destination: "/speakers#interviews",
    permanent: true,
  },
  {
    source: "/archive",
    destination: "/speakers#interviews",
    permanent: true,
  },
  {
    source: "/media",
    destination: "/speakers#interviews",
    permanent: true,
  },
  { source: "/assembly/about", destination: "/#about", permanent: true },
  { source: "/assembly/speakers", destination: "/speakers", permanent: true },
  { source: "/assembly/agenda", destination: "/program", permanent: true },
  {
    source: "/assembly/media",
    destination: "/speakers#interviews",
    permanent: true,
  },
  { source: "/assembly/partners", destination: "/#partners", permanent: true },
  { source: "/assembly/register", destination: "/#contact", permanent: true },
  { source: "/assembly/contact", destination: "/#contact", permanent: true },
  { source: "/nexus", destination: "/", permanent: true },
] as const;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.sanity.io" },
      { protocol: "https", hostname: "image.sanity.io" },
    ],
  },
  outputFileTracingIncludes: {
    "/*": [
      "./node_modules/@libsql/client/lib-esm/web.js",
      "./node_modules/@libsql/client/lib-cjs/web.js",
      "./node_modules/@libsql/isomorphic-ws/web.mjs",
      "./node_modules/@libsql/isomorphic-ws/web.cjs",
    ],
  },
  async redirects() {
    return [...legacyRedirects];
  },
};

export default nextConfig;
