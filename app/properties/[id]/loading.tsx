import { Skeleton } from '@/components/ui/LoadingSkeleton'

export default function PropertyLoading() {
    return (
        <main className="min-h-screen bg-neutral-50">
            {/* Hero image placeholder */}
            <div className="w-full aspect-[16/9] bg-neutral-200 animate-pulse" />

            <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Main content */}
                    <div className="lg:col-span-2 space-y-6">
                        <Skeleton className="h-10 w-3/4" />
                        <Skeleton className="h-5 w-1/3" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                        <Skeleton className="h-4 w-2/3" />
                    </div>

                    {/* Sidebar placeholder */}
                    <div className="space-y-4">
                        <Skeleton className="h-64 w-full rounded-2xl" />
                    </div>
                </div>
            </div>
        </main>
    )
}
