/** @type {import('next').NextConfig} */
const nextConfig = {

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