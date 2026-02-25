'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Search, Shield, Info, Sparkles, AlertTriangle } from 'lucide-react'

export default function InternalAskPage() {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [searchMode, setSearchMode] = useState<'semantic' | 'keyword'>('semantic')
    const supabase = createClient()

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!query.trim()) return

        setLoading(true)
        setResults([])
        setError(null)

        try {
            if (searchMode === 'semantic') {
                // 1. Generate Embedding via API
                const embeddingResponse = await fetch('/api/embeddings', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ query })
                })

                if (!embeddingResponse.ok) {
                    const err = await embeddingResponse.json()
                    throw new Error(err.error || 'Failed to generate embedding')
                }

                const { embedding } = await embeddingResponse.json()

                // 2. Match via RPC
                const { data, error: rpcError } = await (supabase as any).rpc('match_entities', {
                    query_embedding: embedding,
                    match_threshold: 0.5,
                    match_count: 10
                })

                if (rpcError) {
                    console.error('RPC Error:', rpcError)
                    throw new Error('Vector search failed (Database might need migration). Switching to keyword search...')
                }

                setResults(data || [])
            } else {
                // Fallback: Keyword Search
                const { data, error } = await supabase
                    .from('entities')
                    .select('*')
                    .ilike('name', `%${query}%`)
                    .limit(10)

                if (error) throw error
                setResults(data || [])
            }

        } catch (err: any) {
            console.error('Search failed:', err)
            setError(err.message)
            // Optional: Auto-fallback logic if we wanted to be fancy, but manual toggle is clearer for internal tool
        } finally {
            setLoading(false)
        }
    }

    return (
        <main className="min-h-screen bg-neutral-50 p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary-100 text-primary-600 rounded-lg">
                            <Shield className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-neutral-900">Founder Ask</h1>
                            <p className="text-sm text-neutral-500 font-medium">Internal Intelligence Tool</p>
                        </div>
                    </div>
                    <Link href="/markets/admin" className="text-sm font-bold text-neutral-500 hover:text-neutral-900">
                        &larr; Back to Admin
                    </Link>
                </div>

                {/* Search Interface */}
                <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-8 mb-8">
                    <form onSubmit={handleSearch} className="relative">
                        <div className="relative">
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Ask about the community (e.g. 'coffee in Da Nang')..."
                                className="w-full pl-12 pr-32 py-4 bg-neutral-50 border border-neutral-200 rounded-xl text-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                            />
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 w-6 h-6" />
                            <button
                                type="submit"
                                disabled={loading || !query.trim()}
                                className="absolute right-2 top-2 bottom-2 px-6 bg-neutral-900 text-white font-bold rounded-lg hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                            >
                                {loading ? (
                                    'Thinking...'
                                ) : (
                                    <>
                                        <span>Ask</span>
                                        {searchMode === 'semantic' && <Sparkles className="w-4 h-4 text-yellow-400" />}
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-4 text-xs text-neutral-400">
                        <div className="flex items-center gap-2">
                            <Info className="w-3 h-3" />
                            <span>Powered by Entity Embeddings (Phase 6.2)</span>
                        </div>

                        <div className="flex items-center gap-2 bg-neutral-100 p-1 rounded-lg">
                            <button
                                onClick={() => setSearchMode('semantic')}
                                className={`px-3 py-1 rounded-md transition-all ${searchMode === 'semantic' ? 'bg-white shadow-sm text-primary-700 font-bold' : 'text-neutral-500 hover:text-neutral-900'}`}
                            >
                                Semantic
                            </button>
                            <button
                                onClick={() => setSearchMode('keyword')}
                                className={`px-3 py-1 rounded-md transition-all ${searchMode === 'keyword' ? 'bg-white shadow-sm text-primary-700 font-bold' : 'text-neutral-500 hover:text-neutral-900'}`}
                            >
                                Keyword
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-xl flex items-start gap-3 text-sm">
                            <AlertTriangle className="w-5 h-5 shrink-0" />
                            <div>
                                <p className="font-bold">Search Error</p>
                                <p>{error}</p>
                                {error.includes('OpenAI') && (
                                    <p className="mt-1 text-xs text-red-500">
                                        Note: Semantic search requires OPENAI_API_KEY in .env.local. Switch to Keyword mode if unavailable.
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Results */}
                <div className="space-y-4">
                    {results.length > 0 ? (
                        results.map((entity) => (
                            <div key={entity.id} className="bg-white rounded-xl border border-neutral-200 p-6 hover:shadow-md transition-all">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="text-xl font-bold text-neutral-900">{entity.name}</h3>
                                            <span className="px-2 py-0.5 bg-neutral-100 text-neutral-600 text-[10px] uppercase font-bold tracking-wider rounded">
                                                {entity.entity_type || 'Entity'}
                                            </span>
                                            {entity.similarity !== undefined && (
                                                <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-mono rounded">
                                                    match: {(entity.similarity * 100).toFixed(0)}%
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-neutral-600 line-clamp-2">{entity.description}</p>
                                    </div>
                                    <Link
                                        href={`/makers/${entity.slug}`}
                                        target="_blank"
                                        className="text-primary-600 hover:text-primary-700 font-bold text-sm"
                                    >
                                        View Profile &rarr;
                                    </Link>
                                </div>
                            </div>
                        ))
                    ) : (
                        query && !loading && !error && (
                            <div className="text-center py-12 text-neutral-500">
                                <p>No results found for "{query}"</p>
                            </div>
                        )
                    )}
                </div>
            </div>
        </main>
    )
}
