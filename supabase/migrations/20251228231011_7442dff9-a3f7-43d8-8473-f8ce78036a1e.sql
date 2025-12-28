-- Fix 1: Add authorization check to generate_recurring_jobs function
CREATE OR REPLACE FUNCTION public.generate_recurring_jobs(p_template_id uuid, p_start_date date, p_end_date date)
 RETURNS TABLE(generated_date date, was_skipped boolean, skip_reason text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
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

  -- CRITICAL: Verify caller has permission to access this organization
  IF NOT (
    is_organization_admin(v_template.organization_id, auth.uid()) 
    OR 
    has_any_role(auth.uid(), ARRAY['reconstruction_pm'::app_role], v_template.organization_id)
  ) THEN
    RAISE EXCEPTION 'Permission denied: must be organization admin or PM';
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
$function$;

-- Fix 2: Make project-photos bucket private
UPDATE storage.buckets
SET public = false
WHERE id = 'project-photos';

-- Fix 3: Set search_path for set_updated_at function (fixes SUPA_function_search_path_mutable)
CREATE OR REPLACE FUNCTION public.set_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;