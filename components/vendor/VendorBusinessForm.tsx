'use client'

import { useEffect, useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { vendorApplicationSchema, type VendorApplicationData, submitVendorApplication } from '@/lib/actions/vendor-onboarding'
import { getUserAgencies, type UserAgency } from '@/lib/actions/agency'

const CATEGORIES = [
  'Food & Beverage',
  'Fashion & Apparel',
  'Jewellery & Accessories',
  'Health & Wellness',
  'Art & Craft',
  'Home & Living',
  'Books & Stationery',
  'Electronics & Tech',
  'Beauty & Personal Care',
  'Plants & Garden',
  'Kids & Baby',
  'Sports & Outdoor',
  'Other',
]

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="mt-1.5 text-sm text-red-500 font-medium">{message}</p>
}

function Label({ htmlFor, children, required }: { htmlFor: string; children: React.ReactNode; required?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-semibold text-neutral-800 mb-2">
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  )
}

function Input({ className = '', ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full h-11 px-4 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all ${className}`}
      {...props}
    />
  )
}

function Textarea({ className = '', ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={`w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all resize-none ${className}`}
      {...props}
    />
  )
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-sm font-semibold ${
        checked
          ? 'bg-teal-50 border-teal-200 text-teal-700'
          : 'bg-neutral-50 border-neutral-200 text-neutral-500'
      }`}
    >
      <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${checked ? 'border-teal-500 bg-teal-500' : 'border-neutral-300'}`}>
        {checked && <span className="w-2 h-2 rounded-full bg-white" />}
      </span>
      {label}
    </button>
  )
}

export default function VendorBusinessForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [agencies, setAgencies] = useState<UserAgency[]>([])
  const [agenciesLoading, setAgenciesLoading] = useState(true)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<VendorApplicationData>({
    resolver: zodResolver(vendorApplicationSchema),
    mode: 'onChange',
    defaultValues: {
      deliveryAvailable: false,
      pickupAvailable: true,
    },
  })

  const nameValue = watch('name')
  const slugValue = watch('slug')

  // Auto-generate slug from name (unless user has manually edited it)
  useEffect(() => {
    if (nameValue) {
      setValue('slug', slugify(nameValue), { shouldValidate: true })
    }
  }, [nameValue, setValue])

  // Fetch agencies on mount
  useEffect(() => {
    getUserAgencies().then((data) => {
      setAgencies(data)
      if (data.length === 1) {
        setValue('agencyId', data[0].id, { shouldValidate: true })
      }
      setAgenciesLoading(false)
    })
  }, [setValue])

  const onSubmit = (data: VendorApplicationData) => {
    startTransition(async () => {
      const result = await submitVendorApplication(data)
      if (result.success) {
        toast.success('Application submitted! Your profile is under review.')
        router.push('/markets/vendor/dashboard')
      } else {
        toast.error(result.error ?? 'Something went wrong. Please try again.')
      }
    })
  }

  // Zero agencies — not a member of any agency
  if (!agenciesLoading && agencies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-10 bg-white border border-neutral-200 rounded-2xl">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mb-5">
          <svg className="w-6 h-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-black text-neutral-900 mb-2">Agency membership required</h3>
        <p className="text-neutral-500 text-sm max-w-sm leading-relaxed">
          You must be part of an agency before you can apply as a vendor. Contact an agency owner to be added.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

      {/* Agency selection */}
      {agenciesLoading ? (
        <div className="h-11 bg-neutral-100 rounded-xl animate-pulse" />
      ) : agencies.length > 1 ? (
        <div>
          <Label htmlFor="agencyId" required>Agency</Label>
          <select
            id="agencyId"
            {...register('agencyId')}
            className="w-full h-11 px-4 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
          >
            <option value="">Select an agency…</option>
            {agencies.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} ({a.role})
              </option>
            ))}
          </select>
          <FieldError message={errors.agencyId?.message} />
        </div>
      ) : (
        <input type="hidden" {...register('agencyId')} />
      )}

      {/* Business name + slug */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <Label htmlFor="name" required>Business name</Label>
          <Input id="name" placeholder="e.g. Cheryl's Kitchen" {...register('name')} />
          <FieldError message={errors.name?.message} />
        </div>
        <div>
          <Label htmlFor="slug" required>URL slug</Label>
          <Input id="slug" placeholder="cheryls-kitchen" {...register('slug')} />
          <p className="mt-1.5 text-xs text-neutral-400">asia-insights.com/vendors/<strong>{slugValue || '…'}</strong></p>
          <FieldError message={errors.slug?.message} />
        </div>
      </div>

      {/* Category */}
      <div>
        <Label htmlFor="category" required>Category</Label>
        <select
          id="category"
          {...register('category')}
          className="w-full h-11 px-4 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
        >
          <option value="">Select a category…</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <FieldError message={errors.category?.message} />
      </div>

      {/* Tagline */}
      <div>
        <Label htmlFor="tagline">Tagline</Label>
        <Input id="tagline" placeholder="A short line that captures your brand" {...register('tagline')} maxLength={120} />
        <FieldError message={errors.tagline?.message} />
      </div>

      {/* Bio */}
      <div>
        <Label htmlFor="bio">About your business</Label>
        <Textarea id="bio" rows={4} placeholder="Tell customers what makes you special…" {...register('bio')} maxLength={1000} />
        <FieldError message={errors.bio?.message} />
      </div>

      {/* Contact */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <Label htmlFor="contactEmail" required>Contact email</Label>
          <Input id="contactEmail" type="email" placeholder="hello@yourbusiness.com" {...register('contactEmail')} />
          <FieldError message={errors.contactEmail?.message} />
        </div>
        <div>
          <Label htmlFor="contactPhone" required>Contact phone</Label>
          <Input id="contactPhone" type="tel" placeholder="+66 12 345 6789" {...register('contactPhone')} />
          <FieldError message={errors.contactPhone?.message} />
        </div>
      </div>

      {/* Optional links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <Label htmlFor="websiteUrl">Website</Label>
          <Input id="websiteUrl" type="url" placeholder="https://yourbusiness.com" {...register('websiteUrl')} />
          <FieldError message={errors.websiteUrl?.message} />
        </div>
        <div>
          <Label htmlFor="instagramHandle">Instagram handle</Label>
          <Input id="instagramHandle" placeholder="@yourbusiness" {...register('instagramHandle')} />
          <FieldError message={errors.instagramHandle?.message} />
        </div>
      </div>

      {/* Delivery options */}
      <div>
        <Label htmlFor="delivery">Fulfilment options</Label>
        <div className="flex flex-wrap gap-3">
          <Toggle
            checked={watch('pickupAvailable')}
            onChange={(v) => setValue('pickupAvailable', v, { shouldValidate: true })}
            label="Market pickup"
          />
          <Toggle
            checked={watch('deliveryAvailable')}
            onChange={(v) => setValue('deliveryAvailable', v, { shouldValidate: true })}
            label="Delivery available"
          />
        </div>
      </div>

      {/* Submit */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isPending || !isValid}
          className="w-full h-12 bg-teal-600 hover:bg-teal-700 disabled:bg-neutral-200 disabled:text-neutral-400 text-white font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-sm"
        >
          {isPending ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Submitting…
            </>
          ) : (
            'Submit application'
          )}
        </button>
        <p className="mt-3 text-center text-xs text-neutral-400">
          Your profile will be reviewed before going live.
        </p>
      </div>

    </form>
  )
}
