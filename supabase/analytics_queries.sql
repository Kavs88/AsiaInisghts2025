-- Analytics & Enhanced Figures Queries
-- Use these to generate dashboards and reports

-- 1. Total sales today
SELECT
  date_trunc('day', o.created_at) as day,
  COUNT(DISTINCT o.id) as orders_count,
  COUNT(oi.*) as items_sold,
  COALESCE(SUM(oi.unit_price * oi.quantity),0) as revenue,
  ROUND(COALESCE(SUM(oi.unit_price * oi.quantity)/NULLIF(COUNT(DISTINCT o.id),0),0),2) AS avg_order_value
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
WHERE o.created_at >= date_trunc('day', now()) -- today
GROUP BY 1;

-- 2. Sales by vendor (last 30 days)
SELECT 
  v.id, 
  v.name,
  COUNT(DISTINCT o.id) AS orders_count,
  COALESCE(SUM(oi.unit_price * oi.quantity), 0) AS revenue,
  COALESCE(SUM(oi.quantity), 0) AS units_sold
FROM vendors v
LEFT JOIN products p ON p.vendor_id = v.id
LEFT JOIN order_items oi ON oi.product_id = p.id
LEFT JOIN orders o ON o.id = oi.order_id AND o.created_at >= now() - interval '30 days'
GROUP BY v.id, v.name
ORDER BY revenue DESC NULLS LAST;

-- 3. Top products (30 days)
SELECT 
  p.id, 
  p.name, 
  v.name AS vendor_name, 
  COALESCE(SUM(oi.quantity), 0) AS units_sold, 
  COALESCE(SUM(oi.quantity * oi.unit_price), 0) AS revenue
FROM products p
JOIN vendors v ON v.id = p.vendor_id
LEFT JOIN order_items oi ON oi.product_id = p.id
LEFT JOIN orders o ON o.id = oi.order_id AND o.created_at >= now() - interval '30 days'
GROUP BY p.id, p.name, v.name
ORDER BY units_sold DESC
LIMIT 20;

-- 4. Vendor conversion rate (views -> orders)
SELECT
  v.id, 
  v.name,
  COUNT(DISTINCT CASE WHEN ae.event_type = 'view_vendor' THEN ae.id END) AS unique_views,
  COUNT(DISTINCT o.id) AS orders_count,
  ROUND(100.0 * COUNT(DISTINCT o.id) / NULLIF(COUNT(DISTINCT CASE WHEN ae.event_type = 'view_vendor' THEN ae.id END),0), 2) AS conversion_rate_pct
FROM vendors v
LEFT JOIN analytics_events ae ON ae.vendor_id = v.id AND ae.event_type = 'view_vendor' AND ae.created_at >= now() - interval '30 days'
LEFT JOIN products p ON p.vendor_id = v.id
LEFT JOIN order_items oi ON oi.product_id = p.id
LEFT JOIN orders o ON o.id = oi.order_id AND o.created_at >= now() - interval '30 days'
GROUP BY v.id, v.name
ORDER BY conversion_rate_pct DESC NULLS LAST;

-- 5. Sales by day (last 7 days)
SELECT
  date_trunc('day', o.created_at) as day,
  COUNT(DISTINCT o.id) as orders_count,
  COALESCE(SUM(oi.unit_price * oi.quantity), 0) as revenue,
  COALESCE(SUM(oi.quantity), 0) as items_sold
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
WHERE o.created_at >= now() - interval '7 days'
GROUP BY 1
ORDER BY 1 DESC;

-- 6. Average order value by vendor
SELECT
  v.id,
  v.name,
  COUNT(DISTINCT o.id) as order_count,
  ROUND(COALESCE(AVG(order_totals.total), 0), 2) as avg_order_value
FROM vendors v
LEFT JOIN products p ON p.vendor_id = v.id
LEFT JOIN order_items oi ON oi.product_id = p.id
LEFT JOIN orders o ON o.id = oi.order_id
LEFT JOIN LATERAL (
  SELECT SUM(oi2.unit_price * oi2.quantity) as total
  FROM order_items oi2
  WHERE oi2.order_id = o.id
) order_totals ON true
WHERE o.created_at >= now() - interval '30 days' OR o.id IS NULL
GROUP BY v.id, v.name
ORDER BY avg_order_value DESC NULLS LAST;

-- 7. Items per order (average)
SELECT
  COUNT(DISTINCT o.id) as total_orders,
  COALESCE(SUM(oi.quantity), 0) as total_items,
  ROUND(COALESCE(SUM(oi.quantity)::numeric / NULLIF(COUNT(DISTINCT o.id), 0), 0), 2) as avg_items_per_order
FROM orders o
LEFT JOIN order_items oi ON oi.order_id = o.id
WHERE o.created_at >= now() - interval '30 days';

-- 8. Product-level conversion rate
SELECT
  p.id,
  p.name,
  v.name as vendor_name,
  COUNT(DISTINCT CASE WHEN ae.event_type = 'view_product' THEN ae.id END) as views,
  COUNT(DISTINCT o.id) as orders,
  ROUND(100.0 * COUNT(DISTINCT o.id) / NULLIF(COUNT(DISTINCT CASE WHEN ae.event_type = 'view_product' THEN ae.id END), 0), 2) as conversion_rate_pct
FROM products p
JOIN vendors v ON v.id = p.vendor_id
LEFT JOIN analytics_events ae ON ae.product_id = p.id AND ae.event_type = 'view_product' AND ae.created_at >= now() - interval '30 days'
LEFT JOIN order_items oi ON oi.product_id = p.id
LEFT JOIN orders o ON o.id = oi.order_id AND o.created_at >= now() - interval '30 days'
GROUP BY p.id, p.name, v.name
HAVING COUNT(DISTINCT CASE WHEN ae.event_type = 'view_product' THEN ae.id END) > 0
ORDER BY conversion_rate_pct DESC
LIMIT 20;

