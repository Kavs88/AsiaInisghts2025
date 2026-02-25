import Link from 'next/link'
import Image from 'next/image'

export const metadata = {
    title: 'Our Locations - Asia Insights',
    description: 'Explore the destinations where we offer comprehensive concierge and community support.',
}

const locations = [
    {
        id: 'da-nang',
        name: 'Da Nang, Vietnam',
        description: 'A vibrant coastal city balancing modern conveniences with rich culture. Perfect for digital nomads and beach lovers.',
        image: '/images/destinations/danang.jpg', // Placeholder path
        features: ['International Airport', 'Beach & Mountains', 'Thriving Expat Community'],
    },
    {
        id: 'hua-hin',
        name: 'Hua Hin, Thailand',
        description: 'The royal beach resort town offering a relaxed pace of life, excellent healthcare, and world-class golf.',
        image: '/images/destinations/huahin.jpg',
        features: ['Royal Heritage', 'Retiree Friendly', 'Top-tier Medical Care'],
    },
    {
        id: 'sarawak',
        name: 'Sarawak, Malaysia',
        description: 'Discover the charm of Kuching and the wilds of Borneo. A haven for nature enthusiasts and culture seekers.',
        image: '/images/destinations/sarawak.jpg',
        features: ['Rainforests', 'Cultural Diversity', 'Cat City Charm'],
    },
    {
        id: 'sabah',
        name: 'Sabah, Malaysia',
        description: 'From Mount Kinabalu to diving in Sipadan. Experience the best of eco-tourism and island living.',
        image: '/images/destinations/sabah.jpg',
        features: ['Eco-Tourism', 'Island Hopping', 'Adventure Hub'],
    }
]

export default function LocationsPage() {
    return (
        <main className="min-h-screen bg-white">
            {/* Hero */}
            <section className="relative py-16 lg:py-24 bg-neutral-900 text-white">
                <div className="container-custom relative z-10 text-center max-w-4xl mx-auto">
                    <h1 className="text-4xl lg:text-5xl font-black mb-6 tracking-tight">
                        Our <span className="text-primary-500">Locations.</span>
                    </h1>
                    <p className="text-xl text-neutral-300 font-medium leading-relaxed max-w-2xl mx-auto">
                        We operate hands-on hubs in these select destinations, ensuring you have real, on-the-ground support where it matters most.
                    </p>
                </div>
            </section>

            {/* Locations Grid */}
            <section className="py-12 bg-neutral-50">
                <div className="container-custom">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                        {locations.map((location) => (
                            <div key={location.id} className="bg-white rounded-3xl overflow-hidden border border-neutral-200 hover:shadow-xl transition-all duration-300 group flex flex-col">
                                <div className="relative h-64 bg-neutral-200 overflow-hidden">
                                    {/* Placeholder for real images - using a gradient fallback if image fails or for now */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary-800 to-secondary-800" />
                                    <div className="absolute inset-0 flex items-center justify-center text-white/20 text-4xl font-black uppercase tracking-widest">
                                        {location.name.split(',')[0]}
                                    </div>
                                </div>

                                <div className="p-8 flex-1 flex flex-col">
                                    <h2 className="text-2xl font-bold text-neutral-900 mb-3 group-hover:text-primary-600 transition-colors">
                                        {location.name}
                                    </h2>
                                    <p className="text-neutral-600 mb-6 leading-relaxed flex-1">
                                        {location.description}
                                    </p>

                                    <div className="flex flex-wrap gap-2 mb-8">
                                        {location.features.map((feature, i) => (
                                            <span key={i} className="px-3 py-1 bg-neutral-100 text-neutral-600 text-xs font-bold uppercase tracking-wider rounded-lg">
                                                {feature}
                                            </span>
                                        ))}
                                    </div>

                                    <Link
                                        href={`/contact?subject=Inquiry about ${location.name}`}
                                        className="inline-flex items-center justify-center px-6 py-3 bg-neutral-900 text-white font-bold rounded-xl hover:bg-primary-600 transition-colors w-full"
                                    >
                                        Learn More
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Expansion CTA */}
            <section className="py-12 bg-white border-t border-neutral-100">
                <div className="container-custom text-center max-w-3xl mx-auto">
                    <h2 className="text-3xl font-black text-neutral-900 mb-4">Don't see your destination?</h2>
                    <p className="text-lg text-neutral-600 mb-8">
                        We are constantly expanding our network. Reach out to see if we have partners in your desired location.
                    </p>
                    <Link
                        href="/contact"
                        className="inline-flex items-center justify-center gap-2 text-primary-600 font-bold hover:gap-3 transition-all"
                    >
                        Contact Us <span aria-hidden="true">&rarr;</span>
                    </Link>
                </div>
            </section>
        </main>
    )
}
