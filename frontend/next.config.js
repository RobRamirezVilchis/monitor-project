/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"]
    });

    config.module.rules.unshift({
      test: /pdf\.worker\.(min\.)?js/,
      use: [{
        loader: "file-loader",
        options: {
          name: "[contenthash].[ext]",
          publicPath: "/_next/static/worker",
          outputPath: "static/worker"
        }
      }]
    })

    return config;
  },
  experimental: {
    optimizePackageImports: [
      "@mantine/core",
      "@mantine/dates",
      "@tabler/icons-react",
    ],
    scrollRestoration: true,
  },
}

module.exports = nextConfig
