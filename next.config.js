/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/uploads/**',
      }
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  webpack: (config) => {
    const rules = config.module.rules
      .find((rule) => typeof rule.oneOf === 'object')
      .oneOf.filter((rule) => Array.isArray(rule.use));

    rules.forEach((rule) => {
      rule.use = rule.use.map((moduleLoader) => {
        if (
          moduleLoader.loader?.includes('postcss-loader') ||
          moduleLoader.loader?.includes('tailwindcss')
        ) {
          return false;
        }
        return moduleLoader;
      }).filter(Boolean);
    });

    return config;
  }
};

module.exports = nextConfig;
