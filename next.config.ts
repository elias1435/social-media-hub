import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Hostinger has a strict OS thread/process limit. Keep Next.js build
    // worker count low to avoid EAGAIN / SIGABRT during static page generation.
    cpus: 1,
  },
};

export default nextConfig;
