export default function AdminLoading() {
  return (
    <main className="min-h-screen bg-neutral-50">
      <div className="container-custom py-8">
        <div className="mb-8">
          <div className="h-10 bg-neutral-200 rounded-xl w-64 mb-2 animate-pulse" />
          <div className="h-6 bg-neutral-200 rounded-lg w-96 animate-pulse" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-2xl shadow-soft p-6">
              <div className="h-6 bg-neutral-200 rounded w-32 mb-4 animate-pulse" />
              <div className="h-10 bg-neutral-200 rounded w-20 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}




