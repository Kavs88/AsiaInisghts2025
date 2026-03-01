import Link from 'next/link'
import Image from 'next/image'
import { createPublicClient } from '@/lib/supabase/public'
import { ShieldCheck, MapPin } from 'lucide-react'

export const revalidate = 3600

export const metadata = {
  title: 'Makers & Artisans | Sunday Night Market',
  description: 'Discover verified makers, artisans, and local businesses in our community.',
  openGraph: {
    title: 'Makers & Artisans | Sunday Night Market',
    description: 'Discover verified makers, artisans, and local businesses in our community.',
  },
}

async function getMakers() {
  const supabase = createPublicClient()
  const { data, error } = await supabase
    .from('entities')
    .select('id, name, slug, tags, description, location_text, logo_url, confidence_score, last_verified_at')
    .eq('type', 'business')
    .gt('confidence_score', 80)
    .order('confidence_score', { ascending: false })
    .order('name', { ascending: true })
    .limit(200)

  if (error) {
    console.error('[getMakers]', error.message)
    return []
  }
  return data || []
}

export default async function MakersPage() {
  const makers = await getMakers()

  return (
    <main className="min-h-screen bg-neutral-50">
      {/* Hero */}
      <div className="bg-white border-b border-neutral-100">
        <div className="container-custom py-14 sm:py-20">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-50 border border-primary-100 rounded-full mb-5">
              <ShieldCheck className="w-3.5 h-3.5 text-primary-600" />
              <span className="text-xs font-bold text-primary-700 uppercase tracking-wider">Verified Community</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-neutral-900 mb-4 leading-tight">
              Makers & Artisans
            </h1>
            <p className="text-lg text-neutral-600 leading-relaxed">
              Hand-picked businesses and creators who've earned their place in our community.
              Every listing is verified and trust-scored.
            </p>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="container-custom py-12">
        {makers.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-neutral-500 text-lg">No verified makers found yet.</p>
            <Link href="/businesses" className="mt-4 inline-block text-primary-600 font-semibold hover:underline">
              Browse all businesses →
            </Link>
          </div>
        ) : (
          <>
            <p className="text-sm text-neutral-400 font-medium mb-8">
              {makers.length} verified maker{makers.length !== 1 ? 's' : ''}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {makers.map((maker: any) => {
                const primaryTag = maker.tags?.[0]
                const isVerified = maker.last_verified_at || maker.confidence_score >= 90

                return (
                  <Link
                    key={maker.id}
                    href={`/makers/${maker.slug}`}
                    className="group bg-white rounded-2xl border border-neutral-200/60 shadow-sm hover:shadow-md hover:border-primary-100 transition-all duration-200 overflow-hidden flex flex-col"
                  >
                    {/* Logo / placeholder */}
                    <div className="h-16 bg-neutral-50 border-b border-neutral-100 flex items-center px-5 gap-3">
                      {maker.logo_url ? (
                        <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 border border-neutral-100">
                          <Image
                            src={maker.logo_url}
                            alt={maker.name}
                            width={40}
                            height={40}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-primary-50 flex-shrink-0 flex items-center justify-center border border-primary-100">
                          <span className="text-base font-black text-primary-600 leading-none">
                            {maker.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      {isVerified && (
                        <ShieldCheck className="w-4 h-4 text-primary-500 flex-shrink-0 ml-auto" aria-label="Verified" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-5 flex-1 flex flex-col">
                      <h2 className="font-black text-neutral-900 text-base leading-tight mb-1 group-hover:text-primary-700 transition-colors">
                        {maker.name}
                      </h2>
                      {primaryTag && (
                        <span className="inline-block text-xs font-semibold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full w-fit mb-2 capitalize">
                          {primaryTag}
                        </span>
                      )}
                      {maker.description && (
                        <p className="text-sm text-neutral-500 leading-relaxed line-clamp-2 flex-1">
                          {maker.description}
                        </p>
                      )}
                      {maker.location_text && (
                        <div className="flex items-center gap-1.5 mt-3 text-xs text-neutral-400">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{maker.location_text}</span>
                        </div>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          </>
        )}
      </div>
    </main>
  )
}
