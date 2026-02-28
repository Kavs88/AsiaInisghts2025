-- Migration: 028_harden_ownership_audit_chain.sql

CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE public.ownership_changes
ADD COLUMN IF NOT EXISTS row_hash TEXT;

-- 1. Cryptographic Hash Chaining Trigger with Concurrency Control
CREATE OR REPLACE FUNCTION public.hash_audit_log_entry()
RETURNS TRIGGER AS $$
DECLARE
    prev_hash TEXT;
BEGIN
    -- Ensure exactly sequential writes using an advisory lock on the table OID
    -- This prevents concurrent transactions from generating identical previous hashes
    PERFORM pg_advisory_xact_lock('public.ownership_changes'::regclass::bigint);

    -- Guarantee clock_timestamp() for true sequential time order, not transaction start time
    NEW.changed_at := clock_timestamp();

    -- Fetch the absolute latest hash (safe now due to advisory lock)
    SELECT row_hash INTO prev_hash
    FROM public.ownership_changes
    ORDER BY changed_at DESC, id DESC
    LIMIT 1;

    NEW.row_hash := encode(digest(
        COALESCE(NEW.entity_type, '') ||
        COALESCE(NEW.entity_id::TEXT, '') ||
        COALESCE(NEW.previous_owner_id::TEXT, '') ||
        COALESCE(NEW.new_owner_id::TEXT, '') ||
        COALESCE(NEW.changed_by::TEXT, '') ||
        COALESCE(NEW.changed_at::TEXT, '') ||
        COALESCE(prev_hash, ''),
        'sha256'
    ), 'hex');

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_hash_audit_entry ON public.ownership_changes;
CREATE TRIGGER trg_hash_audit_entry
BEFORE INSERT ON public.ownership_changes
FOR EACH ROW EXECUTE FUNCTION public.hash_audit_log_entry();

-- 2. Prevent UPDATE / DELETE via Trigger
CREATE OR REPLACE FUNCTION public.block_audit_modifications()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Audit log tampering detected: Modification of ownership_changes is strictly prohibited.';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_block_audit_modifications ON public.ownership_changes;
CREATE TRIGGER trg_block_audit_modifications
BEFORE UPDATE OR DELETE ON public.ownership_changes
FOR EACH ROW EXECUTE FUNCTION public.block_audit_modifications();

-- 3. Revoke explicit manipulation privileges
REVOKE UPDATE, DELETE ON public.ownership_changes FROM authenticated, anon, public;

-- 4. Enforce RLS denial for direct client INSERT
ALTER TABLE public.ownership_changes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Prevent client inserts to audit log" ON public.ownership_changes;
CREATE POLICY "Prevent client inserts to audit log"
ON public.ownership_changes FOR INSERT
TO authenticated, anon, public
WITH CHECK (false);
