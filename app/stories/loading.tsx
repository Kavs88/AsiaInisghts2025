import { GridSkeleton } from '@/components/ui/LoadingSkeleton'

export default function StoriesLoading() {
  return (
    <div className="min-h-screen bg-white">
      <div className="h-64 bg-neutral-900 animate-pulse" />
      <div className="max-w-7xl mx-auto px-4 py-20">
        <GridSkeleton count={6} columns={3} />
      </div>
    </div>
  )
}
