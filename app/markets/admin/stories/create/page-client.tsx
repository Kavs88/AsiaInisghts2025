'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Vendor {
  id: string
  name: string
}

interface Props {
  vendors: Vendor[]
}

const EMPTY_FORM = {
  slug: '',
  title: '',
  excerpt: '',
  body: '',
  hero_image_url: '',
  audio_url: '',
  video_url: '',
  related_vendor_id: '',
  status: 'draft' as 'draft' | 'published',
  published_at: '',
}

export default function CreateStoryPageClient({ vendors }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)

  function set(field: keyof typeof EMPTY_FORM, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function autoSlug(title: string) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .slice(0, 80)
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

      const { error: insertError } = await (supabase as any)
        .from('local_legends')
        .insert(payload)

      if (insertError) {
        setError(insertError.message)
        return
      }

      router.push('/markets/admin/stories')
    } catch (err: any) {
      setError(err.message || 'Unexpected error.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-neutral-50 p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/markets/admin/stories"
            className="text-sm font-semibold text-neutral-500 hover:text-neutral-700"
          >
            ← Stories
          </Link>
          <h1 className="text-2xl font-black text-neutral-900">New Story</h1>
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
                onChange={(e) => {
                  set('title', e.target.value)
                  if (!form.slug) set('slug', autoSlug(e.target.value))
                }}
                placeholder="An Inspiring Headline"
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
                placeholder="an-inspiring-headline"
                className="w-full px-4 py-2.5 border border-neutral-300 rounded-xl text-sm font-mono focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              />
              <p className="mt-1 text-xs text-neutral-400">URL: /stories/{form.slug || 'your-slug'}</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Excerpt</label>
              <textarea
                rows={3}
                value={form.excerpt}
                onChange={(e) => set('excerpt', e.target.value)}
                placeholder="A short summary shown on the listing page."
                className="w-full px-4 py-2.5 border border-neutral-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Body</label>
              <textarea
                rows={20}
                value={form.body}
                onChange={(e) => set('body', e.target.value)}
                placeholder="Full story content. Separate paragraphs with a blank line."
                className="w-full px-4 py-2.5 border border-neutral-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              />
            </div>
          </div>

          {/* Media */}
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-8 space-y-6">
            <h2 className="text-base font-bold text-neutral-800">Media</h2>
            <p className="text-xs text-neutral-400 -mt-4">
              Upload files to <code className="font-mono">stories/{'{slug}'}/</code> in Supabase Storage, then paste the public URL below.
            </p>

            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Hero Image URL</label>
              <input
                type="url"
                value={form.hero_image_url}
                onChange={(e) => set('hero_image_url', e.target.value)}
                placeholder="https://…/stories/slug/hero.jpg"
                className="w-full px-4 py-2.5 border border-neutral-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Audio URL</label>
              <input
                type="url"
                value={form.audio_url}
                onChange={(e) => set('audio_url', e.target.value)}
                placeholder="https://…/stories/slug/audio.mp3"
                className="w-full px-4 py-2.5 border border-neutral-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Video URL</label>
              <input
                type="url"
                value={form.video_url}
                onChange={(e) => set('video_url', e.target.value)}
                placeholder="https://…/stories/slug/video.mp4"
                className="w-full px-4 py-2.5 border border-neutral-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              />
            </div>
          </div>

          {/* Relations + Publishing */}
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-8 space-y-6">
            <h2 className="text-base font-bold text-neutral-800">Publishing</h2>

            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
                Featured Vendor
              </label>
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
                  Publish Date <span className="text-neutral-400 font-normal">(defaults to now)</span>
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
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-primary-600 text-white text-sm font-bold rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              {loading ? 'Creating…' : 'Create Story'}
            </button>
            <Link
              href="/markets/admin/stories"
              className="px-8 py-3 bg-neutral-100 text-neutral-700 text-sm font-bold rounded-xl hover:bg-neutral-200 transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </main>
  )
}
