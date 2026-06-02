import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import { SITE } from '@/lib/constants';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — ${SITE.tagline}`,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  openGraph: {
    type: 'website',
    siteName: SITE.name,
    locale: SITE.locale,
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased bg-background text-foreground`}>
        {children}
        <Script
          src="https://cloud.umami.is/script.js"
          data-website-id="4850926a-9af1-4bdd-a634-bb244620e3fe"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
