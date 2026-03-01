'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { X, MessageSquare, Send, CheckCircle, User, Mail, Phone, Calendar, ChevronRight } from 'lucide-react'
import { submitEnquiry } from '@/lib/actions/enquiries'
import Link from 'next/link'

interface EnquiryModalProps {
    propertyId: string
    propertyAddress: string
    propertyType: 'rental' | 'event_space'
    isOpen: boolean
    onClose: () => void
    currentUser?: {
        id: string
        email?: string
        user_metadata?: { full_name?: string }
    } | null
}

export default function EnquiryModal({
    propertyId,
    propertyAddress,
    propertyType,
    isOpen,
    onClose,
    currentUser,
}: EnquiryModalProps) {
    const router = useRouter()
    const [isPending, setIsPending] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [form, setForm] = useState({
        name: currentUser?.user_metadata?.full_name || '',
        email: currentUser?.email || '',
        phone: '',
        message: '',
        moveInDate: '',
    })

    // Pre-fill if user logs in while modal is open
    useEffect(() => {
        if (currentUser) {
            setForm(prev => ({
                ...prev,
                name: prev.name || currentUser.user_metadata?.full_name || '',
                email: prev.email || currentUser.email || '',
            }))
        }
    }, [currentUser])

    // Reset state when modal closes
    useEffect(() => {
        if (!isOpen) {
            setTimeout(() => {
                setIsSuccess(false)
                setError(null)
                setIsPending(false)
            }, 300)
        }
    }, [isOpen])

    // Close on Escape
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
        if (isOpen) window.addEventListener('keydown', handleEsc)
        return () => window.removeEventListener('keydown', handleEsc)
    }, [isOpen, onClose])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!form.name || !form.email || !form.message) return
        setIsPending(true)
        setError(null)
        try {
            await submitEnquiry({
                propertyId,
                propertyAddress,
                name: form.name,
                email: form.email,
                phone: form.phone || undefined,
                message: form.message,
                moveInDate: form.moveInDate || undefined,
            })
            setIsSuccess(true)
        } catch {
            setError('Something went wrong. Please try again.')
        } finally {
            setIsPending(false)
        }
    }

    if (!isOpen) return null

    const label = propertyType === 'event_space' ? 'venue' : 'property'
    const datePlaceholder = propertyType === 'event_space' ? 'Event date' : 'Move-in date'

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Panel */}
            <div className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
                {/* Header */}
                <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-neutral-100">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-primary-50 rounded-xl flex items-center justify-center">
                            <MessageSquare className="w-4 h-4 text-primary-600" strokeWidth={2} />
                        </div>
                        <div>
                            <h2 className="text-base font-black text-neutral-900">Enquire about this {label}</h2>
                            <p className="text-xs text-neutral-400 truncate max-w-[260px]">{propertyAddress}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-all"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Content */}
                <div className="px-6 pb-6">
                    {!currentUser ? (
                        // Unauthenticated state
                        <div className="py-8 text-center">
                            <div className="w-14 h-14 bg-neutral-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-neutral-100">
                                <User className="w-6 h-6 text-neutral-400" strokeWidth={1.5} />
                            </div>
                            <h3 className="text-lg font-black text-neutral-900 mb-2">Sign in to enquire</h3>
                            <p className="text-sm text-neutral-500 mb-6 max-w-xs mx-auto leading-relaxed">
                                Create a free account to send an enquiry and track your messages in My Community.
                            </p>
                            <Link
                                href={`/auth/login?next=${encodeURIComponent(typeof window !== 'undefined' ? window.location.pathname : '/')}`}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-neutral-900 text-white font-bold rounded-xl hover:bg-neutral-800 transition-all shadow-sm"
                            >
                                Sign In
                                <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>
                    ) : isSuccess ? (
                        // Success state
                        <div className="py-8 text-center">
                            <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-green-100">
                                <CheckCircle className="w-7 h-7 text-green-500" strokeWidth={1.5} />
                            </div>
                            <h3 className="text-lg font-black text-neutral-900 mb-2">Enquiry sent!</h3>
                            <p className="text-sm text-neutral-500 mb-6 max-w-xs mx-auto leading-relaxed">
                                The host will be in touch. You can review this enquiry any time in{' '}
                                <Link href="/account/community" className="text-primary-600 font-bold hover:underline" onClick={onClose}>
                                    My Community
                                </Link>.
                            </p>
                            <button
                                onClick={onClose}
                                className="px-6 py-2.5 bg-neutral-100 text-neutral-700 font-bold rounded-xl hover:bg-neutral-200 transition-all text-sm"
                            >
                                Close
                            </button>
                        </div>
                    ) : (
                        // Form
                        <form onSubmit={handleSubmit} className="space-y-4 pt-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-neutral-600 mb-1.5 uppercase tracking-wider">Name</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-300" strokeWidth={1.5} />
                                        <input
                                            type="text"
                                            required
                                            placeholder="Your name"
                                            value={form.name}
                                            onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                                            className="w-full pl-9 pr-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-neutral-600 mb-1.5 uppercase tracking-wider">Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-300" strokeWidth={1.5} />
                                        <input
                                            type="email"
                                            required
                                            placeholder="you@example.com"
                                            value={form.email}
                                            onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                                            className="w-full pl-9 pr-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-neutral-600 mb-1.5 uppercase tracking-wider">Phone <span className="text-neutral-400 font-normal">(optional)</span></label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-300" strokeWidth={1.5} />
                                        <input
                                            type="tel"
                                            placeholder="+84 ..."
                                            value={form.phone}
                                            onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                                            className="w-full pl-9 pr-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-neutral-600 mb-1.5 uppercase tracking-wider">{datePlaceholder} <span className="text-neutral-400 font-normal">(optional)</span></label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-300" strokeWidth={1.5} />
                                        <input
                                            type="date"
                                            value={form.moveInDate}
                                            onChange={e => setForm(p => ({ ...p, moveInDate: e.target.value }))}
                                            className="w-full pl-9 pr-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-neutral-600 mb-1.5 uppercase tracking-wider">Message</label>
                                <textarea
                                    required
                                    rows={4}
                                    placeholder={`Tell the host about your interest in this ${label}...`}
                                    value={form.message}
                                    onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all resize-none"
                                />
                            </div>

                            {error && (
                                <p className="text-xs font-bold text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
                            )}

                            <button
                                type="submit"
                                disabled={isPending}
                                className="w-full flex items-center justify-center gap-2 py-3.5 bg-neutral-900 text-white font-black rounded-xl hover:bg-neutral-800 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                            >
                                {isPending ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Sending…
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-4 h-4" />
                                        Send Enquiry
                                    </>
                                )}
                            </button>

                            <p className="text-center text-xs text-neutral-400">
                                Your contact details are only shared with the property host.
                            </p>
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}
