-- Drop the overly permissive public SELECT policy
DROP POLICY IF EXISTS "Anyone with token can view portal" ON public.customer_portals;

-- Create a secure policy that only allows:
-- 1. Organization admins to view all portals in their org
-- 2. Authenticated org members to view portals for their org's projects
CREATE POLICY "Organization members can view their portals"
ON public.customer_portals
FOR SELECT
TO authenticated
USING (
  is_organization_admin(organization_id, auth.uid())
  OR
  is_organization_member(organization_id, auth.uid())
);

-- Create a secure function to validate portal access tokens server-side
-- This allows customers to access their portal via a secure edge function
CREATE OR REPLACE FUNCTION public.validate_portal_token(token text)
RETURNS TABLE (
  portal_id uuid,
  project_id uuid,
  customer_name text,
  is_valid boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cp.id as portal_id,
    cp.project_id,
    cp.customer_name,
    (cp.is_active = true AND (cp.expires_at IS NULL OR cp.expires_at > now())) as is_valid
  FROM customer_portals cp
  WHERE cp.access_token = token
  LIMIT 1;
END;
$$;