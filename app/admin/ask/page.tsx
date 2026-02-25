'use client'

import { useState } from 'react'
import { askAsiaInsights } from '@/app/actions/admin-search'

export default function AdminAskPage() {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<any>(null)
    const [loading, setLoading] = useState(false)

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!query.trim()) return

        setLoading(true)
        try {
            const data = await askAsiaInsights(query)
            setResults(data)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold text-gray-900">Ask Asia Insights</h1>
                <p className="text-gray-500">Semantic Search over {results?.results?.entities?.length ? 'Unified Entities' : 'the Knowledge Base'}</p>
            </div>

            {/* Search Input */}
            <form onSubmit={handleSearch} className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="e.g., 'Who sells organic coffee in Hoi An?' or 'New visa rules'"
                    className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none shadow-sm transition-all"
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="absolute right-3 top-3 px-6 py-2 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                    {loading ? 'Thinking...' : 'Search'}
                </button>
            </form>

            {/* Results Display */}
            {results && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Entities Column */}
                    <div className="space-y-4">
                        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Matched Entities</h2>
                        {results.results.entities.length === 0 ? (
                            <p className="text-gray-400 italic">No entities found.</p>
                        ) : (
                            results.results.entities.map((entity: any) => (
                                <div key={entity.id} className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-semibold text-gray-900">{entity.name}</h3>
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${entity.type === 'vendor' ? 'bg-purple-100 text-purple-700' :
                                                entity.type === 'business' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-gray-100 text-gray-700'
                                            }`}>
                                            {entity.type}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{entity.description || 'No description provided.'}</p>
                                    <div className="flex flex-wrap gap-2">
                                        {entity.tags?.map((tag: string) => (
                                            <span key={tag} className="text-xs px-2 py-1 bg-gray-50 text-gray-500 rounded border border-gray-100">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Insights Column */}
                    <div className="space-y-4">
                        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Related Insights</h2>
                        {results.results.insights.length === 0 ? (
                            <p className="text-gray-400 italic">No insights found.</p>
                        ) : (
                            results.results.insights.map((insight: any) => (
                                <div key={insight.id} className="p-4 bg-amber-50 border border-amber-100 rounded-xl">
                                    <p className="text-sm text-gray-800 mb-2 font-medium">{insight.detected_topic || 'General'}</p>
                                    <p className="text-gray-600 text-sm italic mb-2">"{insight.raw_text.substring(0, 100)}..."</p>
                                    <div className="flex justify-between items-center text-xs text-gray-400">
                                        <span>{insight.status}</span>
                                        <a href={insight.source_url} target="_blank" className="hover:text-blue-600 hover:underline">Source ↗</a>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
