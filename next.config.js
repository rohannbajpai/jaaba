/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable compression temporarily to resolve the transformAlgorithm error
  compress: false,
  
  // Keep any other existing config options
  experimental: {
    serverActions: true,
  },
  images: {
    domains: ['avatars.githubusercontent.com'],
  },
}

module.exports = nextConfig 