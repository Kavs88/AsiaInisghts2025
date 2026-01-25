import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'

export interface BreadcrumbItem {
    label: string
    href: string
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[]
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
    return (
        <nav aria-label="Breadcrumb" className="py-4">
            <ol className="flex items-center gap-2 text-sm text-neutral-600">
                {/* Home Icon */}
                <li>
                    <Link
                        href="/"
                        className="flex items-center hover:text-primary-600 transition-colors"
                        aria-label="Home"
                    >
                        <Home className="w-4 h-4" />
                    </Link>
                </li>

                {items.map((item, index) => {
                    const isLast = index === items.length - 1

                    return (
                        <li key={index} className="flex items-center gap-2">
                            <ChevronRight className="w-4 h-4 text-neutral-400" />
                            {isLast || !item.href ? (
                                <span className="font-semibold text-neutral-900 truncate max-w-[200px] sm:max-w-none">
                                    {item.label}
                                </span>
                            ) : (
                                <Link
                                    href={item.href}
                                    className="hover:text-primary-600 transition-colors truncate max-w-[150px] sm:max-w-none"
                                >
                                    {item.label}
                                </Link>
                            )}
                        </li>
                    )
                })}
            </ol>
        </nav>
    )
}
