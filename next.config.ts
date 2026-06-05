import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Produces a self-contained server in .next/standalone — needed for Docker
  output: 'standalone',
};

export default nextConfig;
