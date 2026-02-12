import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
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
