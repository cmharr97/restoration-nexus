import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from './useOrganization';
import { useToast } from './use-toast';

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
export type DamageType = 'water' | 'fire' | 'mold' | 'storm' | 'biohazard' | 'other';
export type UrgencyLevel = 'low' | 'medium' | 'high' | 'emergency';

export interface Lead {
  id: string;
  organization_id: string;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string | null;
  address: string | null;
  damage_type: DamageType;
  urgency: UrgencyLevel;
  status: LeadStatus;
  initial_photos: string[] | null;
  ai_triage_score: number | null;
  ai_damage_estimate: number | null;
  notes: string | null;
  source: string | null;
  assigned_to: string | null;
  converted_project_id: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const { organization } = useOrganization();
  const { toast } = useToast();

  const fetchLeads = async () => {
    if (!organization?.id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('organization_id', organization.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLeads((data as any) || []);
    } catch (error: any) {
      console.error('Error fetching leads:', error);
      toast({
        title: 'Error',
        description: 'Failed to load leads',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [organization?.id]);

  const createLead = async (leadData: Partial<Lead>) => {
    if (!organization?.id) return null;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('leads')
        .insert({
          ...leadData,
          organization_id: organization.id,
          created_by: user.id,
        } as any)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Lead Created',
        description: `${(data as any).customer_name} has been added to the pipeline`,
      });

      fetchLeads();
      return data;
    } catch (error: any) {
      console.error('Error creating lead:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create lead',
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateLead = async (id: string, leadData: Partial<Lead>) => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .update(leadData as any)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Lead Updated',
        description: 'Lead has been updated successfully',
      });

      fetchLeads();
      return data;
    } catch (error: any) {
      console.error('Error updating lead:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update lead',
        variant: 'destructive',
      });
      return null;
    }
  };

  const convertToProject = async (leadId: string, projectData: any) => {
    try {
      // First create the project
      const { data: projectResponse, error: projectError } = await supabase
        .from('projects')
        .insert(projectData)
        .select()
        .single();

      if (projectError) throw projectError;

      // Then update the lead with the project ID and mark as converted
      const { error: updateError } = await supabase
        .from('leads')
        .update({
          status: 'converted',
          converted_project_id: (projectResponse as any).id,
        } as any)
        .eq('id', leadId);

      if (updateError) throw updateError;

      toast({
        title: 'Lead Converted',
        description: 'Lead has been converted to a project',
      });

      fetchLeads();
      return projectResponse;
    } catch (error: any) {
      console.error('Error converting lead:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to convert lead',
        variant: 'destructive',
      });
      return null;
    }
  };

  const deleteLead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Lead Deleted',
        description: 'Lead has been deleted successfully',
      });

      fetchLeads();
      return true;
    } catch (error: any) {
      console.error('Error deleting lead:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete lead',
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    leads,
    loading,
    fetchLeads,
    createLead,
    updateLead,
    convertToProject,
    deleteLead,
  };
}
