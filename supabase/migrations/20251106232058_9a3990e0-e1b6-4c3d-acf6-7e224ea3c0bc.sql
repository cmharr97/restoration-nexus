-- Enable realtime for project_photos table
ALTER TABLE public.project_photos REPLICA IDENTITY FULL;

-- Note: Tables are automatically added to realtime publication in Lovable Cloud
-- No need to manually add to supabase_realtime publication