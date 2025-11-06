-- Add created_by column to organizations if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'organizations' AND column_name = 'created_by'
  ) THEN
    ALTER TABLE public.organizations ADD COLUMN created_by uuid;
  END IF;
END $$;

-- Tighten INSERT policy to bind creator
DROP POLICY IF EXISTS "Authenticated users can create organizations" ON public.organizations;
CREATE POLICY "Users can create organizations they own"
ON public.organizations
FOR INSERT
TO authenticated
WITH CHECK (created_by = auth.uid());

-- Allow creators to view their organizations immediately (before membership exists)
DROP POLICY IF EXISTS "Members can view their organizations" ON public.organizations;
CREATE POLICY "Members or creators can view organizations"
ON public.organizations
FOR SELECT
TO authenticated
USING (
  public.is_organization_member(id, auth.uid()) OR created_by = auth.uid()
);

-- Keep admins update policy as is (recreate to ensure consistency)
DROP POLICY IF EXISTS "Admins can update organizations" ON public.organizations;
CREATE POLICY "Admins can update organizations"
ON public.organizations
FOR UPDATE
TO authenticated
USING (public.is_organization_admin(id, auth.uid()));