import Link from 'next/link'
import Image from 'next/image'

interface Host {
  name: string
  logo_url: string | null
}

interface MarketDay {
  id: string
  market_date: string
  location_name: string
  location_address: string | null
  start_time: string | null
  end_time: string | null
  is_published: boolean
  hosts: Host | null
}

interface Props {
  marketDays: MarketDay[]
  page: number
  totalPages: number
  total: number
  error: string | null
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatTime(timeString: string | null) {
  if (!timeString) return 'TBD'
  const [hours, minutes] = timeString.split(':')
  const hour = parseInt(hours)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  return `${hour % 12 || 12}:${minutes} ${ampm}`
}

export default function AdminMarketDaysPageClient({ marketDays, page, totalPages, total, error }: Props) {
  return (
    <main className="min-h-screen bg-neutral-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-neutral-900">Market Day Planning</h1>
            <p className="text-neutral-600">Plan and coordinate market gatherings</p>
          </div>
          <Link
            href="/markets/admin/market-days/create"
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
          >
            + Create Market Day
          </Link>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-red-700 text-sm font-medium">Failed to load market days.</p>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-200">
            <p className="text-sm text-neutral-500">{total} market day{total !== 1 ? 's' : ''}</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-6 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Time</th>
                  <th className="px-6 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Venue</th>
                  <th className="px-6 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {marketDays.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-neutral-500">
                      No market days found.
                    </td>
                  </tr>
                ) : (
                  marketDays.map((day) => (
                    <tr key={day.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-neutral-900">{formatDate(day.market_date)}</div>
                        <div className="text-xs text-neutral-400 mt-0.5">
                          {new Date(day.market_date) < new Date() ? 'Past' : 'Upcoming'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-neutral-900">{day.location_name}</div>
                        {day.location_address && (
                          <div className="text-sm text-neutral-500">{day.location_address}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-600">
                        {formatTime(day.start_time)} – {formatTime(day.end_time)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${day.is_published ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-600'}`}>
                          {day.is_published ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {day.hosts?.logo_url ? (
                          <Image
                            src={day.hosts.logo_url}
                            alt={day.hosts.name}
                            width={40}
                            height={40}
                            className="rounded-lg object-contain"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-neutral-100" />
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/markets/admin/market-days/${day.id}/edit`}
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
