'use client'

import dynamic from 'next/dynamic'

interface InteractiveMapProps {
    center: [number, number]
    zoom?: number
    markers?: Array<{
        position: [number, number]
        label?: string
    }>
    className?: string
}

// Hoisted to module scope — created once at module initialisation, never recreated.
// Previously called inside useMemo([props.className]) which created a new component
// reference on every className change, causing full unmount → remount → tile refetch.
const MapInnerDynamic = dynamic(() => import('./MapInner'), {
    loading: () => (
        <div className="w-full h-full bg-neutral-100 flex items-center justify-center rounded-2xl" style={{ minHeight: '300px' }}>
            <div className="text-neutral-400 font-medium">Loading Map...</div>
        </div>
    ),
    ssr: false,
})

export default function InteractiveMap({ className, ...props }: InteractiveMapProps) {
    return (
        <div className={className}>
            <MapInnerDynamic className={className} {...props} />
        </div>
    )
}
