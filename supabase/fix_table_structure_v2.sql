-- FIX TABLE STRUCTURE V2 (Corrected)
-- Problem: 'fix_and_seed' created 'user_event_intents' with 'status' column.
-- Code expects 'user_event_intent' with 'intent_type' column.

-- 1. Rename Table
ALTER TABLE IF EXISTS public.user_event_intents RENAME TO user_event_intent;

-- 2. Drop old policies
DROP POLICY IF EXISTS "Users manage own intents" ON public.user_event_intent;
DROP POLICY IF EXISTS "Public view counts" ON public.user_event_intent;

-- 3. Add intent_type column (if not exists)
ALTER TABLE public.user_event_intent ADD COLUMN IF NOT EXISTS intent_type TEXT;

-- 4. Migrate Data (Map 'status' to 'intent_type')
-- Only needed if there is data.
UPDATE public.user_event_intent SET intent_type = 'planning_to_attend' WHERE status = 'going';
UPDATE public.user_event_intent SET intent_type = 'favourite' WHERE status = 'maybe';
-- Remove 'not_going' as we don't track that anymore
DELETE FROM public.user_event_intent WHERE status = 'not_going';
-- Clean up any rows that didn't map (though fix_and_seed only used those 3)
DELETE FROM public.user_event_intent WHERE intent_type IS NULL;

-- 5. Add Constraints to intent_type
ALTER TABLE public.user_event_intent ALTER COLUMN intent_type SET NOT NULL;
ALTER TABLE public.user_event_intent DROP CONSTRAINT IF EXISTS user_event_intent_intent_type_check;
ALTER TABLE public.user_event_intent ADD CONSTRAINT user_event_intent_intent_type_check CHECK (intent_type IN ('favourite', 'planning_to_attend'));

-- 6. Drop old 'status' column
ALTER TABLE public.user_event_intent DROP COLUMN IF EXISTS status;

-- 7. Fix Primary Key / Unique Constraints
-- Drop the PK created by fix_and_seed
ALTER TABLE public.user_event_intent DROP CONSTRAINT IF EXISTS user_event_intents_pkey;

-- Add ID column if missing
ALTER TABLE public.user_event_intent ADD COLUMN IF NOT EXISTS id UUID DEFAULT gen_random_uuid() PRIMARY KEY;

-- Add the unique constraint required by the code
ALTER TABLE public.user_event_intent DROP CONSTRAINT IF EXISTS user_event_intent_user_id_event_id_intent_type_key;
ALTER TABLE public.user_event_intent ADD CONSTRAINT user_event_intent_user_id_event_id_intent_type_key UNIQUE (user_id, event_id, intent_type);

-- 8. Re-apply Correct Policies
ALTER TABLE public.user_event_intent ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own intents" ON public.user_event_intent;
CREATE POLICY "Users can read own intents" ON public.user_event_intent FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own intents" ON public.user_event_intent;
CREATE POLICY "Users can insert own intents" ON public.user_event_intent FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own intents" ON public.user_event_intent;
CREATE POLICY "Users can delete own intents" ON public.user_event_intent FOR DELETE USING (auth.uid() = user_id);

SELECT 'Table structure successfully fixed' as status;
