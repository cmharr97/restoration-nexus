import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from './useOrganization';
import { useToast } from './use-toast';

export interface WorkflowHandoff {
  id: string;
  project_id: string;
  organization_id: string;
  from_phase: string;
  to_phase: string;
  from_user: string;
  to_user: string | null;
  handoff_data: any;
  status: 'pending' | 'accepted' | 'rejected';
  notes: string | null;
  notification_sent: boolean;
  created_at: string;
  completed_at: string | null;
}

export function useWorkflowHandoffs(projectId?: string) {
  const [handoffs, setHandoffs] = useState<WorkflowHandoff[]>([]);
  const [loading, setLoading] = useState(true);
  const { organization } = useOrganization();
  const { toast } = useToast();

  const fetchHandoffs = async () => {
    if (!organization?.id) return;

    try {
      setLoading(true);
      let query = supabase
        .from('workflow_handoffs')
        .select('*')
        .eq('organization_id', organization.id);

      if (projectId) {
        query = query.eq('project_id', projectId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setHandoffs((data as any) || []);
    } catch (error: any) {
      console.error('Error fetching handoffs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHandoffs();
  }, [organization?.id, projectId]);

  const createHandoff = async (handoffData: Partial<WorkflowHandoff>) => {
    if (!organization?.id) return null;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('workflow_handoffs')
        .insert({
          ...handoffData,
          organization_id: organization.id,
          from_user: user.id,
        } as any)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Handoff Created',
        description: `Phase handoff from ${handoffData.from_phase} to ${handoffData.to_phase} initiated`,
      });

      fetchHandoffs();
      return data;
    } catch (error: any) {
      console.error('Error creating handoff:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create handoff',
        variant: 'destructive',
      });
      return null;
    }
  };

  const acceptHandoff = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('workflow_handoffs')
        .update({
          status: 'accepted',
          completed_at: new Date().toISOString(),
        } as any)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Handoff Accepted',
        description: 'You have accepted this phase handoff',
      });

      fetchHandoffs();
      return data;
    } catch (error: any) {
      console.error('Error accepting handoff:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to accept handoff',
        variant: 'destructive',
      });
      return null;
    }
  };

  const rejectHandoff = async (id: string, reason: string) => {
    try {
      const { data, error } = await supabase
        .from('workflow_handoffs')
        .update({
          status: 'rejected',
          notes: reason,
          completed_at: new Date().toISOString(),
        } as any)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Handoff Rejected',
        description: 'Handoff has been rejected',
      });

      fetchHandoffs();
      return data;
    } catch (error: any) {
      console.error('Error rejecting handoff:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to reject handoff',
        variant: 'destructive',
      });
      return null;
    }
  };

  return {
    handoffs,
    loading,
    fetchHandoffs,
    createHandoff,
    acceptHandoff,
    rejectHandoff,
  };
}
