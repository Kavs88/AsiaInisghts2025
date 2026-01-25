import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <h2 className="text-4xl md:text-5xl font-black text-neutral-900 mb-6 tracking-tight">
        Page Not Found
      </h2>
      <p className="text-lg text-neutral-600 max-w-md mb-10 leading-relaxed">
        We couldn't find the page you're looking for. It might have been moved or doesn't exist.
      </p>

      <Link
        href="/"
        className="btn-primary mb-16 inline-flex items-center justify-center shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
      >
        Return Home
      </Link>

      <div className="border-t border-neutral-100 pt-10 w-full max-w-lg">
        <p className="text-xs font-bold text-neutral-400 mb-6 uppercase tracking-widest">
          Explore our Community
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/markets"
            className="px-6 py-2.5 bg-white border border-neutral-200 rounded-xl text-neutral-600 font-medium hover:border-primary-500 hover:text-primary-600 transition-colors shadow-sm"
          >
            Markets
          </Link>
          <Link
            href="/businesses"
            className="px-6 py-2.5 bg-white border border-neutral-200 rounded-xl text-neutral-600 font-medium hover:border-primary-500 hover:text-primary-600 transition-colors shadow-sm"
          >
            Businesses
          </Link>
          <Link
            href="/properties"
            className="px-6 py-2.5 bg-white border border-neutral-200 rounded-xl text-neutral-600 font-medium hover:border-primary-500 hover:text-primary-600 transition-colors shadow-sm"
          >
            Properties
          </Link>
        </div>
      </div>
    </div>
  )
}
