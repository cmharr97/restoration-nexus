import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/hooks/useOrganization';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DollarSign, Plus, Loader2 } from 'lucide-react';

export default function PaymentsPage() {
  const { organization } = useOrganization();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!organization?.id) return;
    const fetch = async () => {
      const { data } = await supabase
        .from('financial_transactions')
        .select('*')
        .eq('organization_id', organization.id)
        .order('created_at', { ascending: false });
      setTransactions(data || []);
      setLoading(false);
    };
    fetch();
  }, [organization?.id]);

  const getStatusColor = (s: string) => {
    if (s === 'paid') return 'bg-success/15 text-success';
    if (s === 'pending') return 'bg-warning/15 text-warning';
    if (s === 'overdue') return 'bg-destructive/15 text-destructive';
    return 'bg-muted text-muted-foreground';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Payments</h1>
          <p className="page-subtitle">Insurance payments, homeowner payments & collections</p>
        </div>
        <Button size="sm" className="gap-2"><Plus className="h-3.5 w-3.5" /> Record Payment</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Received', value: `$${(transactions.filter(t => t.payment_status === 'paid').reduce((a, b) => a + Number(b.amount), 0) / 1000).toFixed(0)}K` },
          { label: 'Pending', value: transactions.filter(t => t.payment_status === 'pending').length },
          { label: 'Overdue', value: transactions.filter(t => t.payment_status === 'overdue').length },
          { label: 'Total Transactions', value: transactions.length },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="section-label">{s.label}</div>
            <div className="text-2xl font-extrabold font-headline">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
        ) : transactions.length === 0 ? (
          <div className="py-16 text-center">
            <DollarSign className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No payments recorded yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Due Date</th>
                  <th>Paid Date</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(t => (
                  <tr key={t.id}>
                    <td className="font-mono text-xs text-primary">{t.invoice_number || '—'}</td>
                    <td className="text-xs capitalize">{t.transaction_type}</td>
                    <td className="font-semibold">${Number(t.amount).toLocaleString()}</td>
                    <td><Badge className={`stage-badge ${getStatusColor(t.payment_status)}`}>{t.payment_status}</Badge></td>
                    <td className="text-xs text-muted-foreground">{t.due_date ? new Date(t.due_date).toLocaleDateString() : '—'}</td>
                    <td className="text-xs text-muted-foreground">{t.paid_date ? new Date(t.paid_date).toLocaleDateString() : '—'}</td>
                    <td className="text-sm text-muted-foreground max-w-[200px] truncate">{t.description || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
