/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'iampuntacana.com',
      },
    ],
  },
  devIndicators: {
    allowedDevOrigins: [
      '3003-firebase-sweet-home-2-1763055212058.cluster-hf4yr35cmnbd4vhbxvfvc6cp5q.cloudworkstations.dev'
    ],
  },
  // Explicitly expose server-side env vars to ensuring baking if build-time available
  env: {
    BEDS24_API_KEY: process.env.BEDS24_API_KEY,
    BEDS24_PROP_ID: process.env.BEDS24_PROP_ID,
    BEDS24_PROP_KEY: process.env.BEDS24_PROP_KEY,
  },

};

// Force Vercel Rebuild: Audit 2024-12-07

export default nextConfig;
