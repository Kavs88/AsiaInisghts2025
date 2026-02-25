import { ShieldCheck, Award, MapPin, Store, Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TrustBadgeListProps {
    badges: string[]
    className?: string
    size?: 'sm' | 'md'
}

type BadgeConfig = {
    label: string
    icon: React.ElementType
    colorClasses: string
}

const BADGE_CONFIG: Record<string, BadgeConfig> = {
    'founding_member': {
        label: 'Founding Member',
        icon: Award,
        colorClasses: 'bg-amber-50 text-amber-700 border-amber-200'
    },
    'market_regular': {
        label: 'Market Regular',
        icon: Store,
        colorClasses: 'bg-blue-50 text-blue-700 border-blue-200'
    },
    'verified_landlord': {
        label: 'Verified Landlord',
        icon: MapPin, // Using MapPin as 'Home' might be confused with nav
        colorClasses: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    },
    'trusted_service': {
        label: 'Trusted Service',
        icon: Star,
        colorClasses: 'bg-purple-50 text-purple-700 border-purple-200'
    }
}

export default function TrustBadgeList({ badges, className, size = 'md' }: TrustBadgeListProps) {
    if (!badges || badges.length === 0) return null

    return (
        <div className={cn("flex flex-wrap gap-2", className)}>
            {badges.map(badgeKey => {
                const config = BADGE_CONFIG[badgeKey]
                if (!config) return null

                const Icon = config.icon

                return (
                    <div
                        key={badgeKey}
                        className={cn(
                            "inline-flex items-center gap-1.5 border rounded-full font-bold",
                            config.colorClasses,
                            size === 'sm' ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-xs"
                        )}
                        title={config.label}
                    >
                        <Icon className={cn(size === 'sm' ? "w-3 h-3" : "w-3.5 h-3.5")} />
                        <span>{config.label}</span>
                    </div>
                )
            })}
        </div>
    )
}
