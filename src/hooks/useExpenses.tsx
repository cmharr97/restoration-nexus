import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from './useOrganization';
import { toast } from '@/hooks/use-toast';

export interface Expense {
  id: string;
  organization_id: string;
  project_id: string;
  user_id: string;
  amount: number;
  category: string;
  description: string | null;
  receipt_url: string | null;
  expense_date: string;
  status: 'pending' | 'approved' | 'rejected';
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
  profiles?: {
    full_name: string | null;
    email: string;
  };
}

export function useExpenses(projectId?: string) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const { organization } = useOrganization();

  const fetchExpenses = async () => {
    if (!organization) return;

    try {
      setLoading(true);
      let query = supabase
        .from('expenses')
        .select(`
          *,
          profiles:user_id (
            full_name,
            email
          )
        `)
        .eq('organization_id', organization.id)
        .order('expense_date', { ascending: false });

      if (projectId) {
        query = query.eq('project_id', projectId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setExpenses((data as any) || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [organization, projectId]);

  const createExpense = async (expenseData: {
    project_id: string;
    amount: number;
    category: string;
    description?: string;
    expense_date: string;
    receipt?: File;
  }) => {
    if (!organization) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      let receiptUrl: string | null = null;

      // Upload receipt if provided
      if (expenseData.receipt) {
        const fileExt = expenseData.receipt.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('expense-receipts')
          .upload(fileName, expenseData.receipt);

        if (uploadError) throw uploadError;
        receiptUrl = fileName;
      }

      const { error } = await supabase.from('expenses').insert({
        organization_id: organization.id,
        project_id: expenseData.project_id,
        user_id: user.id,
        amount: expenseData.amount,
        category: expenseData.category,
        description: expenseData.description || null,
        expense_date: expenseData.expense_date,
        receipt_url: receiptUrl,
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Expense submitted successfully',
      });

      await fetchExpenses();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const updateExpenseStatus = async (
    expenseId: string,
    status: 'approved' | 'rejected'
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('expenses')
        .update({
          status,
          approved_by: user.id,
          approved_at: new Date().toISOString(),
        })
        .eq('id', expenseId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Expense ${status}`,
      });

      await fetchExpenses();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const deleteExpense = async (expenseId: string) => {
    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', expenseId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Expense deleted',
      });

      await fetchExpenses();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const getReceiptUrl = async (receiptPath: string) => {
    const { data } = await supabase.storage
      .from('expense-receipts')
      .createSignedUrl(receiptPath, 3600);
    return data?.signedUrl || null;
  };

  return {
    expenses,
    loading,
    fetchExpenses,
    createExpense,
    updateExpenseStatus,
    deleteExpense,
    getReceiptUrl,
  };
}
