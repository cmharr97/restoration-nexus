import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from './useOrganization';
import { useToast } from './use-toast';

export type Project = {
  id: string;
  organization_id: string;
  name: string;
  project_number: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  loss_type: 'water' | 'fire' | 'mold' | 'storm' | 'reconstruction' | 'other';
  loss_date: string | null;
  loss_description: string | null;
  status: 'lead' | 'opportunity' | 'active' | 'on_hold' | 'completed' | 'cancelled';
  policy_number: string | null;
  claim_number: string | null;
  insurance_carrier: string | null;
  tpa_name: string | null;
  adjuster_name: string | null;
  adjuster_email: string | null;
  adjuster_phone: string | null;
  deductible: number | null;
  owner_name: string | null;
  owner_email: string | null;
  owner_phone: string | null;
  start_date: string | null;
  target_completion_date: string | null;
  actual_completion_date: string | null;
  estimated_cost: number | null;
  actual_cost: number | null;
  template_used: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const { organization } = useOrganization();
  const { toast } = useToast();

  const fetchProjects = async () => {
    if (!organization?.id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('projects' as any)
        .select('*')
        .eq('organization_id', organization.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects((data as any) || []);
    } catch (error: any) {
      console.error('Error fetching projects:', error);
      toast({
        title: 'Error',
        description: 'Failed to load projects',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [organization?.id]);

  const createProject = async (projectData: Partial<Project>) => {
    if (!organization?.id) return null;

    try {
      // Generate project number
      const { data: projectNumber, error: numberError } = await (supabase as any)
        .rpc('generate_project_number');

      if (numberError) throw numberError;

      // Convert empty strings to null for date fields
      const cleanedData = {
        ...projectData,
        loss_date: projectData.loss_date || null,
        start_date: projectData.start_date || null,
        target_completion_date: projectData.target_completion_date || null,
        actual_completion_date: projectData.actual_completion_date || null,
      };

      const { data, error } = await supabase
        .from('projects' as any)
        .insert({
          ...cleanedData,
          organization_id: organization.id,
          project_number: projectNumber,
          created_by: (await supabase.auth.getUser()).data.user?.id,
        } as any)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Project Created',
        description: `${(data as any).name} has been created successfully`,
      });

      fetchProjects();
      return data;
    } catch (error: any) {
      console.error('Error creating project:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create project',
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateProject = async (id: string, projectData: Partial<Project>) => {
    try {
      const { data, error } = await supabase
        .from('projects' as any)
        .update(projectData as any)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Project Updated',
        description: 'Project has been updated successfully',
      });

      fetchProjects();
      return data;
    } catch (error: any) {
      console.error('Error updating project:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update project',
        variant: 'destructive',
      });
      return null;
    }
  };

  const deleteProject = async (id: string) => {
    try {
      const { error } = await supabase
        .from('projects' as any)
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Project Deleted',
        description: 'Project has been deleted successfully',
      });

      fetchProjects();
      return true;
    } catch (error: any) {
      console.error('Error deleting project:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete project',
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    projects,
    loading,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
  };
}
