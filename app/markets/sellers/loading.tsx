export default function SellersLoading() {
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
        <div className="flex gap-3 mb-8">
          <div className="h-11 flex-1 max-w-sm bg-neutral-100 rounded-xl animate-pulse" />
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-11 w-24 bg-neutral-100 rounded-xl animate-pulse" />
          ))}
        </div>

        {/* Seller card grid skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="rounded-2xl border border-neutral-100 p-5 animate-pulse">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 bg-neutral-200 rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 bg-neutral-200 rounded" />
                  <div className="h-3 w-1/2 bg-neutral-100 rounded" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 w-full bg-neutral-100 rounded" />
                <div className="h-3 w-4/5 bg-neutral-100 rounded" />
              </div>
              <div className="flex gap-2 mt-4">
                <div className="h-6 w-16 bg-neutral-100 rounded-full" />
                <div className="h-6 w-16 bg-neutral-100 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
