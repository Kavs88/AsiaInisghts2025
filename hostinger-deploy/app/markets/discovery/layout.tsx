import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Discover Events | AI Markets',
  description: 'Discover local events, workshops, meetups, and market days happening near you. From artisan workshops to community meetups, find something extraordinary.',
}

export default function DiscoveryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

