import type { NextConfig } from "next";

export const legacyRedirects = [
  /* The site collapsed to one page. Every route that used to carry a subject
     is now a section of the home page, so the old URLs land on the section
     rather than on a 404 — and legacy media/archive URLs point at Interviews. */
  { source: "/assembly", destination: "/", permanent: true },
  { source: "/about", destination: "/#about", permanent: true },
  { source: "/speakers", destination: "/#faculty", permanent: true },
  { source: "/agenda", destination: "/#agenda", permanent: true },
  { source: "/partners", destination: "/#partners", permanent: true },
  { source: "/contact", destination: "/#contact", permanent: true },
  { source: "/register", destination: "/#contact", permanent: true },
  { source: "/archive", destination: "/interviews", permanent: true },
  { source: "/media", destination: "/interviews", permanent: true },
  { source: "/assembly/about", destination: "/#about", permanent: true },
  { source: "/assembly/speakers", destination: "/#faculty", permanent: true },
  { source: "/assembly/agenda", destination: "/#agenda", permanent: true },
  { source: "/assembly/media", destination: "/interviews", permanent: true },
  { source: "/assembly/partners", destination: "/#partners", permanent: true },
  { source: "/assembly/register", destination: "/#contact", permanent: true },
  { source: "/assembly/contact", destination: "/#contact", permanent: true },
  { source: "/nexus", destination: "/", permanent: true },
] as const;

const nextConfig: NextConfig = {
  async redirects() {
    return [...legacyRedirects];
  },
};

export default nextConfig;
