'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Toast, { ToastType } from './Toast'

interface VendorNotificationSettingsProps {
  vendorId: string
  initialChannel?: 'email' | 'whatsapp' | 'zalo' | null
  initialTarget?: string | null
  contactEmail?: string | null
}

export default function VendorNotificationSettings({
  vendorId,
  initialChannel = 'email',
  initialTarget,
  contactEmail,
}: VendorNotificationSettingsProps) {
  const [channel, setChannel] = useState<'email' | 'whatsapp' | 'zalo'>(initialChannel || 'email')
  const [target, setTarget] = useState(initialTarget || contactEmail || '')
  const [isSaving, setIsSaving] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: ToastType; visible: boolean }>({
    message: '',
    type: 'info',
    visible: false,
  })

  useEffect(() => {
    setChannel(initialChannel || 'email')
    setTarget(initialTarget || contactEmail || '')
  }, [initialChannel, initialTarget, contactEmail])

  const handleSave = async () => {
    // Validation
    if (!target.trim()) {
      showToast('Please enter a notification target', 'error')
      return
    }

    if (channel === 'email' && !target.includes('@')) {
      showToast('Please enter a valid email address', 'error')
      return
    }

    if (channel === 'whatsapp' && !/^\+?[1-9]\d{1,14}$/.test(target.replace(/\s/g, ''))) {
      showToast('Please enter a valid phone number (e.g., +1234567890)', 'error')
      return
    }

    setIsSaving(true)

    try {
      const supabase = createClient()

      const { error } = await supabase
        .from('vendors')
        // @ts-ignore
        .update({
          notification_channel: channel,
          notification_target: target.trim(),
        })
        .eq('id', vendorId)

      if (error) {
        throw error
      }

      showToast('Notification preferences saved successfully', 'success')
    } catch (error: any) {
      console.error('Error saving notification preferences:', error)
      showToast(
        error.message || 'Failed to save preferences. Please try again.',
        'error'
      )
    } finally {
      setIsSaving(false)
    }
  }

  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type, visible: true })
  }

  const handleCloseToast = () => {
    setToast({ ...toast, visible: false })
  }

  const getPlaceholder = () => {
    switch (channel) {
      case 'email':
        return 'vendor@example.com'
      case 'whatsapp':
        return '+1234567890'
      case 'zalo':
        return 'Zalo ID or phone number'
      default:
        return ''
    }
  }

  const getLabel = () => {
    switch (channel) {
      case 'email':
        return 'Email Address'
      case 'whatsapp':
        return 'WhatsApp Number'
      case 'zalo':
        return 'Zalo ID'
      default:
        return 'Target'
    }
  }

  return (
    <>
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">Notification Preferences</h3>
          <p className="text-sm text-neutral-600 mb-6">
            Choose how you want to be notified when customers submit order intents.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-900 mb-3">
            Notification Channel
          </label>
          <div className="space-y-2">
            {(['email', 'whatsapp', 'zalo'] as const).map((option) => (
              <label
                key={option}
                className="flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-colors hover:bg-neutral-50"
                style={{
                  borderColor: channel === option ? '#0ea5e9' : '#e5e7eb',
                  backgroundColor: channel === option ? '#f0f9ff' : 'transparent',
                }}
              >
                <input
                  type="radio"
                  name="notification_channel"
                  value={option}
                  checked={channel === option}
                  onChange={(e) => {
                    setChannel(e.target.value as 'email' | 'whatsapp' | 'zalo')
                    // Reset target when switching channels
                    if (option === 'email' && contactEmail) {
                      setTarget(contactEmail)
                    } else {
                      setTarget('')
                    }
                  }}
                  className="w-4 h-4 text-primary-600 border-neutral-300 focus:ring-primary-500"
                />
                <div className="flex-1">
                  <div className="font-medium text-neutral-900 capitalize">{option}</div>
                  <div className="text-xs text-neutral-600">
                    {option === 'email' && 'Receive notifications via email'}
                    {option === 'whatsapp' && 'Receive notifications via WhatsApp (requires integration)'}
                    {option === 'zalo' && 'Receive notifications via Zalo (requires integration)'}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="notification_target" className="block text-sm font-medium text-neutral-900 mb-2">
            {getLabel()} <span className="text-error-600">*</span>
          </label>
          <input
            type={channel === 'email' ? 'email' : 'text'}
            id="notification_target"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder={getPlaceholder()}
            className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
            disabled={isSaving}
          />
          {channel === 'email' && contactEmail && !target && (
            <p className="text-xs text-neutral-500 mt-1">
              Default: {contactEmail}
            </p>
          )}
        </div>

        <div className="pt-4 border-t border-neutral-200">
          <button
            onClick={handleSave}
            disabled={isSaving || !target.trim()}
            className="w-full px-6 py-3 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
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





