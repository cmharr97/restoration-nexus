-- Create enum for loss types
CREATE TYPE loss_type AS ENUM ('water', 'fire', 'mold', 'storm', 'other');

-- Create enum for project stages
CREATE TYPE project_stage AS ENUM ('emergency', 'mitigation', 'estimating', 'reconstruction', 'contents', 'closeout');

-- Create table for AI-generated scopes
CREATE TABLE public.ai_scopes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_name TEXT NOT NULL,
  project_address TEXT,
  loss_type loss_type NOT NULL,
  stage project_stage DEFAULT 'estimating',
  description TEXT NOT NULL,
  
  -- AI Generated Content
  scope_summary TEXT,
  detailed_scope TEXT,
  op_justification TEXT,
  material_list JSONB DEFAULT '[]'::jsonb,
  estimated_cost DECIMAL(10, 2),
  estimated_duration_days INTEGER,
  trades_required TEXT[],
  
  -- Metadata
  photo_urls TEXT[],
  model_used TEXT DEFAULT 'google/gemini-2.5-flash',
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_scopes ENABLE ROW LEVEL SECURITY;

-- Create policy for public access (anyone can create and view scopes)
CREATE POLICY "Anyone can create scopes"
  ON public.ai_scopes
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view scopes"
  ON public.ai_scopes
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can update scopes"
  ON public.ai_scopes
  FOR UPDATE
  USING (true);

-- Create index for faster queries
CREATE INDEX idx_ai_scopes_created_at ON public.ai_scopes(created_at DESC);
CREATE INDEX idx_ai_scopes_loss_type ON public.ai_scopes(loss_type);

-- Create trigger for updating updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_ai_scopes_updated_at
  BEFORE UPDATE ON public.ai_scopes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();