-- Migration: 020_phase4_intelligence.sql
-- Description: Adds infrastructure for High-Fidelity Intelligence (Phase 4).
--             - Enables pgvector support on entities (inactive/future).
--             - Creates tables for Founder Notes and Founder Tags.
--             - Adds HNSW index for vector similarity.

-- 1. Add embedding column to entities (Future Semantic Search)
-- Note: Dimensions set to 1536 for compatibility with OpenAI text-embedding-3-small
ALTER TABLE public.entities
ADD COLUMN IF NOT EXISTS embedding vector(1536);

-- 2. Founder Notes Table
-- Context: Private or shared insights written by the founder.
CREATE TABLE IF NOT EXISTS public.founder_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_id UUID REFERENCES public.entities(id) ON DELETE CASCADE NOT NULL,
    note TEXT NOT NULL,
    visibility TEXT DEFAULT 'internal' CHECK (visibility IN ('internal', 'public', 'team')),
    author_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Founder Tags Table
-- Context: Sparse, meaningful tags for "quiet" weighting (e.g. "retiree-friendly").
CREATE TABLE IF NOT EXISTS public.founder_tags (
    entity_id UUID REFERENCES public.entities(id) ON DELETE CASCADE NOT NULL,
    tag TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (entity_id, tag)
);

-- 4. Vector Similarity Index
-- Context: HNSW index for fast approximate nearest neighbor search.
-- Ignored if column is null, safe to create now.
CREATE INDEX IF NOT EXISTS entities_embedding_idx
ON public.entities
USING hnsw (embedding vector_cosine_ops);

-- 5. Enable RLS
ALTER TABLE public.founder_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.founder_tags ENABLE ROW LEVEL SECURITY;

-- 6. Policies (Founder/Admin Only for Write, Public/Internal for Read based on visibility)

-- Founder Notes: Read
CREATE POLICY "Internal notes visible to team only" ON public.founder_notes
    FOR SELECT USING (
        visibility = 'public' 
        OR 
        (auth.uid() IN (SELECT id FROM public.users WHERE role IN ('admin', 'founder', 'team')))
    );

-- Founder Notes: Write (Admin/Founder only)
CREATE POLICY "Admins can manage founder notes" ON public.founder_notes
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'founder'))
    );

-- Founder Tags: Read (Public)
CREATE POLICY "Founder tags are publicly viewable" ON public.founder_tags
    FOR SELECT USING (true);

-- Founder Tags: Write (Admin/Founder only)
CREATE POLICY "Admins can manage founder tags" ON public.founder_tags
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'founder'))
    );

-- 7. Realtime subscriptions (optional, for admin tools)
alter publication supabase_realtime add table public.founder_notes;
alter publication supabase_realtime add table public.founder_tags;
