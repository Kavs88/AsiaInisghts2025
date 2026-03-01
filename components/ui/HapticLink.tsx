'use client'

import Link from 'next/link'
import { ReactNode } from 'react'

interface HapticLinkProps {
    href: string
    className?: string
    children: ReactNode
    hapticPattern?: number | number[]
}

export default function HapticLink({ href, className, children, hapticPattern = 50 }: HapticLinkProps) {
    const handleClick = () => {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            // Catch potential permission issues gracefully
            try {
                navigator.vibrate(hapticPattern)
            } catch (e) {
                // Silently fail if vibration API is not allowed
            }
        }
    }

    return (
        <Link href={href} className={className} onClick={handleClick}>
            {children}
        </Link>
    )
}
