'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { type LocalLegend } from '@/lib/supabase/local-legends'

interface Vendor {
  id: string
  name: string
}

interface Props {
  story: LocalLegend
  vendors: Vendor[]
}

export default function EditStoryPageClient({ story, vendors }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const [form, setForm] = useState({
    slug: story.slug,
    title: story.title,
    excerpt: story.excerpt ?? '',
    body: story.body ?? '',
    hero_image_url: story.hero_image_url ?? '',
    audio_url: story.audio_url ?? '',
    video_url: story.video_url ?? '',
    related_vendor_id: story.related_vendor_id ?? '',
    status: story.status,
    published_at: story.published_at
      ? story.published_at.slice(0, 16) // truncate to datetime-local format
      : '',
  })

  function set(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!form.slug.trim() || !form.title.trim()) {
      setError('Slug and title are required.')
      return
    }

    setLoading(true)
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()

      const payload: Record<string, any> = {
        slug: form.slug.trim(),
        title: form.title.trim(),
        excerpt: form.excerpt.trim() || null,
        body: form.body.trim() || null,
        hero_image_url: form.hero_image_url.trim() || null,
        audio_url: form.audio_url.trim() || null,
        video_url: form.video_url.trim() || null,
        related_vendor_id: form.related_vendor_id || null,
        status: form.status,
        published_at:
          form.status === 'published'
            ? form.published_at || new Date().toISOString()
            : null,
      }

      const { error: updateError } = await (supabase as any)
        .from('local_legends')
        .update(payload)
        .eq('id', story.id)

      if (updateError) {
        setError(updateError.message)
        return
      }

      router.push('/markets/admin/stories')
    } catch (err: any) {
      setError(err.message || 'Unexpected error.')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    setError(null)
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()

      const { error: deleteError } = await (supabase as any)
        .from('local_legends')
        .delete()
        .eq('id', story.id)

      if (deleteError) {
        setError(deleteError.message)
        return
      }

      router.push('/markets/admin/stories')
    } catch (err: any) {
      setError(err.message || 'Unexpected error.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <main className="min-h-screen bg-neutral-50 p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/markets/admin/stories"
              className="text-sm font-semibold text-neutral-500 hover:text-neutral-700"
            >
              ← Stories
            </Link>
            <h1 className="text-2xl font-black text-neutral-900">Edit Story</h1>
          </div>
          {story.status === 'published' && (
            <Link
              href={`/stories/${story.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-neutral-500 hover:text-neutral-700 hover:underline"
            >
              View live ↗
            </Link>
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Core fields */}
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-8 space-y-6">
            <h2 className="text-base font-bold text-neutral-800">Story Details</h2>

            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
                className="w-full px-4 py-2.5 border border-neutral-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
                Slug <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.slug}
                onChange={(e) => set('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                className="w-full px-4 py-2.5 border border-neutral-300 rounded-xl text-sm font-mono focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              />
              <p className="mt-1 text-xs text-neutral-400">
                URL: /stories/{form.slug}
                {story.slug !== form.slug && (
                  <span className="ml-2 text-amber-600 font-semibold">
                    ⚠ Changing slug breaks existing links
                  </span>
                )}
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Excerpt</label>
              <textarea
                rows={3}
                value={form.excerpt}
                onChange={(e) => set('excerpt', e.target.value)}
                className="w-full px-4 py-2.5 border border-neutral-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Body</label>
              <textarea
                rows={20}
                value={form.body}
                onChange={(e) => set('body', e.target.value)}
                placeholder="Separate paragraphs with a blank line."
                className="w-full px-4 py-2.5 border border-neutral-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              />
            </div>
          </div>

          {/* Media */}
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-8 space-y-6">
            <h2 className="text-base font-bold text-neutral-800">Media</h2>

            {['hero_image_url', 'audio_url', 'video_url'].map((field) => (
              <div key={field}>
                <label className="block text-sm font-semibold text-neutral-700 mb-1.5 capitalize">
                  {field.replace('_url', '').replace(/_/g, ' ')} URL
                </label>
                <input
                  type="url"
                  value={form[field as keyof typeof form]}
                  onChange={(e) => set(field as keyof typeof form, e.target.value)}
                  className="w-full px-4 py-2.5 border border-neutral-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                />
              </div>
            ))}
          </div>

          {/* Publishing */}
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-8 space-y-6">
            <h2 className="text-base font-bold text-neutral-800">Publishing</h2>

            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Featured Vendor</label>
              <select
                value={form.related_vendor_id}
                onChange={(e) => set('related_vendor_id', e.target.value)}
                className="w-full px-4 py-2.5 border border-neutral-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none bg-white"
              >
                <option value="">No vendor (optional)</option>
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Status</label>
              <select
                value={form.status}
                onChange={(e) => set('status', e.target.value as 'draft' | 'published')}
                className="w-full px-4 py-2.5 border border-neutral-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none bg-white"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>

            {form.status === 'published' && (
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
                  Publish Date
                </label>
                <input
                  type="datetime-local"
                  value={form.published_at}
                  onChange={(e) => set('published_at', e.target.value)}
                  className="w-full px-4 py-2.5 border border-neutral-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-primary-600 text-white text-sm font-bold rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                {loading ? 'Saving…' : 'Save Changes'}
              </button>
              <Link
                href="/markets/admin/stories"
                className="px-8 py-3 bg-neutral-100 text-neutral-700 text-sm font-bold rounded-xl hover:bg-neutral-200 transition-colors"
              >
                Cancel
              </Link>
            </div>

            {/* Delete */}
            {confirmDelete ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-red-600 font-semibold">Delete this story?</span>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="px-4 py-2 bg-red-600 text-white text-sm font-bold rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {deleting ? 'Deleting…' : 'Confirm'}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="px-4 py-2 bg-neutral-100 text-neutral-600 text-sm font-bold rounded-xl hover:bg-neutral-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="text-sm font-semibold text-red-500 hover:text-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 rounded"
              >
                Delete story
              </button>
            )}
          </div>
        </form>
      </div>
    </main>
  )
}
