import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'
import { Suspense } from 'react'
import Header from '@/components/ui/Header'
import Footer from '@/components/ui/Footer'
import NextTopLoader from 'nextjs-toploader'
import { AppProviders } from '@/components/providers/AppProviders'
import ErrorBoundary from '@/components/ui/ErrorBoundary'
import { Toaster } from 'sonner'

// Single font family — eliminates one Google Fonts download
// system-ui is the fallback for body text (zero-cost, no layout shift)
// Using 'variable' weight loads the variable-font file (one file for all weights),
// which is smaller than loading multiple separate weight files.
// The variable font covers 200–800; font-black (900) maps gracefully to 800.
const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  variable: '--font-display',
  weight: 'variable',
  adjustFontFallback: true,
})

export const metadata: Metadata = {
  // SOVEREIGN IDENTITY: Asia Insights is the city. Markets is a district.
  title: {
    default: 'Asia Insights - Community & Commerce',
    template: '%s · Asia Insights',
  },
  description: 'A curated directory and trust layer for expats, travellers, and long-stay residents in Southeast Asia. Businesses, stays, events, and human concierge support.',
  keywords: 'expat, nomad, relocation, southeast asia, vietnam, thailand, malaysia, concierge, local businesses, stays',
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
    title: 'Asia Insights',
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
    <html lang="en" className={plusJakartaSans.variable}>
      <head>
        {/* Preconnect to external domains for faster loading */}
        <link rel="preconnect" href="https://hkssuvamxdnqptyprsom.supabase.co" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        {/* Note: hero image preload is handled by Next.js <Image priority> automatically */}
      </head>
      <body className={plusJakartaSans.className}>
        <ErrorBoundary>
          <AppProviders>
            <a href="#main-content" className="skip-to-content">
              Skip to main content
            </a>
            <NextTopLoader
              color="#0d9488"
              initialPosition={0.08}
              crawlSpeed={200}
              height={3}
              crawl={true}
              showSpinner={false}
              easing="ease"
              speed={200}
              shadow="0 0 10px #0d9488,0 0 5px #0d9488"
            />
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
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}

