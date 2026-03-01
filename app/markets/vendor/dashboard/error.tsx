'use client'

export default function VendorDashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        <h2 className="text-xl font-bold text-neutral-900 mb-3">Dashboard error</h2>
        <p className="text-sm text-neutral-500 mb-6">
          Something went wrong loading your dashboard. Your data is safe.
        </p>
        <button
          onClick={reset}
          className="px-6 py-3 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
