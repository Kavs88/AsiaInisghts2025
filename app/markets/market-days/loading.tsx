import { GridSkeleton, Skeleton } from '@/components/ui/LoadingSkeleton'

export default function MarketDaysLoading() {
    return (
        <main className="min-h-screen">
            {/* Hero */}
            <div className="h-64 bg-neutral-200 animate-pulse" />

            {/* Next market card */}
            <section className="py-12 bg-white">
                <div className="container-custom">
                    <div className="bg-neutral-100 rounded-2xl p-6 lg:p-8 mb-12 animate-pulse">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <Skeleton className="h-9 w-3/4" />
                                <Skeleton className="h-5 w-1/2" />
                                <Skeleton className="h-5 w-1/3" />
                                <Skeleton className="h-5 w-2/5" />
                            </div>
                            <Skeleton className="aspect-square rounded-3xl" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Attending grid */}
            <section className="py-12 bg-white border-t border-neutral-200/60">
                <div className="container-custom">
                    <Skeleton className="h-9 w-56 mb-8" />
                    <GridSkeleton count={4} columns={4} />
                </div>
            </section>
        </main>
    )
}
