import Link from 'next/link'
import Image from 'next/image'

export default function NotFound() {
  return (
    <main className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-primary-600 mb-4">404</h1>
          <h2 className="text-3xl font-bold text-neutral-900 mb-4">Page Not Found</h2>
          <p className="text-neutral-600 mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        
        <div className="space-y-4">
          <Link
            href="/"
            className="inline-block px-8 py-4 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            Go Home
          </Link>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/markets/products"
              className="px-6 py-3 text-primary-600 font-medium border-2 border-primary-600 rounded-xl hover:bg-primary-50 transition-colors"
            >
              Browse Products
            </Link>
            <Link
              href="/markets/sellers"
              className="px-6 py-3 text-primary-600 font-medium border-2 border-primary-600 rounded-xl hover:bg-primary-50 transition-colors"
            >
              View Vendors
            </Link>
            <Link
              href="/markets/market-days"
              className="px-6 py-3 text-primary-600 font-medium border-2 border-primary-600 rounded-xl hover:bg-primary-50 transition-colors"
            >
              Market Days
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}

