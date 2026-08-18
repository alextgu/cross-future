import type { NextConfig } from "next";

export const legacyRedirects = [
  { source: "/assembly", destination: "/", permanent: true },
  { source: "/assembly/about", destination: "/about", permanent: true },
  { source: "/assembly/speakers", destination: "/speakers", permanent: true },
  { source: "/assembly/agenda", destination: "/agenda", permanent: true },
  { source: "/assembly/media", destination: "/media", permanent: true },
  { source: "/assembly/partners", destination: "/partners", permanent: true },
  { source: "/assembly/register", destination: "/register", permanent: true },
  { source: "/assembly/contact", destination: "/contact", permanent: true },
  { source: "/nexus", destination: "/", permanent: true },
] as const;

const nextConfig: NextConfig = {
  async redirects() {
    return [...legacyRedirects];
  },
};

export default nextConfig;
