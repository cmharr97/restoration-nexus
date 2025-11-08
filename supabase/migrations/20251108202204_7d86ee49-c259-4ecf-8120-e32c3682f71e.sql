-- ============================================================================
-- ReCon Pro: Complete Database Schema
-- Role-Based Restoration Management Platform
-- ============================================================================

-- 1. CREATE ROLE ENUM & USER ROLES TABLE
-- ============================================================================
CREATE TYPE public.app_role AS ENUM (
  'owner',
  'office_admin',
  'recon_tech',
  'mitigation_tech',
  'contents_specialist',
  'reconstruction_pm',
  'field_crew',
  'subcontractor'
);

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, organization_id)
);

-- Security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role, _org_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND organization_id = _org_id
      AND role = _role
  )
$$;

-- Function to check if user has any of multiple roles
CREATE OR REPLACE FUNCTION public.has_any_role(_user_id UUID, _roles app_role[], _org_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND organization_id = _org_id
      AND role = ANY(_roles)
  )
$$;

-- RLS for user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view roles in their org"
  ON public.user_roles FOR SELECT
  USING (is_organization_member(organization_id, auth.uid()));

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  USING (is_organization_admin(organization_id, auth.uid()));

-- 2. LEADS & CRM PIPELINE
-- ============================================================================
CREATE TYPE public.lead_status AS ENUM ('new', 'contacted', 'qualified', 'converted', 'lost');
CREATE TYPE public.damage_type AS ENUM ('water', 'fire', 'mold', 'storm', 'biohazard', 'other');
CREATE TYPE public.urgency_level AS ENUM ('low', 'medium', 'high', 'emergency');

CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT,
  address TEXT,
  damage_type damage_type NOT NULL,
  urgency urgency_level DEFAULT 'medium',
  status lead_status DEFAULT 'new',
  initial_photos TEXT[],
  ai_triage_score INTEGER, -- 0-100, AI urgency assessment
  ai_damage_estimate NUMERIC,
  notes TEXT,
  source TEXT, -- 'web_form', 'phone', 'referral', etc.
  assigned_to UUID REFERENCES auth.users(id),
  converted_project_id UUID REFERENCES public.projects(id),
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can view leads"
  ON public.leads FOR SELECT
  USING (is_organization_member(organization_id, auth.uid()));

CREATE POLICY "Admins and office can manage leads"
  ON public.leads FOR ALL
  USING (has_any_role(auth.uid(), ARRAY['owner', 'office_admin']::app_role[], organization_id));

-- 3. RECON ASSESSMENTS (Enhanced project phase tracking)
-- ============================================================================
CREATE TABLE public.recon_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  tech_id UUID REFERENCES auth.users(id) NOT NULL,
  damage_severity INTEGER, -- 1-10 scale
  affected_areas JSONB, -- [{room: 'Kitchen', sqft: 200, damage_type: 'water'}]
  moisture_readings JSONB, -- [{location: 'Wall A', reading: 45, timestamp: '...'}]
  photos TEXT[],
  ai_damage_tags TEXT[], -- AI-detected: ['water_stain', 'buckled_floor']
  ai_estimate NUMERIC,
  estimated_scope TEXT,
  recommended_phases TEXT[], -- ['mitigation', 'contents', 'reconstruction']
  geolocation POINT,
  status TEXT DEFAULT 'in_progress', -- in_progress, complete, approved
  completed_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.recon_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can view assessments"
  ON public.recon_assessments FOR SELECT
  USING (is_organization_member(organization_id, auth.uid()));

CREATE POLICY "Recon techs can create assessments"
  ON public.recon_assessments FOR INSERT
  WITH CHECK (
    has_any_role(auth.uid(), ARRAY['owner', 'office_admin', 'recon_tech']::app_role[], organization_id)
    AND tech_id = auth.uid()
  );

CREATE POLICY "Techs can update their assessments"
  ON public.recon_assessments FOR UPDATE
  USING (tech_id = auth.uid() OR is_organization_admin(organization_id, auth.uid()));

