import { Skeleton } from '@/components/ui/LoadingSkeleton'

export default function BusinessProfileLoading() {
    return (
        <main className="min-h-screen bg-white">
            {/* Hero banner */}
            <div className="relative h-[50vh] min-h-[400px] bg-neutral-200 animate-pulse" />

            {/* Identity block */}
            <section className="relative bg-white border-b border-neutral-100">
                <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-12 pb-8">
                    <div className="flex flex-col sm:flex-row items-end gap-6 sm:gap-8 mb-8 -mt-20 sm:-mt-24 relative z-10">
                        <Skeleton className="w-32 h-32 sm:w-40 sm:h-40 lg:w-44 lg:h-44 rounded-2xl flex-shrink-0" />
                        <div className="flex-1 space-y-3 pb-2">
                            <Skeleton className="h-5 w-32 rounded-full" />
                            <Skeleton className="h-12 w-3/4" />
                        </div>
                    </div>

                    {/* Tagline */}
                    <div className="mb-8 space-y-2">
                        <Skeleton className="h-6 w-1/2" />
                        <Skeleton className="h-5 w-1/3" />
                    </div>

                    {/* 2-col layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
                        <div className="lg:col-span-2 space-y-3">
                            <Skeleton className="h-7 w-48" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-5/6" />
                            <Skeleton className="h-4 w-4/6" />
                        </div>
                        <div className="space-y-4">
                            <Skeleton className="h-48 w-full rounded-2xl" />
                            <Skeleton className="h-24 w-full rounded-2xl" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Tab nav placeholder */}
            <div className="bg-white border-b border-neutral-200/60 h-14" />
        </main>
    )
}
