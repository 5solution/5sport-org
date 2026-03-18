import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from 'next';

const withNextIntl = createNextIntlPlugin('./i18n.ts');

const nextConfig: NextConfig = {
  output: 'standalone',
  env: {
    REFEREE_UI_URL: process.env.REFEREE_UI_URL,
  },
  async rewrites() {
    return [
      {
        // Proxy all API requests EXCEPT NextAuth routes to the backend
        source: "/api/:path((?!auth).*)*",
        destination: "http://localhost:3000/:path*",
      },
    ];
  },
};

export default withNextIntl(nextConfig);
