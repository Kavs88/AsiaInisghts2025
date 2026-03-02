import { GridSkeleton } from '@/components/ui/LoadingSkeleton'

export default function DiscoveryLoading() {
  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
      <div className="space-y-8">
        <div className="h-8 bg-neutral-200 animate-pulse rounded w-1/4 mb-6" />
        <GridSkeleton count={6} columns={3} />
        <div className="h-8 bg-neutral-200 animate-pulse rounded w-1/4 mt-8 mb-6" />
        <GridSkeleton count={6} columns={3} />
      </div>
    </div>
  )
}
