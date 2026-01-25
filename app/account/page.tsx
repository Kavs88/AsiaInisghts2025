import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserAuthorityServer } from '@/lib/auth/authority'
import AccountPageClient from './page-client'

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

    return (
        <AccountPageClient
            user={session.user}
            authority={authority}
        />
    )
}
