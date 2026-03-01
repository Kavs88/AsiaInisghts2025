import { Skeleton } from '@/components/ui/LoadingSkeleton'

export default function MakerProfileLoading() {
    return (
        <main className="min-h-screen bg-white pb-20">
            {/* Cover banner */}
            <div className="h-56 md:h-72 bg-neutral-900" />

            <div className="container-custom relative -mt-20">
                <div className="bg-white rounded-2xl p-6 md:p-10 shadow-xl border border-neutral-100">
                    {/* Identity */}
                    <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-start mb-8">
                        <Skeleton className="w-32 h-32 md:w-40 md:h-40 rounded-2xl flex-shrink-0" />
                        <div className="flex-1 space-y-3 pt-2">
                            <Skeleton className="h-9 w-2/3" />
                            <Skeleton className="h-5 w-1/2" />
                            <Skeleton className="h-5 w-1/3" />
                        </div>
                    </div>

                    {/* Stats row */}
                    <div className="flex gap-6 mb-6 pb-6 border-b border-neutral-100">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="space-y-1">
                                <Skeleton className="h-7 w-12" />
                                <Skeleton className="h-4 w-16" />
                            </div>
                        ))}
                    </div>

                    {/* Description */}
                    <div className="space-y-2 mb-8">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                        <Skeleton className="h-4 w-4/6" />
                    </div>

                    {/* Cards row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-neutral-50 rounded-2xl p-4 space-y-3">
                                <Skeleton className="h-36 rounded-xl w-full" />
                                <Skeleton className="h-5 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </main>
    )
}
