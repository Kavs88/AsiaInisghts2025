import { cn } from '@/lib/utils'

interface BadgeProps {
    children: React.ReactNode
    variant?: 'glass' | 'primary' | 'success' | 'warning' | 'neutral' | 'outline'
    className?: string
}

export default function Badge({
    children,
    variant = 'glass',
    className
}: BadgeProps) {
    const variants = {
        glass: 'bg-neutral-900/80 backdrop-blur-md text-white border border-white/20 shadow-lg',
        primary: 'bg-primary-50 text-primary-700 border border-primary-200/50',
        success: 'bg-success-50 text-success-700 border border-success-200/50',
        warning: 'bg-amber-50 text-amber-700 border border-amber-200/50',
        neutral: 'bg-neutral-50 text-neutral-600 border border-neutral-200/50',
        outline: 'bg-transparent text-neutral-500 border border-neutral-200'
    }

    return (
        <span className={cn(
            "px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest inline-flex items-center justify-center transition-all",
            variants[variant],
            className
        )}>
            {children}
        </span>
    )
}
