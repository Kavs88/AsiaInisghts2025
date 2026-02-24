import VendorApplyPageClient from './page-client'

export const metadata = {
  title: 'Become a Vendor - Sunday Market',
  description: 'Join our marketplace and reach new customers',
}

export default function VendorApplyPage() {
  return (
    <main id="main-content" className="min-h-screen bg-neutral-50">
      {/* Page Header */}
      <section className="bg-neutral-900 text-white py-12 lg:py-16">
        <div className="container-custom">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">Become a Vendor</h1>
          <p className="text-lg text-neutral-300">Join our marketplace and reach new customers</p>
        </div>
      </section>

      {/* Application Form */}
      <section className="py-12">
        <VendorApplyPageClient />
      </section>
    </main>
  )
}

