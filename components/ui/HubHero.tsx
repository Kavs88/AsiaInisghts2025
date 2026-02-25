'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'

interface HubHeroProps {
    title: string
    subtitle: string
    imageUrl?: string
    className?: string
    children?: React.ReactNode
    variant?: 'events' | 'markets' | 'businesses' | 'concierge' | 'default'
    anchorId?: string
    contentClassName?: string
    titleClassName?: string
}

export default function HubHero({
    title,
    subtitle,
    imageUrl,
    className,
    children,
    variant = 'default',
    anchorId,
    contentClassName,
    titleClassName
}: HubHeroProps) {
    // Define themes based on variant
    const themes = {
        events: 'from-neutral-900 via-neutral-900/40 to-transparent',
        markets: 'from-primary-900 via-primary-900/40 to-transparent',
        businesses: 'from-neutral-900 via-neutral-900/40 to-transparent',
        concierge: 'from-primary-900 via-primary-900/40 to-transparent',
        default: 'from-black/80 via-black/40 to-black/20'
    }

    const selectedTheme = themes[variant] || themes.default

    return (
        <section className={cn(
            "relative min-h-[50vh] flex items-center bg-neutral-900 overflow-hidden",
            className
        )}>
            {/* Background Layer */}
            <div className="absolute inset-0 z-0">
                <div className={cn("absolute inset-0 z-10", selectedTheme)} />
                {imageUrl ? (
                    <Image
                        src={imageUrl}
                        alt={title}
                        fill
                        className="object-cover opacity-60"
                        priority
                        sizes="100vw"
                    />
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-neutral-800 to-neutral-700 opacity-50" />
                )}
            </div>

            {/* Content Layer */}
            <div className={cn("max-w-7xl mx-auto px-6 lg:px-8 relative z-20 py-24 lg:py-32", contentClassName)}>
                <div className="max-w-4xl animate-fade-up">
                    <h1 className={cn("text-5xl lg:text-7xl xl:text-8xl font-black text-white mb-6 leading-[0.9] tracking-tight", titleClassName)}>
                        {title}
                    </h1>
                    <p className="text-xl lg:text-2xl text-white/90 mb-10 leading-relaxed font-light max-w-2xl">
                        {subtitle}
                    </p>
                    {children && (
                        <div className="flex flex-wrap gap-4">
                            {children}
                        </div>
                    )}
                </div>
            </div>

            {/* Scroll Indicator */}
            {anchorId && (
                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 animate-bounce">
                    <a href={`#${anchorId}`} className="text-white/40 hover:text-white transition-colors">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                    </a>
                </div>
            )}
        </section>
    )
}
