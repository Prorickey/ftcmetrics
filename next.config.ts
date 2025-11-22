import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: ["ftcmetrics-api"],
};

export default nextConfig;
