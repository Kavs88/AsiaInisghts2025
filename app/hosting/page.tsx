import Link from 'next/link'
import Image from 'next/image'

export const metadata = {
    title: 'Host with Asia Insights',
    description: 'Partner with us to host markets, events, or guests.',
}

export default function HostingPage() {
    return (
        <main className="min-h-screen bg-white">
            {/* Hero */}
            <section className="relative py-16 lg:py-24 bg-neutral-900 text-white overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-neutral-900 to-secondary-900 opacity-90" />
                <div className="container-custom relative z-10 text-center max-w-4xl mx-auto">
                    <h1 className="text-4xl lg:text-5xl font-black mb-8 tracking-tight">
                        Host with <span className="text-primary-500">Asia Insights.</span>
                    </h1>
                    <p className="text-lg lg:text-xl text-neutral-300 font-medium leading-relaxed mb-12">
                        Turn your property into a community hub. Whether you have a venue, a home, or a unique space, we help you connect with the right people.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/contact"
                            className="px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-2xl transition-all shadow-lg hover:shadow-xl text-lg"
                        >
                            Get in Touch
                        </Link>
                    </div>
                </div>
            </section>

            {/* Options Grid */}
            <section className="py-12 bg-white">
                <div className="container-custom">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Host a Market */}
                        <div className="bg-neutral-50 rounded-3xl p-8 border border-neutral-100 hover:border-primary-200 transition-all hover:shadow-xl group">
                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-neutral-900 mb-4">Host a Market</h2>
                            <p className="text-neutral-600 mb-8 leading-relaxed">
                                Transform your venue into a bustling weekly market. We bring the vendors, the community, and the operations.
                            </p>
                            <Link href="/contact?subject=Host%20Market" className="text-primary-600 font-bold flex items-center gap-2 group-hover:gap-3 transition-all">
                                Learn More <span aria-hidden="true">&rarr;</span>
                            </Link>
                        </div>

                        {/* List Property */}
                        <div className="bg-neutral-50 rounded-3xl p-8 border border-neutral-100 hover:border-primary-200 transition-all hover:shadow-xl group">
                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-neutral-900 mb-4">List a Property</h2>
                            <p className="text-neutral-600 mb-8 leading-relaxed">
                                Welcome verified expats and retirees into your property. Long-term tenants who value community and reliability.
                            </p>
                            <Link href="/contact?subject=List%20Property" className="text-primary-600 font-bold flex items-center gap-2 group-hover:gap-3 transition-all">
                                List Now <span aria-hidden="true">&rarr;</span>
                            </Link>
                        </div>

                        {/* Partner / Guide */}
                        <div className="bg-neutral-50 rounded-3xl p-8 border border-neutral-100 hover:border-primary-200 transition-all hover:shadow-xl group">
                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-neutral-900 mb-4">Become a Partner</h2>
                            <p className="text-neutral-600 mb-8 leading-relaxed">
                                Connect your services with our concierge clients. From visa agents to tour guides, we work with the best.
                            </p>
                            <Link href="/contact?subject=Partner%20Application" className="text-primary-600 font-bold flex items-center gap-2 group-hover:gap-3 transition-all">
                                Apply <span aria-hidden="true">&rarr;</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    )
}
