-- Migration: Enhance businesses table for parity with vendors
-- Description: Adds hero_image_url, tagline, and delivery flags to businesses table

-- Add missing fields to businesses table
ALTER TABLE businesses
ADD COLUMN IF NOT EXISTS hero_image_url TEXT,
ADD COLUMN IF NOT EXISTS tagline TEXT,
ADD COLUMN IF NOT EXISTS delivery_available BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS pickup_available BOOLEAN DEFAULT false;

-- Migrate first image to hero_image_url if hero_image_url is null
UPDATE businesses
SET hero_image_url = images[1]
WHERE hero_image_url IS NULL 
  AND images IS NOT NULL 
  AND array_length(images, 1) > 0;

-- Extract tagline from description (first sentence) if tagline is null
UPDATE businesses
SET tagline = split_part(description, '.', 1) || '.'
WHERE tagline IS NULL 
  AND description IS NOT NULL 
  AND length(description) > 0;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_businesses_hero_image ON businesses(hero_image_url);
CREATE INDEX IF NOT EXISTS idx_businesses_tagline ON businesses(tagline);
