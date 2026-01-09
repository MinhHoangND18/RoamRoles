/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'roamroles.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig;