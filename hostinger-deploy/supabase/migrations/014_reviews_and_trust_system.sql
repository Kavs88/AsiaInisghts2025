-- Migration 014: Reviews and Trust System
-- Creates reviews table with support for Business, Vendor, and Market Day reviews
-- Includes verified purchase tracking, moderation status, and helpful voting

-- ============================================
-- REVIEWS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL, -- The ID of the Business, Vendor, or Market Day
    subject_type TEXT NOT NULL CHECK (subject_type IN ('business', 'vendor', 'market_day')),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    images TEXT[], -- Array of photo URLs
    is_verified BOOLEAN DEFAULT FALSE, -- True if user has purchased from this subject
    status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'reported', 'hidden')),
    helpful_count INTEGER DEFAULT 0, -- Community voting for helpful reviews
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure one review per user per subject
    UNIQUE(user_id, subject_id, subject_type)
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_reviews_subject ON public.reviews(subject_id, subject_type);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON public.reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON public.reviews(status) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON public.reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON public.reviews(created_at DESC);

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_reviews_subject_status_rating ON public.reviews(subject_id, subject_type, status, rating);

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================

CREATE OR REPLACE FUNCTION update_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_reviews_updated_at
    BEFORE UPDATE ON public.reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_reviews_updated_at();

-- ============================================
-- REVIEW HELPFUL VOTES TABLE (Optional Community Feature)
-- ============================================

CREATE TABLE IF NOT EXISTS public.review_helpful_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id UUID NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(review_id, user_id) -- One vote per user per review
);

CREATE INDEX IF NOT EXISTS idx_review_helpful_votes_review ON public.review_helpful_votes(review_id);
CREATE INDEX IF NOT EXISTS idx_review_helpful_votes_user ON public.review_helpful_votes(user_id);

-- ============================================
-- FUNCTION: Update helpful_count on review_helpful_votes
-- ============================================

CREATE OR REPLACE FUNCTION update_review_helpful_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.reviews
        SET helpful_count = helpful_count + 1
        WHERE id = NEW.review_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.reviews
        SET helpful_count = GREATEST(0, helpful_count - 1)
        WHERE id = OLD.review_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_review_helpful_count_trigger
    AFTER INSERT OR DELETE ON public.review_helpful_votes
    FOR EACH ROW
    EXECUTE FUNCTION update_review_helpful_count();

-- ============================================
-- FUNCTION: Check if user can verify purchase
-- ============================================

CREATE OR REPLACE FUNCTION check_verified_purchase(
    p_user_id UUID,
    p_subject_id UUID,
    p_subject_type TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    has_order BOOLEAN := FALSE;
BEGIN
    -- For businesses and vendors, check if user has orders
    IF p_subject_type IN ('business', 'vendor') THEN
        SELECT EXISTS(
            SELECT 1
            FROM public.orders o
            WHERE o.customer_id = p_user_id
            AND (
                -- For vendors: direct vendor_id match
                (p_subject_type = 'vendor' AND o.vendor_id = p_subject_id)
                OR
                -- For businesses: check via vendors linked to business
                (p_subject_type = 'business' AND EXISTS(
                    SELECT 1 FROM public.vendors v
                    WHERE v.id = o.vendor_id
                    AND v.business_id = p_subject_id
                ))
            )
            -- Accept completed orders (status values from orders table)
            AND o.status = 'completed'
        ) INTO has_order;
    END IF;
    
    -- For market_day, check if user RSVP'd "going" or "interested"
    IF p_subject_type = 'market_day' THEN
        SELECT EXISTS(
            SELECT 1
            FROM public.user_event_intents uei
            WHERE uei.user_id = p_user_id
            AND uei.market_day_id = p_subject_id
            AND uei.status IN ('going', 'interested')
        ) INTO has_order;
    END IF;
    
    RETURN has_order;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- VIEW: Review Summary Statistics
-- ============================================

CREATE OR REPLACE VIEW public.review_summaries AS
SELECT 
    subject_id,
    subject_type,
    COUNT(*) as total_reviews,
    AVG(rating)::NUMERIC(3,2) as average_rating,
    COUNT(*) FILTER (WHERE rating = 5) as five_star_count,
    COUNT(*) FILTER (WHERE rating = 4) as four_star_count,
    COUNT(*) FILTER (WHERE rating = 3) as three_star_count,
    COUNT(*) FILTER (WHERE rating = 2) as two_star_count,
    COUNT(*) FILTER (WHERE rating = 1) as one_star_count,
    COUNT(*) FILTER (WHERE is_verified = TRUE) as verified_reviews_count,
    MAX(created_at) as latest_review_at
FROM public.reviews
WHERE status = 'published'
GROUP BY subject_id, subject_type;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_helpful_votes ENABLE ROW LEVEL SECURITY;

-- Public can read published reviews
DROP POLICY IF EXISTS "Public can read published reviews" ON public.reviews;
CREATE POLICY "Public can read published reviews" ON public.reviews
    FOR SELECT USING (status = 'published');

-- Authenticated users can create their own reviews
DROP POLICY IF EXISTS "Users can create own reviews" ON public.reviews;
CREATE POLICY "Users can create own reviews" ON public.reviews
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own reviews
DROP POLICY IF EXISTS "Users can update own reviews" ON public.reviews;
CREATE POLICY "Users can update own reviews" ON public.reviews
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own reviews
DROP POLICY IF EXISTS "Users can delete own reviews" ON public.reviews;
CREATE POLICY "Users can delete own reviews" ON public.reviews
    FOR DELETE USING (auth.uid() = user_id);

-- Admins can manage all reviews
DROP POLICY IF EXISTS "Admins can manage all reviews" ON public.reviews;
CREATE POLICY "Admins can manage all reviews" ON public.reviews
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    );

-- Public can read helpful votes (for counts)
DROP POLICY IF EXISTS "Public can read helpful votes" ON public.review_helpful_votes;
CREATE POLICY "Public can read helpful votes" ON public.review_helpful_votes
    FOR SELECT USING (TRUE);

-- Authenticated users can vote helpful
DROP POLICY IF EXISTS "Users can vote helpful" ON public.review_helpful_votes;
CREATE POLICY "Users can vote helpful" ON public.review_helpful_votes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can remove their helpful vote
DROP POLICY IF EXISTS "Users can remove own helpful vote" ON public.review_helpful_votes;
CREATE POLICY "Users can remove own helpful vote" ON public.review_helpful_votes
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- MIGRATION COMPLETE
-- ============================================

COMMENT ON TABLE public.reviews IS 'User reviews for businesses, vendors, and market days';
COMMENT ON COLUMN public.reviews.subject_type IS 'Type of entity being reviewed: business, vendor, or market_day';
COMMENT ON COLUMN public.reviews.is_verified IS 'True if the reviewer has made a verified purchase/transaction';
COMMENT ON COLUMN public.reviews.status IS 'Review status: published (live), reported (flagged), hidden (moderated)';
COMMENT ON COLUMN public.reviews.helpful_count IS 'Number of users who found this review helpful';

