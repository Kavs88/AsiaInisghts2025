'use client'

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <main className="min-h-screen bg-neutral-50">
      <div className="container-custom py-8">
        <div className="bg-error-50 border border-error-200 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-error-900 mb-4">Platform Overview Error</h2>
          <p className="text-error-800 mb-6">{error.message}</p>
          <button
            onClick={reset}
            className="px-6 py-3 bg-error-600 text-white font-medium rounded-xl hover:bg-error-700 transition-colors"
          >
            Try again
          </button>
        </div>
      </div>
    </main>
  )
}




