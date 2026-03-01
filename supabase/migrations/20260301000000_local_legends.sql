-- Migration: 20260301000000_local_legends.sql
-- Description: Additive editorial stories table for "Local Legends" feature.
--              Does NOT modify any existing tables, RLS policies, roles, or triggers.
-- Created: 2026-03-01

-- ============================================================
-- TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.local_legends (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                text        UNIQUE NOT NULL,
  title               text        NOT NULL,
  excerpt             text,
  body                text,
  hero_image_url      text,
  audio_url           text,
  video_url           text,
  related_vendor_id   uuid        REFERENCES public.vendors(id)    ON DELETE SET NULL,
  related_business_id uuid        REFERENCES public.businesses(id) ON DELETE SET NULL,
  status              text        NOT NULL DEFAULT 'draft'
                                  CHECK (status IN ('draft', 'published')),
  published_at        timestamptz,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_local_legends_status_published
  ON public.local_legends (status, published_at DESC);

CREATE INDEX IF NOT EXISTS idx_local_legends_slug
  ON public.local_legends (slug);

CREATE INDEX IF NOT EXISTS idx_local_legends_vendor
  ON public.local_legends (related_vendor_id)
  WHERE related_vendor_id IS NOT NULL;

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================

CREATE OR REPLACE FUNCTION public.set_local_legends_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_local_legends_updated_at
  BEFORE UPDATE ON public.local_legends
  FOR EACH ROW EXECUTE FUNCTION public.set_local_legends_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.local_legends ENABLE ROW LEVEL SECURITY;

-- Public read: published stories only
CREATE POLICY "local_legends_public_select"
  ON public.local_legends
  FOR SELECT
  USING (status = 'published');

-- Platform admins: full access (uses existing is_platform_admin function)
CREATE POLICY "local_legends_admin_all"
  ON public.local_legends
  FOR ALL
  USING (public.is_platform_admin(auth.uid()))
  WITH CHECK (public.is_platform_admin(auth.uid()));

-- ============================================================
-- STORAGE BUCKET (run manually in Supabase dashboard if needed)
-- ============================================================
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('stories', 'stories', true)
-- ON CONFLICT (id) DO NOTHING;
--
-- File layout:
--   stories/{slug}/hero.jpg
--   stories/{slug}/audio.mp3
--   stories/{slug}/video.mp4
