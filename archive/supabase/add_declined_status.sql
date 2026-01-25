-- Add 'declined' status to intent_status enum
-- This migration adds the declined status option for order intents

-- Add 'declined' to the enum if it doesn't exist
DO $$ 
BEGIN
  -- Check if 'declined' already exists in the enum
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'declined' 
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'intent_status')
  ) THEN
    ALTER TYPE intent_status ADD VALUE 'declined';
  END IF;
END $$;

