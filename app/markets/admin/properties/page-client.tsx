import Link from 'next/link'

interface Property {
  id: string
  address: string
  type: string
  availability: string
  price: number
  bedrooms: number | null
  bathrooms: number | null
  square_meters: number | null
  created_at: string
}

interface Props {
  properties: Property[]
  page: number
  totalPages: number
  total: number
  error: string | null
}

const AVAILABILITY_STYLES: Record<string, string> = {
  available: 'bg-green-100 text-green-700',
  rented:    'bg-amber-100 text-amber-700',
  sold:      'bg-neutral-100 text-neutral-600',
}

export default function AdminPropertiesPageClient({ properties, page, totalPages, total, error }: Props) {
  return (
    <main className="min-h-screen bg-neutral-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-neutral-900">Property Directory</h1>
            <p className="text-neutral-600">Curate venue and property listings</p>
          </div>
          <Link
            href="/markets/admin/properties/create"
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
          >
            + Add Property
          </Link>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-red-700 text-sm font-medium">Failed to load properties.</p>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-200">
            <p className="text-sm text-neutral-500">{total} propert{total !== 1 ? 'ies' : 'y'}</p>
          </div>
          <table className="w-full text-left">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-6 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Address</th>
                <th className="px-6 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Specs</th>
                <th className="px-6 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {properties.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-neutral-500">
                    No properties found.
                  </td>
                </tr>
              ) : (
                properties.map((property) => (
                  <tr key={property.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-neutral-900">{property.address}</td>
                    <td className="px-6 py-4 text-sm text-neutral-600 capitalize">{property.type}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-primary-600">
                      ${property.price.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-600">
                      {[
                        property.bedrooms != null && `${property.bedrooms}bd`,
                        property.bathrooms != null && `${property.bathrooms}ba`,
                        property.square_meters != null && `${property.square_meters}m²`,
                      ].filter(Boolean).join(' · ') || '—'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${AVAILABILITY_STYLES[property.availability] ?? 'bg-red-100 text-red-700'}`}>
                        {property.availability}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/markets/admin/properties/${property.id}/edit`}
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
