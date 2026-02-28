-- Enforce agency scoping permanently

ALTER TABLE public.vendors
  ALTER COLUMN agency_id SET NOT NULL;

ALTER TABLE public.businesses
  ALTER COLUMN agency_id SET NOT NULL;
