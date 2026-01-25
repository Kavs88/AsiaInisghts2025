-- Additional SQL functions for Sunday Market Platform
-- These functions support transactional operations and advanced queries

-- ============================================
-- PRODUCT STOCK MANAGEMENT
-- ============================================

-- Function to safely decrement product stock (with optimistic locking)
CREATE OR REPLACE FUNCTION decrement_product_stock(
  p_product_id UUID,
  p_quantity INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
  current_stock INTEGER;
BEGIN
  -- Get current stock with row lock
  SELECT stock_quantity INTO current_stock
  FROM products
  WHERE id = p_product_id
  FOR UPDATE;

  -- Check if sufficient stock
  IF current_stock IS NULL THEN
    RAISE EXCEPTION 'Product not found: %', p_product_id;
  END IF;

  IF current_stock < p_quantity THEN
    RAISE EXCEPTION 'Insufficient stock. Available: %, Requested: %', current_stock, p_quantity;
  END IF;

  -- Update stock
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

-- Function for product search using trigram similarity
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

-- Function to calculate order totals
CREATE OR REPLACE FUNCTION calculate_order_totals(
  p_subtotal DECIMAL,
  p_tax_rate DECIMAL DEFAULT 0.1,
  p_shipping_amount DECIMAL DEFAULT 0
)
RETURNS TABLE (
  subtotal DECIMAL,
  tax_amount DECIMAL,
  shipping_amount DECIMAL,
  total_amount DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p_subtotal,
    ROUND(p_subtotal * p_tax_rate, 2) AS tax_amount,
    p_shipping_amount,
    ROUND(p_subtotal + (p_subtotal * p_tax_rate) + p_shipping_amount, 2) AS total_amount;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- MARKET DAY HELPERS
-- ============================================

-- Function to get vendors attending a market day
CREATE OR REPLACE FUNCTION get_market_day_vendors(
  p_market_day_id UUID
)
RETURNS TABLE (
  vendor_id UUID,
  vendor_name TEXT,
  vendor_slug TEXT,
  stall_number TEXT,
  attending_physically BOOLEAN,
  delivery_available BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    v.id AS vendor_id,
    v.name AS vendor_name,
    v.slug AS vendor_slug,
    ms.stall_number,
    ms.attending_physically,
    v.delivery_available
  FROM market_stalls ms
  JOIN vendors v ON ms.vendor_id = v.id
  WHERE ms.market_day_id = p_market_day_id
    AND v.is_active = TRUE
  ORDER BY ms.stall_number;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- VENDOR STATISTICS
-- ============================================

-- Function to get vendor statistics
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
  -- Set date filters
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
-- ADMIN HELPERS
-- ============================================

-- Function to get market day summary
CREATE OR REPLACE FUNCTION get_market_day_summary(
  p_market_day_id UUID
)
RETURNS TABLE (
  vendor_id UUID,
  vendor_name TEXT,
  total_orders BIGINT,
  total_sales DECIMAL,
  total_items BIGINT,
  avg_order_value DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    v.id AS vendor_id,
    v.name AS vendor_name,
    COUNT(DISTINCT o.id) AS total_orders,
    COALESCE(SUM(o.total_amount), 0) AS total_sales,
    COALESCE(SUM(oi.quantity), 0) AS total_items,
    CASE
      WHEN COUNT(DISTINCT o.id) > 0
      THEN ROUND(SUM(o.total_amount)::DECIMAL / COUNT(DISTINCT o.id), 2)
      ELSE 0
    END AS avg_order_value
  FROM market_stalls ms
  JOIN vendors v ON ms.vendor_id = v.id
  LEFT JOIN orders o ON v.id = o.vendor_id AND o.market_day_id = p_market_day_id
  LEFT JOIN order_items oi ON o.id = oi.order_id
  WHERE ms.market_day_id = p_market_day_id
  GROUP BY v.id, v.name
  ORDER BY total_sales DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- DATA VALIDATION HELPERS
-- ============================================

-- Function to validate order before creation
CREATE OR REPLACE FUNCTION validate_order(
  p_items JSONB
)
RETURNS TABLE (
  is_valid BOOLEAN,
  error_message TEXT
) AS $$
DECLARE
  item JSONB;
  product_record RECORD;
  total_quantity INTEGER;
BEGIN
  -- Check if items array is not empty
  IF jsonb_array_length(p_items) = 0 THEN
    RETURN QUERY SELECT FALSE, 'Order must contain at least one item';
    RETURN;
  END IF;

  -- Validate each item
  FOR item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    -- Check if product exists and is available
    SELECT * INTO product_record
    FROM products
    WHERE id = (item->>'product_id')::UUID
      AND is_available = TRUE;

    IF NOT FOUND THEN
      RETURN QUERY SELECT FALSE, format('Product %s not found or unavailable', item->>'product_id');
      RETURN;
    END IF;

    -- Check stock availability (unless preorder)
    IF NOT product_record.requires_preorder THEN
      total_quantity := (item->>'quantity')::INTEGER;
      IF product_record.stock_quantity < total_quantity THEN
        RETURN QUERY SELECT FALSE, format(
          'Insufficient stock for product %s. Available: %s, Requested: %s',
          product_record.name,
          product_record.stock_quantity,
          total_quantity
        );
        RETURN;
      END IF;
    END IF;
  END LOOP;

  -- All validations passed
  RETURN QUERY SELECT TRUE, NULL::TEXT;
END;
$$ LANGUAGE plpgsql;






