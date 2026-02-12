import type { Metadata } from 'next';
import { Montserrat, Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

import '../globals.css';
import { Providers } from '../providers';

const montserrat = Montserrat({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-heading',
  display: 'swap',
  weight: ['500', '600', '700', '800', '900'],
});

const inter = Inter({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: '5Sport - Admin Dashboard',
  description: 'Admin dashboard for 5Sport platform',
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${inter.variable} ${montserrat.variable} font-sans antialiased`}>
        <NextIntlClientProvider messages={messages}>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
