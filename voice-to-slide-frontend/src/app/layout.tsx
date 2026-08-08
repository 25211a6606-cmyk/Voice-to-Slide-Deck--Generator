import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import { ToastProvider } from '@/components/Toast';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'VoiceToSlide - AI Audio to Presentation Generator',
  description: 'Convert voice recordings, audio transcripts, and lectures into structured PowerPoint slides in seconds using AI.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}>
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100">
        <ToastProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-slate-800/80 bg-slate-950/80 py-8 text-center text-xs text-slate-500">
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-300">VoiceToSlide AI</span>
                <span>• Speech-to-Presentation Studio</span>
              </div>
              <p className="flex items-center gap-1">
                <span>Built with Next.js 16, TypeScript & Tailwind CSS</span>
              </p>
            </div>
          </footer>
        </ToastProvider>
      </body>
    </html>
  );
}
