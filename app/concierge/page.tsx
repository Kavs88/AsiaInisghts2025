import Link from 'next/link'
import Image from 'next/image'
import HubHero from '@/components/ui/HubHero'

export const metadata = {
  title: 'Concierge - Asia Insights',
  description: 'Your Gateway to Southeast Asia - Personalized support for expats, retirees, nomads, and entrepreneurs',
}

export default function ConciergeHomePage() {
  return (
    <main id="main-content" className="min-h-screen bg-white">
      {/* Hero Section - Uplifted to Markets confidence level */}
      <HubHero
        title="Concierge"
        subtitle="Your Gateway to Southeast Asia. Personalized support for expats, retirees, nomads, and entrepreneurs."
        variant="concierge"
        imageUrl="/images/concierge-hero.jpg"
      >
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <Link
            href="#get-in-touch"
            className="inline-flex items-center justify-center px-8 py-4 bg-white text-primary-600 font-bold rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl text-lg hover:bg-neutral-50"
          >
            Get Started
          </Link>
          <Link
            href="#our-services"
            className="inline-flex items-center justify-center px-8 py-4 bg-white/10 text-white font-semibold rounded-2xl transition-all duration-200 border-2 border-white/30 hover:bg-white/20 text-lg"
          >
            View Services
          </Link>
        </div>
      </HubHero>

      {/* Our Concierge Services - Uplifted spacing and typography */}
      {/* QA FIX: Added id for anchor link from hero "View Services" button */}
      <section id="our-services" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-4xl lg:text-5xl font-black text-neutral-900 mb-4">
              Our Concierge Services
            </h2>
            <p className="text-xl text-neutral-600 font-medium mb-8">
              Tailored support for your unique journey in Southeast Asia
            </p>
            {/* QA FIX: Removed "View All Services" link - services are shown below, no separate page needed
                REASON: /concierge/services shows placeholder, breaking user expectation
                RESULT: Services are visible on this page, no need for separate link
            */}
          </div>
          {/* Visual Elevation: Increased card padding, stronger shadows for Markets-level confidence */}
          <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-6 lg:gap-8 max-w-7xl mx-auto">
            {/* For Expats */}
            <div className="bg-white rounded-2xl p-8 border border-neutral-300 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
              <div className="flex items-start gap-3 mb-6">
                <svg className="w-6 h-6 text-primary-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <h3 className="text-xl lg:text-2xl font-bold text-neutral-900">For Expats</h3>
              </div>
              <ul className="space-y-3 text-neutral-700 mb-8 flex-grow">
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Visa and work permit assistance</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Housing search and relocation support</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>School enrollment and education guidance</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Banking and financial setup</span>
                </li>
              </ul>
              <Link
                href="#get-in-touch"
                className="inline-flex items-center justify-center px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition-all duration-200 mt-auto w-full"
              >
                Get Started
              </Link>
            </div>

            {/* For Retirees */}
            <div className="bg-white rounded-2xl p-8 border border-neutral-300 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
              <div className="flex items-start gap-3 mb-6">
                <svg className="w-6 h-6 text-primary-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <h3 className="text-xl lg:text-2xl font-bold text-neutral-900">For Retirees</h3>
              </div>
              <ul className="space-y-3 text-neutral-700 mb-8 flex-grow">
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Retirement visa and long-term stay support</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Healthcare and medical facility connections</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Property search and purchase assistance</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Community integration and social connections</span>
                </li>
              </ul>
              <Link
                href="#get-in-touch"
                className="inline-flex items-center justify-center px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition-all duration-200 mt-auto w-full"
              >
                Get Started
              </Link>
            </div>

            {/* For Digital Nomads */}
            <div className="bg-white rounded-2xl p-8 border border-neutral-300 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
              <div className="flex items-start gap-3 mb-6">
                <svg className="w-6 h-6 text-primary-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <h3 className="text-xl lg:text-2xl font-bold text-neutral-900">For Digital Nomads</h3>
              </div>
              <ul className="space-y-3 text-neutral-700 mb-8 flex-grow">
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Co-working space recommendations</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Short-term accommodation solutions</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Internet and connectivity setup</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Local networking and community access</span>
                </li>
              </ul>
              <Link
                href="#get-in-touch"
                className="inline-flex items-center justify-center px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition-all duration-200 mt-auto w-full"
              >
                Get Started
              </Link>
            </div>

            {/* For Entrepreneurs */}
            <div className="bg-white rounded-2xl p-8 border border-neutral-300 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
              <div className="flex items-start gap-3 mb-6">
                <svg className="w-6 h-6 text-primary-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <h3 className="text-xl lg:text-2xl font-bold text-neutral-900">For Entrepreneurs</h3>
              </div>
              <ul className="space-y-3 text-neutral-700 mb-8 flex-grow">
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Business registration and legal setup</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Local partnership and networking introductions</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Office space and commercial property search</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Market research and entry strategy support</span>
                </li>
              </ul>
              <Link
                href="#get-in-touch"
                className="inline-flex items-center justify-center px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition-all duration-200 mt-auto w-full"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* What the Concierge Does - Visual Elevation Pass
          INTENT: Match Markets confidence level with stronger typography, clearer CTA, more spacing
          CHANGES: Increased heading size, larger CTA button, more spacing between elements
      */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-4xl lg:text-5xl font-black text-neutral-900 mb-6">
              What the Concierge Does
            </h2>
            <p className="text-lg text-neutral-500 font-medium mb-4">
              Real support from people who understand your journey
            </p>
            <p className="text-xl lg:text-2xl text-neutral-600 font-medium mb-10 leading-relaxed">
              We provide hands-on local support and trusted introductions to help you navigate your transition to life in Southeast Asia. Our team connects you with the right people, places, and resources to make your move seamless.
            </p>
            {/* QA FIX: Changed link to scroll to services section instead of placeholder page
                REASON: /concierge/services shows "Coming Soon", breaking user expectation
                RESULT: User scrolls to services section on same page
            */}
            <Link
              href="#our-services"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl text-lg"
            >
              Explore Our Services
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Where We Go - Uplifted spacing and typography */}
      <section className="py-20 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-4xl lg:text-5xl font-black text-neutral-900 mb-4">
              Where We Go
            </h2>
            <p className="text-xl text-neutral-600 font-medium">
              We provide concierge services in these destinations across Southeast Asia
            </p>
          </div>
          {/* Visual Elevation: Increased card padding, stronger shadows, larger icons for Markets-level confidence */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto mb-10">
            {/* Da Nang, Vietnam */}
            <div className="bg-white rounded-2xl p-8 border border-neutral-300 shadow-sm hover:shadow-md hover:scale-105 transition-all flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-neutral-900">Da Nang, Vietnam</h3>
            </div>

            {/* Hua Hin, Thailand */}
            <div className="bg-white rounded-2xl p-8 border border-neutral-300 shadow-sm hover:shadow-md hover:scale-105 transition-all flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-neutral-900">Hua Hin, Thailand</h3>
            </div>

            {/* Sarawak, Malaysia */}
            <div className="bg-white rounded-2xl p-8 border border-neutral-300 shadow-sm hover:shadow-md hover:scale-105 transition-all flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-neutral-900">Sarawak, Malaysia</h3>
            </div>

            {/* Sabah, Malaysia */}
            <div className="bg-white rounded-2xl p-8 border border-neutral-300 shadow-sm hover:shadow-md hover:scale-105 transition-all flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-neutral-900">Sabah, Malaysia</h3>
            </div>
          </div>
          {/* Visual Elevation: More prominent CTA with larger button */}
          <div className="text-center mt-10">
            <Link
              href="#our-services"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl text-lg"
            >
              Learn More About Our Locations
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>



      {/* What People Say - Testimonials - Uplifted spacing and typography */}
      <section className="py-20 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-4xl lg:text-5xl font-black text-neutral-900 mb-4">
              What People Say
            </h2>
            <p className="text-xl lg:text-2xl text-neutral-600 font-medium leading-relaxed">
              Hear from our clients who have successfully navigated their journey with Asia Insights Concierge
            </p>
          </div>
          {/* Visual Elevation: Horizontal scrolling carousel for testimonials */}
          <div className="overflow-x-auto pb-4 -mx-4 px-4 scroll-smooth" style={{ scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 transparent' }}>
            <div className="flex gap-6 min-w-max">
              {/* Testimonial 1: Richard W. - General relocation support */}
              <div className="bg-white rounded-2xl p-8 border border-neutral-200 shadow-sm hover:shadow-md transition-shadow w-[90vw] sm:w-[500px] flex-shrink-0">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary-200 flex-shrink-0">
                    <Image
                      src="/images/testimonials/richardprofile-150x150.png"
                      alt="Richard W."
                      width={64}
                      height={64}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-neutral-900">Richard W.</p>
                    <p className="text-sm text-neutral-600">Relocation support</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-neutral-700 mb-4 italic text-lg leading-relaxed">
                  "Sam is a knowledgeable informed guide. His experience in Southeast Asia has proved invaluable to me. He has consistently offered excellent service as I've attempted to settle down here. I wholeheartedly recommend Asia insights and it's services."
                </p>
              </div>
              {/* Testimonial 2: Christine M. - Long-term support */}
              <div className="bg-white rounded-2xl p-8 border border-neutral-200 shadow-sm hover:shadow-md transition-shadow w-[90vw] sm:w-[500px] flex-shrink-0">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary-200 flex-shrink-0">
                    <Image
                      src="/images/testimonials/christine-136x150.jpg"
                      alt="Christine M."
                      width={64}
                      height={64}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-neutral-900">Christine M.</p>
                    <p className="text-sm text-neutral-600">Long-term support & community</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-neutral-700 mb-4 italic text-lg leading-relaxed">
                  "I've known Sam for several years now. He has organized several outings and is always open to take care of issues that arise. In addition, he is well travelled and passionate about helping others have a great experience in their new surroundings. He is a super friendly, knowledgeable, and all-around great guy to know."
                </p>
              </div>
              {/* Testimonial 3: David J. - Retiree in Kuching */}
              <div className="bg-white rounded-2xl p-8 border border-neutral-200 shadow-sm hover:shadow-md transition-shadow w-[90vw] sm:w-[500px] flex-shrink-0">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary-200 flex-shrink-0">
                    <Image
                      src="/images/testimonials/davidprofile-150x150.jpg"
                      alt="David J."
                      width={64}
                      height={64}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-neutral-900">David J.</p>
                    <p className="text-sm text-neutral-600">Retiree in Kuching, Sarawak</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-neutral-700 mb-4 italic text-lg leading-relaxed">
                  "My wife and I retired and moved to Kuching two years ago. We met Sam very early on, and he has been incredibly helpful for us in our settling into our new city. His knowledge and contact list is vast, and he has been a major source of information on travels, events, transport, and the ways and means of getting things done. I would not hesitate to recommend Sam in any capacity. Your time in Asia will be much easier with Sam around."
                </p>
              </div>
              {/* Testimonial 4: Cheryl T. - Da Nang tour guide experience */}
              <div className="bg-white rounded-2xl p-8 border border-neutral-200 shadow-sm hover:shadow-md transition-shadow w-[90vw] sm:w-[500px] flex-shrink-0">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary-200 flex-shrink-0">
                    <Image
                      src="/images/testimonials/cherlyprofile-150x150.png"
                      alt="Cheryl T."
                      width={64}
                      height={64}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-neutral-900">Cheryl T.</p>
                    <p className="text-sm text-neutral-600">Tour guide in Da Nang, Vietnam</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-neutral-700 mb-4 italic text-lg leading-relaxed">
                  "I recently spent a week in Danang and had the pleasure of having Sam as my tour guide. From the moment we met, Sam was incredibly attentive and intuitive to my needs. His extensive knowledge of local spots in Danang was impressive, and he provided excellent recommendations for places to stay, cafes offering both local and western cuisine, and activities to enjoy. Thanks to Sam, I not only had a fantastic time exploring Danang, but I also felt safe and well-cared for throughout my stay."
                </p>
              </div>
            </div>
          </div>
          <div className="text-center mt-8">
            {/* Visual Elevation: More prominent CTA with larger spacing and hover scale */}
            <Link
              href="#get-in-touch"
              className="inline-flex items-center justify-center px-10 py-5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-2xl transition-all duration-200 shadow-xl hover:shadow-2xl hover:scale-105 text-lg"
            >
              Get Started Today
              <svg className="w-6 h-6 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Coming Soon - Uplifted spacing */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            {/* Visual Elevation: Larger typography for stronger impact */}
            <p className="text-3xl lg:text-4xl font-black text-neutral-900 leading-relaxed">
              The ultimate online platform to get you offline — and connected to your community.
            </p>
          </div>
        </div>
      </section>

      {/* Get in Touch - Reduced padding for better space efficiency */}
      <section id="get-in-touch" className="py-12 lg:py-16 bg-gradient-to-br from-primary-600 to-secondary-600 text-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-6 lg:mb-8">
              <h2 className="text-4xl lg:text-5xl font-black text-white mb-2 lg:mb-3">
                Get in Touch
              </h2>
              <p className="text-lg lg:text-xl xl:text-2xl text-white/90 font-medium max-w-2xl mx-auto">
                Ready to start your journey? Contact us today and let's make your transition seamless.
              </p>
            </div>

            <div className="max-w-2xl mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* WhatsApp Button */}
                <a
                  href="https://wa.me/60172461819"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center gap-2 p-4 bg-[#25D366] hover:bg-[#20BA5A] text-white rounded-xl transition-all hover:shadow-lg hover:scale-105"
                >
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                  <span className="text-sm font-semibold">WhatsApp</span>
                </a>

                {/* Zalo Button */}
                <a
                  href="https://zalo.me/60172461819"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center gap-2 p-4 bg-[#0068FF] hover:bg-[#0052CC] text-white rounded-xl transition-all hover:shadow-lg hover:scale-105"
                >
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12c0 1.54.36 2.98.97 4.29L1 23l6.71-1.97C9.02 21.64 10.46 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm0 18c-1.33 0-2.57-.36-3.64-.99l-.24-.14-2.49.73.73-2.49-.14-.24C5.36 14.57 5 13.33 5 12c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7z" />
                    <path d="M12.5 8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-4 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm8 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                  </svg>
                  <span className="text-sm font-semibold">Zalo</span>
                </a>

                {/* Email Button */}
                <a
                  href="mailto:info@asia-insights.com"
                  className="flex flex-col items-center justify-center gap-2 p-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition-all hover:shadow-lg hover:scale-105"
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="text-sm font-semibold">Email</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
