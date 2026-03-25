import type { Metadata } from 'next';
import { Playfair_Display, Inter } from 'next/font/google';
import { Geist_Mono } from 'next/font/google';
import { Header } from '@/components/layout/Header';
import './globals.css';

const playfair = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
  display: 'swap',
});

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata: Metadata = {
  title: "Ale's Blog",
  description: 'Thoughts on code, design, and whatever else is on my mind.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#f5f2ed] text-gray-900" style={{ fontFamily: 'var(--font-inter), system-ui, sans-serif' }}>
        <Header />
        <main className="mx-auto w-full max-w-6xl px-8 pt-14 pb-20 flex-1">{children}</main>
        <footer className="border-t border-stone-200 py-8 text-center text-xs text-stone-400">
          © {new Date().getFullYear()} · Ale&apos;s Blog
        </footer>
      </body>
    </html>
  );
}
