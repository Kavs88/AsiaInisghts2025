/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ['@/components/ui', 'lucide-react'],
    // Enable partial prerendering for better performance
    ppr: false, // Can enable when stable
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
    // Enable image optimization for better performance
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Reduce quality for non-critical images
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: false,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // Optimize compilation
  swcMinify: true,
  // Enable compression
  compress: true,
  // Production optimizations
  poweredByHeader: false,
  // Optimize output
  output: 'standalone', // Enabled for optimized deployment (Hostinger compatible)
  // Disable prefetching to prevent navigation issues
  // Links will still work, just won't prefetch in background
  async redirects() {
    return [
      {
        source: '/products',
        destination: '/markets/products',
        permanent: true,
      },
      {
        source: '/products/:path*',
        destination: '/markets/products/:path*',
        permanent: true,
      },
      {
        source: '/orders',
        destination: '/markets/orders',
        permanent: true,
      },
      {
        source: '/orders/:path*',
        destination: '/markets/orders/:path*',
        permanent: true,
      },
      {
        source: '/admin',
        destination: '/markets/admin',
        permanent: true,
      },
      {
        source: '/admin/:path*',
        destination: '/markets/admin/:path*',
        permanent: true,
      },
      {
        source: '/sellers',
        destination: '/markets/sellers',
        permanent: true,
      },
      {
        source: '/sellers/:path*',
        destination: '/markets/sellers/:path*',
        permanent: true,
      },
      {
        source: '/vendor',
        destination: '/markets/vendor/dashboard',
        permanent: true,
      },
      {
        source: '/vendor/dashboard',
        destination: '/markets/vendor/dashboard',
        permanent: true,
      },
      {
        source: '/vendor/apply',
        destination: '/markets/vendor/apply',
        permanent: true,
      },
      {
        source: '/vendor/profile',
        destination: '/markets/vendor/profile',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig

