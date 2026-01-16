import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  trailingSlash: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'jobzesty.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
