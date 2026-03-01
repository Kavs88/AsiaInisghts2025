import { createEvent } from '@/lib/actions/admin-events'
import EventForm from '@/components/admin/EventForm'
import { requireAdmin } from '@/lib/auth/server-admin-check'

export default async function CreateEventPage() {
  await requireAdmin()

  return (
    <main className="min-h-screen bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
      <EventForm
        title="Create New Event"
        onSubmit={async (data) => {
          'use server'
          return await createEvent(data)
        }}
      />
    </main>
  )
}
