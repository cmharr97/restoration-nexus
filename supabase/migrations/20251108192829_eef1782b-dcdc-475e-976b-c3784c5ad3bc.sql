-- Create time_entries table for tracking billable hours
CREATE TABLE public.time_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  clock_in TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  clock_out TIMESTAMP WITH TIME ZONE,
  billable_hours NUMERIC,
  hourly_rate NUMERIC,
  total_cost NUMERIC,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on time_entries
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;

-- RLS policies for time_entries
CREATE POLICY "Users can clock in for their org projects"
ON public.time_entries
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid() AND
  is_organization_member(organization_id, auth.uid())
);

CREATE POLICY "Users can update their own time entries"
ON public.time_entries
FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Org members can view time entries"
ON public.time_entries
FOR SELECT
TO authenticated
USING (is_organization_member(organization_id, auth.uid()));

CREATE POLICY "Admins can delete time entries"
ON public.time_entries
FOR DELETE
TO authenticated
USING (is_organization_admin(organization_id, auth.uid()));

-- Trigger to update updated_at
CREATE TRIGGER update_time_entries_updated_at
BEFORE UPDATE ON public.time_entries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to notify on project assignment
CREATE OR REPLACE FUNCTION public.notify_project_assignment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  project_name TEXT;
  assigner_name TEXT;
BEGIN
  -- Get project name
  SELECT name INTO project_name
  FROM public.projects
  WHERE id = NEW.project_id;
  
  -- Get assigner name
  SELECT COALESCE(full_name, email) INTO assigner_name
  FROM public.profiles
  WHERE id = NEW.assigned_by;
  
  -- Create notification for assigned user
  INSERT INTO public.notifications (user_id, title, message, type, link)
  VALUES (
    NEW.assigned_to,
    'New Project Assignment',
    assigner_name || ' assigned you to project: ' || project_name,
    'assignment',
    '/projects/' || NEW.project_id
  );
  
  RETURN NEW;
END;
$$;

-- Trigger on project_assignments
CREATE TRIGGER notify_on_project_assignment
AFTER INSERT ON public.project_assignments
FOR EACH ROW
EXECUTE FUNCTION public.notify_project_assignment();

-- Function to notify on schedule assignment
CREATE OR REPLACE FUNCTION public.notify_schedule_assignment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  project_name TEXT;
  assigned_user_id UUID;
  assigner_name TEXT;
BEGIN
  -- Get user_id from schedule
  SELECT user_id INTO assigned_user_id
  FROM public.user_schedules
  WHERE id = NEW.schedule_id;
  
  -- Get project name
  SELECT name INTO project_name
  FROM public.projects
  WHERE id = NEW.project_id;
  
  -- Get assigner name
  SELECT COALESCE(full_name, email) INTO assigner_name
  FROM public.profiles
  WHERE id = NEW.created_by;
  
  -- Create notification for scheduled user
  INSERT INTO public.notifications (user_id, title, message, type, link)
  VALUES (
    assigned_user_id,
    'New Schedule Assignment',
    assigner_name || ' scheduled you for: ' || project_name,
    'assignment',
    '/projects/' || NEW.project_id
  );
  
  RETURN NEW;
END;
$$;

-- Trigger on schedule_assignments
CREATE TRIGGER notify_on_schedule_assignment
AFTER INSERT ON public.schedule_assignments
FOR EACH ROW
EXECUTE FUNCTION public.notify_schedule_assignment();

-- Enable realtime for time_entries
ALTER PUBLICATION supabase_realtime ADD TABLE public.time_entries;