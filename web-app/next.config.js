/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React StrictMode for development
  reactStrictMode: true,
  
  // Enable debug mode for faster refresh
  experimental: {
    // Optimize fast refresh for better development experience
    optimizeServerTopology: true,
  },
  
  // Allow image optimization for specified domains
  images: {
    domains: ['placehold.co'],
  }
};

module.exports = nextConfig; 