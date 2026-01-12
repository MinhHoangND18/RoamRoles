/** @type {import('next').NextConfig} */
const nextConfig = {

  ...(process.env.NODE_ENV === 'production' ? { output: 'export' } : {}),
  trailingSlash: false,
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