-- Create project_messages table for Basecamp-style project message board
CREATE TABLE public.project_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'discussion',
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX idx_project_messages_project_id ON public.project_messages(project_id);
CREATE INDEX idx_project_messages_created_at ON public.project_messages(created_at DESC);

-- Enable RLS
ALTER TABLE public.project_messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for project messages
CREATE POLICY "Org members can view project messages"
  ON public.project_messages
  FOR SELECT
  USING (is_organization_member(organization_id, auth.uid()));

CREATE POLICY "Org members can create project messages"
  ON public.project_messages
  FOR INSERT
  WITH CHECK (
    is_organization_member(organization_id, auth.uid()) 
    AND user_id = auth.uid()
  );

CREATE POLICY "Users can update their own messages"
  ON public.project_messages
  FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Admins can delete any message, users can delete their own"
  ON public.project_messages
  FOR DELETE
  USING (
    user_id = auth.uid() 
    OR is_organization_admin(organization_id, auth.uid())
  );

-- Enable realtime for project messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.project_messages;