import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost" },
      { protocol: "https", hostname: "randomuser.me" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },

  turbopack: {
  },

  experimental: {
    optimizeCss: true, // You can still keep this
  },
};

export default nextConfig;
