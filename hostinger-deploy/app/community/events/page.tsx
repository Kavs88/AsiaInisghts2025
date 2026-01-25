import { redirect } from 'next/navigation'

// PHASE 1: Event System Consolidation
// Redirect /community/events to canonical /markets/market-days
// Events are owned by Businesses and associated with Markets
export default function CommunityEventsRedirect() {
  redirect('/markets/discovery')
}
