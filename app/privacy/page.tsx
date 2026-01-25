import Link from 'next/link'

export const metadata = {
  title: 'Privacy Policy | AI Markets',
  description: 'Privacy Policy for AI Markets platform',
}

export default function PrivacyPage() {
  const lastUpdated = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })

  return (
    <main id="main-content" className="min-h-screen bg-neutral-50 py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-8 sm:p-12">
          <h1 className="text-4xl font-bold text-neutral-900 mb-4">Privacy Policy</h1>
          <p className="text-sm text-neutral-500 mb-8">Last updated: {lastUpdated}</p>

          <div className="prose prose-neutral max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-neutral-900 mb-4">1. Introduction</h2>
              <p className="text-neutral-700 leading-relaxed mb-4">
                AI Markets ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-neutral-900 mb-4">2. Information We Collect</h2>
              <p className="text-neutral-700 leading-relaxed mb-4">
                We collect information that you provide directly to us, including:
              </p>
              <ul className="list-disc pl-6 mb-4 text-neutral-700 space-y-2">
                <li><strong>Account Information:</strong> When you create an account, we collect your email address, name, and any other information you choose to provide.</li>
                <li><strong>Profile Information:</strong> Information you provide in your user profile, including business details, contact information, and preferences.</li>
                <li><strong>Content:</strong> Information you post, upload, or share on the platform, including events, listings, reviews, and messages.</li>
                <li><strong>Communication Data:</strong> Information you provide when you contact us for support or inquiries.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-neutral-900 mb-4">3. Authentication & Account Data</h2>
              <p className="text-neutral-700 leading-relaxed mb-4">
                We use secure authentication services to manage your account access. Your authentication data is handled securely and is not shared with third parties except as necessary to provide our services.
              </p>
              <p className="text-neutral-700 leading-relaxed mb-4">
                Account information is stored securely and is accessible only to you and authorized platform administrators. You can update or delete your account information at any time through your account settings.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-neutral-900 mb-4">4. Cookies & Session Usage</h2>
              <p className="text-neutral-700 leading-relaxed mb-4">
                We use cookies and similar technologies to:
              </p>
              <ul className="list-disc pl-6 mb-4 text-neutral-700 space-y-2">
                <li>Maintain your session and authentication state</li>
                <li>Remember your preferences and settings</li>
                <li>Improve platform functionality and user experience</li>
              </ul>
              <p className="text-neutral-700 leading-relaxed mb-4">
                Session cookies are essential for the platform to function properly and are used solely to maintain your logged-in state. You can control cookie settings through your browser, though disabling cookies may affect platform functionality.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-neutral-900 mb-4">5. How We Use Your Information</h2>
              <p className="text-neutral-700 leading-relaxed mb-4">
                We use the information we collect to:
              </p>
              <ul className="list-disc pl-6 mb-4 text-neutral-700 space-y-2">
                <li>Provide, maintain, and improve our services</li>
                <li>Process transactions and send related information</li>
                <li>Send technical notices, updates, and support messages</li>
                <li>Respond to your comments, questions, and requests</li>
                <li>Monitor and analyze trends, usage, and activities</li>
                <li>Detect, prevent, and address technical issues</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-neutral-900 mb-4">6. Information Sharing</h2>
              <p className="text-neutral-700 leading-relaxed mb-4">
                We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
              </p>
              <ul className="list-disc pl-6 mb-4 text-neutral-700 space-y-2">
                <li>With your consent or at your direction</li>
                <li>To comply with legal obligations or respond to legal requests</li>
                <li>To protect the rights, property, or safety of AI Markets, our users, or others</li>
                <li>In connection with a merger, acquisition, or sale of assets</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-neutral-900 mb-4">7. Data Security</h2>
              <p className="text-neutral-700 leading-relaxed mb-4">
                We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic storage is 100% secure.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-neutral-900 mb-4">8. Your Rights</h2>
              <p className="text-neutral-700 leading-relaxed mb-4">
                You have the right to:
              </p>
              <ul className="list-disc pl-6 mb-4 text-neutral-700 space-y-2">
                <li>Access and receive a copy of your personal information</li>
                <li>Rectify inaccurate or incomplete information</li>
                <li>Request deletion of your personal information</li>
                <li>Object to or restrict processing of your information</li>
                <li>Withdraw consent at any time</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-neutral-900 mb-4">9. Data Retention</h2>
              <p className="text-neutral-700 leading-relaxed mb-4">
                We retain your personal information for as long as necessary to provide our services and fulfill the purposes described in this policy, unless a longer retention period is required or permitted by law.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-neutral-900 mb-4">10. Children's Privacy</h2>
              <p className="text-neutral-700 leading-relaxed mb-4">
                Our platform is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If you believe we have collected information from a child under 13, please contact us immediately.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-neutral-900 mb-4">11. Changes to This Privacy Policy</h2>
              <p className="text-neutral-700 leading-relaxed mb-4">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-neutral-900 mb-4">12. Contact Us</h2>
              <p className="text-neutral-700 leading-relaxed mb-4">
                If you have any questions about this Privacy Policy, please contact us through our <Link href="/contact" className="text-primary-600 hover:text-primary-700 underline">contact page</Link>.
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



