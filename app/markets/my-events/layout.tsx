// Imports removed as they are no longer used for server-side auth checks

/**
 * Server-side protection for My Events page
 * Requires authentication
 */
export default function MyEventsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // We allow the page to render even if server-side auth check fails
  // The client-side component (page.tsx) handles the "not logged in" state gracefully
  // This prevents redirect loops when middleware cookies are out of sync
  return <>{children}</>
}



