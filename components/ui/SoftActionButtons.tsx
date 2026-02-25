'use client'

import { useState, useTransition, useEffect } from 'react'
import { Bookmark } from 'lucide-react'
import { cn } from '@/lib/utils'
import { saveItem, unsaveItem, getSavedStatus } from '@/lib/actions/social'

// --- Save Button ---

interface SaveButtonProps {
    itemType: 'event' | 'product' | 'property' | 'entity'
    itemId: string
    initialIsSaved?: boolean
    className?: string
    minimal?: boolean
}

export function SaveButton({ itemType, itemId, initialIsSaved, className, minimal = false }: SaveButtonProps) {
    const [isSaved, setIsSaved] = useState(!!initialIsSaved)
    const [isPending, startTransition] = useTransition()
    const [hasLoaded, setHasLoaded] = useState(initialIsSaved !== undefined)

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

        // Optimistic update
        const newState = !isSaved
        setIsSaved(newState)

        startTransition(async () => {
            try {
                if (newState) {
                    await saveItem(itemType, itemId)
                } else {
                    await unsaveItem(itemType, itemId)
                }
            } catch (error) {
                // Revert on error
                setIsSaved(!newState)
                console.error('Save action failed:', error)
            }
        })
    }

    return (
        <button
            onClick={handleToggle}
            disabled={isPending}
            className={cn(
                "group transition-all duration-200 ease-out flex items-center justify-center gap-2",
                minimal
                    ? "p-2 rounded-full hover:bg-neutral-100"
                    : "px-4 py-2 rounded-xl border font-bold text-sm",
                isSaved
                    ? "bg-neutral-100 border-neutral-200 text-primary-600"
                    : "bg-white border-neutral-200 text-neutral-600 hover:border-neutral-300 hover:text-neutral-900",
                className
            )}
            aria-label={isSaved ? "Unsave" : "Save"}
        >
            <Bookmark
                className={cn(
                    "transition-transform group-active:scale-90",
                    minimal ? "w-5 h-5" : "w-4 h-4",
                    isSaved ? "fill-primary-600 text-primary-600" : "text-neutral-500 group-hover:text-neutral-900"
                )}
            />
            {!minimal && (
                <span className={cn(isPending && "opacity-70")}>
                    {isSaved ? 'Saved' : 'Save'}
                </span>
            )}
        </button>
    )
}
