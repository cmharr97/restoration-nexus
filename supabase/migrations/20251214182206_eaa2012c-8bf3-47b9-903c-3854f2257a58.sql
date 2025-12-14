-- Fix ai_scopes table: Drop overly permissive policies and add proper RLS

-- Drop the existing public policies
DROP POLICY IF EXISTS "Anyone can view scopes" ON public.ai_scopes;
DROP POLICY IF EXISTS "Anyone can create scopes" ON public.ai_scopes;
DROP POLICY IF EXISTS "Anyone can update scopes" ON public.ai_scopes;

-- Add created_by column to track who created the scope
ALTER TABLE public.ai_scopes ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- Create proper RLS policies - users can only manage their own scopes
CREATE POLICY "Users can view their own scopes"
  ON public.ai_scopes FOR SELECT
  USING (auth.uid() = created_by);

CREATE POLICY "Authenticated users can create scopes"
  ON public.ai_scopes FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = created_by);

CREATE POLICY "Users can update their own scopes"
  ON public.ai_scopes FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own scopes"
  ON public.ai_scopes FOR DELETE
  USING (auth.uid() = created_by);