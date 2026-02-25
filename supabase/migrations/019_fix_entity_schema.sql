-- Migration: 019_fix_entity_schema.sql
-- Description: Adds visual fields (logo, hero) to entities for unified display.
--             Adds trust_badges to legacy tables for query compatibility.

-- 1. Add Visual Fields to Unified Entities Table
ALTER TABLE public.entities 
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS hero_image_url TEXT,
ADD COLUMN IF NOT EXISTS trust_badges TEXT[] DEFAULT '{}';

-- 2. Backfill Visual Fields from Vendors
UPDATE public.entities e
SET 
    logo_url = v.logo_url,
    hero_image_url = v.hero_image_url
FROM public.vendors v
WHERE e.legacy_vendor_id = v.id;

-- 3. Backfill Visual Fields from Businesses
UPDATE public.entities e
SET 
    logo_url = b.logo_url,
    hero_image_url = b.hero_image_url
FROM public.businesses b
WHERE e.legacy_business_id = b.id;

-- 4. Add Trust Badges to Legacy Tables (Backward Compatibility)
ALTER TABLE public.vendors 
ADD COLUMN IF NOT EXISTS trust_badges TEXT[] DEFAULT '{}';

ALTER TABLE public.businesses 
ADD COLUMN IF NOT EXISTS trust_badges TEXT[] DEFAULT '{}';

-- 5. Sync Trust Badges (Initial Sync is empty, trigger or manual update needed later)
-- For now, initialize empty.

-- 6. Create Trigger to Sync Trust Badges (Optional but good for consistency)
-- If trust_badges changes in entities, should it update vendors?
-- Given "Unified Intelligence" direction, entities should be master.
-- But legacy UI reads vendors.
-- Let's add a sync function for entities -> vendors/businesses trust_badges

CREATE OR REPLACE FUNCTION public.sync_trust_badges_to_legacy()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.type = 'vendor' AND NEW.legacy_vendor_id IS NOT NULL THEN
        UPDATE public.vendors 
        SET trust_badges = NEW.trust_badges 
        WHERE id = NEW.legacy_vendor_id;
    ELSIF NEW.type = 'business' AND NEW.legacy_business_id IS NOT NULL THEN
        UPDATE public.businesses 
        SET trust_badges = NEW.trust_badges 
        WHERE id = NEW.legacy_business_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_sync_trust_badges ON public.entities;
CREATE TRIGGER trigger_sync_trust_badges
    AFTER UPDATE OF trust_badges ON public.entities
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_trust_badges_to_legacy();
