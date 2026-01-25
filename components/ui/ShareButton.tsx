'use client'

import { useState } from 'react'
import { Check, Share2, MessageCircle, Facebook } from 'lucide-react'

interface ShareButtonProps {
  name: string
  type?: 'vendor' | 'business' | 'property' | 'event'
  title?: string
  description?: string
  variant?: 'default' | 'minimal' | 'expanded'
}

export default function ShareButton({
  name,
  type = 'vendor',
  title,
  description,
  variant = 'default'
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false)
  const [showOptions, setShowOptions] = useState(false)

  const shareTitle = title || `${name} | Asia Insights`
  const shareText = description || `Check out ${name} on Asia Insights`
  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''

  const handleNativeShare = async () => {
    if (typeof window === 'undefined') return

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        })
        setShowOptions(false)
      } catch (err) {
        // User cancelled or error occurred
      }
    } else {
      // Fallback: show options
      setShowOptions(!showOptions)
    }
  }

  const handleCopyLink = async () => {
    if (typeof window === 'undefined') return

    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => {
        setCopied(false)
        setShowOptions(false)
      }, 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(`${shareText} ${shareUrl}`)
    window.open(`https://wa.me/?text=${text}`, '_blank')
    setShowOptions(false)
  }

  const handleFacebookShare = () => {
    const url = encodeURIComponent(shareUrl)
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank', 'width=600,height=400')
    setShowOptions(false)
  }

  if (variant === 'minimal') {
    return (
      <button
        onClick={handleCopyLink}
        className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
        aria-label="Share"
      >
        {copied ? (
          <Check className="w-5 h-5 text-emerald-600" />
        ) : (
          <Share2 className="w-5 h-5 text-neutral-600" />
        )}
      </button>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={handleNativeShare}
        className={`flex items-center justify-center gap-2 px-5 py-3 bg-white hover:bg-neutral-50 text-neutral-700 font-semibold rounded-xl border border-neutral-200 transition-all shadow-sm hover:shadow-md ${copied ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : ''
          }`}
        aria-label={`Share ${type} profile`}
      >
        {copied ? (
          <>
            <Check className="w-5 h-5 text-emerald-600" />
            <span className="hidden sm:inline">Link Copied!</span>
          </>
        ) : (
          <>
            <Share2 className="w-5 h-5" />
            <span className="hidden sm:inline">Share</span>
          </>
        )}
      </button>

      {/* Quick Share Options Dropdown */}
      {showOptions && !navigator.share && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-neutral-200 overflow-hidden z-50 animate-fade-in">
          <button
            onClick={handleCopyLink}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 transition-colors text-left"
          >
            {copied ? (
              <>
                <Check className="w-5 h-5 text-emerald-600" />
                <span className="text-sm font-semibold text-emerald-700">Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-5 h-5 text-neutral-600" />
                <span className="text-sm font-semibold text-neutral-900">Copy Link</span>
              </>
            )}
          </button>

          <div className="h-px bg-neutral-100" />

          <button
            onClick={handleWhatsAppShare}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 transition-colors text-left"
          >
            <MessageCircle className="w-5 h-5 text-[#25D366]" />
            <span className="text-sm font-semibold text-neutral-900">WhatsApp</span>
          </button>

          <button
            onClick={handleFacebookShare}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 transition-colors text-left"
          >
            <Facebook className="w-5 h-5 text-[#1877F2]" />
            <span className="text-sm font-semibold text-neutral-900">Facebook</span>
          </button>
        </div>
      )}

      {/* Click outside to close */}
      {showOptions && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowOptions(false)}
        />
      )}
    </div>
  )
}
