'use client'

import dynamic from 'next/dynamic'
import { useMemo } from 'react'

interface InteractiveMapProps {
    center: [number, number]
    zoom?: number
    markers?: Array<{
        position: [number, number]
        label?: string
    }>
    className?: string
}

export default function InteractiveMap(props: InteractiveMapProps) {
    const Map = useMemo(
        () =>
            dynamic(() => import('./MapInner'), {
                loading: () => (
                    <div className={`bg-neutral-100 flex items-center justify-center rounded-2xl ${props.className}`} style={{ minHeight: '300px' }}>
                        <div className="text-neutral-400 font-medium">Loading Map...</div>
                    </div>
                ),
                ssr: false,
            }),
        [props.className]
    )

    return <Map {...props} />
}
