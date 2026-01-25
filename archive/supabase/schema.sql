-- Sunday Market Platform - Complete Supabase Schema
-- Production-ready SQL schema with RLS policies and indexes

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For fuzzy text search

-- ============================================
-- TABLES
-- ============================================

-- Users table (extends Supabase Auth)
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'vendor', 'admin')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vendors table
CREATE TABLE public.vendors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    tagline TEXT,
    bio TEXT,
    logo_url TEXT,
    hero_image_url TEXT,
    category TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    contact_email TEXT,
    contact_phone TEXT,
    website_url TEXT,
    instagram_handle TEXT,
    facebook_url TEXT,
    delivery_available BOOLEAN DEFAULT FALSE,
    pickup_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Market Days table
CREATE TABLE public.market_days (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    market_date DATE NOT NULL,
    location_name TEXT NOT NULL,
    location_address TEXT,
    location_coords POINT, -- PostGIS point for map center
    start_time TIME,
    end_time TIME,
    is_published BOOLEAN DEFAULT FALSE,
    stall_map JSONB, -- Stores SVG coordinates and stall positions
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(market_date)
);

-- Market Stalls table (vendor assignments to stalls on market days)
CREATE TABLE public.market_stalls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    market_day_id UUID NOT NULL REFERENCES public.market_days(id) ON DELETE CASCADE,
    vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
    stall_number TEXT NOT NULL,
    attending_physically BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(market_day_id, stall_number),
    UNIQUE(market_day_id, vendor_id)
);

-- Products table
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    compare_at_price DECIMAL(10, 2),
    sku TEXT,
    stock_quantity INTEGER DEFAULT 0,
    is_available BOOLEAN DEFAULT TRUE,
    requires_preorder BOOLEAN DEFAULT FALSE,
    preorder_lead_days INTEGER DEFAULT 0,
    image_urls TEXT[], -- Array of image URLs
    category TEXT,
    tags TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(vendor_id, slug)
);

-- Vendor Portfolio Items table
CREATE TABLE public.vendor_portfolio_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
    title TEXT,
    description TEXT,
    image_url TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders table
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    market_day_id UUID REFERENCES public.market_days(id) ON DELETE SET NULL,
    vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE RESTRICT,
    order_number TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled')),
    fulfillment_type TEXT NOT NULL CHECK (fulfillment_type IN ('pickup', 'delivery')),
    delivery_address TEXT,
    delivery_notes TEXT,
    total_amount DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    tax_amount DECIMAL(10, 2) DEFAULT 0,
    shipping_amount DECIMAL(10, 2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order Items table
CREATE TABLE public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10, 2) NOT NULL,
    line_total DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Deliveries table (for tracking delivery status)
CREATE TABLE public.deliveries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID UNIQUE NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'scheduled', 'out_for_delivery', 'delivered', 'failed')),
    scheduled_date DATE,
    tracking_number TEXT,
    delivery_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES (for performance)
-- ============================================

-- Users indexes
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_email ON public.users(email);

-- Vendors indexes
CREATE INDEX idx_vendors_user_id ON public.vendors(user_id);
CREATE INDEX idx_vendors_slug ON public.vendors(slug);
CREATE INDEX idx_vendors_category ON public.vendors(category);
CREATE INDEX idx_vendors_is_active ON public.vendors(is_active);
CREATE INDEX idx_vendors_is_verified ON public.vendors(is_verified);

-- Products indexes
CREATE INDEX idx_products_vendor_id ON public.products(vendor_id);
CREATE INDEX idx_products_vendor_id_available ON public.products(vendor_id, is_available);
CREATE INDEX idx_products_is_available ON public.products(is_available);
CREATE INDEX idx_products_category ON public.products(category);
CREATE INDEX idx_products_slug ON public.products(slug);

-- Full-text search index for products (using pg_trgm)
CREATE INDEX idx_products_search ON public.products USING gin (
    name gin_trgm_ops,
    description gin_trgm_ops
);

-- Combined index for vendor name search
CREATE INDEX idx_vendors_search ON public.vendors USING gin (
    name gin_trgm_ops,
    tagline gin_trgm_ops
);

-- Market Days indexes
CREATE INDEX idx_market_days_date ON public.market_days(market_date DESC);
CREATE INDEX idx_market_days_published ON public.market_days(is_published);

-- Market Stalls indexes
CREATE INDEX idx_market_stalls_market_day ON public.market_stalls(market_day_id);
CREATE INDEX idx_market_stalls_vendor ON public.market_stalls(vendor_id);
CREATE INDEX idx_market_stalls_stall_number ON public.market_stalls(market_day_id, stall_number);

-- Orders indexes
CREATE INDEX idx_orders_customer_id ON public.orders(customer_id);
CREATE INDEX idx_orders_market_day_id ON public.orders(market_day_id);
CREATE INDEX idx_orders_vendor_id ON public.orders(vendor_id);
CREATE INDEX idx_orders_customer_market ON public.orders(customer_id, market_day_id);
CREATE INDEX idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX idx_orders_status ON public.orders(status);

-- Order Items indexes
CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX idx_order_items_product_id ON public.order_items(product_id);

-- Portfolio indexes
CREATE INDEX idx_portfolio_vendor_id ON public.vendor_portfolio_items(vendor_id, display_order);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_portfolio_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_stalls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.users
        WHERE id = user_id AND role = 'admin'
    );
$$ LANGUAGE sql SECURITY DEFINER;

