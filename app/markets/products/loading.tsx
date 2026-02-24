export default function ProductsLoading() {
  return (
    <main className="min-h-screen bg-white">
      {/* Header skeleton */}
      <div className="bg-neutral-900 py-12">
        <div className="container-custom">
          <div className="h-9 w-40 bg-neutral-700 rounded-lg animate-pulse mb-3" />
          <div className="h-5 w-64 bg-neutral-700 rounded animate-pulse" />
        </div>
      </div>

      <div className="container-custom py-12">
        {/* Search + filter skeleton */}
        <div className="flex gap-3 mb-8 flex-wrap">
          <div className="h-11 flex-1 max-w-sm bg-neutral-100 rounded-xl animate-pulse" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-11 w-24 bg-neutral-100 rounded-full animate-pulse" />
          ))}
        </div>

        {/* Product card grid skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6">
          {[...Array(15)].map((_, i) => (
            <div key={i} className="rounded-2xl border border-neutral-100 overflow-hidden animate-pulse">
              <div className="aspect-square bg-neutral-200" />
              <div className="p-4 space-y-2">
                <div className="h-4 w-3/4 bg-neutral-200 rounded" />
                <div className="h-3 w-1/2 bg-neutral-100 rounded" />
                <div className="h-5 w-20 bg-neutral-200 rounded mt-1" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
