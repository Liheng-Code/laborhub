import { imageHosts } from './image-hosts.config.mjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
  productionBrowserSourceMaps: false,
  distDir: process.env.DIST_DIR || '.next',
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: imageHosts,
    minimumCacheTTL: 60,
  },
  webpack(
    config,
    {
      dev: dev
    }
  ) {
    if (!dev) {
      config.module.rules.push({
        test: /\.(jsx|tsx)$/,
        exclude: [/node_modules/],
        use: [{
          loader: '@dhiwise/component-tagger/nextLoader',
        }],
      });
    }
    if (dev) {
      config.watchOptions = {
        ignored: [
          '**/node_modules/**',
          '**/.git/**',
          '**/.next/**',
        ],
      };
    }
    return config;
  },
};
export default nextConfig;