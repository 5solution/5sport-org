import type { Metadata } from 'next';
import { Montserrat, Inter } from 'next/font/google';

import './globals.css';
import { Providers } from './providers';

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
  weight: ['500', '600', '700', '800', '900'],
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: '5Sport - Admin Dashboard',
  description: 'Admin dashboard for 5Sport platform',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${montserrat.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
