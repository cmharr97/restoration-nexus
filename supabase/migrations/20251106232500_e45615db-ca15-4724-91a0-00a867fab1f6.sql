-- Align projects table with frontend fields and project numbering

-- 1) Utilities for project numbers
CREATE SEQUENCE IF NOT EXISTS public.project_number_seq START 1000;

CREATE OR REPLACE FUNCTION public.generate_project_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  seq integer;
  year text := to_char(now(), 'YYYY');
BEGIN
  SELECT nextval('public.project_number_seq') INTO seq;
  RETURN 'PRJ-' || year || '-' || lpad(seq::text, 5, '0');
END;
$$;

-- 2) Add missing columns used by the app (idempotent)
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS project_number text,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS state text,
  ADD COLUMN IF NOT EXISTS zip text,
  ADD COLUMN IF NOT EXISTS loss_type text,
  ADD COLUMN IF NOT EXISTS loss_date date,
  ADD COLUMN IF NOT EXISTS loss_description text,
  ADD COLUMN IF NOT EXISTS policy_number text,
  ADD COLUMN IF NOT EXISTS claim_number text,
  ADD COLUMN IF NOT EXISTS insurance_carrier text,
  ADD COLUMN IF NOT EXISTS tpa_name text,
  ADD COLUMN IF NOT EXISTS adjuster_name text,
  ADD COLUMN IF NOT EXISTS adjuster_email text,
  ADD COLUMN IF NOT EXISTS adjuster_phone text,
  ADD COLUMN IF NOT EXISTS deductible numeric,
  ADD COLUMN IF NOT EXISTS owner_name text,
  ADD COLUMN IF NOT EXISTS owner_email text,
  ADD COLUMN IF NOT EXISTS owner_phone text,
  ADD COLUMN IF NOT EXISTS target_completion_date timestamp with time zone,
  ADD COLUMN IF NOT EXISTS actual_completion_date timestamp with time zone,
  ADD COLUMN IF NOT EXISTS estimated_cost numeric,
  ADD COLUMN IF NOT EXISTS actual_cost numeric,
  ADD COLUMN IF NOT EXISTS template_used text,
  ADD COLUMN IF NOT EXISTS notes text;

-- 3) Set default project number and backfill
ALTER TABLE public.projects ALTER COLUMN project_number SET DEFAULT public.generate_project_number();
UPDATE public.projects SET project_number = public.generate_project_number() WHERE project_number IS NULL;

-- 4) Ensure uniqueness on project number
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'projects_project_number_key'
  ) THEN
    EXECUTE 'CREATE UNIQUE INDEX projects_project_number_key ON public.projects (project_number)';
  END IF;
END $$;