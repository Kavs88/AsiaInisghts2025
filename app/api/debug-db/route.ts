
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
    const supabase = await createClient()

    // 1. Get raw count
    const { count } = await supabase
        .from('market_days')
        .select('*', { count: 'exact', head: true })

    // 2. Get first 5 rows
    const { data: rawDays } = await supabase
        .from('market_days')
        .select('id, market_date, is_published, location_name')
        .limit(5)
        .order('market_date', { ascending: false })

    // 3. Get upcoming valid
    const today = new Date().toISOString().split('T')[0]
    const { data: upcoming } = await supabase
        .from('market_days')
        .select('id, market_date')
        .eq('is_published', true)
        .gte('market_date', today)
        .order('market_date', { ascending: true })

    // 4. Check products
    const { count: productCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })

    const { data: rawProducts } = await supabase
        .from('products')
        .select('id, name, is_available')
        .limit(5)

    return NextResponse.json({
        total_count: count,
        raw_sample: rawDays,
        upcoming_valid: upcoming,
        server_date: today,
        upcoming_count: upcoming?.length || 0,
        products: {
            total: productCount,
            sample: rawProducts
        }
    })
}
