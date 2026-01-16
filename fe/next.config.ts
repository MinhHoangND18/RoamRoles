/** @type {import('next').NextConfig} */
const nextConfig = {

  // ...(process.env.NODE_ENV === 'production' ? { output: 'export' } : {}),
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