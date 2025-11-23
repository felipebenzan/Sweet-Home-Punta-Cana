// next.config.mjs
var nextConfig = {
  typescript: {
    ignoreBuildErrors: true
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com"
      },
      {
        protocol: "https",
        hostname: "picsum.photos"
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com"
      },
      {
        protocol: "https",
        hostname: "iampuntacana.com"
      }
    ]
  },
  devIndicators: {
    allowedDevOrigins: [
      "3003-firebase-sweet-home-2-1763055212058.cluster-hf4yr35cmnbd4vhbxvfvc6cp5q.cloudworkstations.dev"
    ]
  },
  env: {
    PAYPAL_CLIENT_ID: "AXq7eJpeSOd3qbCEX_88yc9TFm8-M3CEd7JUGoKH7KJVH9Z9e0IOeqAsamYl6m6VyemOvi0rXKQ2xAFu",
    PAYPAL_CLIENT_SECRET: "EOwmlfNjjVxZ8rz0MMaN0lVP-N9R5iCieJ2KR1nQEx68hwN3BWoo5-_Bq0Djvf20QtKkTqMo_eSVPiua",
    PAYPAL_ENV: "sandbox"
  }
};
var next_config_default = nextConfig;
export {
  next_config_default as default
};
