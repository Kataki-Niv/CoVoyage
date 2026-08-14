import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "i.pinimg.com",
      },
    ],
  },
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        ...config.watchOptions,
        ignored:
          /[\\/]backend[\\/](?:venv[\\/]|__pycache__[\\/]|.*\.(?:pyc|err|out)$)/,
      };
    }

    return config;
  },
  reactCompiler: true,
};

export default nextConfig;
