import { BadgeCheck, Users, Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EntitySignalSummaryProps {
    signals: {
        community: {
            hasRecommendations: boolean
            hasRegulars: boolean
            recommendCount: number // Kept for logic, hidden by default
            regularCount: number
        }
        founder: {
            isRecommended: boolean
        }
    }
    className?: string
}

export function EntitySignalSummary({ signals, className }: EntitySignalSummaryProps) {
    if (!signals) return null

    // Determine what to show.
    // Founder Rec > Community Rec > Community Regular

    return (
        <div className={cn("flex flex-col gap-1.5 items-start", className)}>
            {/* Founder Recommendation - Top Tier */}
            {signals.founder.isRecommended && (
                <div className="flex items-center gap-1.5 px-2 py-1 bg-neutral-900 text-white rounded-md shadow-sm border border-neutral-800">
                    <BadgeCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-[10px] font-bold tracking-wide uppercase">Asia Insights Recommends</span>
                </div>
            )}

            <div className="flex items-center gap-2 flex-wrap">
                {/* Community Recommendation */}
                {signals.community.hasRecommendations && (
                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-amber-50 text-amber-800 rounded-md border border-amber-100">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span className="text-xs font-medium">Recommended by neighbors</span>
                    </div>
                )}

                {/* Community Regulars */}
                {signals.community.hasRegulars && (
                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-blue-50 text-blue-800 rounded-md border border-blue-100">
                        <Users className="w-3 h-3 text-blue-500" />
                        <span className="text-xs font-medium">Known regulars</span>
                    </div>
                )}
            </div>
        </div>
    )
}
