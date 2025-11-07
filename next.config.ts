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
        source: '/help-center/:path*',
        destination: '/dashboard',
        permanent: false,
      },
    ];
  },
};

export default withNextVideo(nextConfig, { folder: '/public/media/videos' });