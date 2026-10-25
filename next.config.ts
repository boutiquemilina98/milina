import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,
  images: {
    minimumCacheTTL: 2592000, // 30 days
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "50mb",
    },
  },
};

export default nextConfig;
