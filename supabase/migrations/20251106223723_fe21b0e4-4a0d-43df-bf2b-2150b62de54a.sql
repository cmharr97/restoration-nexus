-- Add triggers for logging organization member changes

-- Function to log member role changes
CREATE OR REPLACE FUNCTION public.log_member_role_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.role IS DISTINCT FROM OLD.role THEN
    INSERT INTO public.organization_audit_log 
      (organization_id, user_id, action, entity_type, field_name, old_value, new_value, details)
    VALUES 
      (NEW.organization_id, auth.uid(), 'role_changed', 'member', 'role', OLD.role::text, NEW.role::text, 
       jsonb_build_object('member_id', NEW.id, 'member_user_id', NEW.user_id));
  END IF;
  
  RETURN NEW;
END;
$$;

-- Function to log member status changes
CREATE OR REPLACE FUNCTION public.log_member_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.is_active IS DISTINCT FROM OLD.is_active THEN
    INSERT INTO public.organization_audit_log 
      (organization_id, user_id, action, entity_type, field_name, old_value, new_value, details)
    VALUES 
      (NEW.organization_id, auth.uid(), 
       CASE WHEN NEW.is_active THEN 'reactivated' ELSE 'deactivated' END, 
       'member', 'status', OLD.is_active::text, NEW.is_active::text,
       jsonb_build_object('member_id', NEW.id, 'member_user_id', NEW.user_id));
  END IF;
  
  RETURN NEW;
END;
$$;

-- Function to log new member invitations
CREATE OR REPLACE FUNCTION public.log_member_invitation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.organization_audit_log 
    (organization_id, user_id, action, entity_type, field_name, new_value, details)
  VALUES 
    (NEW.organization_id, COALESCE(auth.uid(), NEW.invited_by), 'invited', 'member', 'role', NEW.role::text,
     jsonb_build_object('member_id', NEW.id, 'member_user_id', NEW.user_id));
  
  RETURN NEW;
END;
$$;

-- Create triggers
CREATE TRIGGER member_role_change_trigger
  AFTER UPDATE ON public.organization_members
  FOR EACH ROW
  EXECUTE FUNCTION public.log_member_role_change();

CREATE TRIGGER member_status_change_trigger
  AFTER UPDATE ON public.organization_members
  FOR EACH ROW
  EXECUTE FUNCTION public.log_member_status_change();

CREATE TRIGGER member_invitation_trigger
  AFTER INSERT ON public.organization_members
  FOR EACH ROW
  EXECUTE FUNCTION public.log_member_invitation();