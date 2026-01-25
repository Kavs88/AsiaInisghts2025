-- Sunday Market Platform - Safe Schema (Handles Existing Tables)
-- This version uses IF NOT EXISTS to avoid errors if tables already exist
-- Run this if you get "relation already exists" errors

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For fuzzy text search

-- ============================================
-- TABLES (with IF NOT EXISTS)
-- ============================================

-- Users table (extends Supabase Auth)
CREATE TABLE IF NOT EXISTS public.users (
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
CREATE TABLE IF NOT EXISTS public.vendors (
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
CREATE TABLE IF NOT EXISTS public.market_days (
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
CREATE TABLE IF NOT EXISTS public.market_stalls (
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
CREATE TABLE IF NOT EXISTS public.products (
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
CREATE TABLE IF NOT EXISTS public.vendor_portfolio_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    title TEXT,
    description TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT UNIQUE NOT NULL,
    customer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
    market_day_id UUID REFERENCES public.market_days(id) ON DELETE SET NULL,
    fulfillment_type TEXT NOT NULL CHECK (fulfillment_type IN ('pickup', 'delivery')),
    delivery_address TEXT,
    subtotal DECIMAL(10, 2) NOT NULL,
    tax_amount DECIMAL(10, 2) DEFAULT 0,
    shipping_amount DECIMAL(10, 2) DEFAULT 0,
    total_amount DECIMAL(10, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'fulfilled', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order Items table
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10, 2) NOT NULL,
    line_total DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Deliveries table (for tracking delivery status)
CREATE TABLE IF NOT EXISTS public.deliveries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID UNIQUE NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'scheduled', 'out_for_delivery', 'delivered', 'failed')),
    scheduled_date DATE,
    tracking_number TEXT,
    delivery_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order Intents table (customer requests before formal orders)
CREATE TABLE IF NOT EXISTS public.order_intents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
    market_day_id UUID NOT NULL REFERENCES public.market_days(id) ON DELETE CASCADE,
    intent_type TEXT NOT NULL CHECK (intent_type IN ('pickup', 'delivery')),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT,
    customer_notes TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'declined', 'fulfilled', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES (with IF NOT EXISTS)
-- ============================================

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- Vendors indexes
CREATE INDEX IF NOT EXISTS idx_vendors_user_id ON public.vendors(user_id);
CREATE INDEX IF NOT EXISTS idx_vendors_slug ON public.vendors(slug);
CREATE INDEX IF NOT EXISTS idx_vendors_category ON public.vendors(category);
CREATE INDEX IF NOT EXISTS idx_vendors_is_active ON public.vendors(is_active);
CREATE INDEX IF NOT EXISTS idx_vendors_is_verified ON public.vendors(is_verified);

-- Products indexes
CREATE INDEX IF NOT EXISTS idx_products_vendor_id ON public.products(vendor_id);
CREATE INDEX IF NOT EXISTS idx_products_vendor_id_available ON public.products(vendor_id, is_available);
CREATE INDEX IF NOT EXISTS idx_products_is_available ON public.products(is_available);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);

-- Full-text search index for products (using pg_trgm)
-- Note: GIN indexes can't use IF NOT EXISTS, so we check first
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_products_search'
    ) THEN
        CREATE INDEX idx_products_search ON public.products USING gin (
            name gin_trgm_ops,
            description gin_trgm_ops
        );
    END IF;
END $$;

-- Combined index for vendor name search
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_vendors_search'
    ) THEN
        CREATE INDEX idx_vendors_search ON public.vendors USING gin (
            name gin_trgm_ops,
            tagline gin_trgm_ops
        );
    END IF;
END $$;

-- Market Days indexes
CREATE INDEX IF NOT EXISTS idx_market_days_date ON public.market_days(market_date DESC);
CREATE INDEX IF NOT EXISTS idx_market_days_published ON public.market_days(is_published);

-- Market Stalls indexes
CREATE INDEX IF NOT EXISTS idx_market_stalls_market_day ON public.market_stalls(market_day_id);
CREATE INDEX IF NOT EXISTS idx_market_stalls_vendor ON public.market_stalls(vendor_id);

-- Orders indexes
CREATE INDEX IF NOT EXISTS idx_orders_customer ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_vendor ON public.orders(vendor_id);
CREATE INDEX IF NOT EXISTS idx_orders_market_day ON public.orders(market_day_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

-- Order Items indexes
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON public.order_items(product_id);

-- Order Intents indexes
CREATE INDEX IF NOT EXISTS idx_order_intents_vendor ON public.order_intents(vendor_id);
CREATE INDEX IF NOT EXISTS idx_order_intents_product ON public.order_intents(product_id);
CREATE INDEX IF NOT EXISTS idx_order_intents_market_day ON public.order_intents(market_day_id);
CREATE INDEX IF NOT EXISTS idx_order_intents_status ON public.order_intents(status);
CREATE INDEX IF NOT EXISTS idx_order_intents_customer_email ON public.order_intents(customer_email);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to get current user ID
CREATE OR REPLACE FUNCTION public.current_user_id()
RETURNS UUID AS $$
    SELECT auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.users
        WHERE id = user_id AND role = 'admin'
    );
