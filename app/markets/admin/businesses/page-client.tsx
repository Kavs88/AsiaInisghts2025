import Link from 'next/link'

interface Business {
  id: string
  name: string
  slug: string
  description: string | null
  location_text: string | null
  logo_url: string | null
  tags: string[] | null
  created_at: string
}

interface Props {
  businesses: Business[]
  page: number
  totalPages: number
  total: number
  error: string | null
}

export default function AdminBusinessesPageClient({ businesses, page, totalPages, total, error }: Props) {
  return (
    <main className="min-h-screen bg-neutral-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-neutral-900">Business Directory</h1>
            <p className="text-neutral-600">Curate and celebrate local businesses</p>
          </div>
          <Link
            href="/markets/admin/businesses/create"
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
          >
            + Add Business
          </Link>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-red-700 text-sm font-medium">Failed to load businesses.</p>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-200">
            <p className="text-sm text-neutral-500">{total} business{total !== 1 ? 'es' : ''}</p>
          </div>
          <table className="w-full text-left">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-6 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Tags</th>
                <th className="px-6 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {businesses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-neutral-500">
                    No businesses found.
                  </td>
                </tr>
              ) : (
                businesses.map((business) => (
                  <tr key={business.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-neutral-900">{business.name}</div>
                      {business.description && (
                        <div className="text-xs text-neutral-500 mt-0.5 max-w-xs truncate">{business.description}</div>
                      )}
                      <div className="text-xs text-neutral-400">/{business.slug}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-600">
                      {business.location_text ?? '—'}
                    </td>
                    <td className="px-6 py-4">
                      {business.tags && business.tags.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {business.tags.slice(0, 3).map((tag) => (
                            <span key={tag} className="px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded text-xs">
                              {tag}
                            </span>
                          ))}
                          {business.tags.length > 3 && (
                            <span className="text-xs text-neutral-400">+{business.tags.length - 3}</span>
                          )}
                        </div>
                      ) : '—'}
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-600">
                      {new Date(business.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/markets/admin/businesses/${business.id}/edit`}
                        className="text-sm font-semibold text-primary-600 hover:text-primary-700"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-neutral-500">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              {page > 1 && (
                <Link
                  href={`?page=${page - 1}`}
                  className="px-4 py-2 bg-white border border-neutral-200 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
                >
                  Previous
                </Link>
              )}
              {page < totalPages && (
                <Link
                  href={`?page=${page + 1}`}
                  className="px-4 py-2 bg-white border border-neutral-200 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
                >
                  Next
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
