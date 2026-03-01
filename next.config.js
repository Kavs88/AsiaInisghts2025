/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // Tree-shake icon/animation libraries so only used exports ship
    // NOTE: supabase packages omitted — they have complex side-effect exports
    // that break under barrel optimisation
    optimizePackageImports: [
      'lucide-react',
      'framer-motion',
    ],
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
    // Serve WebP/AVIF automatically (massive size savings vs JPEG)
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Cache optimised images for 30 days
    minimumCacheTTL: 2592000,
    dangerouslyAllowSVG: false,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // Gzip/Brotli all text responses
  compress: true,
  poweredByHeader: false,
  // output: 'standalone',

  // Aggressive long-term caching for immutable static assets
  async headers() {
    return [
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=2592000, stale-while-revalidate=86400',
          },
        ],
      },
    ]
  },

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

