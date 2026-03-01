export default function MakersLoading() {
  return (
    <main className="min-h-screen bg-neutral-50 animate-pulse">
      {/* Hero */}
      <div className="bg-white border-b border-neutral-100">
        <div className="container-custom py-14 sm:py-20">
          <div className="h-5 w-32 bg-neutral-100 rounded-full mb-5" />
          <div className="h-12 w-72 bg-neutral-200 rounded-xl mb-4" />
          <div className="h-5 w-96 bg-neutral-100 rounded" />
        </div>
      </div>

      {/* Grid */}
      <div className="container-custom py-12">
        <div className="h-4 w-32 bg-neutral-100 rounded mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-neutral-200/60 overflow-hidden">
              <div className="h-16 bg-neutral-50 border-b border-neutral-100" />
              <div className="p-5">
                <div className="h-5 w-32 bg-neutral-200 rounded mb-2" />
                <div className="h-4 w-16 bg-neutral-100 rounded-full mb-3" />
                <div className="h-3 w-full bg-neutral-100 rounded mb-1.5" />
                <div className="h-3 w-3/4 bg-neutral-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
