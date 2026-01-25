import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Suspense } from 'react'
import Header from '@/components/ui/Header'
import Footer from '@/components/ui/Footer'
import { AppProviders } from '@/components/providers/AppProviders'
import ErrorBoundary from '@/components/ui/ErrorBoundary'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap', // Prevents invisible text during font load
  preload: true,
  variable: '--font-inter',
  adjustFontFallback: true,
})

export const metadata: Metadata = {
  title: 'AI Markets - Multi-Vendor Marketplace',
  description: 'Discover artisan vendors, shop local products, and visit our real-world markets',
  keywords: 'marketplace, artisan, local, vendors, AI Markets, handmade, local produce',
  icons: {
    icon: [
      { url: '/icon.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'AI Markets',
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        {/* Preconnect to external domains for faster loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://hkssuvamxdnqptyprsom.supabase.co" />
      </head>
      <body className={inter.className}>
        <ErrorBoundary>
          <AppProviders>
            <a href="#main-content" className="skip-to-content">
              Skip to main content
            </a>
            <Suspense fallback={<div className="h-16 bg-white border-b border-neutral-100" />}>
              <Header />
            </Suspense>
            <Suspense fallback={<div className="min-h-screen bg-white" />}>
              {children}
            </Suspense>
            <Suspense fallback={null}>
              <Footer />
            </Suspense>
          </AppProviders>
        </ErrorBoundary>
      </body>
    </html>
  )
}

