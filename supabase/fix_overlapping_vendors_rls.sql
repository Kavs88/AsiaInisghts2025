-- Fix overbearing Vendors ALL policy
-- The existing policy "Vendors tenant isolation" uses `cmd: ALL` with a `with_check` that requires the user to ALREADY belong to the agency.
-- This intrinsically blocks initial INSERTS because during vendor creation, the `agency_id` isn't fully resolved/verified yet for the user.

BEGIN;

-- Drop the overly restrictive ALL policy
DROP POLICY IF EXISTS "Vendors tenant isolation" ON public.vendors;

-- Re-implement tenant isolation securely by splitting commands
-- 1. SELECT (Viewing): Anyone in the agency can view their agency's vendors.
CREATE POLICY "Vendors tenant isolation - SELECT" ON public.vendors
FOR SELECT
TO public
USING (
  is_platform_admin(auth.uid()) OR 
  EXISTS (
    SELECT 1 FROM agency_members am 
    WHERE am.agency_id = vendors.agency_id AND am.user_id = auth.uid()
  )
);

-- 2. UPDATE (Modifying): Covered safely by existing "Agency managers can update vendors"
-- 3. DELETE (Removing): Covered safely by existing "Agency owners can delete vendors"
-- 4. INSERT (Creating): Covered safely by existing "Users can create their own vendor profile"

COMMIT;
