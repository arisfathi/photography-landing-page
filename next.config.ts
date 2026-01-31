import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "upwxmmvgwfpwicsznljh.supabase.co",
      },
    ],
  },
};

export default nextConfig;
