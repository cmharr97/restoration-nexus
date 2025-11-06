-- Create storage bucket for organization logos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'organization-logos',
  'organization-logos',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for organization logos
CREATE POLICY "Organization members can view logos"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'organization-logos' AND
  EXISTS (
    SELECT 1 FROM public.organization_members om
    WHERE om.organization_id::text = (storage.foldername(name))[1]
      AND om.user_id = auth.uid()
      AND om.is_active = true
  )
);

CREATE POLICY "Admins can upload logos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'organization-logos' AND
  EXISTS (
    SELECT 1 FROM public.organization_members om
    WHERE om.organization_id::text = (storage.foldername(name))[1]
      AND om.user_id = auth.uid()
      AND om.role = ANY (ARRAY['owner'::user_role, 'admin'::user_role])
      AND om.is_active = true
  )
);

CREATE POLICY "Admins can update logos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'organization-logos' AND
  EXISTS (
    SELECT 1 FROM public.organization_members om
    WHERE om.organization_id::text = (storage.foldername(name))[1]
      AND om.user_id = auth.uid()
      AND om.role = ANY (ARRAY['owner'::user_role, 'admin'::user_role])
      AND om.is_active = true
  )
);

CREATE POLICY "Admins can delete logos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'organization-logos' AND
  EXISTS (
    SELECT 1 FROM public.organization_members om
    WHERE om.organization_id::text = (storage.foldername(name))[1]
      AND om.user_id = auth.uid()
      AND om.role = ANY (ARRAY['owner'::user_role, 'admin'::user_role])
      AND om.is_active = true
  )
);

-- Create audit log table for organization changes
CREATE TABLE IF NOT EXISTS public.organization_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  action text NOT NULL,
  entity_type text NOT NULL DEFAULT 'organization',
  field_name text,
  old_value text,
  new_value text,
  details jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_org_audit_log_org ON public.organization_audit_log(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_audit_log_created ON public.organization_audit_log(created_at DESC);

-- Enable RLS on audit log
ALTER TABLE public.organization_audit_log ENABLE ROW LEVEL SECURITY;

-- Allow org members to view audit logs
CREATE POLICY "Members can view org audit logs"
ON public.organization_audit_log FOR SELECT
TO authenticated
USING (public.is_organization_member(organization_id, auth.uid()));

-- Allow system to insert audit logs
CREATE POLICY "System can insert audit logs"
ON public.organization_audit_log FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Function to log organization changes
CREATE OR REPLACE FUNCTION public.log_organization_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  changed_fields text[];
  field_name text;
BEGIN
  -- Only log updates
  IF TG_OP = 'UPDATE' THEN
    -- Check which fields changed
    IF NEW.name IS DISTINCT FROM OLD.name THEN
      INSERT INTO public.organization_audit_log 
        (organization_id, user_id, action, field_name, old_value, new_value)
      VALUES 
        (NEW.id, auth.uid(), 'updated', 'name', OLD.name, NEW.name);
    END IF;
    
    IF NEW.address IS DISTINCT FROM OLD.address THEN
      INSERT INTO public.organization_audit_log 
        (organization_id, user_id, action, field_name, old_value, new_value)
      VALUES 
        (NEW.id, auth.uid(), 'updated', 'address', OLD.address, NEW.address);
    END IF;
    
    IF NEW.phone IS DISTINCT FROM OLD.phone THEN
      INSERT INTO public.organization_audit_log 
        (organization_id, user_id, action, field_name, old_value, new_value)
      VALUES 
        (NEW.id, auth.uid(), 'updated', 'phone', OLD.phone, NEW.phone);
    END IF;
    
    IF NEW.email IS DISTINCT FROM OLD.email THEN
      INSERT INTO public.organization_audit_log 
        (organization_id, user_id, action, field_name, old_value, new_value)
      VALUES 
        (NEW.id, auth.uid(), 'updated', 'email', OLD.email, NEW.email);
    END IF;
    
    IF NEW.website IS DISTINCT FROM OLD.website THEN
      INSERT INTO public.organization_audit_log 
        (organization_id, user_id, action, field_name, old_value, new_value)
      VALUES 
        (NEW.id, auth.uid(), 'updated', 'website', OLD.website, NEW.website);
    END IF;
    
    IF NEW.logo_url IS DISTINCT FROM OLD.logo_url THEN
      INSERT INTO public.organization_audit_log 
        (organization_id, user_id, action, field_name, old_value, new_value)
      VALUES 
        (NEW.id, auth.uid(), 'updated', 'logo', OLD.logo_url, NEW.logo_url);
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for organization audit logging
DROP TRIGGER IF EXISTS log_organization_changes ON public.organizations;
CREATE TRIGGER log_organization_changes
AFTER UPDATE ON public.organizations
FOR EACH ROW
EXECUTE FUNCTION public.log_organization_change();