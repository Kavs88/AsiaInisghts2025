import { requireAdmin } from '@/lib/auth/server-admin-check'

export const dynamic = 'force-dynamic'
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireAdmin()
  return <>{children}</>
}
