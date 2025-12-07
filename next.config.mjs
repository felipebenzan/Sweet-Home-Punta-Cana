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

};

// Force Vercel Rebuild: Audit 2024-12-07

export default nextConfig;