$$ LANGUAGE sql SECURITY DEFINER;

-- Function to check if user is vendor
CREATE OR REPLACE FUNCTION public.is_vendor(user_id UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.vendors
        WHERE user_id = user_id
    );
$$ LANGUAGE sql SECURITY DEFINER;

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to generate order number
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TEXT AS $$
    SELECT 'SM-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
$$ LANGUAGE sql;

-- ============================================
-- TRIGGERS (for auto-updating updated_at)
-- ============================================

-- Drop existing triggers if they exist, then recreate
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_vendors_updated_at ON public.vendors;
CREATE TRIGGER update_vendors_updated_at
    BEFORE UPDATE ON public.vendors
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;
CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_order_intents_updated_at ON public.order_intents;
CREATE TRIGGER update_order_intents_updated_at
    BEFORE UPDATE ON public.order_intents
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_intents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_stalls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_portfolio_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;

-- Users policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Vendors policies
DROP POLICY IF EXISTS "Vendors are publicly viewable" ON public.vendors;
CREATE POLICY "Vendors are publicly viewable" ON public.vendors
    FOR SELECT USING (is_active = TRUE);

DROP POLICY IF EXISTS "Vendors can update their own profile" ON public.vendors;
CREATE POLICY "Vendors can update their own profile" ON public.vendors
    FOR UPDATE USING (user_id = auth.uid());

-- Products policies
DROP POLICY IF EXISTS "Products are publicly viewable" ON public.products;
CREATE POLICY "Products are publicly viewable" ON public.products
    FOR SELECT USING (is_available = TRUE);

DROP POLICY IF EXISTS "Vendors can manage their own products" ON public.products;
CREATE POLICY "Vendors can manage their own products" ON public.products
    FOR ALL USING (
        vendor_id IN (
            SELECT id FROM public.vendors WHERE user_id = auth.uid()
        )
    );

-- Market Days policies
DROP POLICY IF EXISTS "Published market days are publicly viewable" ON public.market_days;
CREATE POLICY "Published market days are publicly viewable" ON public.market_days
    FOR SELECT USING (is_published = TRUE);

-- Market Stalls policies
DROP POLICY IF EXISTS "Market stalls are publicly viewable" ON public.market_stalls;
CREATE POLICY "Market stalls are publicly viewable" ON public.market_stalls
    FOR SELECT USING (TRUE);

-- Orders policies
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
CREATE POLICY "Users can view their own orders" ON public.orders
    FOR SELECT USING (customer_id = auth.uid());

DROP POLICY IF EXISTS "Vendors can view their own orders" ON public.orders;
CREATE POLICY "Vendors can view their own orders" ON public.orders
    FOR SELECT USING (
        vendor_id IN (
            SELECT id FROM public.vendors WHERE user_id = auth.uid()
        )
    );

-- Order Intents policies
DROP POLICY IF EXISTS "Order intents are publicly readable" ON public.order_intents;
CREATE POLICY "Order intents are publicly readable" ON public.order_intents
    FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Anyone can create order intents" ON public.order_intents;
CREATE POLICY "Anyone can create order intents" ON public.order_intents
    FOR INSERT WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Vendors can update their order intents" ON public.order_intents;
CREATE POLICY "Vendors can update their order intents" ON public.order_intents
    FOR UPDATE USING (
        vendor_id IN (
            SELECT id FROM public.vendors WHERE user_id = auth.uid()
        )
    );

-- Portfolio items policies
DROP POLICY IF EXISTS "Portfolio items are publicly viewable" ON public.vendor_portfolio_items;
CREATE POLICY "Portfolio items are publicly viewable" ON public.vendor_portfolio_items
    FOR SELECT USING (TRUE);

-- Deliveries policies
DROP POLICY IF EXISTS "Deliveries follow order access" ON public.deliveries;
CREATE POLICY "Deliveries follow order access" ON public.deliveries
    FOR SELECT USING (
        order_id IN (
            SELECT id FROM public.orders 
            WHERE customer_id = auth.uid() 
            OR vendor_id IN (
                SELECT id FROM public.vendors WHERE user_id = auth.uid()
            )
        )
    );

