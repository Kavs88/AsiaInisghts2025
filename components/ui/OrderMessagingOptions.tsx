'use client'

import { useState } from 'react'

interface OrderMessagingOptionsProps {
  vendor: {
    name: string
    contactPhone?: string | null
    contactEmail?: string | null
  }
  orderDetails: {
    productName: string
    customerName: string
    customerEmail: string
    customerPhone?: string
    quantity: number
    intentType: 'pickup' | 'delivery'
    marketDate?: string
    marketLocation?: string
    customerNotes?: string | null
  }
  onMessageSent?: () => void
}

export default function OrderMessagingOptions({
  vendor,
  orderDetails,
  onMessageSent,
}: OrderMessagingOptionsProps) {
  const [selectedMethod, setSelectedMethod] = useState<'whatsapp' | 'zalo' | 'email' | null>(null)

  // Format order message for email (plain text, email-friendly)
  const formatOrderMessage = (forEmail: boolean = false): string => {
    const intentTypeLabel = orderDetails.intentType === 'pickup' ? 'Market Pickup' : 'Delivery'
    
    // Email format (plain text, no markdown)
    if (forEmail) {
      let message = `Order Inquiry from Sunday Market\n\n`
      
      message += `Customer Information:\n`
      message += `Name: ${orderDetails.customerName}\n`
      if (orderDetails.customerPhone) {
        message += `Phone: ${orderDetails.customerPhone}\n`
      }
      message += `Email: ${orderDetails.customerEmail}\n`
      message += `\n`

      message += `Order Details:\n`
      message += `Product: ${orderDetails.productName}\n`
      message += `Quantity: ${orderDetails.quantity}\n`
      message += `Type: ${intentTypeLabel}\n`
      
      if (orderDetails.marketDate) {
        const marketDateFormatted = new Date(orderDetails.marketDate).toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        })
        message += `Market Date: ${marketDateFormatted}\n`
      }
      
      if (orderDetails.marketLocation) {
        message += `Location: ${orderDetails.marketLocation}\n`
      }
      
      if (orderDetails.customerNotes) {
        message += `Notes: ${orderDetails.customerNotes}\n`
      }
      
      message += `\n`
      message += `Thank you for your interest! We'll contact you shortly to confirm your order.`
      
      return message
    }
    
    // WhatsApp/Zalo format (with markdown)
    let message = `*Order Inquiry from Sunday Market*\n\n`
    
    message += `*Customer Information:*\n`
    message += `Name: ${orderDetails.customerName}\n`
    if (orderDetails.customerPhone) {
      message += `Phone: ${orderDetails.customerPhone}\n`
    }
    message += `Email: ${orderDetails.customerEmail}\n`
    message += `\n`

    message += `*Order Details:*\n`
    message += `Product: ${orderDetails.productName}\n`
    message += `Quantity: ${orderDetails.quantity}\n`
    message += `Type: ${intentTypeLabel}\n`
    
    if (orderDetails.marketDate) {
      const marketDateFormatted = new Date(orderDetails.marketDate).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
      message += `Market Date: ${marketDateFormatted}\n`
    }
    
    if (orderDetails.marketLocation) {
      message += `Location: ${orderDetails.marketLocation}\n`
    }
    
    if (orderDetails.customerNotes) {
      message += `Notes: ${orderDetails.customerNotes}\n`
    }
    
    message += `\n`
    message += `Thank you for your interest! We'll contact you shortly to confirm your order.`

    return message
  }

  const handleMessaging = (method: 'whatsapp' | 'zalo' | 'email') => {
    let url = ''

    // Use business contact info (Sunday Market) instead of vendor's
    // You can set these in environment variables or config
    const businessWhatsApp = process.env.NEXT_PUBLIC_BUSINESS_WHATSAPP || '84386435947' // Default from other project
    const businessZalo = process.env.NEXT_PUBLIC_BUSINESS_ZALO || '84386435947' // Default from other project
    const businessEmail = process.env.NEXT_PUBLIC_BUSINESS_EMAIL || vendor.contactEmail || 'info@sundaymarket.com'

    switch (method) {
      case 'whatsapp':
        // Format phone number (remove all non-digits)
        const whatsappPhone = businessWhatsApp.replace(/[^0-9]/g, '')
        const whatsappMessage = formatOrderMessage(false) // WhatsApp format with markdown
        const encodedWhatsAppMessage = encodeURIComponent(whatsappMessage)
        url = `https://wa.me/${whatsappPhone}?text=${encodedWhatsAppMessage}`
        window.open(url, '_blank')
        break

      case 'zalo':
        // Format phone number for Zalo
        const zaloPhone = businessZalo.replace(/[^0-9]/g, '')
        const zaloMessage = formatOrderMessage(false) // Zalo format with markdown
        const encodedZaloMessage = encodeURIComponent(zaloMessage)
        // Try Zalo app first (use proper format)
        const zaloAppUrl = `zalo://chat?phone=${zaloPhone}&message=${encodedZaloMessage}`
        
        // Try to open Zalo app
        const iframe = document.createElement('iframe')
        iframe.style.display = 'none'
        iframe.src = zaloAppUrl
        document.body.appendChild(iframe)
        
        // Fallback to web if app not available
        setTimeout(() => {
          document.body.removeChild(iframe)
          window.open(`https://zalo.me/${zaloPhone}?text=${encodedZaloMessage}`, '_blank')
        }, 500)
        break

      case 'email':
        // Email format (plain text, no markdown)
        const emailMessage = formatOrderMessage(true) // Email format (plain text)
        const encodedEmailMessage = encodeURIComponent(emailMessage)
        const subject = encodeURIComponent(`Order Inquiry - ${orderDetails.productName} - ${vendor.name}`)
        url = `mailto:${businessEmail}?subject=${subject}&body=${encodedEmailMessage}`
        // Open user's default email client
        window.location.href = url
        break
    }

    setSelectedMethod(method)
    if (onMessageSent) {
      onMessageSent()
    }
  }

  // Determine available methods (always available since we use business number)
  const businessWhatsApp = process.env.NEXT_PUBLIC_BUSINESS_WHATSAPP || '84386435947'
  const businessZalo = process.env.NEXT_PUBLIC_BUSINESS_ZALO || '84386435947'
  const businessEmail = process.env.NEXT_PUBLIC_BUSINESS_EMAIL || vendor.contactEmail || 'info@sundaymarket.com'
  
  const hasWhatsApp = !!businessWhatsApp
  const hasZalo = !!businessZalo
  const hasEmail = !!businessEmail

  return (
    <div className="space-y-4">
      <p className="text-sm text-neutral-600 mb-4">
        Choose how you'd like to send your order inquiry:
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {hasWhatsApp && (
          <button
            onClick={() => handleMessaging('whatsapp')}
            className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-neutral-200 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition-all focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <span className="text-3xl">📱</span>
            <span className="font-medium text-neutral-900">WhatsApp</span>
            <span className="text-xs text-neutral-500">Open WhatsApp</span>
          </button>
        )}

        {hasZalo && (
          <button
            onClick={() => handleMessaging('zalo')}
            className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-neutral-200 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition-all focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <span className="text-3xl">💬</span>
            <span className="font-medium text-neutral-900">Zalo</span>
            <span className="text-xs text-neutral-500">Open Zalo</span>
          </button>
        )}

        {hasEmail && (
          <button
            onClick={() => handleMessaging('email')}
            className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-neutral-200 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition-all focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <span className="text-3xl">✉️</span>
            <span className="font-medium text-neutral-900">Email</span>
            <span className="text-xs text-neutral-500">Open Email</span>
          </button>
        )}
      </div>

      {selectedMethod && (
        <div className="p-3 bg-success-50 border border-success-200 rounded-lg">
          <p className="text-sm text-success-800">
            ✓ Opening {selectedMethod === 'whatsapp' ? 'WhatsApp' : selectedMethod === 'zalo' ? 'Zalo' : 'Email'}...
          </p>
        </div>
      )}
    </div>
  )
}

