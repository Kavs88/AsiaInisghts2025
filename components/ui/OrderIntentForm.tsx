'use client'

import { useState, FormEvent, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Toast, { ToastType } from './Toast'
import OrderMessagingOptions from './OrderMessagingOptions'

interface OrderIntentFormProps {
  productId: string
  vendorId: string
  marketDayId: string
  intentType: 'pickup' | 'delivery'
  productName: string
  onSuccess: () => void
  onClose: () => void
}

export default function OrderIntentForm({
  productId,
  vendorId,
  marketDayId,
  intentType,
  productName,
  onSuccess,
  onClose,
}: OrderIntentFormProps) {
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    quantity: 1,
    customerNotes: '',
  })
  const [vendorInfo, setVendorInfo] = useState<{
    name: string
    contactPhone?: string | null
    contactEmail?: string | null
  } | null>(null)
  const [marketDayInfo, setMarketDayInfo] = useState<{
    marketDate?: string
    locationName?: string
  } | null>(null)
  const [showMessagingOptions, setShowMessagingOptions] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: ToastType; visible: boolean }>({
    message: '',
    type: 'info',
    visible: false,
  })

  // Fetch vendor and market day info on mount
  useEffect(() => {
    async function fetchInfo() {
      try {
        const supabase = createClient()
        const [vendorResult, marketDayResult] = await Promise.all([
          supabase
            .from('vendors')
            .select('name, contact_phone, contact_email')
            .eq('id', vendorId)
            .single(),
          supabase
            .from('market_days')
            .select('market_date, location_name')
            .eq('id', marketDayId)
            .single(),
        ]) as any

        if (vendorResult.data) {
          setVendorInfo({
            name: vendorResult.data.name,
            contactPhone: vendorResult.data.contact_phone,
            contactEmail: vendorResult.data.contact_email,
          })
        }

        if (marketDayResult.data) {
          setMarketDayInfo({
            marketDate: marketDayResult.data.market_date,
            locationName: marketDayResult.data.location_name || undefined,
          })
        }
      } catch (error) {
        console.error('Error fetching vendor/market info:', error)
      }
    }
    fetchInfo()
  }, [vendorId, marketDayId])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    // Validation
    if (!formData.customerName.trim()) {
      showToast('Please enter your name', 'error')
      return
    }

    if (!formData.customerEmail.trim() || !formData.customerEmail.includes('@')) {
      showToast('Please enter a valid email address', 'error')
      return
    }

    if (formData.quantity < 1) {
      showToast('Quantity must be at least 1', 'error')
      return
    }

    // Show messaging options instead of submitting to database
    setShowMessagingOptions(true)
  }

  const handleMessageSent = async () => {
    // Optionally save to database after messaging (non-blocking)
    try {
      const supabase = createClient()
      await supabase
        .from('order_intents')
        // @ts-ignore
        .insert({
          product_id: productId,
          vendor_id: vendorId,
          market_day_id: marketDayId,
          intent_type: intentType,
          quantity: formData.quantity,
          customer_name: formData.customerName.trim(),
          customer_email: formData.customerEmail.trim(),
          customer_notes: formData.customerNotes.trim() || null,
          status: 'pending',
        })
    } catch (error) {
      // Log but don't block - messaging is the primary action
      console.error('Failed to save order intent to database:', error)
    }

    showToast('Your order inquiry has been sent!', 'success')

    // Close modal after short delay
    setTimeout(() => {
      onSuccess()
      onClose()
    }, 2000)
  }

  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type, visible: true })
  }

  const handleCloseToast = () => {
    setToast({ ...toast, visible: false })
  }

  if (showMessagingOptions && vendorInfo) {
    return (
      <>
        <div className="space-y-4">
          <div className="p-4 bg-primary-50 border border-primary-200 rounded-xl">
            <h3 className="font-semibold text-primary-900 mb-2">Order Summary</h3>
            <div className="text-sm text-primary-800 space-y-1">
              <p><strong>Product:</strong> {productName}</p>
              <p><strong>Quantity:</strong> {formData.quantity}</p>
              <p><strong>Type:</strong> {intentType === 'pickup' ? 'Market Pickup' : 'Delivery'}</p>
              <p><strong>Customer:</strong> {formData.customerName}</p>
            </div>
          </div>

          <OrderMessagingOptions
            vendor={vendorInfo}
            orderDetails={{
              productName,
              customerName: formData.customerName,
              customerEmail: formData.customerEmail,
              customerPhone: formData.customerPhone,
              quantity: formData.quantity,
              intentType,
              marketDate: marketDayInfo?.marketDate,
              marketLocation: marketDayInfo?.locationName,
              customerNotes: formData.customerNotes,
            }}
            onMessageSent={handleMessageSent}
          />
        </div>

        <div className="mt-4 pt-4 border-t border-neutral-200">
          <button
            onClick={() => setShowMessagingOptions(false)}
            className="w-full px-4 py-2 text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            ← Back to edit details
          </button>
        </div>

        <Toast
          message={toast.message}
          type={toast.type}
          isVisible={toast.visible}
          onClose={handleCloseToast}
        />
      </>
    )
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <p className="text-sm text-neutral-600 mb-4">
            {intentType === 'pickup'
              ? `Reserve ${productName} for pickup at the next market day.`
              : `Request delivery for ${productName}.`}
          </p>
        </div>

        <div>
          <label htmlFor="customerName" className="block text-sm font-medium text-neutral-900 mb-2">
            Your Name <span className="text-error-600">*</span>
          </label>
          <input
            type="text"
            id="customerName"
            required
            value={formData.customerName}
            onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
            className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
            placeholder="John Doe"
            disabled={isLoading}
          />
        </div>

        <div>
          <label htmlFor="customerEmail" className="block text-sm font-medium text-neutral-900 mb-2">
            Email Address <span className="text-error-600">*</span>
          </label>
          <input
            type="email"
            id="customerEmail"
            required
            value={formData.customerEmail}
            onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
            className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
            placeholder="john@example.com"
            disabled={isLoading}
          />
        </div>

        <div>
          <label htmlFor="customerPhone" className="block text-sm font-medium text-neutral-900 mb-2">
            Phone Number (Optional)
          </label>
          <input
            type="tel"
            id="customerPhone"
            value={formData.customerPhone}
            onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
            className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
            placeholder="+84 123 456 789"
            disabled={isLoading}
          />
        </div>

        <div>
          <label htmlFor="quantity" className="block text-sm font-medium text-neutral-900 mb-2">
            Quantity <span className="text-error-600">*</span>
          </label>
          <input
            type="number"
            id="quantity"
            required
            min="1"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
            className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
            disabled={isLoading}
          />
        </div>

        <div>
          <label htmlFor="customerNotes" className="block text-sm font-medium text-neutral-900 mb-2">
            Notes (Optional)
          </label>
          <textarea
            id="customerNotes"
            rows={3}
            value={formData.customerNotes}
            onChange={(e) => setFormData({ ...formData, customerNotes: e.target.value })}
            className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors resize-none"
            placeholder="Any special requests or instructions..."
            disabled={isLoading}
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-6 py-3 border border-neutral-300 text-neutral-700 font-medium rounded-xl hover:bg-neutral-50 transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-500"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 px-6 py-3 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {intentType === 'pickup' ? 'Continue to Send Order' : 'Continue to Send Order'}
          </button>
        </div>
      </form>

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.visible}
        onClose={handleCloseToast}
      />
    </>
  )
}

