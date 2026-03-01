export default function ProductsLoading() {
  return (
    <main className="container-custom py-10 animate-pulse">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <div className="h-8 w-56 bg-neutral-200 rounded-xl mb-2" />
          <div className="h-4 w-40 bg-neutral-100 rounded-lg" />
        </div>
        <div className="h-12 w-36 bg-neutral-200 rounded-2xl" />
      </div>

      {/* Table skeleton */}
      <div className="bg-white rounded-2xl shadow-soft border border-neutral-100 overflow-hidden">
        <div className="bg-neutral-50/50 border-b border-neutral-100 px-6 py-4 flex gap-8">
          {['Product', 'Status', 'Price', 'Stock', 'Actions'].map((h) => (
            <div key={h} className="h-3 w-16 bg-neutral-200 rounded" />
          ))}
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="px-6 py-4 border-b border-neutral-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-neutral-100 rounded-xl flex-shrink-0" />
            <div className="flex-1">
              <div className="h-4 w-40 bg-neutral-200 rounded mb-1" />
              <div className="h-3 w-24 bg-neutral-100 rounded" />
            </div>
            <div className="h-6 w-16 bg-neutral-100 rounded-full ml-auto" />
            <div className="h-4 w-12 bg-neutral-100 rounded" />
            <div className="h-4 w-12 bg-neutral-100 rounded" />
            <div className="h-4 w-10 bg-neutral-100 rounded" />
          </div>
        ))}
      </div>
    </main>
  )
}
