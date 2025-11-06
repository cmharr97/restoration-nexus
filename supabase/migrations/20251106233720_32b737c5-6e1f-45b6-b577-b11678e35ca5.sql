-- Message Boards / Announcements
CREATE TABLE public.announcements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  priority TEXT NOT NULL DEFAULT 'normal',
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.announcement_reactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  announcement_id UUID NOT NULL REFERENCES public.announcements(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  reaction TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(announcement_id, user_id, reaction)
);

CREATE TABLE public.announcement_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  announcement_id UUID NOT NULL REFERENCES public.announcements(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Team Messages / Chat
CREATE TABLE public.chat_channels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_direct_message BOOLEAN NOT NULL DEFAULT false,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.chat_channel_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  channel_id UUID NOT NULL REFERENCES public.chat_channels(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  last_read_at TIMESTAMP WITH TIME ZONE,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(channel_id, user_id)
);

CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  channel_id UUID NOT NULL REFERENCES public.chat_channels(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  content TEXT NOT NULL,
  attachments JSONB,
  is_edited BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Check-ins / Daily Updates
CREATE TABLE public.check_ins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  check_in_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'working',
  what_accomplished TEXT,
  what_planning TEXT,
  blockers TEXT,
  mood TEXT,
  project_updates JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, check_in_date)
);

-- Kanban Boards
CREATE TABLE public.kanban_boards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.kanban_columns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  board_id UUID NOT NULL REFERENCES public.kanban_boards(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  position INTEGER NOT NULL,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.kanban_cards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  column_id UUID NOT NULL REFERENCES public.kanban_columns(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  assigned_to UUID REFERENCES auth.users(id),
  priority TEXT NOT NULL DEFAULT 'medium',
  position INTEGER NOT NULL,
  due_date DATE,
  labels JSONB,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tasks / To-dos
CREATE TABLE public.task_lists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_list_id UUID NOT NULL REFERENCES public.task_lists(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  assigned_to UUID REFERENCES auth.users(id),
  due_date DATE,
  priority TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'pending',
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  completed_by UUID REFERENCES auth.users(id),
  position INTEGER NOT NULL DEFAULT 0,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcement_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcement_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_channel_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kanban_boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kanban_columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kanban_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Announcements
CREATE POLICY "Organization members can view announcements"
  ON public.announcements FOR SELECT
  USING (is_organization_member(organization_id, auth.uid()));

CREATE POLICY "Admins can create announcements"
  ON public.announcements FOR INSERT
  WITH CHECK (is_organization_admin(organization_id, auth.uid()));

CREATE POLICY "Admins can update announcements"
  ON public.announcements FOR UPDATE
  USING (is_organization_admin(organization_id, auth.uid()));

CREATE POLICY "Admins can delete announcements"
  ON public.announcements FOR DELETE
  USING (is_organization_admin(organization_id, auth.uid()));

-- RLS Policies for Chat
CREATE POLICY "Channel members can view channel"
  ON public.chat_channels FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_channel_members
      WHERE channel_id = chat_channels.id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Members can create channels"
  ON public.chat_channels FOR INSERT
  WITH CHECK (is_organization_member(organization_id, auth.uid()));

CREATE POLICY "Channel members can view messages"
  ON public.chat_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_channel_members
      WHERE channel_id = chat_messages.channel_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Channel members can send messages"
  ON public.chat_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.chat_channel_members
      WHERE channel_id = chat_messages.channel_id AND user_id = auth.uid()
    )
  );

-- RLS Policies for Check-ins
CREATE POLICY "Users can view check-ins in their org"
  ON public.check_ins FOR SELECT
  USING (is_organization_member(organization_id, auth.uid()));

CREATE POLICY "Users can create their own check-ins"
  ON public.check_ins FOR INSERT
  WITH CHECK (user_id = auth.uid() AND is_organization_member(organization_id, auth.uid()));

CREATE POLICY "Users can update their own check-ins"
  ON public.check_ins FOR UPDATE
  USING (user_id = auth.uid());

-- RLS Policies for Kanban
CREATE POLICY "Org members can view kanban boards"
  ON public.kanban_boards FOR SELECT
  USING (is_organization_member(organization_id, auth.uid()));

CREATE POLICY "Org members can create kanban boards"
  ON public.kanban_boards FOR INSERT
  WITH CHECK (is_organization_member(organization_id, auth.uid()));

CREATE POLICY "Org members can view kanban cards"
  ON public.kanban_cards FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.kanban_columns kc
      JOIN public.kanban_boards kb ON kb.id = kc.board_id
      WHERE kc.id = kanban_cards.column_id
      AND is_organization_member(kb.organization_id, auth.uid())
    )
  );

CREATE POLICY "Org members can manage kanban cards"
  ON public.kanban_cards FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.kanban_columns kc
      JOIN public.kanban_boards kb ON kb.id = kc.board_id
      WHERE kc.id = kanban_cards.column_id
      AND is_organization_member(kb.organization_id, auth.uid())
    )
  );

-- RLS Policies for Tasks
CREATE POLICY "Org members can view tasks"
  ON public.tasks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.task_lists tl
      WHERE tl.id = tasks.task_list_id
      AND is_organization_member(tl.organization_id, auth.uid())
    )
  );

CREATE POLICY "Org members can manage tasks"
  ON public.tasks FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.task_lists tl
      WHERE tl.id = tasks.task_list_id
      AND is_organization_member(tl.organization_id, auth.uid())
    )
  );

-- Indexes for performance
CREATE INDEX idx_announcements_org ON public.announcements(organization_id);
CREATE INDEX idx_chat_channels_org ON public.chat_channels(organization_id);
CREATE INDEX idx_chat_messages_channel ON public.chat_messages(channel_id, created_at DESC);
CREATE INDEX idx_check_ins_org_date ON public.check_ins(organization_id, check_in_date DESC);
CREATE INDEX idx_kanban_boards_org ON public.kanban_boards(organization_id);
CREATE INDEX idx_tasks_assigned ON public.tasks(assigned_to) WHERE assigned_to IS NOT NULL;