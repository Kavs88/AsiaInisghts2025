-- Migration: 016_remove_unused_roles.sql
-- Description: Remove unused roles (business_user, attendee_user) from schema
-- Created: 2024-12-19
-- Reason: These roles were defined but never implemented, causing confusion

-- ============================================
-- REMOVE UNUSED ROLES
-- ============================================

-- Update users table to remove unused roles
-- business_user and attendee_user were defined but never implemented
ALTER TABLE public.users 
  DROP CONSTRAINT IF EXISTS users_role_check;

ALTER TABLE public.users
  ADD CONSTRAINT users_role_check 
  CHECK (role IN ('customer', 'vendor', 'admin', 'super_user'));

-- Note: super_user is included here for consistency, though it's primarily
-- checked via the super_users table. This allows users.role = 'super_user'
-- as an alternative to super_users table entry.

-- ============================================
-- MIGRATION COMPLETE
-- ============================================

SELECT 'Migration 016: Unused roles removed (business_user, attendee_user)' as status;

