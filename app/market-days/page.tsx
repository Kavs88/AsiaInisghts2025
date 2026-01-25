import { redirect } from 'next/navigation'

// REDIRECT: Legacy route /market-days → /markets/market-days
// Migration: Markets routing migration plan (ROUTING_MIGRATION_PLAN_MARKETS.md)
export default function MarketDaysRedirect() {
  redirect('/markets/market-days')
}
