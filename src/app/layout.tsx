import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Header } from '@/components/layout/Header';
import './globals.css';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata: Metadata = {
  title: "Ale's Blog",
  description: 'Thoughts on code, design, and whatever else is on my mind.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-gray-50 text-gray-900">
        <Header />
        <main className="mx-auto w-full max-w-5xl px-6 pt-16 pb-16 flex-1">{children}</main>
        <footer className="border-t border-gray-100 py-8 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} · Ale&apos;s Blog
        </footer>
      </body>
    </html>
  );
}
