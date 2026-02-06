/** @type {import('next').NextConfig} */
const nextConfig = {
  /**
   * Explicitly set the Turbopack root so Next.js
   * doesn't infer the monorepo root and look for
   * dependencies (like tailwindcss) in the wrong place.
   */
  turbopack: {
    // Use the `fe` app directory as the root
    root: __dirname,
  },

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

module.exports = nextConfig;