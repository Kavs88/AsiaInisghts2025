'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { uploadVendorLogo, uploadVendorHero, validateImageFile, deleteImage } from '@/lib/supabase/storage'

interface SingleImageUploaderProps {
    entityId: string
    imageUrl: string | null
    onChange: (url: string) => void
    disabled?: boolean
    type: 'logo' | 'hero'
}

export function SingleImageUploader({
    entityId,
    imageUrl,
    onChange,
    disabled = false,
    type,
}: SingleImageUploaderProps) {
    const [imageInput, setImageInput] = useState('')
    const [isUploadingImage, setIsUploadingImage] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const imageInputRef = useRef<HTMLInputElement>(null)

    const addImageFromUrl = () => {
        const trimmed = imageInput.trim()
        if (!trimmed) return
        setError(null)
        onChange(trimmed)
        setImageInput('')
    }

    const handleImageFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const validation = validateImageFile(file)
        if (!validation.valid) {
            setError(validation.error || 'Invalid file')
            return
        }

        if (!entityId) {
            setError('Cannot upload images before record is saved.')
            return
        }

        setIsUploadingImage(true)
        setError(null)

        try {
            const uploadFn = type === 'logo' ? uploadVendorLogo : uploadVendorHero
            const result = await uploadFn(entityId, file)
            if (result.error) {
                setError(result.error)
            } else {
                onChange(result.url)
            }
        } catch (err: any) {
            setError(err.message || 'Failed to upload image')
        } finally {
            setIsUploadingImage(false)
            if (imageInputRef.current) imageInputRef.current.value = ''
        }
    }

    const removeImage = async () => {
        setError(null)

        // Optionally delete from storage if it's a supabase URL for vendor-assets
        if (imageUrl && imageUrl.includes('vendor-assets')) {
            try {
                const urlParts = imageUrl.split('/vendor-assets/')
                if (urlParts.length > 1) {
                    await deleteImage('vendor-assets', urlParts[1])
                }
            } catch (err) {
                console.error('Error removing image from bucket:', err)
            }
        }

        onChange('')
    }

    return (
        <div className="space-y-4">
            {error && (
                <div className="p-4 bg-error-50 border border-error-200 text-error-800 text-sm rounded-xl">
                    {error}
                </div>
            )}

            {/* Existing Image Display */}
            {imageUrl ? (
                <div className="relative rounded-xl overflow-hidden border border-neutral-200 bg-neutral-100 group" style={{ height: type === 'hero' ? '200px' : '120px', width: type === 'hero' ? '100%' : '120px' }}>
                    <Image src={imageUrl} alt={`${type} image`} fill sizes="100vw" className="object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                            type="button"
                            onClick={() => !disabled && removeImage()}
                            disabled={disabled}
                            className="p-2 bg-error-600 text-white rounded-lg hover:bg-error-700 transition-colors shadow-sm disabled:opacity-50"
                            title="Remove image"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </div>
                </div>
            ) : (
                /* File Upload Area */
                <div
                    onClick={() => !isUploadingImage && !disabled && imageInputRef.current?.click()}
                    className={`w-full p-6 border-2 border-dashed rounded-xl text-center transition-colors ${disabled || isUploadingImage
                        ? 'border-neutral-300 bg-neutral-50 cursor-not-allowed'
                        : 'border-primary-300 bg-primary-50 hover:bg-primary-100 hover:border-primary-400 cursor-pointer'
                        }`}
                >
                    <input
                        type="file"
                        ref={imageInputRef}
                        onChange={handleImageFileSelect}
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        className="hidden"
                        disabled={isUploadingImage || disabled}
                    />
                    {isUploadingImage ? (
                        <div className="flex flex-col items-center justify-center">
                            <div className="w-6 h-6 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mb-2"></div>
                            <p className="text-sm font-medium text-neutral-600">Uploading...</p>
                        </div>
                    ) : !entityId ? (
                        <div>
                            <svg className="w-8 h-8 mx-auto text-neutral-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            <p className="text-sm font-semibold text-neutral-500">Save to upload</p>
                        </div>
                    ) : (
                        <div>
                            <svg className="w-8 h-8 mx-auto text-primary-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p className="text-sm font-semibold text-primary-900 leading-tight">Click to upload<br />{type === 'logo' ? 'Logo' : 'Hero Image'}</p>
                        </div>
                    )}
                </div>
            )}

            {/* Legacy Manual URL Area */}
            {!imageUrl && (
                <div className="flex gap-2 items-center">
                    <input
                        type="url"
                        disabled={disabled}
                        value={imageInput}
                        onChange={(e) => setImageInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault()
                                addImageFromUrl()
                            }
                        }}
                        className="flex-1 px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
                        placeholder="Or direct URL..."
                    />
                    <button
                        type="button"
                        disabled={disabled}
                        onClick={addImageFromUrl}
                        className="px-3 py-2 text-sm bg-neutral-100 text-neutral-900 rounded-lg hover:bg-neutral-200 transition-colors whitespace-nowrap disabled:opacity-50"
                    >
                        Add
                    </button>
                </div>
            )}
        </div>
    )
}
