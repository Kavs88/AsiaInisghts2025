import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getLegendBySlug } from '@/lib/supabase/local-legends'
import { ArrowLeft } from 'lucide-react'

export const revalidate = 3600

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const story = await getLegendBySlug(params.slug)
  if (!story) return { title: 'Story Not Found | Asia Insights' }
  return {
    title: `${story.title} | Local Legends`,
    description: story.excerpt ?? undefined,
    openGraph: story.hero_image_url
      ? { images: [{ url: story.hero_image_url }] }
      : undefined,
  }
}

function formatDate(dateString: string | null) {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export default async function StoryDetailPage({ params }: { params: { slug: string } }) {
  const story = await getLegendBySlug(params.slug)
  if (!story) notFound()

  const vendor = story.vendors ?? null

  return (
    <main id="main-content" className="min-h-screen bg-white">
      {/* Back link */}
      <div className="max-w-4xl mx-auto px-4 pt-8">
        <Link
          href="/stories"
          className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-500 hover:text-primary-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-lg"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={2} />
          Local Legends
        </Link>
      </div>

      {/* Hero image */}
      {story.hero_image_url && (
        <div className="relative w-full mt-6" style={{ aspectRatio: '21/9', maxHeight: '560px' }}>
          <Image
            src={story.hero_image_url}
            alt={story.title}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </div>
      )}

      {/* Article */}
      <article className="max-w-3xl mx-auto px-4 py-12">
        {/* Meta */}
        <div className="mb-8">
          <p className="text-xs font-bold text-primary-600 uppercase tracking-widest mb-4">
            Local Legends
          </p>
          <h1 className="text-4xl sm:text-5xl font-black text-neutral-900 leading-[1.05] tracking-tight mb-4">
            {story.title}
          </h1>
          {story.published_at && (
            <p className="text-sm font-medium text-neutral-500">
              {formatDate(story.published_at)}
            </p>
          )}

          {/* Related vendor link */}
          {vendor && (
            <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-primary-50 border border-primary-100 rounded-full">
              <span className="text-xs font-semibold text-primary-700 uppercase tracking-wide">
                Featured:
              </span>
              <Link
                href={`/makers/${vendor.slug}`}
                className="text-sm font-bold text-primary-700 hover:text-primary-900 hover:underline transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 rounded"
              >
                {vendor.name}
              </Link>
            </div>
          )}
        </div>

        {/* Excerpt */}
        {story.excerpt && (
          <p className="text-xl text-neutral-700 font-medium leading-relaxed mb-10 border-l-4 border-primary-400 pl-5">
            {story.excerpt}
          </p>
        )}

        {/* Audio player */}
        {story.audio_url && (
          <div className="mb-10 p-4 bg-neutral-50 rounded-2xl border border-neutral-200">
            <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3">
              Listen
            </p>
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <audio controls className="w-full" src={story.audio_url}>
              Your browser does not support the audio element.
            </audio>
          </div>
        )}

        {/* Video player */}
        {story.video_url && (
          <div className="mb-10 rounded-2xl overflow-hidden border border-neutral-200 bg-black">
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <video controls className="w-full max-h-[480px]" src={story.video_url}>
              Your browser does not support the video element.
            </video>
          </div>
        )}

        {/* Body */}
        {story.body && (
          <div className="prose-body">
            {story.body.split('\n\n').map((paragraph, i) => (
              <p
                key={i}
                className="text-lg text-neutral-800 leading-relaxed mb-6 font-normal"
              >
                {paragraph}
              </p>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-neutral-100">
          <Link
            href="/stories"
            className="inline-flex items-center gap-2 text-sm font-bold text-primary-600 hover:text-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-lg"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={2} />
            Back to Local Legends
          </Link>
        </div>
      </article>
    </main>
  )
}
