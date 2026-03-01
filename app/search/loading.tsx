import { GridSkeleton } from '@/components/ui/LoadingSkeleton'

export default function SearchLoading() {
    return (
        <main className="min-h-screen bg-neutral-50 pt-24 px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-12">
                    <div className="h-12 w-48 bg-neutral-200 rounded-xl animate-pulse mb-4" />
                    <div className="h-6 w-72 bg-neutral-100 rounded-lg animate-pulse" />
                </div>
                <GridSkeleton count={4} columns={2} />
            </div>
        </main>
    )
}
