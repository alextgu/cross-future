import type { NextConfig } from "next";

export const legacyRedirects = [
  { source: "/assembly", destination: "/", permanent: true },
  { source: "/assembly/:path*", destination: "/:path*", permanent: true },
  { source: "/nexus", destination: "/", permanent: true },
  { source: "/nexus/:path*", destination: "/", permanent: true },
] as const;

const nextConfig: NextConfig = {
  async redirects() {
    return [...legacyRedirects];
  },
};

export default nextConfig;
