-- Create storage bucket for project photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'project-photos',
  'project-photos',
  true,
  10485760, -- 10MB limit per photo
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic']
);

-- Create photos table
CREATE TABLE public.project_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  
  -- AI-generated metadata
  ai_category TEXT, -- e.g., 'damage', 'equipment', 'before', 'after', 'progress'
  ai_room_type TEXT, -- e.g., 'kitchen', 'bathroom', 'living room', 'exterior'
  ai_damage_type TEXT, -- e.g., 'water damage', 'fire damage', 'mold', 'structural'
  ai_description TEXT, -- AI-generated description of the photo
  ai_tags TEXT[], -- Array of relevant tags
  ai_confidence DECIMAL(3,2), -- Confidence score 0-1
  
  -- User metadata
  caption TEXT,
  notes TEXT,
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  is_before_photo BOOLEAN DEFAULT false,
  is_after_photo BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.project_photos ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Members can view organization photos"
  ON public.project_photos
  FOR SELECT
  USING (is_organization_member(organization_id, auth.uid()));

CREATE POLICY "Members can upload photos"
  ON public.project_photos
  FOR INSERT
  WITH CHECK (
    is_organization_member(organization_id, auth.uid())
  );

CREATE POLICY "Users can update their own photos"
  ON public.project_photos
  FOR UPDATE
  USING (uploaded_by = auth.uid());

CREATE POLICY "Admins can delete photos"
  ON public.project_photos
  FOR DELETE
  USING (is_organization_admin(organization_id, auth.uid()));

-- Storage policies
CREATE POLICY "Members can view organization project photos"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'project-photos' AND
    EXISTS (
      SELECT 1 FROM public.project_photos
      WHERE file_path = storage.objects.name
        AND is_organization_member(organization_id, auth.uid())
    )
  );

CREATE POLICY "Members can upload project photos"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'project-photos' AND
    (storage.foldername(name))[1] IN (
      SELECT organization_id::text 
      FROM public.organization_members 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Users can update their own project photos"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'project-photos' AND
    EXISTS (
      SELECT 1 FROM public.project_photos
      WHERE file_path = storage.objects.name
        AND uploaded_by = auth.uid()
    )
  );

CREATE POLICY "Admins can delete project photos"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'project-photos' AND
    EXISTS (
      SELECT 1 FROM public.project_photos pp
      WHERE pp.file_path = storage.objects.name
        AND is_organization_admin(pp.organization_id, auth.uid())
    )
  );

-- Indexes for performance
CREATE INDEX idx_project_photos_project_id ON public.project_photos(project_id);
CREATE INDEX idx_project_photos_organization_id ON public.project_photos(organization_id);
CREATE INDEX idx_project_photos_uploaded_by ON public.project_photos(uploaded_by);
CREATE INDEX idx_project_photos_ai_category ON public.project_photos(ai_category);
CREATE INDEX idx_project_photos_created_at ON public.project_photos(created_at DESC);

-- Trigger for updated_at
CREATE TRIGGER update_project_photos_updated_at
  BEFORE UPDATE ON public.project_photos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();