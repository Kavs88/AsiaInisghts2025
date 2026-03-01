import Image from 'next/image'
import Link from 'next/link'
import { getPublishedLegends } from '@/lib/supabase/local-legends'
import { BookOpen } from 'lucide-react'

export const revalidate = 3600

export const metadata = {
  title: 'Local Legends | Asia Insights',
  description: 'Long-form stories, interviews, and profiles from our local maker community.',
}

function formatDate(dateString: string | null) {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export default async function StoriesPage() {
  const stories = await getPublishedLegends()

  return (
    <main id="main-content" className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-neutral-900 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-primary-400 font-bold text-sm uppercase tracking-widest mb-4">
            Editorial
          </p>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tighter mb-6 leading-[0.95]">
            Local Legends
          </h1>
          <p className="text-xl text-neutral-300 font-medium max-w-2xl mx-auto leading-relaxed">
            Long-form stories, interviews, and profiles from the makers and businesses
            shaping our community.
          </p>
        </div>
      </section>

      {/* Stories grid */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          {stories.length === 0 ? (
            <div className="text-center py-20">
              <BookOpen className="w-12 h-12 text-neutral-300 mx-auto mb-4" strokeWidth={1} />
              <p className="text-xl font-bold text-neutral-400">No stories published yet.</p>
              <p className="text-neutral-400 mt-2">Check back soon.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {stories.map((story) => (
                <article
                  key={story.id}
                  className="group bg-white rounded-2xl border border-neutral-200/60 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col"
                >
                  <Link
                    href={`/stories/${story.slug}`}
                    className="absolute inset-0 z-10 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                    aria-label={`Read ${story.title}`}
                  />

                  {/* Hero image - 4:3 */}
                  <div className="relative aspect-[4/3] bg-neutral-100 overflow-hidden shrink-0">
                    {story.hero_image_url ? (
                      <Image
                        src={story.hero_image_url}
                        alt={story.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary-50 to-neutral-100 flex items-center justify-center">
                        <BookOpen className="w-12 h-12 text-primary-300" strokeWidth={1} />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />
                  </div>

                  {/* Content */}
                  <div className="p-6 flex flex-col flex-1 relative z-10 pointer-events-none">
                    {story.published_at && (
                      <p className="text-xs font-semibold text-primary-600 uppercase tracking-wider mb-2">
                        {formatDate(story.published_at)}
                      </p>
                    )}
                    <h2 className="text-xl font-bold text-neutral-900 mb-3 line-clamp-2 leading-snug group-hover:text-primary-600 transition-colors">
                      {story.title}
                    </h2>
                    {story.excerpt && (
                      <p className="text-sm text-neutral-600 line-clamp-3 leading-relaxed">
                        {story.excerpt}
                      </p>
                    )}
                    <div className="mt-auto pt-4">
                      <span className="text-sm font-bold text-primary-600 group-hover:underline">
                        Read story →
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
