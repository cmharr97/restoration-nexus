-- Create job type enum
CREATE TYPE public.job_type AS ENUM ('mitigation', 'contents', 'reconstruction');

-- Create projects table (jobs)
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  address TEXT,
  job_type public.job_type NOT NULL,
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  priority TEXT DEFAULT 'medium',
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create project assignments history table
CREATE TABLE public.project_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  assigned_to UUID NOT NULL REFERENCES public.profiles(id),
  assigned_by UUID NOT NULL REFERENCES public.profiles(id),
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT
);

-- Create schedules table
CREATE TABLE public.user_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  is_available BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Create schedule assignments table (jobs on schedules)
CREATE TABLE public.schedule_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  schedule_id UUID NOT NULL REFERENCES public.user_schedules(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  notes TEXT,
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_assignments ENABLE ROW LEVEL SECURITY;

-- Projects policies
CREATE POLICY "Members can view organization projects"
  ON public.projects FOR SELECT
  USING (is_organization_member(organization_id, auth.uid()));

CREATE POLICY "Members can create projects"
  ON public.projects FOR INSERT
  WITH CHECK (is_organization_member(organization_id, auth.uid()));

CREATE POLICY "Admins and PMs can update projects"
  ON public.projects FOR UPDATE
  USING (
    is_organization_admin(organization_id, auth.uid()) OR
    EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE organization_id = projects.organization_id
        AND user_id = auth.uid()
        AND role IN ('pm', 'executive')
        AND is_active = true
    )
  );

CREATE POLICY "Admins can delete projects"
  ON public.projects FOR DELETE
  USING (is_organization_admin(organization_id, auth.uid()));

-- Project assignments policies
CREATE POLICY "Members can view assignments"
  ON public.project_assignments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_assignments.project_id
        AND is_organization_member(p.organization_id, auth.uid())
    )
  );

CREATE POLICY "Admins and PMs can create assignments"
  ON public.project_assignments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects p
      JOIN public.organization_members om ON om.organization_id = p.organization_id
      WHERE p.id = project_assignments.project_id
        AND om.user_id = auth.uid()
        AND om.role IN ('owner', 'admin', 'pm', 'executive')
        AND om.is_active = true
    )
  );

-- User schedules policies
CREATE POLICY "Members can view their own schedules"
  ON public.user_schedules FOR SELECT
  USING (
    user_id = auth.uid() OR
    is_organization_admin(organization_id, auth.uid()) OR
    EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE organization_id = user_schedules.organization_id
        AND user_id = auth.uid()
        AND role IN ('pm', 'executive')
        AND is_active = true
    )
  );

CREATE POLICY "Users can manage their own schedules"
  ON public.user_schedules FOR INSERT
  WITH CHECK (user_id = auth.uid() AND is_organization_member(organization_id, auth.uid()));

CREATE POLICY "Users can update their own schedules"
  ON public.user_schedules FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Admins and PMs can manage all schedules"
  ON public.user_schedules FOR ALL
  USING (
    is_organization_admin(organization_id, auth.uid()) OR
    EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE organization_id = user_schedules.organization_id
        AND user_id = auth.uid()
        AND role IN ('pm', 'executive')
        AND is_active = true
    )
  );

-- Schedule assignments policies
CREATE POLICY "Members can view schedule assignments"
  ON public.schedule_assignments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_schedules us
      WHERE us.id = schedule_assignments.schedule_id
        AND (
          us.user_id = auth.uid() OR
          is_organization_admin(us.organization_id, auth.uid()) OR
          EXISTS (
            SELECT 1 FROM public.organization_members
            WHERE organization_id = us.organization_id
              AND user_id = auth.uid()
              AND role IN ('pm', 'executive')
              AND is_active = true
          )
        )
    )
  );

CREATE POLICY "Admins and PMs can manage schedule assignments"
  ON public.schedule_assignments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_schedules us
      WHERE us.id = schedule_assignments.schedule_id
        AND (
          is_organization_admin(us.organization_id, auth.uid()) OR
          EXISTS (
            SELECT 1 FROM public.organization_members
            WHERE organization_id = us.organization_id
              AND user_id = auth.uid()
              AND role IN ('pm', 'executive')
              AND is_active = true
          )
        )
    )
  );

-- Triggers
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_schedules_updated_at
  BEFORE UPDATE ON public.user_schedules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_schedule_assignments_updated_at
  BEFORE UPDATE ON public.schedule_assignments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to log project assignments
CREATE OR REPLACE FUNCTION public.log_project_assignment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.assigned_to IS DISTINCT FROM OLD.assigned_to THEN
    INSERT INTO public.project_assignments (project_id, assigned_to, assigned_by, notes)
    VALUES (NEW.id, NEW.assigned_to, auth.uid(), 
            'Project reassigned from ' || COALESCE(OLD.assigned_to::text, 'unassigned'));
  ELSIF TG_OP = 'INSERT' AND NEW.assigned_to IS NOT NULL THEN
    INSERT INTO public.project_assignments (project_id, assigned_to, assigned_by, notes)
    VALUES (NEW.id, NEW.assigned_to, auth.uid(), 'Initial assignment');
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER project_assignment_trigger
  AFTER INSERT OR UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.log_project_assignment();