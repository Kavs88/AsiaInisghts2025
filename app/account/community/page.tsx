import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import Image from 'next/image'

export const metadata = {
    title: 'My Community | Asia Insights',
    description: 'Your personal connection to the community.',
}

export default async function MyCommunityPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login?next=/account/community')
    }

    // Fetch Follows
    const { data: contentFollows } = await supabase
        .from('user_follows')
        .select('*, entities(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    // Fetch Signals (Recommend / Regular)
    const { data: contentSignals } = await supabase
        .from('user_entity_signals')
        .select('*, entities(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    // Fetch Saved Events
    const { data: contentEvents } = await supabase
        .from('user_event_bookmarks')
        .select('*, market_days(*)')
        .eq('user_id', user.id)
        .eq('intent_type', 'saved')
        .order('created_at', { ascending: false })

    // Process Signals
    const recommends = contentSignals?.filter((s: any) => s.signal_type === 'recommend') || []
    const regulars = contentSignals?.filter((s: any) => s.signal_type === 'regular') || []
    const follows = contentFollows || []
    const events = contentEvents || []

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    }

    return (
        <main className="min-h-screen bg-neutral-50 pb-20">
            {/* Header */}
            <section className="bg-white border-b border-neutral-100 sticky top-0 z-30">
                <div className="container-custom py-6">
                    <div className="flex items-center gap-4">
                        <Link href="/account" className="p-2 -ml-2 text-neutral-400 hover:text-neutral-900 transition-colors">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </Link>
                        <h1 className="text-2xl font-bold text-neutral-900">My Community</h1>
                    </div>
                </div>
            </section>

            <div className="container-custom space-y-8 py-8">

                {/* RECOMMENDS */}
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 bg-primary-100 text-primary-600 rounded-lg">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                            </svg>
                        </div>
                        <h2 className="text-lg font-bold text-neutral-900">Places I Recommend</h2>
                    </div>

                    {recommends.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {recommends.map((item: any) => (
                                <Link href={`/makers/${item.entities.slug}`} key={item.entity_id} className="bg-white p-4 rounded-xl border border-neutral-200 hover:border-primary-300 transition-all flex items-center gap-4 group">
                                    <div className="w-12 h-12 bg-neutral-100 rounded-lg overflow-hidden flex-shrink-0">
                                        {/* Placeholder or real image if available in entity (entities table schema was viewed in 017 but assume logo/image availability logic) - Entities table has no logo_url directly shown in 017 migration, but inserted from vendors/businesses which DO have it. Let's assume joining vendors/businesses or check if we store logo in entities? 
                     Wait, 017 migration doesn't explicitly add logo_url to entities. It inserts from vendors/businesses.
                     Actually, looking at 017 migration, schema doesn't show logo_url in entities table definition! 
                     It only shows name, slug, description, etc. 
                     We might need to fetch legacy_vendor/business or assume entities has it (maybe added in another migration?). 
                     If not, we might not have images here easily without extra joins. 
                     I'll just use a placeholder/initials for now to be safe, or just name. */}
                                        <div className="w-full h-full flex items-center justify-center bg-primary-50 text-primary-600 font-bold text-lg">
                                            {item.entities.name.charAt(0)}
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-neutral-900 group-hover:text-primary-700 transition-colors">{item.entities.name}</h3>
                                        <p className="text-xs text-neutral-500">Recommended on {formatDate(item.created_at)}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-neutral-500 text-sm italic py-4">No recommendations yet.</div>
                    )}
                </section>

                {/* REGULARS */}
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 bg-secondary-100 text-secondary-600 rounded-lg">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h2 className="text-lg font-bold text-neutral-900">Places I'm a Regular At</h2>
                    </div>
                    {regulars.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {regulars.map((item: any) => (
                                <Link href={`/makers/${item.entities.slug}`} key={item.entity_id} className="bg-white p-4 rounded-xl border border-neutral-200 hover:border-secondary-300 transition-all flex items-center gap-4 group">
                                    <div className="w-12 h-12 bg-neutral-100 rounded-lg overflow-hidden flex-shrink-0">
                                        <div className="w-full h-full flex items-center justify-center bg-secondary-50 text-secondary-600 font-bold text-lg">
                                            {item.entities.name.charAt(0)}
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-neutral-900 group-hover:text-secondary-700 transition-colors">{item.entities.name}</h3>
                                        <p className="text-xs text-neutral-500">Regular since {formatDate(item.created_at)}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-neutral-500 text-sm italic py-4">No regular places marked yet.</div>
                    )}
                </section>

                {/* FOLLOWS */}
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 bg-neutral-100 text-neutral-600 rounded-lg">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                            </svg>
                        </div>
                        <h2 className="text-lg font-bold text-neutral-900">Places I Follow</h2>
                    </div>
                    {follows.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {follows.map((item: any) => (
                                <Link href={`/makers/${item.entities.slug}`} key={item.entity_id} className="bg-white p-4 rounded-xl border border-neutral-200 hover:border-neutral-300 transition-all flex items-center gap-4 group">
                                    <div className="w-12 h-12 bg-neutral-100 rounded-lg overflow-hidden flex-shrink-0">
                                        <div className="w-full h-full flex items-center justify-center bg-neutral-200 text-neutral-600 font-bold text-lg">
                                            {item.entities.name.charAt(0)}
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-neutral-900 group-hover:text-neutral-700 transition-colors">{item.entities.name}</h3>
                                        <p className="text-xs text-neutral-500">Followed on {formatDate(item.created_at)}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-neutral-500 text-sm italic py-4">Not following any places yet.</div>
                    )}
                </section>

                {/* SAVED EVENTS */}
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 bg-red-100 text-red-600 rounded-lg">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h2 className="text-lg font-bold text-neutral-900">Saved Events</h2>
                    </div>
                    {events.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {events.map((item: any) => (
                                <div key={item.id} className="bg-white p-4 rounded-xl border border-neutral-200 flex items-center gap-4 hover:shadow-sm transition-all">
                                    <div className="w-12 h-12 bg-red-50 text-red-600 rounded-lg flex flex-col items-center justify-center flex-shrink-0">
                                        <span className="text-[10px] font-bold uppercase">{new Date(item.market_days.market_date).toLocaleString('default', { month: 'short' })}</span>
                                        <span className="text-lg font-bold leading-none">{new Date(item.market_days.market_date).getDate()}</span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-neutral-900">{item.market_days.title || 'Market Day'}</h3>
                                        <p className="text-xs text-neutral-500">{item.market_days.location_name}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-neutral-500 text-sm italic py-4">No saved events.</div>
                    )}
                </section>

            </div>
        </main>
    )
}
