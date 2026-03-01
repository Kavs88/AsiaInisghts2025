'use client'

import { ReactNode, useState, useEffect, useRef, useCallback } from 'react'
import { cn } from '@/lib/utils'

export default function MobileActionBar({ children, className }: { children: ReactNode, className?: string }) {
    const [isVisible, setIsVisible] = useState(true)
    // useRef instead of useState — stores scroll position without triggering re-renders.
    // Previously lastScrollY was in state, which caused the useEffect to re-run (and
    // re-attach the scroll listener) on every single scroll event.
    const lastScrollYRef = useRef(0)
    // rAF token ref to cancel pending frames on cleanup
    const rafRef = useRef<number | null>(null)

    const handleScroll = useCallback(() => {
        // Cancel any pending rAF before scheduling a new one — prevents stacking frames
        if (rafRef.current !== null) {
            cancelAnimationFrame(rafRef.current)
        }

        rafRef.current = requestAnimationFrame(() => {
            const currentScrollY = window.scrollY

            if ((window.innerHeight + currentScrollY) >= document.documentElement.scrollHeight - 50) {
                // At bottom — always show
                setIsVisible(true)
            } else if (currentScrollY > lastScrollYRef.current && currentScrollY > 100) {
                // Scrolling down past threshold — hide
                setIsVisible(false)
            } else if (currentScrollY < lastScrollYRef.current) {
                // Scrolling up — show
                setIsVisible(true)
            }

            lastScrollYRef.current = currentScrollY
            rafRef.current = null
        })
    }, []) // stable — no dependencies, never recreated

    useEffect(() => {
        if (typeof window === 'undefined') return

        // Passive listener: browser can optimise scroll without waiting for preventDefault()
        window.addEventListener('scroll', handleScroll, { passive: true })

        return () => {
            window.removeEventListener('scroll', handleScroll)
            // Cancel any pending rAF on unmount to prevent setState on unmounted component
            if (rafRef.current !== null) {
                cancelAnimationFrame(rafRef.current)
            }
        }
    }, [handleScroll]) // handleScroll is stable from useCallback([])

    return (
        <div
            className={cn(
                "lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-neutral-200 p-4 pb-[env(safe-area-inset-bottom,16px)] shadow-[0_-8px_30px_rgba(0,0,0,0.08)] transition-transform duration-300",
                isVisible ? "translate-y-0" : "translate-y-[calc(100%+env(safe-area-inset-bottom,16px))]",
                className
            )}
        >
            {children}
        </div>
    )
}
