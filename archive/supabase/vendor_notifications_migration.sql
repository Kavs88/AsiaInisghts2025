-- Vendor Notifications Migration
-- Adds notification preferences to vendors table

-- Create notification channel enum
DO $$ BEGIN
  CREATE TYPE notification_channel AS ENUM ('email', 'whatsapp', 'zalo');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add notification columns to vendors table
ALTER TABLE public.vendors
  ADD COLUMN IF NOT EXISTS notification_channel notification_channel DEFAULT 'email',
  ADD COLUMN IF NOT EXISTS notification_target TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.vendors.notification_channel IS 'Preferred notification channel: email, whatsapp, or zalo';
COMMENT ON COLUMN public.vendors.notification_target IS 'Target for notifications: email address, WhatsApp number, or Zalo ID';

-- Create index for notification queries
CREATE INDEX IF NOT EXISTS idx_vendors_notification_channel ON public.vendors(notification_channel);

