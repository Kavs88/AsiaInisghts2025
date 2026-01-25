-- FIX TABLE NAME MISMATCH
-- The code expects 'user_event_intent' (singular)
-- The previous script created 'user_event_intents' (plural)

-- 1. Rename Table
ALTER TABLE IF EXISTS public.user_event_intents RENAME TO user_event_intent;

-- 2. Drop old policies (if they carried over with rename, they might have old names, but they attach to the table)
-- It's safer to drop and recreate to match the codebase/migration exactly.

DROP POLICY IF EXISTS "Users manage own intents" ON public.user_event_intent;
DROP POLICY IF EXISTS "Public view counts" ON public.user_event_intent;

-- 3. Create Correct Policies (as per 010 migration)
ALTER TABLE public.user_event_intent ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own intents" ON public.user_event_intent
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own intents" ON public.user_event_intent
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own intents" ON public.user_event_intent
  FOR DELETE USING (auth.uid() = user_id);

-- 4. Recreate Indexes (if needed, rename preserves them but let's ensure naming convention)
-- Rename indexes if they exist with old names, or just leave them. 
-- Best to ensure the constraints match what migration 010 expects.
-- Migration 010 expects: UNIQUE(user_id, event_id, intent_type)
-- fix_and_seed created: PRIMARY KEY (user_id, event_id) - THIS IS DIFFERENT!

-- Migration 010 allows multiple intents per user/event (e.g. favourite AND planning_to_attend?)
-- Wait, migration 010 has: UNIQUE(user_id, event_id, intent_type)
-- Code has: intent_type IN ('favourite', 'planning_to_attend')
-- Code logic:
--   existing = select check where intent_type = X. 
--   If exists, delete. Else insert.
--   This implies a user can have both 'favourite' AND 'planning_to_attend' for the same event concurrently?
--   Yes, usually you can favorite an event AND plan to go.
--   But fix_and_seed PRIMARY KEY (user_id, event_id) prevents this! It restricts to ONE intent per user per event.

-- FIX: We must drop the primary key and add the unique constraint as per 010.

ALTER TABLE public.user_event_intent DROP CONSTRAINT IF EXISTS user_event_intents_pkey;

-- Add ID column if missing (fix_and_seed didn't add ID, it used composite PK)
ALTER TABLE public.user_event_intent ADD COLUMN IF NOT EXISTS id UUID DEFAULT gen_random_uuid() PRIMARY KEY;

-- Add the unique constraint from 010
ALTER TABLE public.user_event_intent ADD CONSTRAINT user_event_intent_user_id_event_id_intent_type_key UNIQUE (user_id, event_id, intent_type);

-- Add Indexes from 010
CREATE INDEX IF NOT EXISTS idx_user_event_intent_user_id ON public.user_event_intent(user_id);
CREATE INDEX IF NOT EXISTS idx_user_event_intent_event_id ON public.user_event_intent(event_id);
CREATE INDEX IF NOT EXISTS idx_user_event_intent_type ON public.user_event_intent(intent_type);
-- Composite index
CREATE INDEX IF NOT EXISTS idx_user_event_intent_user_type ON public.user_event_intent(user_id, intent_type);

-- Verify structure
SELECT 'Fixed table structure for user_event_intent' as status;
