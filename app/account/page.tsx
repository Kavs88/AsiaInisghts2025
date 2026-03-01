import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserAuthorityServer } from '@/lib/auth/authority'
import AccountPageClient from './page-client'
import { getUserEngagements, getUserWatchlist } from '@/lib/actions/engagements'

export const metadata = {
    title: 'My Account - Asia Insights',
    description: 'Manage your profile and platform settings',
}

export default async function AccountPage() {
    const supabase = await createClient()
    if (!supabase) {
        redirect('/auth/login')
    }

    // Get current user session
    const { data: { session } } = await supabase.auth.getSession()

    if (!session?.user) {
        redirect('/auth/login?redirect=/account')
    }

    // Get full user authority (roles, vendor status, etc.)
    const authority = await getUserAuthorityServer()

    // Fetch all account data in parallel
    const userId = session.user.id
    const [
        { count: rsvpCount },
        { count: savedEventsCount },
        { count: savedBusinessesCount },
        { count: savedStaysCount },
        engagements,
        watchlist,
    ] = await Promise.all([
        supabase.from('user_event_rsvps' as any).select('*', { count: 'exact', head: true }).eq('user_id', userId),
        supabase.from('user_event_bookmarks' as any).select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('intent_type', 'saved'),
        supabase.from('user_saved_items' as any).select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('item_type', 'entity'),
        supabase.from('user_saved_items' as any).select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('item_type', 'property'),
        getUserEngagements().catch(() => ({ recommendations: [], regulars: [] })),
        getUserWatchlist().catch(() => []),
    ])

    const consumerSummary = {
        rsvpCount: rsvpCount ?? 0,
        savedEventsCount: savedEventsCount ?? 0,
        savedBusinessesCount: savedBusinessesCount ?? 0,
        savedStaysCount: savedStaysCount ?? 0,
    }

    return (
        <AccountPageClient
            user={session.user}
            authority={authority}
            consumerSummary={consumerSummary}
            recommendations={engagements.recommendations}
            regulars={engagements.regulars}
            watchlist={watchlist}
        />
    )
}
