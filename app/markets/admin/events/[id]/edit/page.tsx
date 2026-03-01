import { updateEvent } from '@/lib/actions/admin-events'
import EventForm from '@/components/admin/EventForm'
import { requireAdmin } from '@/lib/auth/server-admin-check'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

interface EditEventPageProps {
  params: {
    id: string
  }
}

export default async function EditEventPage({ params }: EditEventPageProps) {
  await requireAdmin()
  const supabase = await createClient()

  const { data: eventRaw, error } = await (supabase as any)
    .from('events')
    .select('*')
    .eq('id', params.id)
    .single()
  const event = eventRaw as any

  if (error || !event) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
      <EventForm
        title={`Edit ${event.title}`}
        initialData={event}
        onSubmit={async (data) => {
          'use server'
          return await updateEvent(params.id, data)
        }}
      />
    </main>
  )
}
