/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ['@tabler/icons-react'],
  },

  webpack: (config, { isServer }) => {
    config.optimization.splitChunks.cacheGroups = {
      ...config.optimization.splitChunks.cacheGroups,
      fonts: {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        type: 'asset/resource',
        filename: 'static/fonts/[name].[hash][ext]',
      },
    };
    return config;
  },
};

module.exports = nextConfig;