'use client'

import Link from 'next/link'
import { ArrowRight, Plane, Home, Users, Sparkles, HelpCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface JourneyBridgeProps {
    type: 'arrival-to-setup' | 'setup-to-belonging' | 'belonging-to-leverage' | 'concierge-escape'
    className?: string
}

const BRIDGE_CONFIG = {
    'arrival-to-setup': {
        title: 'Found your base? Now let\'s settle in.',
        description: 'Connect with verified services for your new home—from high-speed internet to visa support.',
        cta: 'Browse Setup Services',
        href: '/businesses?category=service',
        icon: Home,
        bg: 'bg-blue-600',
        hover: 'hover:bg-blue-700',
    },
    'setup-to-belonging': {
        title: 'You\'re all set. Ready to meet the community?',
        description: 'The best part of the region is the people. Discover local events and weekly morning markets.',
        cta: 'Explore Events',
        href: '/markets/discovery',
        icon: Users,
        bg: 'bg-primary-600',
        hover: 'hover:bg-primary-700',
    },
    'belonging-to-leverage': {
        title: 'Love the community? Start your own story.',
        description: 'Apply to host an event or list your artisan products at our upcoming Sunday Markets.',
        cta: 'Become a Contributor',
        href: '/markets/vendor/apply',
        icon: Sparkles,
        bg: 'bg-green-600',
        hover: 'hover:bg-green-700',
    },
    'concierge-escape': {
        title: 'Feeling overwhelmed?',
        description: 'Our personalized concierge service can handle the complexity for you. We take care of it all.',
        cta: 'Get Assistance',
        href: '/concierge',
        icon: HelpCircle,
        bg: 'bg-neutral-900',
        hover: 'hover:bg-neutral-800',
    }
}

export default function JourneyBridge({ type, className }: JourneyBridgeProps) {
    const config = BRIDGE_CONFIG[type]
    const Icon = config.icon

    return (
        <div className={cn("w-full py-12", className)}>
            <div className="max-w-5xl mx-auto px-6">
                <div className={cn(
                    "relative overflow-hidden rounded-2xl p-8 text-white shadow-2xl",
                    config.bg
                )}>
                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-2xl -ml-16 -mb-16" />

                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-12">
                        <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center shrink-0 backdrop-blur-md border border-white/20">
                            <Icon className="w-10 h-10 text-white" />
                        </div>

                        <div className="flex-1 text-center md:text-left">
                            <h3 className="text-2xl md:text-3xl font-black mb-3 tracking-tight">
                                {config.title}
                            </h3>
                            <p className="text-white/80 text-lg font-medium leading-relaxed max-w-2xl">
                                {config.description}
                            </p>
                        </div>

                        <Link
                            href={config.href}
                            className={cn(
                                "inline-flex items-center gap-3 px-8 py-4 bg-white text-neutral-900 font-black rounded-2xl transition-all hover:-translate-y-0.5 hover:shadow-xl shadow-lg whitespace-nowrap",
                                config.hover.replace('hover:bg-', 'hover:text-') // Simple dynamic color swap for text
                            )}
                        >
                            {config.cta}
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
