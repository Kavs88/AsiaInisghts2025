-- Order Intents Table
-- Allows customers to express intent to purchase without full checkout
-- No payments, no customer accounts required

-- Create enum types
DO $$ BEGIN
  CREATE TYPE intent_type AS ENUM ('pickup', 'delivery');
  CREATE TYPE intent_status AS ENUM ('pending', 'confirmed', 'fulfilled', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create order_intents table
CREATE TABLE IF NOT EXISTS public.order_intents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  market_day_id UUID NOT NULL REFERENCES public.market_days(id) ON DELETE CASCADE,
  intent_type intent_type NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_notes TEXT,
  status intent_status DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_order_intents_vendor_id ON public.order_intents(vendor_id);
CREATE INDEX IF NOT EXISTS idx_order_intents_market_day_id ON public.order_intents(market_day_id);
CREATE INDEX IF NOT EXISTS idx_order_intents_product_id ON public.order_intents(product_id);
CREATE INDEX IF NOT EXISTS idx_order_intents_status ON public.order_intents(status);
CREATE INDEX IF NOT EXISTS idx_order_intents_created_at ON public.order_intents(created_at DESC);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_order_intents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_order_intents_updated_at
  BEFORE UPDATE ON public.order_intents
  FOR EACH ROW
  EXECUTE FUNCTION update_order_intents_updated_at();

-- RLS Policies

-- Enable RLS
ALTER TABLE public.order_intents ENABLE ROW LEVEL SECURITY;

-- Policy: Public can insert order intents
CREATE POLICY order_intents_public_insert ON public.order_intents
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Policy: Vendors can read their own order intents
CREATE POLICY order_intents_vendor_read ON public.order_intents
  FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM public.vendors
      WHERE vendors.id = order_intents.vendor_id
      AND vendors.user_id = auth.uid()
    )
  );

-- Policy: Vendors can update status of their own order intents
CREATE POLICY order_intents_vendor_update ON public.order_intents
  FOR UPDATE
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM public.vendors
      WHERE vendors.id = order_intents.vendor_id
      AND vendors.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.vendors
      WHERE vendors.id = order_intents.vendor_id
      AND vendors.user_id = auth.uid()
    )
  );

-- Note: For now, we allow public read for vendor pages (will be restricted later with proper auth)
-- In production, this should be restricted to authenticated vendors only
CREATE POLICY order_intents_public_read_for_vendor_pages ON public.order_intents
  FOR SELECT
  TO public
  USING (true); -- Temporary: allow public read for vendor visibility (will be restricted with auth)

