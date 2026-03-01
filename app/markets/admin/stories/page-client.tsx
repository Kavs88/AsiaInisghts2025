'use client'

import Link from 'next/link'
import { type LocalLegend } from '@/lib/supabase/local-legends'

interface Props {
  stories: LocalLegend[]
  page: number
  totalPages: number
  total: number
}

function formatDate(dateString: string | null) {
  if (!dateString) return '—'
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function AdminStoriesPageClient({ stories, page, totalPages, total }: Props) {
  return (
    <main className="min-h-screen bg-neutral-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-neutral-900">Local Legends</h1>
            <p className="text-sm text-neutral-500 mt-1">{total} {total === 1 ? 'story' : 'stories'} total</p>
          </div>
          <Link
            href="/markets/admin/stories/create"
            className="px-5 py-2.5 bg-primary-600 text-white text-sm font-bold rounded-xl hover:bg-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            + New Story
          </Link>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Slug</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Published</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {stories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-neutral-400 text-sm">
                    No stories yet.{' '}
                    <Link href="/markets/admin/stories/create" className="text-primary-600 font-semibold hover:underline">
                      Create the first one.
                    </Link>
                  </td>
                </tr>
              ) : (
                stories.map((story) => (
                  <tr key={story.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-neutral-900 line-clamp-1">
                        {story.title}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-mono text-neutral-500">{story.slug}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        story.status === 'published'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-neutral-100 text-neutral-600'
                      }`}>
                        {story.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-neutral-500">{formatDate(story.published_at)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/markets/admin/stories/${story.id}/edit`}
                          className="text-sm font-semibold text-primary-600 hover:text-primary-700 hover:underline"
                        >
                          Edit
                        </Link>
                        {story.status === 'published' && (
                          <Link
                            href={`/stories/${story.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-semibold text-neutral-500 hover:text-neutral-700 hover:underline"
                          >
                            View ↗
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-neutral-500">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              {page > 1 && (
                <Link
                  href={`?page=${page - 1}`}
                  className="px-4 py-2 text-sm font-semibold bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
                >
                  Previous
                </Link>
              )}
              {page < totalPages && (
                <Link
                  href={`?page=${page + 1}`}
                  className="px-4 py-2 text-sm font-semibold bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
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
