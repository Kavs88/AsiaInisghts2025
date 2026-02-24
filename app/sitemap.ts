import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

// Constants
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://asiainsights.com' // Fallback for dev

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const supabase = await createClient()

    // 1. Static Routes
    const routes = [
        '',
        '/about',
        '/meet-the-team',
        '/contact',
        '/concierge',
        '/businesses',
        '/markets/market-days',
        '/markets/products',
    ].map((route) => ({
        url: `${BASE_URL}${route}`,
        lastModified: new Date().toISOString(),
        changeFrequency: 'weekly' as const,
        priority: route === '' ? 1.0 : 0.8,
    }))

    // 2. Verified Entities (Confidence > 80)
    // We only want to index entities that meet our "High Signal" criteria
    const { data: entities } = await supabase
        .from('entities')
        .select('slug, updated_at')
        .gt('confidence_score', 80)
        .limit(1000) // Cap for performance for now

    const entityRoutes = ((entities as any[]) || []).map((entity) => ({
        url: `${BASE_URL}/makers/${entity.slug}`,
        lastModified: new Date(entity.updated_at || new Date()).toISOString(),
        changeFrequency: 'weekly' as const,
        priority: 0.9,
    }))

    return [...routes, ...entityRoutes]
}