-- 4. MITIGATION LOGS (Psychrometric tracking)
-- ============================================================================
CREATE TABLE public.mitigation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  tech_id UUID REFERENCES auth.users(id) NOT NULL,
  log_date DATE NOT NULL,
  temperature NUMERIC, -- °F
  relative_humidity NUMERIC, -- %
  moisture_readings JSONB, -- [{location, reading, material_type}]
  equipment_deployed JSONB, -- [{type: 'dehumidifier', serial: 'DH-001', runtime_hours: 24}]
  drying_progress INTEGER, -- 0-100%
  photos TEXT[],
  notes TEXT,
  alert_flags TEXT[], -- ['high_humidity', 'equipment_failure']
  status TEXT DEFAULT 'active', -- active, monitoring, complete
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.mitigation_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can view mitigation logs"
  ON public.mitigation_logs FOR SELECT
  USING (is_organization_member(organization_id, auth.uid()));

CREATE POLICY "Mitigation techs can manage logs"
  ON public.mitigation_logs FOR ALL
  USING (
    has_any_role(auth.uid(), ARRAY['owner', 'office_admin', 'mitigation_tech']::app_role[], organization_id)
  );

-- 5. CONTENTS INVENTORY (QR tracking)
-- ============================================================================
CREATE TYPE public.item_condition AS ENUM ('excellent', 'good', 'fair', 'damaged', 'total_loss', 'salvage');

CREATE TABLE public.contents_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  specialist_id UUID REFERENCES auth.users(id) NOT NULL,
  qr_code TEXT UNIQUE,
  item_name TEXT NOT NULL,
  description TEXT,
  category TEXT, -- 'furniture', 'electronics', 'clothing', etc.
  room TEXT,
  condition item_condition NOT NULL,
  estimated_value NUMERIC,
  photos TEXT[],
  storage_location TEXT, -- 'Bin A-12', 'Warehouse 1'
  packed_date DATE,
  returned_date DATE,
  customer_signature TEXT, -- URL to signed doc
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.contents_inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can view contents"
  ON public.contents_inventory FOR SELECT
  USING (is_organization_member(organization_id, auth.uid()));

CREATE POLICY "Contents specialists can manage inventory"
  ON public.contents_inventory FOR ALL
  USING (
    has_any_role(auth.uid(), ARRAY['owner', 'office_admin', 'contents_specialist']::app_role[], organization_id)
  );

-- 6. RECONSTRUCTION PHASES (PM tracking)
-- ============================================================================
CREATE TABLE public.reconstruction_phases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  pm_id UUID REFERENCES auth.users(id) NOT NULL,
  phase_name TEXT NOT NULL, -- 'Demo', 'Framing', 'Drywall', etc.
  dependencies UUID[], -- Array of phase IDs that must complete first
  assigned_subcontractor UUID REFERENCES auth.users(id),
  start_date DATE,
  target_completion DATE,
  actual_completion DATE,
  status TEXT DEFAULT 'not_started', -- not_started, in_progress, blocked, complete
  budget NUMERIC,
  actual_cost NUMERIC,
  change_orders JSONB, -- [{description, amount, approved_by, date}]
  punch_list JSONB, -- [{item, status, photos, assigned_to}]
  permits_required BOOLEAN DEFAULT false,
  permit_status TEXT,
  photos TEXT[],
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.reconstruction_phases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can view recon phases"
  ON public.reconstruction_phases FOR SELECT
  USING (is_organization_member(organization_id, auth.uid()));

CREATE POLICY "PMs and admins can manage phases"
  ON public.reconstruction_phases FOR ALL
  USING (
    has_any_role(auth.uid(), ARRAY['owner', 'office_admin', 'reconstruction_pm']::app_role[], organization_id)
  );

-- 7. EQUIPMENT TRACKING
-- ============================================================================
CREATE TYPE public.equipment_type AS ENUM ('dehumidifier', 'air_mover', 'air_scrubber', 'heater', 'generator', 'other');
CREATE TYPE public.equipment_status AS ENUM ('available', 'deployed', 'maintenance', 'retired');

CREATE TABLE public.equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  equipment_type equipment_type NOT NULL,
  serial_number TEXT UNIQUE NOT NULL,
  model TEXT,
  status equipment_status DEFAULT 'available',
  current_project_id UUID REFERENCES public.projects(id),
  assigned_to UUID REFERENCES auth.users(id),
  last_maintenance DATE,
  next_maintenance DATE,
  runtime_hours NUMERIC DEFAULT 0,
  hourly_rate NUMERIC, -- Billing rate
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can view equipment"
  ON public.equipment FOR SELECT
  USING (is_organization_member(organization_id, auth.uid()));

