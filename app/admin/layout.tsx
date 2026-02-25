import Link from 'next/link'

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
            <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-6">
                    <Link href="/admin/ask" className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                        Asia Insights <span className="text-xs font-mono text-gray-500 uppercase tracking-wide">Brain</span>
                    </Link>
                    <div className="flex gap-1">
                        <NavLink href="/admin/ask">Ask</NavLink>
                        <NavLink href="/admin/entities">Entities</NavLink>
                        <NavLink href="/admin/insights">Insights (Soon)</NavLink>
                    </div>
                </div>
                <div className="text-sm text-gray-500">
                    Internal Only
                </div>
            </nav>
            <main className="p-6 max-w-7xl mx-auto">
                {children}
            </main>
        </div>
    )
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
    return (
        <Link
            href={href}
            className="px-4 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
        >
            {children}
        </Link>
    )
}
