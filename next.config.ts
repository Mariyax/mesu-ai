/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export", 
  images: {
    unoptimized: true, 
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
      // Keep any other existing domains you have configured
    ],
    basePath: "/mesu-ai", 
  assetPrefix: "/mesu-ai/", 
  },
  // Add URL rewriting to change the visible link
  async rewrites() {
    return [
      {
        source: '/mesu-ai/:path*',
        destination: '/:path*',
      },
    ];
  },
  // Update metadata for the site
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
