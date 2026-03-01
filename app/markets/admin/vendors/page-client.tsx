import Link from 'next/link'
import Image from 'next/image'

interface Vendor {
  id: string
  name: string
  slug: string
  tagline: string | null
  logo_url: string | null
  contact_email: string | null
  contact_phone: string | null
  is_active: boolean
  is_verified: boolean
  created_at: string
}

interface Props {
  vendors: Vendor[]
  page: number
  totalPages: number
  total: number
  error: string | null
}

export default function AdminVendorsPageClient({ vendors, page, totalPages, total, error }: Props) {
  return (
    <main className="min-h-screen bg-neutral-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-neutral-900">Vendor Stewardship</h1>
            <p className="text-neutral-600">Welcome, support, and guide vendor relationships</p>
          </div>
          <Link
            href="/markets/admin/vendors/create"
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
          >
            + Create Vendor
          </Link>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-red-700 text-sm font-medium">Failed to load vendors.</p>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-200">
            <p className="text-sm text-neutral-500">{total} vendor{total !== 1 ? 's' : ''}</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-6 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Vendor</th>
                  <th className="px-6 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {vendors.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-neutral-500">
                      No vendors found.
                    </td>
                  </tr>
                ) : (
                  vendors.map((vendor) => (
                    <tr key={vendor.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {vendor.logo_url ? (
                            <Image
                              src={vendor.logo_url}
                              alt={vendor.name}
                              width={40}
                              height={40}
                              className="rounded-lg object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-neutral-100 flex-shrink-0" />
                          )}
                          <div>
                            <div className="font-semibold text-neutral-900">{vendor.name}</div>
                            {vendor.tagline && (
                              <div className="text-xs text-neutral-500">{vendor.tagline}</div>
                            )}
                            <div className="text-xs text-neutral-400">/{vendor.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-600">
                        {vendor.contact_email && <div>{vendor.contact_email}</div>}
                        {vendor.contact_phone && <div>{vendor.contact_phone}</div>}
                        {!vendor.contact_email && !vendor.contact_phone && '—'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className={`inline-flex w-fit px-2 py-0.5 rounded text-xs font-semibold ${vendor.is_active ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-600'}`}>
                            {vendor.is_active ? 'Active' : 'Inactive'}
                          </span>
                          {vendor.is_verified && (
                            <span className="inline-flex w-fit px-2 py-0.5 rounded text-xs font-semibold bg-primary-50 text-primary-700">
                              Verified
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-600">
                        {new Date(vendor.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/vendors/${vendor.slug}`}
                            target="_blank"
                            className="text-xs font-medium text-primary-600 hover:text-primary-700"
                          >
                            View
                          </Link>
                          <Link
                            href={`/markets/admin/vendors/${vendor.id}/edit`}
                            className="text-xs font-medium text-neutral-600 hover:text-neutral-900"
                          >
                            Edit
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
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
