import type { NextConfig } from "next";
import { apiOrigin } from "./src/lib/api/origin";

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
  // same-origin API: the browser calls /api/* on this app and Next forwards it to the API server.
  // API_ORIGIN is read at build time (next.config is compiled into the build).
  async rewrites() {
    return [{ source: '/api/:path*', destination: `${apiOrigin()}/api/:path*` }]
  },
  experimental: {
    // bodies forwarded through /api are buffered up to this size; images are capped at 10 MB by the API
    // and videos go straight from the browser to Cloudinary, so 16 MB covers every proxied upload
    proxyClientMaxBodySize: 16 * 1024 * 1024,
  },
};

export default nextConfig;
