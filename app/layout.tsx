import type { Metadata } from 'next';
import Providers from './components/Providers';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://yoursite.com'),
  title: {
    default: 'Prayer Times',
    template: '%s | Prayer Times'
  },
  description: 'Get accurate prayer times for Fajr, Dhuhr, Asr, Maghrib, Isha and Tahajjud prayers with real-time updates.',
  openGraph: {
    type: 'website',
    title: 'Prayer Times',
    description: 'Get accurate prayer times for all daily prayers with real-time updates.',
  },
  alternates: {
    canonical: '/',
    languages: {
      'en': '/en',
      'bn': '/bn'
    },
  },
  robots: {
    index: true,
    follow: true,
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
} 