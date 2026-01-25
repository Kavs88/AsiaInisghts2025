-- Database Trigger for Order Intent Notifications
-- IMPORTANT: Run supabase/order_intents_schema.sql FIRST to create the order_intents table
-- Note: PostgreSQL cannot directly call HTTP endpoints
-- This trigger logs the intent and the application layer handles notifications
-- Alternatively, use Supabase webhooks or pg_net extension for direct HTTP calls

-- Check if order_intents table exists before creating trigger
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'order_intents'
  ) THEN
    RAISE EXCEPTION 'order_intents table does not exist. Please run supabase/order_intents_schema.sql first.';
  END IF;
END $$;

-- Create a function that will be called on order_intent insert
CREATE OR REPLACE FUNCTION notify_vendor_on_intent()
RETURNS TRIGGER AS $$
BEGIN
  -- Log the intent creation (for debugging)
  RAISE NOTICE 'New order intent created: % for vendor %', NEW.id, NEW.vendor_id;
  
  -- The actual notification will be handled by the application layer
  -- after the insert succeeds, to avoid blocking the transaction
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trg_notify_vendor_on_intent ON public.order_intents;
CREATE TRIGGER trg_notify_vendor_on_intent
  AFTER INSERT ON public.order_intents
  FOR EACH ROW
  EXECUTE FUNCTION notify_vendor_on_intent();

-- Note: For production, consider using Supabase webhooks or pg_net extension
-- to make HTTP calls directly from the database trigger

