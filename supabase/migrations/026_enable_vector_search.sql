
-- Enable vector extension
create extension if not exists vector with schema extensions;

-- Add embedding column to entities
alter table "public"."entities" add column if not exists "embedding" vector(1536);

-- Create index (IVFFlat for speed, though HNSW is better for scale, IVFFlat is standard starter)
-- We need to check if table has data first? IVFFlat needs some data to build centers usually, but safe to create.
-- Using vector_cosine_ops for OpenAI embeddings
create index on "public"."entities" using ivfflat (embedding vector_cosine_ops)
with (lists = 100);

-- Create match function
create or replace function match_entities (
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
returns table (
  id uuid,
  name text,
  slug text,
  description text,
  entity_type text,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    entities.id,
    entities.name,
    entities.slug,
    entities.description,
    entities.entity_type,
    1 - (entities.embedding <=> query_embedding) as similarity
  from entities
  where 1 - (entities.embedding <=> query_embedding) > match_threshold
  order by entities.embedding <=> query_embedding
  limit match_count;
end;
$$;
