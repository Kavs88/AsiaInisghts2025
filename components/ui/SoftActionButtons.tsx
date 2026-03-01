'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Bookmark } from 'lucide-react'
import { cn } from '@/lib/utils'
import { saveItem, unsaveItem, getSavedStatus } from '@/lib/actions/social'
import Toast, { ToastType } from './Toast'

// --- Save Button ---

interface SaveButtonProps {
    itemType: 'event' | 'product' | 'property' | 'entity'
    itemId: string
    initialIsSaved?: boolean
    className?: string
    minimal?: boolean
}

export function SaveButton({ itemType, itemId, initialIsSaved, className, minimal = false }: SaveButtonProps) {
    const router = useRouter()
    const [isSaved, setIsSaved] = useState(!!initialIsSaved)
    const [isPending, startTransition] = useTransition()
    const [hasLoaded, setHasLoaded] = useState(initialIsSaved !== undefined)
    const [toast, setToast] = useState<{ message: string; type: ToastType; visible: boolean }>({ message: '', type: 'info', visible: false })

    useEffect(() => {
        if (initialIsSaved === undefined) {
            const checkStatus = async () => {
                try {
                    const status = await getSavedStatus(itemType, itemId)
                    setIsSaved(status)
                } catch (error) {
                    // Ignore
                } finally {
                    setHasLoaded(true)
                }
            }
            checkStatus()
        }
    }, [itemType, itemId, initialIsSaved])

    const handleToggle = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        // Check auth status — redirect unauthenticated users to sign-in
        const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/'

        // Optimistic update
        const newState = !isSaved
        setIsSaved(newState)

        if (newState && typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(50)
            setToast({ message: 'Saved to your list!', type: 'success', visible: true })
        }

        startTransition(async () => {
            try {
                if (newState) {
                    await saveItem(itemType, itemId)
                } else {
                    await unsaveItem(itemType, itemId)
                }
            } catch (error: any) {
                // If server returns Unauthorized, redirect to sign-in
                if (error?.message === 'Unauthorized') {
                    router.push(`/auth/login?next=${encodeURIComponent(currentPath)}`)
                    setIsSaved(false)
                    return
                }
                // Revert optimistic update on other errors
                setIsSaved(!newState)
                console.error('Save action failed:', error)
            }
        })
    }

    return (
        <>
            <button
                onClick={handleToggle}
                disabled={isPending}
                className={cn(
                    "group transition-all duration-300 ease-out flex items-center justify-center gap-2 transform active:scale-95",
                    minimal
                        ? "p-2 rounded-full hover:bg-neutral-100"
                        : "px-4 py-2 rounded-xl border font-bold text-sm",
                    isSaved
                        ? "bg-neutral-100 border-neutral-200 text-primary-600 shadow-[0_0_15px_rgba(234,88,12,0.15)]"
                        : "bg-white border-neutral-200 text-neutral-600 hover:border-neutral-300 hover:text-neutral-900",
                    className
                )}
                aria-label={isSaved ? "Unsave" : "Save"}
            >
                <Bookmark
                    className={cn(
                        "transition-all duration-300",
                        minimal ? "w-5 h-5" : "w-4 h-4",
                        isSaved ? "fill-primary-600 text-primary-600 scale-110" : "text-neutral-500 group-hover:text-neutral-900 scale-100 group-hover:scale-110"
                    )}
                />
                {!minimal && (
                    <span className={cn(isPending && "opacity-70")}>
                        {isSaved ? 'Saved' : 'Save'}
                    </span>
                )}
            </button>
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
