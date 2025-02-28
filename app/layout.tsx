import type { Metadata } from 'next';
import Providers from './components/Providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'Prayer Times',
  description: 'Bangladesh Prayer Times Schedule',
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