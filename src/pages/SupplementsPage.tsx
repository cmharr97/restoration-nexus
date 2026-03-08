import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ClipboardList, Plus, ArrowRight } from 'lucide-react';

const SAMPLE_SUPPLEMENTS = [
  { id: 'SUP-001', job: 'J-1051', customer: 'Martinez, Sarah', reason: 'Hardwood flooring replacement – cupping from Cat 2', amount: 4200, approved: null, status: 'Submitted', submitted: '2026-03-05', carrier: 'State Farm', estimator: 'Tyler Nguyen' },
  { id: 'SUP-002', job: 'J-1050', customer: 'Sunrise Office Park', reason: 'Additional demo – concealed fire damage in wall cavity', amount: 8400, approved: 6200, status: 'Partially Approved', submitted: '2026-02-28', carrier: 'Travelers', estimator: 'Tyler Nguyen' },
  { id: 'SUP-003', job: 'J-1049', customer: 'Chen, Wei & Linda', reason: 'Mold discovered behind vanity – additional remediation', amount: 3100, approved: null, status: 'Draft', submitted: null, carrier: 'Farmers', estimator: 'Tyler Nguyen' },
  { id: 'SUP-004', job: 'J-1045', customer: 'Patel Commercial', reason: 'Code upgrade – GFCI outlets required in kitchen', amount: 1800, approved: 1800, status: 'Approved', submitted: '2026-02-10', carrier: 'Zurich', estimator: 'Tyler Nguyen' },
];

export default function SupplementsPage() {
  const getStatusColor = (s: string) => {
    if (s === 'Approved') return 'bg-success/15 text-success';
    if (s === 'Partially Approved') return 'bg-warning/15 text-warning';
    if (s === 'Submitted') return 'bg-info/15 text-info';
    if (s === 'Denied') return 'bg-destructive/15 text-destructive';
    return 'bg-muted text-muted-foreground';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Supplements</h1>
          <p className="page-subtitle">Track supplement submissions, approvals & carrier responses</p>
        </div>
        <Button size="sm" className="gap-2"><Plus className="h-3.5 w-3.5" /> New Supplement</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {['Draft', 'Submitted', 'Under Review', 'Approved', 'Denied'].map(status => (
          <div key={status} className="stat-card">
            <div className="section-label">{status}</div>
            <div className="text-2xl font-extrabold font-headline">
              {SAMPLE_SUPPLEMENTS.filter(s => s.status.toLowerCase().includes(status.toLowerCase())).length || 0}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Supplement</th>
                <th>Job</th>
                <th>Customer</th>
                <th>Reason</th>
                <th>Requested</th>
                <th>Approved</th>
                <th>Carrier</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {SAMPLE_SUPPLEMENTS.map(s => (
                <tr key={s.id} className="cursor-pointer">
                  <td><span className="font-mono text-primary font-bold text-xs">{s.id}</span></td>
                  <td><span className="font-mono text-xs text-muted-foreground">{s.job}</span></td>
                  <td className="text-sm font-medium">{s.customer}</td>
                  <td className="text-sm text-muted-foreground max-w-[240px] truncate">{s.reason}</td>
                  <td className="font-semibold text-sm">${s.amount.toLocaleString()}</td>
                  <td className="text-sm">{s.approved !== null ? `$${s.approved.toLocaleString()}` : '—'}</td>
                  <td className="text-sm text-muted-foreground">{s.carrier}</td>
                  <td><Badge className={`stage-badge ${getStatusColor(s.status)}`}>{s.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
