'use client'

import { useState, useTransition, useEffect } from 'react'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import { recommendEntity, unrecommendEntity, getEntitySignals } from '@/lib/actions/signals'

import Toast, { ToastType } from './Toast'

interface EntitySignalButtonsProps {
    entityId: string
    initialUserSignals?: {
        isRecommended: boolean
        // isRegular removed
    }
    className?: string
    minimal?: boolean
}

export function EntitySignalButtons({ entityId, initialUserSignals, className, minimal = false }: EntitySignalButtonsProps) {
    const [status, setStatus] = useState(initialUserSignals || { isRecommended: false })
    const [isPending, startTransition] = useTransition()
    const [hasLoaded, setHasLoaded] = useState(!!initialUserSignals)
    const [toast, setToast] = useState<{ message: string; type: ToastType; visible: boolean }>({ message: '', type: 'info', visible: false })

    useEffect(() => {
        if (!initialUserSignals) {
            const checkStatus = async () => {
                try {
                    const data = await getEntitySignals(entityId)
                    // We only care about isRecommended now
                    setStatus({ isRecommended: data.user.isRecommended })
                } catch (error) {
                    // Ignore, default to false
                } finally {
                    setHasLoaded(true)
                }
            }
            checkStatus()
        }
    }, [entityId, initialUserSignals])

    const handleRecommend = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        const newIsRecommended = !status.isRecommended
        setStatus(prev => ({ ...prev, isRecommended: newIsRecommended }))

        if (newIsRecommended && typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(50)
            setToast({ message: 'Recommended this business!', type: 'success', visible: true })
        }

        startTransition(async () => {
            try {
                if (newIsRecommended) {
                    await recommendEntity(entityId)
                } else {
                    await unrecommendEntity(entityId)
                }
            } catch (error) {
                setStatus(prev => ({ ...prev, isRecommended: !newIsRecommended }))
                console.error('Recommend action failed:', error)
            }
        })
    }

    if (!hasLoaded && !minimal) {
        // Prevent layout shift if possible, or render disabled state
        return (
            <div className={cn("flex gap-2", className)}>
                <div className="h-9 w-24 bg-neutral-100 rounded-xl animate-pulse" />
            </div>
        )
    }

    return (
        <>
            <div className={cn("flex items-center gap-2", className)}>
                {/* Recommend Button */}
                <button
                    onClick={handleRecommend}
                    disabled={isPending}
                    className={cn(
                        "group transition-all duration-300 ease-out flex items-center justify-center gap-1.5 transform active:scale-90",
                        minimal
                            ? "p-2 rounded-full hover:bg-amber-50"
                            : "px-3 py-1.5 rounded-lg border text-xs font-semibold",
                        status.isRecommended
                            ? "bg-amber-100 border-amber-200 text-amber-700 shadow-[0_0_15px_rgba(251,191,36,0.2)]"
                            : "bg-white border-neutral-200 text-neutral-500 hover:border-amber-200 hover:text-amber-600"
                    )}
                    title="I recommend this"
                >
                    <Star
                        className={cn(
                            "transition-all duration-300",
                            minimal ? "w-4 h-4" : "w-3.5 h-3.5",
                            status.isRecommended ? "fill-amber-500 text-amber-500 scale-110" : "text-current scale-100 group-hover:scale-110"
                        )}
                    />
                    {!minimal && (
                        <span>{status.isRecommended ? 'Recommended' : 'Recommend'}</span>
                    )}
                </button>
            </div>
            <Toast
                message={toast.message}
                type={toast.type}
                isVisible={toast.visible}
                onClose={() => setToast(prev => ({ ...prev, visible: false }))}
                duration={3000}
            />
        </>
    )
}
