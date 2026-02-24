export default function BusinessesLoading() {
  return (
    <main className="min-h-screen bg-white">
      {/* Header skeleton */}
      <div className="bg-neutral-900 py-12">
        <div className="container-custom">
          <div className="h-9 w-48 bg-neutral-700 rounded-lg animate-pulse mb-3" />
          <div className="h-5 w-72 bg-neutral-700 rounded animate-pulse" />
        </div>
      </div>

      <div className="container-custom py-12">
        {/* Filter bar skeleton */}
        <div className="flex gap-3 mb-8 flex-wrap">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-9 w-24 bg-neutral-100 rounded-full animate-pulse" />
          ))}
        </div>

        {/* Card grid skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="rounded-2xl border border-neutral-100 overflow-hidden animate-pulse">
              <div className="aspect-video bg-neutral-200" />
              <div className="p-5 space-y-3">
                <div className="h-5 w-3/4 bg-neutral-200 rounded" />
                <div className="h-4 w-full bg-neutral-100 rounded" />
                <div className="h-4 w-2/3 bg-neutral-100 rounded" />
                <div className="h-8 w-28 bg-neutral-200 rounded-full mt-2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
