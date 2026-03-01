'use client'

import dynamic from 'next/dynamic'

const VendorBusinessForm = dynamic(
  () => import('@/components/vendor/VendorBusinessForm'),
  { ssr: false }
)

export default function VendorApplyPageClient() {
  return (
    <div className="container-custom max-w-2xl">
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-8 md:p-10">
        <h2 className="text-2xl font-black text-neutral-900 mb-2">Vendor application</h2>
        <p className="text-neutral-500 mb-8 leading-relaxed">
          Fill in your details below. Your profile will go live once reviewed by our team.
        </p>
        <VendorBusinessForm />
      </div>
    </div>
  )
}
