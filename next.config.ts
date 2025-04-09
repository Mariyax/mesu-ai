/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export", // Enable static export for GitHub Pages
  basePath: "/mesu-ai", // Move to root level - matches your GitHub repo name
  assetPrefix: "/mesu-ai/", // Move to root level - matches your GitHub repo name
  images: {
    unoptimized: true, // Required for static export
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images-na.ssl-images-amazon.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.gr-assets.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'd28hgpri8am2if.cloudfront.net',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'm.media-amazon.com',
        pathname: '/**',
      },
    ],
  },
  // URL rewriting - keep this for when running in dev mode
  async rewrites() {
    return [
      {
        source: '/mesu-ai/:path*',
        destination: '/:path*',
      },
    ];
  },
  // Metadata headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Description',
            value: 'Mesu AI Fan Fiction - The Place to Reach GenX',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
