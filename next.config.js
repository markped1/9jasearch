/** @type {import('next').NextConfig} */
const nextConfig = {
  // Move the build cache outside OneDrive to prevent Turbopack SST corruption
  distDir: process.env.NEXT_DIST_DIR || '.next',
  experimental: {
    // Force Turbopack to use a temp directory for its persistent cache
    turbo: {
      root: __dirname,
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
};

module.exports = nextConfig;
