-- Drop the overly permissive SELECT policy
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Create a more restrictive policy that only allows authenticated users to view profiles
-- of people in their organization
CREATE POLICY "Authenticated users can view profiles in their organization"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  -- Users can always see their own profile
  auth.uid() = id
  OR
  -- Users can see profiles of people in any organization they belong to
  EXISTS (
    SELECT 1 FROM organization_members om1
    JOIN organization_members om2 ON om1.organization_id = om2.organization_id
    WHERE om1.user_id = auth.uid()
    AND om2.user_id = profiles.id
    AND om1.is_active = true
    AND om2.is_active = true
  )
);