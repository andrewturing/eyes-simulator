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
  },
  
  // Expose a limited set of environment variables to the browser
  env: {
    MONGODB_HOST: process.env.MONGODB_HOST,
    MONGODB_PORT: process.env.MONGODB_PORT,
    MONGODB_DATABASE: process.env.MONGODB_DATABASE
  }
};

module.exports = nextConfig; 