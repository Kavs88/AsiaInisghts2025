
import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    if (!process.env.OPENAI_API_KEY) {
        return NextResponse.json({ error: 'OpenAI API Key not configured' }, { status: 503 });
    }

    try {
        const { query } = await req.json();

        if (!query) {
            return NextResponse.json({ error: 'Query is required' }, { status: 400 });
        }

        const openai = new OpenAI();
        const response = await openai.embeddings.create({
            model: 'text-embedding-3-small', // Consistent with migration 026 (1536 dims)
            input: query.replace(/\n/g, ' '),
        });

        const embedding = response.data[0].embedding;
        return NextResponse.json({ embedding });
    } catch (error: any) {
        console.error('Embedding error:', error);
        return NextResponse.json({ error: error.message || 'Failed to generate embedding' }, { status: 500 });
    }
}
