import { withNextVideo } from "next-video/process";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"]
    });
    return config;
  },
  redirects: async () => {
    return [
      {
        source: '/dashboard/:path*',
        destination: '/',
        permanent: false,
      },
      {
        source: '/register/:path*',
        destination: '/',
        permanent: false,
      },
      {
        source: '/settings/:path*',
        destination: '/',
        permanent: false,
      },
      {
        source: '/auth/:path*',
        destination: '/',
        permanent: false,
      },
      {
        source: '/help-center/:path*',
        destination: '/',
        permanent: false,
      },
    ];
  },
};

export default withNextVideo(nextConfig, { folder: '/public/media/videos' });