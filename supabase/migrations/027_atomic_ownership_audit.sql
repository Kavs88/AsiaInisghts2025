-- Migration: 027_atomic_ownership_audit.sql
-- Description: Upgrades ownership auditing to be atomic using PostgreSQL triggers.

-- 1. Create the trigger function
CREATE OR REPLACE FUNCTION public.handle_ownership_audit_trigger()
RETURNS TRIGGER AS $$
DECLARE
    prev_owner_id UUID;
    curr_owner_id UUID;
    e_type TEXT;
BEGIN
    -- Determine entity type and relevant owner columns
    IF TG_TABLE_NAME = 'entities' THEN
        prev_owner_id := CASE WHEN TG_OP = 'INSERT' THEN NULL ELSE OLD.owner_id END;
        curr_owner_id := NEW.owner_id;
        e_type := NEW.type::TEXT;
    ELSIF TG_TABLE_NAME = 'events' THEN
        prev_owner_id := CASE WHEN TG_OP = 'INSERT' THEN NULL ELSE OLD.organizer_id END;
        curr_owner_id := NEW.organizer_id;
        e_type := 'event';
    ELSIF TG_TABLE_NAME = 'properties' THEN
        prev_owner_id := CASE WHEN TG_OP = 'INSERT' THEN NULL ELSE OLD.owner_id END;
        curr_owner_id := NEW.owner_id;
        e_type := 'property';
    ELSE
        RETURN NEW;
    END IF;

    -- Only log if ownership is being set/changed
    -- IS DISTINCT FROM handles NULL comparisons correctly
    IF prev_owner_id IS DISTINCT FROM curr_owner_id AND curr_owner_id IS NOT NULL THEN
        INSERT INTO public.ownership_changes (
            entity_type,
            entity_id,
            previous_owner_id,
            new_owner_id,
            changed_by
        ) VALUES (
            e_type,
            NEW.id,
            prev_owner_id,
            curr_owner_id,
            auth.uid() 
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Drop existing triggers if they exist (idempotency)
DROP TRIGGER IF EXISTS trg_audit_entities_ownership ON public.entities;
DROP TRIGGER IF EXISTS trg_audit_events_ownership ON public.events;
DROP TRIGGER IF EXISTS trg_audit_properties_ownership ON public.properties;

-- 3. Attach triggers to tables
CREATE TRIGGER trg_audit_entities_ownership
AFTER INSERT OR UPDATE ON public.entities
FOR EACH ROW EXECUTE FUNCTION public.handle_ownership_audit_trigger();

CREATE TRIGGER trg_audit_events_ownership
AFTER INSERT OR UPDATE ON public.events
FOR EACH ROW EXECUTE FUNCTION public.handle_ownership_audit_trigger();

CREATE TRIGGER trg_audit_properties_ownership
AFTER INSERT OR UPDATE ON public.properties
FOR EACH ROW EXECUTE FUNCTION public.handle_ownership_audit_trigger();
