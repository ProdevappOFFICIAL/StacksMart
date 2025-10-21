import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
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
};

export default nextConfig;