CREATE POLICY "Admins and techs can manage equipment"
  ON public.equipment FOR ALL
  USING (
    has_any_role(auth.uid(), ARRAY['owner', 'office_admin', 'mitigation_tech']::app_role[], organization_id)
  );

-- 8. FINANCIAL TRANSACTIONS (Budget/Invoice tracking)
-- ============================================================================
CREATE TYPE public.transaction_type AS ENUM ('estimate', 'invoice', 'payment', 'change_order', 'expense');

CREATE TABLE public.financial_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  transaction_type transaction_type NOT NULL,
  amount NUMERIC NOT NULL,
  category TEXT, -- 'labor', 'materials', 'equipment', 'contents'
  description TEXT,
  invoice_number TEXT,
  payment_status TEXT DEFAULT 'pending', -- pending, paid, overdue
  due_date DATE,
  paid_date DATE,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  approved_by UUID REFERENCES auth.users(id),
  documents TEXT[], -- PDF URLs
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and owners can view financials"
  ON public.financial_transactions FOR SELECT
  USING (
    has_any_role(auth.uid(), ARRAY['owner', 'office_admin']::app_role[], organization_id)
  );

CREATE POLICY "Admins and owners can manage financials"
  ON public.financial_transactions FOR ALL
  USING (
    has_any_role(auth.uid(), ARRAY['owner', 'office_admin']::app_role[], organization_id)
  );

-- 9. WORKFLOW HANDOFFS (Phase transitions)
-- ============================================================================
CREATE TABLE public.workflow_handoffs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  from_phase TEXT NOT NULL, -- 'recon', 'mitigation', 'contents', 'reconstruction'
  to_phase TEXT NOT NULL,
  from_user UUID REFERENCES auth.users(id) NOT NULL,
  to_user UUID REFERENCES auth.users(id),
  handoff_data JSONB, -- Summary data for next phase
  status TEXT DEFAULT 'pending', -- pending, accepted, rejected
  notes TEXT,
  notification_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.workflow_handoffs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can view handoffs"
  ON public.workflow_handoffs FOR SELECT
  USING (is_organization_member(organization_id, auth.uid()));

CREATE POLICY "Involved users can manage handoffs"
  ON public.workflow_handoffs FOR ALL
  USING (
    from_user = auth.uid() 
    OR to_user = auth.uid() 
    OR is_organization_admin(organization_id, auth.uid())
  );

-- 10. CUSTOMER PORTAL ACCESS
-- ============================================================================
CREATE TABLE public.customer_portals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  access_token TEXT UNIQUE NOT NULL,
  customer_email TEXT NOT NULL,
  customer_name TEXT,
  is_active BOOLEAN DEFAULT true,
  last_accessed TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.customer_portals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone with token can view portal"
  ON public.customer_portals FOR SELECT
  USING (true); -- Public access via token

CREATE POLICY "Admins can manage portals"
  ON public.customer_portals FOR ALL
  USING (is_organization_admin(organization_id, auth.uid()));

-- 11. TRIGGERS FOR AUTO-UPDATES
-- ============================================================================

-- Auto-update updated_at timestamps
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER update_recon_assessments_updated_at BEFORE UPDATE ON public.recon_assessments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER update_mitigation_logs_updated_at BEFORE UPDATE ON public.mitigation_logs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER update_contents_inventory_updated_at BEFORE UPDATE ON public.contents_inventory
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER update_reconstruction_phases_updated_at BEFORE UPDATE ON public.reconstruction_phases
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER update_equipment_updated_at BEFORE UPDATE ON public.equipment
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 12. INDEXES FOR PERFORMANCE
-- ============================================================================
CREATE INDEX idx_user_roles_user_org ON public.user_roles(user_id, organization_id);
CREATE INDEX idx_leads_org_status ON public.leads(organization_id, status);
CREATE INDEX idx_recon_project ON public.recon_assessments(project_id);
CREATE INDEX idx_mitigation_project ON public.mitigation_logs(project_id);
CREATE INDEX idx_contents_project ON public.contents_inventory(project_id);
CREATE INDEX idx_contents_qr ON public.contents_inventory(qr_code);
CREATE INDEX idx_recon_phases_project ON public.reconstruction_phases(project_id);
CREATE INDEX idx_equipment_org_status ON public.equipment(organization_id, status);
CREATE INDEX idx_financials_project ON public.financial_transactions(project_id);
CREATE INDEX idx_handoffs_project ON public.workflow_handoffs(project_id, status);