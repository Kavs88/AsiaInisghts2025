-- Migration: 002_functions.sql
-- Description: Database functions for business logic
-- Created: 2025-01-29
-- Dependencies: 001_initial_schema.sql

-- ============================================
-- PRODUCT STOCK MANAGEMENT
-- ============================================

CREATE OR REPLACE FUNCTION decrement_product_stock(
  p_product_id UUID,
  p_quantity INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
  current_stock INTEGER;
BEGIN
  SELECT stock_quantity INTO current_stock
  FROM products
  WHERE id = p_product_id
  FOR UPDATE;

  IF current_stock IS NULL THEN
    RAISE EXCEPTION 'Product not found: %', p_product_id;
  END IF;

  IF current_stock < p_quantity THEN
    RAISE EXCEPTION 'Insufficient stock. Available: %, Requested: %', current_stock, p_quantity;
  END IF;

  UPDATE products
  SET stock_quantity = stock_quantity - p_quantity,
      updated_at = NOW()
  WHERE id = p_product_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FULL-TEXT SEARCH FUNCTIONS
-- ============================================

CREATE OR REPLACE FUNCTION search_products(
  search_text TEXT,
  result_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  slug TEXT,
  description TEXT,
  price DECIMAL,
  image_urls TEXT[],
  vendor_id UUID,
  vendor_name TEXT,
  vendor_slug TEXT,
  similarity REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.name,
    p.slug,
    p.description,
    p.price,
    p.image_urls,
    p.vendor_id,
    v.name AS vendor_name,
    v.slug AS vendor_slug,
    GREATEST(
      similarity(p.name, search_text),
      similarity(COALESCE(p.description, ''), search_text),
      similarity(v.name, search_text)
    ) AS similarity
  FROM products p
  JOIN vendors v ON p.vendor_id = v.id
  WHERE
    p.is_available = TRUE
    AND (
      p.name % search_text
      OR p.description % search_text
      OR v.name % search_text
    )
  ORDER BY similarity DESC
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- ORDER MANAGEMENT
-- ============================================

CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  new_number TEXT;
BEGIN
  -- Generate format: ORD-YYYYMMDD-XXXXX
  new_number := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
                LPAD(FLOOR(RANDOM() * 99999)::TEXT, 5, '0');
  
  -- Ensure uniqueness
  WHILE EXISTS (SELECT 1 FROM orders WHERE order_number = new_number) LOOP
    new_number := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
                  LPAD(FLOOR(RANDOM() * 99999)::TEXT, 5, '0');
  END LOOP;
  
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- ADMIN HELPERS
-- ============================================

-- Check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user is vendor
CREATE OR REPLACE FUNCTION is_vendor(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = user_id AND role = 'vendor'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get current user ID from JWT
CREATE OR REPLACE FUNCTION current_user_id()
RETURNS UUID AS $$
BEGIN
  RETURN auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- VENDOR STATISTICS
-- ============================================

CREATE OR REPLACE FUNCTION get_vendor_stats(
  p_vendor_id UUID,
  p_start_date DATE DEFAULT NULL,
  p_end_date DATE DEFAULT NULL
)
RETURNS TABLE (
  total_orders BIGINT,
  total_revenue DECIMAL,
  total_products INTEGER,
  active_products INTEGER,
  pending_orders BIGINT
) AS $$
DECLARE
  start_filter DATE;
  end_filter DATE;
BEGIN
  start_filter := COALESCE(p_start_date, CURRENT_DATE - INTERVAL '30 days');
  end_filter := COALESCE(p_end_date, CURRENT_DATE);

  RETURN QUERY
  SELECT
    COUNT(DISTINCT o.id) AS total_orders,
    COALESCE(SUM(o.total_amount), 0) AS total_revenue,
    COUNT(DISTINCT p.id) AS total_products,
    COUNT(DISTINCT CASE WHEN p.is_available = TRUE THEN p.id END) AS active_products,
    COUNT(DISTINCT CASE WHEN o.status = 'pending' THEN o.id END) AS pending_orders
  FROM vendors v
  LEFT JOIN products p ON v.id = p.vendor_id
  LEFT JOIN orders o ON v.id = o.vendor_id
    AND o.created_at::DATE BETWEEN start_filter AND end_filter
  WHERE v.id = p_vendor_id
  GROUP BY v.id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- VENDOR CHANGE REQUESTS
-- ============================================

-- Apply approved vendor change request
CREATE OR REPLACE FUNCTION apply_vendor_change_request(
  p_request_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_request RECORD;
  v_changes JSONB;
BEGIN
  -- Get the change request
  SELECT * INTO v_request
  FROM vendor_change_requests
  WHERE id = p_request_id
    AND status = 'approved'
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Change request not found or not approved';
  END IF;

  v_changes := v_request.changes;

  -- Apply changes to vendor record
  UPDATE vendors
  SET
    name = COALESCE(v_changes->>'name', name),
    tagline = COALESCE(v_changes->>'tagline', tagline),
    bio = COALESCE(v_changes->>'bio', bio),
    category = COALESCE(v_changes->>'category', category),
    contact_email = COALESCE(v_changes->>'contact_email', contact_email),
    contact_phone = COALESCE(v_changes->>'contact_phone', contact_phone),
    website_url = COALESCE(v_changes->>'website_url', website_url),
    instagram_handle = COALESCE(v_changes->>'instagram_handle', instagram_handle),
    facebook_url = COALESCE(v_changes->>'facebook_url', facebook_url),
    delivery_available = COALESCE((v_changes->>'delivery_available')::BOOLEAN, delivery_available),
    pickup_available = COALESCE((v_changes->>'pickup_available')::BOOLEAN, pickup_available),
    updated_at = NOW()
  WHERE id = v_request.vendor_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;






