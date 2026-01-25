export default function VendorDashboardLoading() {
    return (
        <main className="min-h-screen bg-neutral-50 mb-20">
            {/* Header Skeleton */}
            <div className="bg-white border-b border-neutral-200">
                <div className="container-custom py-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <div className="h-4 bg-neutral-200 rounded w-32 mb-2 animate-pulse" />
                            <div className="h-8 bg-neutral-200 rounded w-64 animate-pulse" />
                        </div>
                        <div className="flex gap-3">
                            <div className="h-10 bg-neutral-200 rounded-lg w-32 animate-pulse" />
                            <div className="h-10 bg-neutral-200 rounded-lg w-32 animate-pulse" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="container-custom py-8">
                {/* Stats Grid Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-white rounded-2xl shadow-soft p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="h-5 bg-neutral-200 rounded w-24 animate-pulse" />
                                <div className="h-10 w-10 bg-neutral-200 rounded-full animate-pulse" />
                            </div>
                            <div className="h-8 bg-neutral-200 rounded w-16 mb-2 animate-pulse" />
                            <div className="h-4 bg-neutral-200 rounded w-32 animate-pulse" />
                        </div>
                    ))}
                </div>

                {/* Recent Activity Skeleton */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white rounded-2xl shadow-soft p-6">
                        <div className="h-6 bg-neutral-200 rounded w-48 mb-6 animate-pulse" />
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-16 bg-neutral-100 rounded-lg animate-pulse" />
                            ))}
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl shadow-soft p-6">
                        <div className="h-6 bg-neutral-200 rounded w-48 mb-6 animate-pulse" />
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-16 bg-neutral-100 rounded-lg animate-pulse" />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}
