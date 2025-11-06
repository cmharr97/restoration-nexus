-- Create recurring job templates table
CREATE TABLE public.recurring_job_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  job_type public.job_type NOT NULL,
  address TEXT,
  priority TEXT DEFAULT 'medium',
  recurrence_pattern TEXT NOT NULL, -- 'daily', 'weekly', 'biweekly', 'monthly'
  recurrence_day INTEGER, -- Day of week (0-6) for weekly, day of month (1-31) for monthly
  start_date DATE NOT NULL,
  end_date DATE,
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  start_time TIME NOT NULL DEFAULT '09:00:00',
  end_time TIME NOT NULL DEFAULT '17:00:00',
  is_active BOOLEAN DEFAULT true,
  auto_skip_conflicts BOOLEAN DEFAULT true,
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create generated recurring jobs tracking table
CREATE TABLE public.recurring_job_instances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID NOT NULL REFERENCES public.recurring_job_templates(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  scheduled_date DATE NOT NULL,
  was_skipped BOOLEAN DEFAULT false,
  skip_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.recurring_job_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_job_instances ENABLE ROW LEVEL SECURITY;

-- Recurring templates policies
CREATE POLICY "Members can view templates"
  ON public.recurring_job_templates FOR SELECT
  USING (is_organization_member(organization_id, auth.uid()));

CREATE POLICY "Admins and PMs can manage templates"
  ON public.recurring_job_templates FOR ALL
  USING (
    is_organization_admin(organization_id, auth.uid()) OR
    EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE organization_id = recurring_job_templates.organization_id
        AND user_id = auth.uid()
        AND role IN ('pm', 'executive')
        AND is_active = true
    )
  );

-- Recurring instances policies
CREATE POLICY "Members can view instances"
  ON public.recurring_job_instances FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.recurring_job_templates t
      WHERE t.id = recurring_job_instances.template_id
        AND is_organization_member(t.organization_id, auth.uid())
    )
  );

CREATE POLICY "System can manage instances"
  ON public.recurring_job_instances FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.recurring_job_templates t
      WHERE t.id = recurring_job_instances.template_id
        AND is_organization_member(t.organization_id, auth.uid())
    )
  );

-- Triggers
CREATE TRIGGER update_recurring_templates_updated_at
  BEFORE UPDATE ON public.recurring_job_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate recurring jobs
CREATE OR REPLACE FUNCTION public.generate_recurring_jobs(
  p_template_id UUID,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS TABLE(
  generated_date DATE,
  was_skipped BOOLEAN,
  skip_reason TEXT
) AS $$
DECLARE
  v_template RECORD;
  v_current_date DATE;
  v_has_conflict BOOLEAN;
  v_conflict_reason TEXT;
  v_project_id UUID;
BEGIN
  -- Get template details
  SELECT * INTO v_template
  FROM public.recurring_job_templates
  WHERE id = p_template_id AND is_active = true;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Template not found or inactive';
  END IF;

  v_current_date := p_start_date;

  WHILE v_current_date <= p_end_date LOOP
    -- Check if this date matches the recurrence pattern
    IF (
      (v_template.recurrence_pattern = 'daily') OR
      (v_template.recurrence_pattern = 'weekly' AND EXTRACT(DOW FROM v_current_date) = v_template.recurrence_day) OR
      (v_template.recurrence_pattern = 'biweekly' AND EXTRACT(DOW FROM v_current_date) = v_template.recurrence_day AND 
       EXTRACT(WEEK FROM v_current_date) % 2 = EXTRACT(WEEK FROM v_template.start_date) % 2) OR
      (v_template.recurrence_pattern = 'monthly' AND EXTRACT(DAY FROM v_current_date) = v_template.recurrence_day)
    ) THEN
      -- Check for conflicts if assigned to someone
      v_has_conflict := false;
      v_conflict_reason := NULL;

      IF v_template.assigned_to IS NOT NULL AND v_template.auto_skip_conflicts THEN
        -- Check if there are conflicting assignments
        SELECT EXISTS (
          SELECT 1
          FROM public.user_schedules us
          JOIN public.schedule_assignments sa ON sa.schedule_id = us.id
          WHERE us.user_id = v_template.assigned_to
            AND us.date = v_current_date
            AND (
              (v_template.start_time >= sa.start_time AND v_template.start_time < sa.end_time) OR
              (v_template.end_time > sa.start_time AND v_template.end_time <= sa.end_time) OR
              (v_template.start_time <= sa.start_time AND v_template.end_time >= sa.end_time)
            )
        ) INTO v_has_conflict;

        IF v_has_conflict THEN
          v_conflict_reason := 'Time slot conflict detected';
        END IF;
      END IF;

      -- Create project if no conflict or conflicts are allowed
      IF NOT v_has_conflict OR NOT v_template.auto_skip_conflicts THEN
        INSERT INTO public.projects (
          organization_id,
          name,
          description,
          address,
          job_type,
          assigned_to,
          status,
          priority,
          start_date,
          created_by
        ) VALUES (
          v_template.organization_id,
          v_template.name || ' - ' || v_current_date::TEXT,
          v_template.description,
          v_template.address,
          v_template.job_type,
          v_template.assigned_to,
          'pending',
          v_template.priority,
          v_current_date,
          v_template.created_by
        ) RETURNING id INTO v_project_id;

        -- Create schedule assignment if assigned
        IF v_template.assigned_to IS NOT NULL THEN
          -- Ensure schedule exists
          INSERT INTO public.user_schedules (user_id, organization_id, date, is_available)
          VALUES (v_template.assigned_to, v_template.organization_id, v_current_date, true)
          ON CONFLICT (user_id, date) DO NOTHING;

          -- Create assignment
          INSERT INTO public.schedule_assignments (
            schedule_id,
            project_id,
            start_time,
            end_time,
            created_by
          )
          SELECT us.id, v_project_id, v_template.start_time, v_template.end_time, v_template.created_by
          FROM public.user_schedules us
          WHERE us.user_id = v_template.assigned_to AND us.date = v_current_date;
        END IF;

        -- Track instance
        INSERT INTO public.recurring_job_instances (template_id, project_id, scheduled_date, was_skipped, skip_reason)
        VALUES (p_template_id, v_project_id, v_current_date, false, NULL);

        generated_date := v_current_date;
        was_skipped := false;
        skip_reason := NULL;
        RETURN NEXT;
      ELSE
        -- Track skipped instance
        INSERT INTO public.recurring_job_instances (template_id, project_id, scheduled_date, was_skipped, skip_reason)
        VALUES (p_template_id, NULL, v_current_date, true, v_conflict_reason);

        generated_date := v_current_date;
        was_skipped := true;
        skip_reason := v_conflict_reason;
        RETURN NEXT;
      END IF;
    END IF;

    v_current_date := v_current_date + INTERVAL '1 day';
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;