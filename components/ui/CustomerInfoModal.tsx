'use client'

import { useState, useEffect } from 'react'
import { useCart } from '@/components/contexts/CartContext'
import { cn } from '@/lib/utils'

interface CustomerInfoModalProps {
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
}

export default function CustomerInfoModal({ isOpen, onClose, onComplete }: CustomerInfoModalProps) {
  const { customerInfo, saveCustomerInfo } = useCart()
  const [formData, setFormData] = useState({
    name: customerInfo?.name || '',
    phone: customerInfo?.phone || '',
    email: customerInfo?.email || '',
    address: customerInfo?.address || '',
  })

  useEffect(() => {
    if (customerInfo) {
      setFormData({
        name: customerInfo.name || '',
        phone: customerInfo.phone || '',
        email: customerInfo.email || '',
        address: customerInfo.address || '',
      })
    }
  }, [customerInfo])

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.phone) {
      alert('Please fill in name and phone number')
      return
    }
    saveCustomerInfo({
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim() || undefined,
      address: formData.address.trim() || undefined,
    })
    onComplete()
  }

  if (!isOpen) return null

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
        aria-label="Customer information"
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
            <h2 className="text-2xl font-bold text-neutral-900">Your Information</h2>
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
          <form onSubmit={handleSubmit} className="p-6">
            <p className="text-neutral-600 mb-6 text-sm">
              Please provide your contact information to proceed with your order:
            </p>

            <div className="space-y-4">
              <div>
                <label htmlFor="customer-name" className="block text-sm font-semibold text-neutral-900 mb-2">
                  Name <span className="text-error-600">*</span>
                </label>
                <input
                  type="text"
                  id="customer-name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label htmlFor="customer-phone" className="block text-sm font-semibold text-neutral-900 mb-2">
                  Phone Number <span className="text-error-600">*</span>
                </label>
                <input
                  type="tel"
                  id="customer-phone"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label htmlFor="customer-email" className="block text-sm font-semibold text-neutral-900 mb-2">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  id="customer-email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label htmlFor="customer-address" className="block text-sm font-semibold text-neutral-900 mb-2">
                  Address (Optional)
                </label>
                <input
                  type="text"
                  id="customer-address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 font-medium rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                Continue
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}


