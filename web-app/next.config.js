/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React StrictMode for development
  reactStrictMode: true,
  
  // Experimental features
  experimental: {
    // Remove unsupported option
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
  },

  // Ignore ESLint errors during builds
  eslint: {
    // Warning: This only enables the ESLint error overlay
    // Next.js doesn't fail builds if you have ESLint errors.
    ignoreDuringBuilds: true,
  }
};

module.exports = nextConfig; 