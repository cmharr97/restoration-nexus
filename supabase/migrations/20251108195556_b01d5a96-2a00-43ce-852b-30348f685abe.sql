-- Create expenses table
CREATE TABLE public.expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  receipt_url TEXT,
  expense_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  approved_by UUID REFERENCES public.profiles(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Members can create expenses"
  ON public.expenses
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND
    is_organization_member(organization_id, auth.uid())
  );

CREATE POLICY "Members can view org expenses"
  ON public.expenses
  FOR SELECT
  USING (is_organization_member(organization_id, auth.uid()));

CREATE POLICY "Users can update their pending expenses"
  ON public.expenses
  FOR UPDATE
  USING (user_id = auth.uid() AND status = 'pending');

CREATE POLICY "Admins can approve/reject expenses"
  ON public.expenses
  FOR UPDATE
  USING (is_organization_admin(organization_id, auth.uid()));

CREATE POLICY "Admins can delete expenses"
  ON public.expenses
  FOR DELETE
  USING (is_organization_admin(organization_id, auth.uid()));

-- Create storage bucket for receipts
INSERT INTO storage.buckets (id, name, public)
VALUES ('expense-receipts', 'expense-receipts', false);

-- Storage policies
CREATE POLICY "Members can upload receipts"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'expense-receipts' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Members can view org receipts"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'expense-receipts' AND
    EXISTS (
      SELECT 1 FROM public.expenses e
      WHERE e.receipt_url = storage.objects.name
        AND is_organization_member(e.organization_id, auth.uid())
    )
  );

CREATE POLICY "Users can update their receipts"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'expense-receipts' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Admins can delete receipts"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'expense-receipts' AND
    EXISTS (
      SELECT 1 FROM public.expenses e
      WHERE e.receipt_url = storage.objects.name
        AND is_organization_admin(e.organization_id, auth.uid())
    )
  );

-- Trigger for updated_at
CREATE TRIGGER update_expenses_updated_at
  BEFORE UPDATE ON public.expenses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();