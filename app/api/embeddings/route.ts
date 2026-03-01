
import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const MAX_QUERY_LENGTH = 1000

export async function POST(req: Request) {
    if (!process.env.OPENAI_API_KEY) {
        return NextResponse.json({ error: 'OpenAI API Key not configured' }, { status: 503 });
    }

    // Require authenticated session — prevents cost-DoS via unlimited embedding calls
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    try {
        const { query } = await req.json();

        if (!query) {
            return NextResponse.json({ error: 'Query is required' }, { status: 400 });
        }

        if (typeof query !== 'string' || query.length > MAX_QUERY_LENGTH) {
            return NextResponse.json({ error: `Query must be a string of at most ${MAX_QUERY_LENGTH} characters` }, { status: 400 })
        }

        const openai = new OpenAI();
        const response = await openai.embeddings.create({
            model: 'text-embedding-3-small', // Consistent with migration 026 (1536 dims)
            input: query.replace(/\n/g, ' '),
        });

        const embedding = response.data[0].embedding;
        return NextResponse.json({ embedding });
    } catch (error: any) {
        console.error('[embeddings] error:', error);
        return NextResponse.json({ error: error.message || 'Failed to generate embedding' }, { status: 500 });
    }
}
