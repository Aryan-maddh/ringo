import type { Metadata } from 'next';
import { Inter, Manrope } from 'next/font/google';
import './globals.css';
import { InquiryModal } from '@/components/ringo/InquiryModal';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

const manrope = Manrope({
  variable: '--font-manrope',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Ripe Lead — Missed-call AI',
  description: 'Every missed call, answered in 11 seconds.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${manrope.variable}`}>
      <body style={{ margin: 0, padding: 0 }}>
        {children}
        <InquiryModal />
      </body>
    </html>
  );
}
