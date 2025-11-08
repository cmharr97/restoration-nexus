-- Fix Team Chat: Add RLS policies for chat_channel_members
CREATE POLICY "Members can view their channel memberships"
ON public.chat_channel_members
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Members can join channels in their org"
ON public.chat_channel_members
FOR INSERT
WITH CHECK (
  user_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM chat_channels cc
    WHERE cc.id = chat_channel_members.channel_id
    AND is_organization_member(cc.organization_id, auth.uid())
  )
);

CREATE POLICY "Members can leave channels"
ON public.chat_channel_members
FOR DELETE
USING (user_id = auth.uid());

CREATE POLICY "Members can update their membership"
ON public.chat_channel_members
FOR UPDATE
USING (user_id = auth.uid());

-- Fix Team Chat: Allow channel updates for members
CREATE POLICY "Channel admins can update channels"
ON public.chat_channels
FOR UPDATE
USING (
  created_by = auth.uid() OR
  is_organization_admin(organization_id, auth.uid())
);

CREATE POLICY "Channel admins can delete channels"
ON public.chat_channels
FOR DELETE
USING (
  created_by = auth.uid() OR
  is_organization_admin(organization_id, auth.uid())
);

-- Fix Task Lists: Add all RLS policies
CREATE POLICY "Org members can view task lists"
ON public.task_lists
FOR SELECT
USING (is_organization_member(organization_id, auth.uid()));

CREATE POLICY "Org members can create task lists"
ON public.task_lists
FOR INSERT
WITH CHECK (is_organization_member(organization_id, auth.uid()));

CREATE POLICY "Org members can update task lists"
ON public.task_lists
FOR UPDATE
USING (is_organization_member(organization_id, auth.uid()));

CREATE POLICY "Org members can delete task lists"
ON public.task_lists
FOR DELETE
USING (is_organization_member(organization_id, auth.uid()));

-- Fix Announcements: Add RLS for comments
CREATE POLICY "Org members can view announcement comments"
ON public.announcement_comments
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM announcements a
    WHERE a.id = announcement_comments.announcement_id
    AND is_organization_member(a.organization_id, auth.uid())
  )
);

CREATE POLICY "Org members can create comments"
ON public.announcement_comments
FOR INSERT
WITH CHECK (
  user_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM announcements a
    WHERE a.id = announcement_comments.announcement_id
    AND is_organization_member(a.organization_id, auth.uid())
  )
);

CREATE POLICY "Users can update their own comments"
ON public.announcement_comments
FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own comments"
ON public.announcement_comments
FOR DELETE
USING (user_id = auth.uid());

-- Fix Announcements: Add RLS for reactions
CREATE POLICY "Org members can view reactions"
ON public.announcement_reactions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM announcements a
    WHERE a.id = announcement_reactions.announcement_id
    AND is_organization_member(a.organization_id, auth.uid())
  )
);

CREATE POLICY "Org members can add reactions"
ON public.announcement_reactions
FOR INSERT
WITH CHECK (
  user_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM announcements a
    WHERE a.id = announcement_reactions.announcement_id
    AND is_organization_member(a.organization_id, auth.uid())
  )
);

CREATE POLICY "Users can delete their own reactions"
ON public.announcement_reactions
FOR DELETE
USING (user_id = auth.uid());

-- Fix Kanban: Add UPDATE/DELETE policies for boards
CREATE POLICY "Org members can update kanban boards"
ON public.kanban_boards
FOR UPDATE
USING (is_organization_member(organization_id, auth.uid()));

CREATE POLICY "Org admins can delete kanban boards"
ON public.kanban_boards
FOR DELETE
USING (is_organization_admin(organization_id, auth.uid()));

-- Fix Kanban: Add RLS policies for columns
CREATE POLICY "Org members can view kanban columns"
ON public.kanban_columns
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM kanban_boards kb
    WHERE kb.id = kanban_columns.board_id
    AND is_organization_member(kb.organization_id, auth.uid())
  )
);

CREATE POLICY "Org members can create kanban columns"
ON public.kanban_columns
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM kanban_boards kb
    WHERE kb.id = kanban_columns.board_id
    AND is_organization_member(kb.organization_id, auth.uid())
  )
);

