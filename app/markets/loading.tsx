export default function MarketsLoading() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero skeleton */}
      <div className="bg-neutral-900 py-16">
        <div className="container-custom text-center space-y-4">
          <div className="h-10 w-64 bg-neutral-700 rounded-lg animate-pulse mx-auto" />
          <div className="h-5 w-96 bg-neutral-700 rounded animate-pulse mx-auto" />
        </div>
      </div>

      <div className="container-custom py-12 space-y-12">
        {/* Nav pill skeleton */}
        <div className="flex gap-3 justify-center">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-10 w-32 bg-neutral-100 rounded-full animate-pulse" />
          ))}
        </div>

        {/* Card grid skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-2xl border border-neutral-100 overflow-hidden animate-pulse">
              <div className="aspect-video bg-neutral-200" />
              <div className="p-5 space-y-3">
                <div className="h-5 w-3/4 bg-neutral-200 rounded" />
                <div className="h-4 w-full bg-neutral-100 rounded" />
                <div className="h-4 w-1/2 bg-neutral-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
