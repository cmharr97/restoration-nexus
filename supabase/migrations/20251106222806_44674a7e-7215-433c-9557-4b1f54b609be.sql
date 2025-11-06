-- Drop existing organization policies
DROP POLICY IF EXISTS "Anyone can create organization" ON public.organizations;
DROP POLICY IF EXISTS "Members can view their organizations" ON public.organizations;
DROP POLICY IF EXISTS "Owners and admins can update organization" ON public.organizations;

-- Allow authenticated users to create organizations
CREATE POLICY "Authenticated users can create organizations"
ON public.organizations
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow members to view their organizations (using security definer function)
CREATE POLICY "Members can view their organizations"
ON public.organizations
FOR SELECT
TO authenticated
USING (public.is_organization_member(id, auth.uid()));

-- Allow admins to update their organizations (using security definer function)
CREATE POLICY "Admins can update organizations"
ON public.organizations
FOR UPDATE
TO authenticated
USING (public.is_organization_admin(id, auth.uid()));

-- Allow owners to delete organizations
CREATE POLICY "Owners can delete organizations"
ON public.organizations
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE organization_id = organizations.id
      AND user_id = auth.uid()
      AND role = 'owner'::user_role
      AND is_active = true
  )
);