-- Helper function to check if user is vendor
CREATE OR REPLACE FUNCTION public.is_vendor(user_id UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.users
        WHERE id = user_id AND role IN ('vendor', 'admin')
    );
$$ LANGUAGE sql SECURITY DEFINER;

-- Helper function to get current user ID
CREATE OR REPLACE FUNCTION public.current_user_id()
RETURNS UUID AS $$
    SELECT auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Users policies
CREATE POLICY "Users can view all users"
    ON public.users FOR SELECT
    USING (true); -- Allow viewing all users (adjust based on your privacy needs)

CREATE POLICY "Users can update own profile"
    ON public.users FOR UPDATE
    USING (id = current_user_id());

-- Vendors policies
CREATE POLICY "Anyone can view active vendors"
    ON public.vendors FOR SELECT
    USING (is_active = TRUE);

CREATE POLICY "Vendors can update own vendor profile"
    ON public.vendors FOR UPDATE
    USING (user_id = current_user_id() OR is_admin(current_user_id()));

CREATE POLICY "Vendors can insert own vendor profile"
    ON public.vendors FOR INSERT
    WITH CHECK (user_id = current_user_id() OR is_admin(current_user_id()));

-- Products policies
CREATE POLICY "Anyone can view available products"
    ON public.products FOR SELECT
    USING (is_available = TRUE OR vendor_id IN (
        SELECT id FROM public.vendors WHERE user_id = current_user_id()
    ) OR is_admin(current_user_id()));

CREATE POLICY "Vendors can manage own products"
    ON public.products FOR ALL
    USING (
        vendor_id IN (SELECT id FROM public.vendors WHERE user_id = current_user_id())
        OR is_admin(current_user_id())
    );

-- Portfolio policies
CREATE POLICY "Anyone can view portfolio items"
    ON public.vendor_portfolio_items FOR SELECT
    USING (vendor_id IN (SELECT id FROM public.vendors WHERE is_active = TRUE));

CREATE POLICY "Vendors can manage own portfolio"
    ON public.vendor_portfolio_items FOR ALL
    USING (
        vendor_id IN (SELECT id FROM public.vendors WHERE user_id = current_user_id())
        OR is_admin(current_user_id())
    );

-- Market Days policies
CREATE POLICY "Anyone can view published market days"
    ON public.market_days FOR SELECT
    USING (is_published = TRUE OR is_admin(current_user_id()));

CREATE POLICY "Only admins can manage market days"
    ON public.market_days FOR ALL
    USING (is_admin(current_user_id()));

-- Market Stalls policies
CREATE POLICY "Anyone can view market stalls for published markets"
    ON public.market_stalls FOR SELECT
    USING (
        market_day_id IN (SELECT id FROM public.market_days WHERE is_published = TRUE)
        OR is_admin(current_user_id())
    );

CREATE POLICY "Vendors can claim stalls (insert only)"
    ON public.market_stalls FOR INSERT
    WITH CHECK (
        vendor_id IN (SELECT id FROM public.vendors WHERE user_id = current_user_id())
        OR is_admin(current_user_id())
    );

CREATE POLICY "Only admins can update stall assignments"
    ON public.market_stalls FOR UPDATE
    USING (is_admin(current_user_id()));

-- Orders policies
CREATE POLICY "Customers can view own orders"
    ON public.orders FOR SELECT
    USING (
        customer_id = current_user_id()
        OR vendor_id IN (SELECT id FROM public.vendors WHERE user_id = current_user_id())
        OR is_admin(current_user_id())
    );

CREATE POLICY "Customers can create orders"
    ON public.orders FOR INSERT
    WITH CHECK (customer_id = current_user_id());

CREATE POLICY "Vendors can update own vendor orders"
    ON public.orders FOR UPDATE
    USING (
        vendor_id IN (SELECT id FROM public.vendors WHERE user_id = current_user_id())
        OR is_admin(current_user_id())
    );

-- Order Items policies
CREATE POLICY "Order items visible with order"
    ON public.order_items FOR SELECT
    USING (
        order_id IN (
            SELECT id FROM public.orders
            WHERE customer_id = current_user_id()
            OR vendor_id IN (SELECT id FROM public.vendors WHERE user_id = current_user_id())
            OR is_admin(current_user_id())
        )
    );

CREATE POLICY "Order items can be created with order"
    ON public.order_items FOR INSERT
    WITH CHECK (
        order_id IN (
            SELECT id FROM public.orders WHERE customer_id = current_user_id()
        )
    );

-- Deliveries policies
CREATE POLICY "Deliveries visible with order"
    ON public.deliveries FOR SELECT
    USING (
        order_id IN (
            SELECT id FROM public.orders
            WHERE customer_id = current_user_id()
            OR vendor_id IN (SELECT id FROM public.vendors WHERE user_id = current_user_id())
            OR is_admin(current_user_id())
        )
    );

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
    new_number TEXT;
BEGIN
    new_number := 'SM-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    -- Check for uniqueness (simple version - in production use sequence)
    RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON public.vendors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- GRANTS (for service role access)
-- ============================================

-- Grant service role full access (bypasses RLS)
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- Grant authenticated users basic access (subject to RLS)
GRANT SELECT, INSERT, UPDATE ON public.users TO authenticated;
GRANT SELECT ON public.vendors TO authenticated;
GRANT SELECT ON public.products TO authenticated;
GRANT SELECT ON public.market_days TO authenticated;
GRANT SELECT ON public.market_stalls TO authenticated;
GRANT SELECT, INSERT ON public.orders TO authenticated;
GRANT SELECT, INSERT ON public.order_items TO authenticated;

