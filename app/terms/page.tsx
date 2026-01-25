import Link from 'next/link'

export const metadata = {
  title: 'Terms of Service | AI Markets',
  description: 'Terms of Service for AI Markets platform',
}

export default function TermsPage() {
  const lastUpdated = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })

  return (
    <main id="main-content" className="min-h-screen bg-neutral-50 py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-8 sm:p-12">
          <h1 className="text-4xl font-bold text-neutral-900 mb-4">Terms of Service</h1>
          <p className="text-sm text-neutral-500 mb-8">Last updated: {lastUpdated}</p>

          <div className="prose prose-neutral max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-neutral-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-neutral-700 leading-relaxed mb-4">
                By accessing and using the AI Markets platform, you accept and agree to be bound by the terms and provision of this agreement.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-neutral-900 mb-4">2. Use License</h2>
              <p className="text-neutral-700 leading-relaxed mb-4">
                Permission is granted to temporarily access the materials on AI Markets for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
              </p>
              <ul className="list-disc pl-6 mb-4 text-neutral-700 space-y-2">
                <li>Modify or copy the materials</li>
                <li>Use the materials for any commercial purpose or for any public display</li>
                <li>Attempt to reverse engineer any software contained on the platform</li>
                <li>Remove any copyright or other proprietary notations from the materials</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-neutral-900 mb-4">3. User Accounts</h2>
              <p className="text-neutral-700 leading-relaxed mb-4">
                When you create an account with us, you must provide information that is accurate, complete, and current at all times. You are responsible for safeguarding the password and for all activities that occur under your account.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-neutral-900 mb-4">4. Content</h2>
              <p className="text-neutral-700 leading-relaxed mb-4">
                Our platform allows you to post, link, store, share and otherwise make available certain information, text, graphics, or other material. You are responsible for the content that you post on or through the platform.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-neutral-900 mb-4">5. Prohibited Uses</h2>
              <p className="text-neutral-700 leading-relaxed mb-4">
                You may not use our platform:
              </p>
              <ul className="list-disc pl-6 mb-4 text-neutral-700 space-y-2">
                <li>In any way that violates any applicable national or international law or regulation</li>
                <li>To transmit, or procure the sending of, any advertising or promotional material</li>
                <li>To impersonate or attempt to impersonate the company, a company employee, another user, or any other person or entity</li>
                <li>In any way that infringes upon the rights of others, or in any way is illegal, threatening, fraudulent, or harmful</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-neutral-900 mb-4">6. Disclaimer</h2>
              <p className="text-neutral-700 leading-relaxed mb-4">
                The materials on AI Markets are provided on an 'as is' basis. AI Markets makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-neutral-900 mb-4">7. Limitations</h2>
              <p className="text-neutral-700 leading-relaxed mb-4">
                In no event shall AI Markets or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on AI Markets, even if AI Markets or an authorized representative has been notified orally or in writing of the possibility of such damage.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-neutral-900 mb-4">8. Revisions</h2>
              <p className="text-neutral-700 leading-relaxed mb-4">
                AI Markets may revise these terms of service at any time without notice. By using this platform you are agreeing to be bound by the then current version of these terms of service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-neutral-900 mb-4">9. Contact Information</h2>
              <p className="text-neutral-700 leading-relaxed mb-4">
                If you have any questions about these Terms of Service, please contact us through our <Link href="/contact" className="text-primary-600 hover:text-primary-700 underline">contact page</Link>.
              </p>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-neutral-200">
            <Link 
              href="/"
              className="text-primary-600 hover:text-primary-700 font-semibold"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}



