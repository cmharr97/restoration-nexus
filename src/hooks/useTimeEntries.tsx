import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

export type TimeEntry = {
  id: string;
  project_id: string;
  user_id: string;
  organization_id: string;
  clock_in: string;
  clock_out: string | null;
  billable_hours: number | null;
  hourly_rate: number | null;
  total_cost: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export function useTimeEntries(projectId?: string) {
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [activeEntry, setActiveEntry] = useState<TimeEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      let query = supabase
        .from('time_entries' as any)
        .select('*')
        .eq('user_id', user.user.id)
        .order('clock_in', { ascending: false });

      if (projectId) {
        query = query.eq('project_id', projectId);
      }

      const { data, error } = await query;
      if (error) throw error;

      setEntries((data as any) || []);
      
      // Find active entry (clocked in but not clocked out)
      const active = (data as any)?.find((entry: any) => !entry.clock_out);
      setActiveEntry(active || null);
    } catch (error: any) {
      console.error('Error fetching time entries:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('time_entries')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'time_entries',
        },
        () => {
          fetchEntries();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId]);

  const clockIn = async (projectId: string, organizationId: string, hourlyRate?: number, notes?: string) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('time_entries' as any)
        .insert({
          project_id: projectId,
          user_id: user.user.id,
          organization_id: organizationId,
          hourly_rate: hourlyRate || null,
          notes: notes || null,
        } as any)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Clocked In',
        description: 'Time tracking started successfully',
      });

      fetchEntries();
      return data;
    } catch (error: any) {
      console.error('Error clocking in:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to clock in',
        variant: 'destructive',
      });
      return null;
    }
  };

  const clockOut = async (entryId: string, notes?: string) => {
    try {
      const clockOutTime = new Date();
      
      // Get the entry to calculate hours
      const entry = entries.find(e => e.id === entryId);
      if (!entry) throw new Error('Entry not found');

      const clockInTime = new Date(entry.clock_in);
      const hoursWorked = (clockOutTime.getTime() - clockInTime.getTime()) / (1000 * 60 * 60);
      const totalCost = entry.hourly_rate ? hoursWorked * entry.hourly_rate : null;

      const { data, error } = await supabase
        .from('time_entries' as any)
        .update({
          clock_out: clockOutTime.toISOString(),
          billable_hours: hoursWorked,
          total_cost: totalCost,
          notes: notes || entry.notes,
        } as any)
        .eq('id', entryId)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Clocked Out',
        description: `Logged ${hoursWorked.toFixed(2)} hours`,
      });

      fetchEntries();
      return data;
    } catch (error: any) {
      console.error('Error clocking out:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to clock out',
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateEntry = async (entryId: string, updates: Partial<TimeEntry>) => {
    try {
      const { data, error } = await supabase
        .from('time_entries' as any)
        .update(updates as any)
        .eq('id', entryId)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Entry Updated',
        description: 'Time entry updated successfully',
      });

      fetchEntries();
      return data;
    } catch (error: any) {
      console.error('Error updating entry:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update entry',
        variant: 'destructive',
      });
      return null;
    }
  };

  return {
    entries,
    activeEntry,
    loading,
    clockIn,
    clockOut,
    updateEntry,
    fetchEntries,
  };
}
