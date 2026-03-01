export default function OrdersLoading() {
  return (
    <main className="min-h-screen bg-neutral-50 animate-pulse">
      <div className="container-custom py-10">
        {/* Back + header */}
        <div className="mb-8">
          <div className="h-4 w-32 bg-neutral-200 rounded mb-4" />
          <div className="h-8 w-48 bg-neutral-200 rounded-xl mb-2" />
          <div className="h-4 w-64 bg-neutral-100 rounded" />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-neutral-200/60 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-neutral-100 flex-shrink-0" />
              <div>
                <div className="h-3 w-24 bg-neutral-100 rounded mb-2" />
                <div className="h-6 w-12 bg-neutral-200 rounded" />
              </div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-soft border border-neutral-100 overflow-hidden">
          <div className="bg-neutral-50/50 border-b border-neutral-100 px-5 py-4 flex gap-8">
            {['Order', 'Customer', 'Item', 'Status', 'Total', 'Date'].map((h) => (
              <div key={h} className="h-3 w-14 bg-neutral-200 rounded" />
            ))}
          </div>
          {[...Array(6)].map((_, i) => (
            <div key={i} className="px-5 py-4 border-b border-neutral-100 flex items-center gap-4">
              <div className="h-4 w-24 bg-neutral-200 rounded font-mono" />
              <div className="flex-1">
                <div className="h-4 w-32 bg-neutral-200 rounded mb-1" />
                <div className="h-3 w-40 bg-neutral-100 rounded" />
              </div>
              <div className="h-4 w-28 bg-neutral-100 rounded" />
              <div className="h-6 w-20 bg-neutral-100 rounded-full" />
              <div className="h-4 w-14 bg-neutral-100 rounded" />
              <div className="h-3 w-20 bg-neutral-100 rounded ml-auto" />
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
