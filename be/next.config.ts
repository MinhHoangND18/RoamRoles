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

      { source: "/pages/add", destination: "/admin/pages/add" },
      { source: "/posts/add", destination: "/admin/posts/add" },
      { source: "/categories/add", destination: "/admin/categories/add" },
      { source: "/accounts/add", destination: "/admin/accounts/add" },

      { source: "/posts/:id", destination: "/admin/posts/:id" },
      { source: "/pages/:id", destination: "/admin/pages/:id" },
      { source: "/categories/:id", destination: "/admin/categories/:id" },
      { source: "/accounts/:id", destination: "/admin/accounts/:id" },

      { source: "/survey", destination: "/admin/survey" },

      
    ];
  },

};

export default nextConfig;