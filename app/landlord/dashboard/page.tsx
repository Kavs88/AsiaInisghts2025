import { getLandlordProperties, getLandlordUpcomingEvents, getLandlordEnquiries } from '@/lib/actions/landlord'
import { createClient } from '@/lib/supabase/server'
import Image from 'next/image'
import Link from 'next/link'
import { Building2, Calendar, MessageSquare, CheckCircle2, Clock, MapPin, AlertCircle, Archive, TrendingUp } from 'lucide-react'

export const metadata = {
  title: 'My Properties — Landlord Portal',
}

function StatCard({ label, value, icon: Icon, color }: {
  label: string
  value: number | string
  icon: React.ElementType
  color: 'teal' | 'amber' | 'neutral' | 'rose'
}) {
  const colors = {
    teal: 'bg-teal-50 text-teal-600',
    amber: 'bg-amber-50 text-amber-600',
    neutral: 'bg-neutral-100 text-neutral-500',
    rose: 'bg-rose-50 text-rose-600',
  }
  return (
    <div className="bg-white rounded-2xl border border-neutral-100 p-6 shadow-sm">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${colors[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="text-3xl font-black text-neutral-900 mb-1">{value}</div>
      <div className="text-sm text-neutral-500 font-medium">{label}</div>
    </div>
  )
}

export default async function LandlordDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: userRecord } = await supabase
    .from('users')
    .select('full_name, email')
    .eq('id', user!.id)
    .single()

  const [properties, upcomingEvents, enquiries] = await Promise.all([
    getLandlordProperties(),
    getLandlordUpcomingEvents(),
    getLandlordEnquiries(),
  ])

  const activeProperties = (properties as any[]).filter((p) => !p.is_archived && p.is_active)
  const archivedProperties = (properties as any[]).filter((p) => p.is_archived)
  const pendingEnquiries = (enquiries as any[]).filter((e) => e.status === 'pending' || e.status === 'new')

  const firstName = (userRecord as any)?.full_name?.split(' ')[0] || 'there'

  return (
    <div className="space-y-10">
      {/* Page header */}
      <div>
        <h1 className="text-4xl font-black text-neutral-900 mb-2">
          Welcome back, {firstName}
        </h1>
        <p className="text-neutral-500 text-lg">Here's what's happening across your properties.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Active Listings"
          value={activeProperties.length}
          icon={Building2}
          color="teal"
        />
        <StatCard
          label="Upcoming Events"
          value={(upcomingEvents as any[]).length}
          icon={Calendar}
          color="amber"
        />
        <StatCard
          label="Enquiries"
          value={pendingEnquiries.length}
          icon={MessageSquare}
          color={pendingEnquiries.length > 0 ? 'rose' : 'neutral'}
        />
        <StatCard
          label="Total Properties"
          value={(properties as any[]).length}
          icon={TrendingUp}
          color="neutral"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Properties list */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-neutral-900">Your Properties</h2>
          </div>

          {activeProperties.length === 0 && (
            <div className="bg-white rounded-2xl border border-neutral-100 p-10 text-center">
              <Building2 className="w-12 h-12 text-neutral-200 mx-auto mb-4" />
              <p className="text-neutral-500 font-medium">No active properties yet.</p>
              <p className="text-sm text-neutral-400 mt-1">Contact your Asia Insights concierge to add a listing.</p>
            </div>
          )}

          <div className="space-y-4">
            {activeProperties.map((property: any) => {
              const mainImage = property.images?.[0]
              const isEventSpace = property.property_type === 'event_space'
              return (
                <div key={property.id} className="bg-white rounded-2xl border border-neutral-100 overflow-hidden flex gap-0">
                  {/* Image strip */}
                  <div className="w-32 h-28 sm:w-40 sm:h-32 relative shrink-0 bg-neutral-100">
                    {mainImage ? (
                      <Image src={mainImage} alt={property.address} fill sizes="160px" className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Building2 className="w-8 h-8 text-neutral-300" />
                      </div>
                    )}
                  </div>
                  {/* Info */}
                  <div className="flex-1 p-5 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="min-w-0">
                        <p className="font-bold text-neutral-900 truncate">{property.address}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            isEventSpace ? 'bg-teal-50 text-teal-700' : 'bg-neutral-100 text-neutral-500'
                          }`}>
                            {isEventSpace ? 'Event Space' : 'Rental'}
                          </span>
                          <span className={`text-xs font-medium ${
                            property.availability === 'available' ? 'text-green-600' : 'text-amber-600'
                          }`}>
                            {property.availability}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-neutral-500">
                      {isEventSpace && property.capacity && (
                        <span className="flex items-center gap-1">
                          <span className="font-medium text-neutral-700">{property.capacity}</span> cap.
                        </span>
                      )}
                      {isEventSpace && property.hourly_rate && (
                        <span className="flex items-center gap-1">
                          <span className="font-medium text-neutral-700">
                            ${property.hourly_rate.toLocaleString()}/hr
                          </span>
                        </span>
                      )}
                      {!isEventSpace && property.price && (
                        <span className="flex items-center gap-1">
                          <span className="font-medium text-neutral-700">
                            ${property.price.toLocaleString()}/mo
                          </span>
                        </span>
                      )}
                    </div>
                    {property.active_until && (
                      <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Listed until {new Date(property.active_until).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    )}
                    {property.landlord_notes && (
                      <p className="text-xs text-neutral-400 mt-1.5 italic truncate">{property.landlord_notes}</p>
                    )}
                  </div>
                  {/* View link */}
                  <div className="flex items-center px-4 shrink-0">
                    <Link
                      href={`/properties/${property.id}`}
                      className="text-xs font-bold text-teal-600 hover:text-teal-700 transition-colors"
                    >
                      View →
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Archived properties (collapsed hint) */}
          {archivedProperties.length > 0 && (
            <div className="bg-neutral-50 rounded-2xl border border-neutral-100 p-5 flex items-center gap-4">
              <Archive className="w-5 h-5 text-neutral-400 shrink-0" />
              <p className="text-sm text-neutral-500">
                <span className="font-semibold text-neutral-700">{archivedProperties.length} archived {archivedProperties.length === 1 ? 'property' : 'properties'}</span> — contact your concierge to restore.
              </p>
            </div>
          )}
        </div>

        {/* Right column: Events + Enquiries */}
        <div className="space-y-8">
          {/* Upcoming events */}
          <div>
            <h2 className="text-xl font-bold text-neutral-900 mb-4">Upcoming Events</h2>
            {(upcomingEvents as any[]).length === 0 ? (
              <div className="bg-white rounded-2xl border border-neutral-100 p-6 text-center">
                <Calendar className="w-8 h-8 text-neutral-200 mx-auto mb-3" />
                <p className="text-sm text-neutral-500">No upcoming events at your venues.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {(upcomingEvents as any[]).map((event: any) => {
                  const startDate = new Date(event.start_at)
                  return (
                    <div key={event.id} className="bg-white rounded-xl border border-neutral-100 p-4 flex gap-4">
                      <div className="w-12 h-12 bg-teal-50 rounded-xl flex flex-col items-center justify-center shrink-0">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400 leading-none">
                          {startDate.toLocaleDateString('en-US', { month: 'short' })}
                        </span>
                        <span className="text-lg font-black text-teal-700 leading-none">
                          {startDate.getDate()}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-neutral-900 text-sm truncate">{event.title}</p>
                        <p className="text-xs text-neutral-500 mt-0.5">
                          {startDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                        </p>
                        {event.properties?.address && (
                          <p className="text-xs text-neutral-400 mt-0.5 flex items-center gap-1 truncate">
                            <MapPin className="w-3 h-3 shrink-0" />
                            {event.properties.address}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Enquiries */}
          <div>
            <h2 className="text-xl font-bold text-neutral-900 mb-4">
              Recent Enquiries
              {pendingEnquiries.length > 0 && (
                <span className="ml-2 text-xs font-bold bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full">
                  {pendingEnquiries.length} new
                </span>
              )}
            </h2>
            {(enquiries as any[]).length === 0 ? (
              <div className="bg-white rounded-2xl border border-neutral-100 p-6 text-center">
                <MessageSquare className="w-8 h-8 text-neutral-200 mx-auto mb-3" />
                <p className="text-sm text-neutral-500">No enquiries yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {(enquiries as any[]).slice(0, 5).map((enquiry: any) => {
                  const isPending = enquiry.status === 'pending' || enquiry.status === 'new'
                  return (
                    <div key={enquiry.id} className={`bg-white rounded-xl border p-4 ${isPending ? 'border-rose-100' : 'border-neutral-100'}`}>
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="font-bold text-neutral-900 text-sm">{enquiry.name}</p>
                        {isPending ? (
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-600 px-1.5 py-0.5 rounded-full shrink-0">New</span>
                        ) : (
                          <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-neutral-500 truncate">{enquiry.message}</p>
                      <p className="text-xs text-neutral-400 mt-1">
                        {enquiry.properties?.address} · {new Date(enquiry.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  )
                })}
                {(enquiries as any[]).length > 5 && (
                  <p className="text-xs text-neutral-400 text-center pt-1">
                    +{(enquiries as any[]).length - 5} more enquiries — contact concierge
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Concierge CTA */}
          <div className="bg-teal-600 rounded-2xl p-6 text-white">
            <h3 className="font-bold text-lg mb-2">Need help?</h3>
            <p className="text-teal-100 text-sm mb-4">
              Your dedicated concierge can update listings, manage enquiries, and schedule events at your properties.
            </p>
            <Link
              href="/concierge"
              className="inline-block bg-white text-teal-700 font-bold text-sm px-4 py-2 rounded-xl hover:bg-teal-50 transition-colors"
            >
              Contact Concierge
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
