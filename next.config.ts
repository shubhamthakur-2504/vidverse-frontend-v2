import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // self-contained server bundle (.next/standalone) used by the production Docker image
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'http',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
};

export default nextConfig;
