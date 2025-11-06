-- Drop the problematic policies
DROP POLICY IF EXISTS "Members can view organization members" ON public.organization_members;
DROP POLICY IF EXISTS "Owners and admins can manage members" ON public.organization_members;

-- Create security definer function to check organization membership
CREATE OR REPLACE FUNCTION public.is_organization_member(_org_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.organization_members
    WHERE organization_id = _org_id
      AND user_id = _user_id
      AND is_active = true
  )
$$;

-- Create security definer function to check if user is org admin/owner
CREATE OR REPLACE FUNCTION public.is_organization_admin(_org_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.organization_members
    WHERE organization_id = _org_id
      AND user_id = _user_id
      AND role = ANY (ARRAY['owner'::user_role, 'admin'::user_role])
      AND is_active = true
  )
$$;

-- Recreate policies using security definer functions (no recursion)
CREATE POLICY "Members can view organization members"
ON public.organization_members
FOR SELECT
USING (public.is_organization_member(organization_id, auth.uid()));

CREATE POLICY "Owners and admins can manage members"
ON public.organization_members
FOR ALL
USING (public.is_organization_admin(organization_id, auth.uid()));

-- Also allow users to insert themselves as the first member when creating an org
CREATE POLICY "Users can insert themselves as first member"
ON public.organization_members
FOR INSERT
WITH CHECK (
  user_id = auth.uid() AND
  role = 'owner'::user_role AND
  NOT EXISTS (
    SELECT 1 FROM public.organization_members om2
    WHERE om2.organization_id = organization_members.organization_id
  )
);