CREATE POLICY "Org members can update kanban columns"
ON public.kanban_columns
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM kanban_boards kb
    WHERE kb.id = kanban_columns.board_id
    AND is_organization_member(kb.organization_id, auth.uid())
  )
);

CREATE POLICY "Org admins can delete kanban columns"
ON public.kanban_columns
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM kanban_boards kb
    WHERE kb.id = kanban_columns.board_id
    AND is_organization_admin(kb.organization_id, auth.uid())
  )
);

-- Add notifications table for system-wide notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  link TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
ON public.notifications
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
ON public.notifications
FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "System can create notifications"
ON public.notifications
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can delete their own notifications"
ON public.notifications
FOR DELETE
USING (user_id = auth.uid());

-- Add project documents table
CREATE TABLE IF NOT EXISTS public.project_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  document_type TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.project_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can view project documents"
ON public.project_documents
FOR SELECT
USING (is_organization_member(organization_id, auth.uid()));

CREATE POLICY "Org members can upload documents"
ON public.project_documents
FOR INSERT
WITH CHECK (is_organization_member(organization_id, auth.uid()));

CREATE POLICY "Uploaders can update their documents"
ON public.project_documents
FOR UPDATE
USING (uploaded_by = auth.uid());

CREATE POLICY "Admins can delete documents"
ON public.project_documents
FOR DELETE
USING (is_organization_admin(organization_id, auth.uid()));

-- Add project timeline/milestones table
CREATE TABLE IF NOT EXISTS public.project_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  completed_by UUID REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'pending',
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.project_milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can view milestones"
ON public.project_milestones
FOR SELECT
USING (is_organization_member(organization_id, auth.uid()));

CREATE POLICY "Org members can create milestones"
ON public.project_milestones
FOR INSERT
WITH CHECK (is_organization_member(organization_id, auth.uid()));

CREATE POLICY "Org members can update milestones"
ON public.project_milestones
FOR UPDATE
USING (is_organization_member(organization_id, auth.uid()));

CREATE POLICY "Admins can delete milestones"
ON public.project_milestones
FOR DELETE
USING (is_organization_admin(organization_id, auth.uid()));

-- Add activity logging for projects
CREATE TABLE IF NOT EXISTS public.project_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.project_activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can view activity logs"
ON public.project_activity_log
FOR SELECT
USING (is_organization_member(organization_id, auth.uid()));

CREATE POLICY "System can create activity logs"
ON public.project_activity_log
FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Add triggers for automatic activity logging
CREATE OR REPLACE FUNCTION public.log_project_activity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.project_activity_log (project_id, organization_id, user_id, action, entity_type, entity_id, details)
    VALUES (NEW.id, NEW.organization_id, NEW.created_by, 'created', 'project', NEW.id, 
            jsonb_build_object('name', NEW.name, 'status', NEW.status));
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.status IS DISTINCT FROM OLD.status THEN
      INSERT INTO public.project_activity_log (project_id, organization_id, user_id, action, entity_type, entity_id, details)
      VALUES (NEW.id, NEW.organization_id, COALESCE(auth.uid(), NEW.created_by), 'updated', 'project', NEW.id,
              jsonb_build_object('field', 'status', 'old_value', OLD.status, 'new_value', NEW.status));
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER project_activity_trigger
AFTER INSERT OR UPDATE ON public.projects
FOR EACH ROW
EXECUTE FUNCTION public.log_project_activity();

-- Add storage bucket for documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-documents', 'project-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Add storage policies for documents
CREATE POLICY "Org members can view documents"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'project-documents' AND
  EXISTS (
    SELECT 1 FROM project_documents pd
    WHERE pd.file_path = storage.objects.name
    AND is_organization_member(pd.organization_id, auth.uid())
  )
);

CREATE POLICY "Org members can upload documents"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'project-documents' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their documents"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'project-documents' AND
  EXISTS (
    SELECT 1 FROM project_documents pd
    WHERE pd.file_path = storage.objects.name
    AND pd.uploaded_by = auth.uid()
  )
);

CREATE POLICY "Admins can delete documents"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'project-documents' AND
  EXISTS (
    SELECT 1 FROM project_documents pd
    JOIN projects p ON p.id = pd.project_id
    WHERE pd.file_path = storage.objects.name
    AND is_organization_admin(pd.organization_id, auth.uid())
  )
);