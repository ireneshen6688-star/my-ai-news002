/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // Changed from 'export' for API routes
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
