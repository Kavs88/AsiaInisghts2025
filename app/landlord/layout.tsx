import { redirect } from 'next/navigation'
import { hasLandlordAccessServer } from '@/lib/auth/authority'
import Link from 'next/link'
import { Building2, LayoutDashboard, Calendar, MessageSquare, ChevronRight } from 'lucide-react'

export default async function LandlordLayout({ children }: { children: React.ReactNode }) {
  const hasAccess = await hasLandlordAccessServer()
  if (!hasAccess) {
    redirect('/auth/login?redirect=/landlord/dashboard')
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Landlord top nav */}
      <nav className="bg-white border-b border-neutral-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/landlord/dashboard" className="flex items-center gap-2.5 font-black text-neutral-900">
              <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
                <Building2 className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm">Landlord Portal</span>
            </Link>
            <div className="hidden md:flex items-center gap-1">
              <Link
                href="/landlord/dashboard"
                className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 rounded-xl transition-all"
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
            </div>
          </div>
          <Link
            href="/"
            className="text-xs text-neutral-400 hover:text-neutral-600 transition-colors font-medium flex items-center gap-1"
          >
            Back to site
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
        {children}
      </main>
    </div>
  )
}
