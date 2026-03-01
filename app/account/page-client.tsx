'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'

import {
    ShieldCheck,
    LayoutDashboard,
    Calendar,
    Building2,
    Users,
    ShoppingBag,
    Settings,
    LogOut,
    Store,
    Bookmark,
    Home,
    Star,
    Coffee,
    Eye,
} from 'lucide-react'
import { User } from '@supabase/supabase-js'
import { UserAuthority } from '@/lib/auth/authority'
import { useAuth } from '@/components/contexts/AuthContext'
import EmptyState from '@/components/ui/EmptyState'
import PropertyCard from '@/components/ui/PropertyCard'

interface ConsumerSummary {
    rsvpCount: number
    savedEventsCount: number
    savedBusinessesCount: number
    savedStaysCount: number
}

interface AccountPageClientProps {
    user: User
    authority: UserAuthority
    consumerSummary?: ConsumerSummary
    recommendations?: any[]
    regulars?: any[]
    watchlist?: any[]
}

export default function AccountPageClient({ user, authority, consumerSummary, recommendations = [], regulars = [], watchlist = [] }: AccountPageClientProps) {
    const { signOut } = useAuth()

    // Map System Role to Human-Readable Title
    const roleTitle = useMemo(() => {
        if (authority.isSuperUser) return 'Platform Owner'
        if (authority.isAdmin) return 'Platform Administrator'
        if (authority.effectiveRole === 'vendor') return 'Market Vendor'
        return 'Community Member'
    }, [authority])

    // Get Name from metadata or fallback
    const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Member'
    const joinDate = new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })

    const summary = consumerSummary ?? { rsvpCount: 0, savedEventsCount: 0, savedBusinessesCount: 0, savedStaysCount: 0 }
    const totalSaved = summary.savedEventsCount + summary.savedBusinessesCount + summary.savedStaysCount

    return (
        <main className="min-h-screen bg-neutral-50">
            <div className="container-custom max-w-5xl py-12">

                {/* 1. Identity Section - "Who I Am" */}
                {/* Visual hierarchies: calm, open, whitespace-heavy */}
                <section className="mb-10">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
                        {/* Large Avatar */}
                        <div className="relative group">
                            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden bg-white shadow-xl ring-4 ring-white relative z-10 text-neutral-200">
                                {user.user_metadata?.avatar_url ? (
                                    <Image
                                        src={user.user_metadata.avatar_url}
                                        alt={displayName}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    // Premium placeholder
                                    <svg className="w-full h-full p-6 text-neutral-300 bg-neutral-50" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                )}
                            </div>
                            {/* Decorative background blur */}
                            <div className="absolute -inset-4 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-full opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500 -z-10" />
                        </div>

                        {/* Identity Details */}
                        <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl md:text-4xl font-black text-neutral-900 tracking-tight">
                                    {displayName}
                                </h1>
                                {authority.isAdmin && (
                                    <div className="bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 border border-primary-100">
                                        <ShieldCheck className="w-3.5 h-3.5" />
                                        Verified
                                    </div>
                                )}
                            </div>

                            <p className="text-lg text-neutral-500 font-medium">{user.email}</p>

                            <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 pt-2">
                                <div>
                                    <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest block mb-1">Role</span>
                                    <span className="text-neutral-900 font-bold">{roleTitle}</span>
                                </div>
                                <div>
                                    <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest block mb-1">Joined</span>
                                    <span className="text-neutral-900 font-medium">{joinDate}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>


                {/* 2. Consumer Hub — My Activity */}
                {/* Always visible for all authenticated users */}
                <section className="mb-16 animate-fade-up">
                    <div className="flex items-end justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-black text-neutral-900">My Activity</h2>
                            <p className="text-sm text-neutral-500 mt-0.5">Your personal collection on Asia Insights</p>
                        </div>
                        <Link
                            href="/account/community"
                            className="text-sm font-bold text-primary-600 hover:text-primary-700 transition-colors flex items-center gap-1"
                        >
                            View all
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                            </svg>
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        {/* RSVPs */}
                        <Link href="/markets/my-events" className="group block">
                            <div className="bg-white rounded-2xl border border-neutral-200/60 shadow-sm p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                                <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center mb-4">
                                    <Calendar className="w-5 h-5 text-primary-600" />
                                </div>
                                <div className="text-3xl font-black text-neutral-900 mb-1">{summary.rsvpCount}</div>
                                <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider">RSVPs</div>
                            </div>
                        </Link>

                        {/* Saved Events */}
                        <Link href="/markets/my-events" className="group block">
                            <div className="bg-white rounded-2xl border border-neutral-200/60 shadow-sm p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                                <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center mb-4">
                                    <Bookmark className="w-5 h-5 text-primary-600" />
                                </div>
                                <div className="text-3xl font-black text-neutral-900 mb-1">{summary.savedEventsCount}</div>
                                <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Saved Events</div>
                            </div>
                        </Link>

                        {/* Saved Businesses */}
                        <Link href="/account/community" className="group block">
                            <div className="bg-white rounded-2xl border border-neutral-200/60 shadow-sm p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                                <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center mb-4">
                                    <Building2 className="w-5 h-5 text-brand-600" />
                                </div>
                                <div className="text-3xl font-black text-neutral-900 mb-1">{summary.savedBusinessesCount}</div>
                                <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Businesses</div>
                            </div>
                        </Link>

                        {/* Saved Stays */}
                        <Link href="/account/community" className="group block">
                            <div className="bg-white rounded-2xl border border-neutral-200/60 shadow-sm p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                                <div className="w-10 h-10 bg-secondary-50 rounded-xl flex items-center justify-center mb-4">
                                    <Home className="w-5 h-5 text-secondary-600" />
                                </div>
                                <div className="text-3xl font-black text-neutral-900 mb-1">{summary.savedStaysCount}</div>
                                <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Saved Stays</div>
                            </div>
                        </Link>
                    </div>

                    {/* My Orders quick-access */}
                    <Link href="/markets/orders" className="group block">
                        <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-4 hover:shadow-md hover:border-neutral-200 transition-all duration-200 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-neutral-100 rounded-xl flex items-center justify-center">
                                    <ShoppingBag className="w-4 h-4 text-neutral-600" />
                                </div>
                                <div>
                                    <div className="font-bold text-neutral-900 text-sm">My Orders</div>
                                    <div className="text-xs text-neutral-400">Market purchases and transactions</div>
                                </div>
                            </div>
                            <svg className="w-4 h-4 text-neutral-400 group-hover:text-primary-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </Link>

                    {/* Empty state prompt when nothing saved */}
                    {totalSaved === 0 && summary.rsvpCount === 0 && (
                        <div className="mt-6">
                            <EmptyState
                                icon={<Bookmark className="w-8 h-8 text-neutral-400" />}
                                title="You haven't saved anything yet"
                                description="Tap the bookmark icon on events, businesses, and stays to curate your personal collection."
                                action={{
                                    label: "Explore Community",
                                    href: "/markets/discovery"
                                }}
                                className="bg-white shadow-sm"
                            />
                        </div>
                    )}
                </section>


                {/* SOCIAL PROOF — Recommendations & Regulars */}
                {(recommendations.length > 0 || regulars.length > 0) && (
                    <section className="mb-16 animate-fade-up">
                        <div className="flex items-end justify-between mb-6">
                            <div>
                                <h2 className="text-xl font-black text-neutral-900">My Social Proof</h2>
                                <p className="text-sm text-neutral-500 mt-0.5">Businesses you endorse and frequent</p>
                            </div>
                        </div>

                        <div className="space-y-8">
                            {/* My Recommendations */}
                            {recommendations.length > 0 && (
                                <div>
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-7 h-7 bg-amber-50 rounded-lg flex items-center justify-center">
                                            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                                        </div>
                                        <h3 className="text-base font-black text-neutral-900">My Recommendations</h3>
                                        <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                                            {recommendations.length}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {recommendations.map((biz: any) => biz && (
                                            <Link key={biz.id} href={`/businesses/${biz.slug}`} className="group flex items-center gap-3 p-4 bg-white rounded-2xl border border-neutral-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                                                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center shrink-0 border border-amber-100 overflow-hidden">
                                                    {biz.logo_url ? (
                                                        <Image src={biz.logo_url} alt={biz.name} width={40} height={40} className="w-10 h-10 rounded-xl object-cover" />
                                                    ) : (
                                                        <span className="text-base font-black text-amber-600">{biz.name?.charAt(0)}</span>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold text-neutral-900 truncate group-hover:text-primary-600 transition-colors">{biz.name}</p>
                                                    {biz.category && <p className="text-xs text-neutral-400 truncate">{biz.category}</p>}
                                                </div>
                                                <Star className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* I'm a Regular At */}
                            {regulars.length > 0 && (
                                <div>
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-7 h-7 bg-primary-50 rounded-lg flex items-center justify-center">
                                            <Coffee className="w-4 h-4 text-primary-600" />
                                        </div>
                                        <h3 className="text-base font-black text-neutral-900">I&apos;m a Regular At</h3>
                                        <span className="text-xs font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full border border-primary-100">
                                            {regulars.length}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {regulars.map((biz: any) => biz && (
                                            <Link key={biz.id} href={`/businesses/${biz.slug}`} className="group flex items-center gap-3 p-4 bg-white rounded-2xl border border-neutral-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                                                <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center shrink-0 border border-primary-100 overflow-hidden">
                                                    {biz.logo_url ? (
                                                        <Image src={biz.logo_url} alt={biz.name} width={40} height={40} className="w-10 h-10 rounded-xl object-cover" />
                                                    ) : (
                                                        <span className="text-base font-black text-primary-600">{biz.name?.charAt(0)}</span>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold text-neutral-900 truncate group-hover:text-primary-600 transition-colors">{biz.name}</p>
                                                    {biz.category && <p className="text-xs text-neutral-400 truncate">{biz.category}</p>}
                                                </div>
                                                <Coffee className="w-4 h-4 text-primary-400 shrink-0" />
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {/* PROPERTY WATCHLIST */}
                <WatchlistSection properties={watchlist} />

                {/* ADMIN SCOPE - STEWARDSHIP LAYER */}
                {/* GUARDRAIL: Max 6 cards per section. If more needed, create subsection or reconsider grouping */}
                {authority.isAdmin && (
                    <section className="mb-16 animate-fade-up">
                        <div className="flex items-end justify-between mb-8">
                            <h2 className="text-xl font-black text-neutral-900">Platform Stewardship</h2>
                            <span className="text-sm text-neutral-500 font-medium">Entrusted to your care</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                            {/* Platform Overview - Featured */}
                            <ScopeCard
                                href="/markets/admin"
                                title="Platform Overview"
                                description="See the heartbeat of your community at a glance."
                                icon={<LayoutDashboard className="w-6 h-6 text-white" />}
                                color="bg-neutral-900"
                                featured={true}
                            />

                            {/* Events */}
                            <ScopeCard
                                href="/markets/admin/events"
                                title="Events"
                                description="Shape the community calendar and welcome new gatherings."
                                icon={<Calendar className="w-6 h-6 text-white" />}
                                color="bg-primary-600"
                            />

                            {/* Vendors */}
                            <ScopeCard
                                href="/markets/admin/vendors"
                                title="Vendors"
                                description="Welcome new vendors and support their growth."
                                icon={<Store className="w-6 h-6 text-white" />}
                                color="bg-primary-600"
                            />

                            {/* Businesses */}
                            <ScopeCard
                                href="/markets/admin/businesses"
                                title="Businesses"
                                description="Curate the local business directory and celebrate trusted partners."
                                icon={<Building2 className="w-6 h-6 text-white" />}
                                color="bg-secondary-600"
                            />

                            {/* Products */}
                            <ScopeCard
                                href="/markets/admin/products"
                                title="Market Products"
                                description="Review and celebrate artisan products in the marketplace."
                                icon={<ShoppingBag className="w-6 h-6 text-white" />}
                                color="bg-secondary-600"
                            />

                            {/* Users */}
                            <ScopeCard
                                href="/markets/admin/users"
                                title="Community"
                                description="Guide membership and recognize contributions."
                                icon={<Users className="w-6 h-6 text-white" />}
                                color="bg-neutral-900"
                            />
                        </div>

                        {/* EMOTIONAL ANCHOR - Trust Affirmation */}
                        <div className="text-center text-sm text-neutral-400 italic mt-8">
                            You are trusted with this space
                        </div>
                    </section>
                )}


                {/* VENDOR SCOPE */}
                {(authority.hasVendorRecord || authority.effectiveRole === 'vendor') && (
                    <section className="mb-16 animate-fade-up">
                        <div className="flex items-end justify-between mb-8">
                            <h2 className="text-xl font-black text-neutral-900">Your Business</h2>
                            <span className="text-sm text-neutral-500 font-medium">Your market presence</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                            <ScopeCard
                                href="/markets/vendor/dashboard"
                                title="Business Hub"
                                description="Track your sales and keep your offerings fresh."
                                icon={<LayoutDashboard className="w-6 h-6 text-white" />}
                                color="bg-primary-600"
                            />

                            <ScopeCard
                                href="/markets/vendor/profile/edit"
                                title="Edit Profile"
                                description="Update your public profile, logo, and contact details."
                                icon={<Store className="w-6 h-6 text-white" />}
                                color="bg-secondary-600"
                            />
                        </div>
                    </section>
                )}


                {/* 3. Account Settings - Tertiary Layer */}
                <section className="pt-8 border-t border-neutral-200/60">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div>
                            <h3 className="text-lg font-bold text-neutral-900 mb-2">Account Settings</h3>
                            <p className="text-neutral-500 text-sm leading-relaxed">
                                Adjust your personal preferences and login details.
                            </p>
                        </div>

                        <div className="md:col-span-2 space-y-4">
                            {/* Password / Details Placeholder */}
                            <div className="p-6 bg-white rounded-2xl border border-neutral-100 shadow-sm flex items-center justify-between group hover:border-neutral-200 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-neutral-50 flex items-center justify-center text-neutral-400 group-hover:text-neutral-600 transition-colors">
                                        <Settings className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-neutral-900">Login &amp; Security</div>
                                        <div className="text-sm text-neutral-500">Update password and security preferences</div>
                                    </div>
                                </div>
                                <Link
                                    href="/auth/forgot-password"
                                    className="px-4 py-2 text-sm font-bold text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                >
                                    Reset Password
                                </Link>
                            </div>

                            {/* Sign Out */}
                            <button
                                onClick={() => signOut()}
                                className="w-full text-left p-6 bg-white rounded-2xl border border-neutral-100 shadow-sm flex items-center justify-between group hover:border-error-100 hover:bg-error-50/30 transition-all"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-error-50 flex items-center justify-center text-error-400 group-hover:text-error-600 transition-colors">
                                        <LogOut className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-neutral-900 group-hover:text-error-700">Sign Out</div>
                                        <div className="text-sm text-neutral-500 group-hover:text-error-600/70">Securely log out of your account</div>
                                    </div>
                                </div>
                            </button>
                        </div>
                    </div>
                </section>

            </div>
        </main>
    )
}

function WatchlistSection({ properties }: { properties: any[] }) {
    if (!properties || properties.length === 0) return null

    return (
        <section className="mb-16 animate-fade-up">
            <div className="flex items-end justify-between mb-8">
                <div>
                    <h2 className="text-xl font-black text-neutral-900">Property Watchlist</h2>
                    <p className="text-sm text-neutral-500 mt-0.5">Stays you are currently monitoring</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {properties.map((property: any) => (
                    <PropertyCard
                        key={property.id}
                        id={property.id}
                        address={property.address}
                        type={property.type}
                        property_type={property.property_type}
                        price={property.price}
                        bedrooms={property.bedrooms}
                        bathrooms={property.bathrooms}
                        capacity={property.capacity}
                        images={property.images}
                        businesses={property.businesses}
                    />
                ))}
            </div>
        </section>
    )
}

// DESIGN GUARDRAIL: Icon colors limited to 3 semantic tones (neutral-900, primary-600, secondary-600)
// Never use dashboard-style color coding. Reuse colors across cards.
function ScopeCard({ href, title, description, icon, color, featured = false }: { href: string, title: string, description: string, icon: React.ReactNode, color: string, featured?: boolean }) {
    return (
        <Link href={href} className="block group h-full">
            <div className={`bg-white h-full p-4 md:p-5 rounded-2xl border border-neutral-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col ${featured ? 'md:col-span-2 lg:col-span-1' : ''}`}>
                <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center shadow-lg mb-6 group-hover:scale-110 transition-transform duration-500`}>
                    {icon}
                </div>
                <h3 className="text-lg font-black text-neutral-900 mb-2 group-hover:text-primary-600 transition-colors">
                    {title}
                </h3>
                <p className="text-sm text-neutral-600 leading-relaxed font-medium">
                    {description}
                </p>

                {/* Subtle arrow hint */}
                <div className="mt-auto pt-6 flex items-center text-xs font-bold text-neutral-400 uppercase tracking-widest group-hover:text-primary-600 transition-colors">
                    Access
                    <svg className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                </div>
            </div>
        </Link>
    )
}
