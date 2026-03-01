import { ReactNode } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export interface EmptyStateProps {
    icon?: ReactNode
    title: string
    description: string
    action?: {
        label: string
        href?: string
        onClick?: () => void
    }
    className?: string
    children?: ReactNode // Phase 3 Hook: for rich contextual insertions (like trending carousels)
}

export default function EmptyState({ icon, title, description, action, className, children }: EmptyStateProps) {
    const isObservationState = !action

    return (
        <div className={cn("flex flex-col items-center justify-center text-center p-10 md:p-14 bg-white border border-neutral-200/60 rounded-2xl shadow-sm", className)}>
            {icon && (
                <div className={cn(
                    "bg-neutral-50 rounded-2xl flex items-center justify-center text-neutral-400 border border-neutral-200/60 mb-6",
                    isObservationState ? "w-20 h-20" : "w-16 h-16"
                )}>
                    {icon}
                </div>
            )}
            <h3 className="text-xl font-black text-neutral-900 mb-2">{title}</h3>
            <p className={cn("text-neutral-500 max-w-sm font-medium leading-relaxed", !isObservationState && "mb-8")}>
                {description}
            </p>
            {action && (
                action.href ? (
                    <Link href={action.href} className="h-12 px-6 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-2xl transition-all duration-300 shadow-sm active:scale-95 flex items-center">
                        {action.label}
                    </Link>
                ) : (
                    <button onClick={action.onClick} className="h-12 px-6 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-2xl transition-all duration-300 shadow-sm active:scale-95 flex items-center">
                        {action.label}
                    </button>
                )
            )}
            {children && (
                <div className="mt-8 w-full">
                    {children}
                </div>
            )}
        </div>
    )
}
