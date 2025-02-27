import './globals.css';
import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { Toaster } from '@/components/ui/toaster';
import { QuickFixButton } from '@/components/quick-fix-button';
import { UserSync } from '@/components/UserSync';
import { Geist, Geist_Mono } from 'next/font/google';
import { Navigation } from '@/components/ui/navigation';
import { MobileNav } from '@/components/ui/mobile-nav';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Sela Grp',
  description: 'Business management platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ClerkProvider>
          <Toaster />
          
          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <Navigation />
          </div>
          
          {/* Mobile Navigation */}
          <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-slate-900 text-white border-b border-slate-800 p-4 flex items-center justify-between">
            <span className="text-2xl font-bold">Sela Grp</span>
            <MobileNav />
          </div>
          
          {/* Main Content */}
          <main className="md:pl-64 min-h-screen bg-gray-50">
            <div className="md:hidden h-16"></div> {/* Spacer for mobile nav */}
            {children}
          </main>
          
          <QuickFixButton />
          <UserSync />
        </ClerkProvider>
      </body>
    </html>
  )
}