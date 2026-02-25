'use client'

import { useState, useEffect } from 'react'
import { useCart } from '@/components/contexts/CartContext'
import { cn } from '@/lib/utils'
import CustomerInfoModal from './CustomerInfoModal'

interface SubmitOrderModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SubmitOrderModal({ isOpen, onClose }: SubmitOrderModalProps) {
  const { cart, getCartTotal, customerInfo } = useCart()
  const [showCustomerInfo, setShowCustomerInfo] = useState(false)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price)
  }

  const formatOrderMessage = () => {
    let message = `*Order Inquiry from Sunday Market*\n\n`

    if (customerInfo) {
      message += `*Customer Information:*\n`
      if (customerInfo.name) message += `Name: ${customerInfo.name}\n`
      if (customerInfo.phone) message += `Phone: ${customerInfo.phone}\n`
      if (customerInfo.email) message += `Email: ${customerInfo.email}\n`
      if (customerInfo.address) message += `Address: ${customerInfo.address}\n`
      message += `\n`
    }

    message += `*Items:*\n`
    cart.forEach((item, index) => {
      message += `${index + 1}. ${item.name}`
      if (item.variant) message += ` (${item.variant})`
      message += `\n   Quantity: ${item.quantity}`
      message += `\n   Price: ${formatPrice(item.price)} each`
      if (item.notes) message += `\n   Notes: ${item.notes}`
      message += `\n\n`
    })

    const total = getCartTotal()
    message += `*Total: ${formatPrice(total)}*\n\n`
    message += `Thank you for your interest! We'll contact you shortly to confirm your order.`

    return message
  }

  const handleSubmit = (method: 'whatsapp' | 'zalo' | 'email') => {
    // Check if we need customer info first
    if (!customerInfo || !customerInfo.phone) {
      setShowCustomerInfo(true)
      return
    }

    const message = formatOrderMessage()
    const encodedMessage = encodeURIComponent(message)

    switch (method) {
      case 'whatsapp':
        // Use business WhatsApp number - update this with your actual number
        const businessWhatsApp = '84386435947' // Format: country code + number without +
        window.open(`https://wa.me/${businessWhatsApp}?text=${encodedMessage}`, '_blank')
        break
      case 'zalo':
        // Use business Zalo number - update this with your actual number
        const businessZalo = '84386435947'
        // Try Zalo app first, fallback to web
        window.location.href = `zalo://chat?phone=${businessZalo}&message=${encodedMessage}`
        setTimeout(() => {
          window.open(`https://zalo.me/${businessZalo}?text=${encodedMessage}`, '_blank')
        }, 1000)
        break
      case 'email':
        const subject = encodeURIComponent('Order Inquiry - Sunday Market')
        const email = 'info@sundaymarket.com' // Update with your email
        window.location.href = `mailto:${email}?subject=${subject}&body=${encodedMessage}`
        break
    }

    onClose()
  }

  if (!isOpen) return null

  if (showCustomerInfo) {
    return (
      <CustomerInfoModal
        isOpen={showCustomerInfo}
        onClose={() => setShowCustomerInfo(false)}
        onComplete={() => setShowCustomerInfo(false)}
      />
    )
  }

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          'fixed inset-0 bg-neutral-900/60 backdrop-blur-sm z-[10000] transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className={cn(
          'fixed inset-0 z-[10001] flex items-center justify-center p-4',
          isOpen ? 'pointer-events-auto' : 'pointer-events-none'
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Submit order"
      >
        <div
          className={cn(
            'bg-white rounded-2xl shadow-xl max-w-md w-full transform transition-all duration-300',
            isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-neutral-200">
            <h2 className="text-2xl font-bold text-neutral-900">Submit Your Order</h2>
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-neutral-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="p-6">
            <p className="text-neutral-600 mb-6">Choose how you'd like to send your order:</p>
            <div className="grid grid-cols-1 gap-4">
              <button
                onClick={() => handleSubmit('whatsapp')}
                className="flex items-center gap-4 p-4 bg-[#25D366] hover:bg-[#20BA5A] text-white rounded-xl transition-all hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:ring-offset-2"
              >
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
                <span className="text-lg font-semibold">WhatsApp</span>
              </button>

              <button
                onClick={() => handleSubmit('zalo')}
                className="flex items-center gap-4 p-4 bg-[#0068FF] hover:bg-[#0052CC] text-white rounded-xl transition-all hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#0068FF] focus:ring-offset-2"
              >
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12c0 1.54.36 2.98.97 4.29L1 23l6.71-1.97C9.02 21.64 10.46 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm0 18c-1.33 0-2.57-.36-3.64-.99l-.24-.14-2.49.73.73-2.49-.14-.24C5.36 14.57 5 13.33 5 12c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7z" />
                  <path d="M12.5 8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-4 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm8 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                </svg>
                <span className="text-lg font-semibold">Zalo</span>
              </button>

              <button
                onClick={() => handleSubmit('email')}
                className="flex items-center gap-4 p-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition-all hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-lg font-semibold">Email</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

