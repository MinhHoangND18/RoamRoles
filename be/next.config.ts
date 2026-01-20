import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  trailingSlash: false,
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
  async rewrites() {
    return [
      { source: "/posts", destination: "/admin/posts" },
      { source: "/pages", destination: "/admin/pages" },
      { source: "/categories", destination: "/admin/categories" },
      { source: "/accounts", destination: "/admin/accounts" },
      { source: "/accounts/add", destination: "/admin/accounts/add" },
      { source: "/posts/:id", destination: "/admin/:id?type=post" },
      { source: "/pages/:id", destination: "/admin/:id?type=page" },
      { source: "/tags/:id", destination: "/admin/:id?menu=tag" },
    ];
  },

};

export default nextConfig;