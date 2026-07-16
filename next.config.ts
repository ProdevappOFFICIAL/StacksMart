import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  // Ensure @stacks/* packages are properly transpiled by webpack
  transpilePackages: [
    '@stacks/connect',
    '@stacks/auth',
    '@stacks/transactions',
    '@stacks/network',
  ],

  images: {

    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },

      {
        protocol: 'https',
        hostname: 'encrypted-tbn0.gstatic.com'
      },
      {
        protocol: 'https',
        hostname: 'sdmntprukwest.oaiusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'sdmntprwestus3.oaiusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'utfs.io', // UploadThing CDN for store icons and banners
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'api.phantom.app',
      },
      {
        protocol: 'https',
        hostname: 'static.tildacdn.net'
      }
    ],
  },

  // Webpack fallbacks for Node.js built-in modules used by @stacks/* packages
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        crypto: false,
        stream: false,
        buffer: false,
        fs: false,
        path: false,
        os: false,
      };
    }
    return config;
  },
};

export default nextConfig;
