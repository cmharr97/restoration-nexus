import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/hooks/useOrganization';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Plus } from 'lucide-react';

const SAMPLE_ESTIMATES = [
  { id: 'E-2041', job: 'J-1051', customer: 'Martinez, Sarah', type: 'Mitigation', software: 'Xactimate', amount: 6800, status: 'Submitted', adjuster: 'Tom Hendricks' },
  { id: 'E-2040', job: 'J-1050', customer: 'Sunrise Office Park', type: 'Reconstruction', software: 'Xactimate', amount: 50200, status: 'Supplement', adjuster: 'Linda Park' },
  { id: 'E-2039', job: 'J-1050', customer: 'Sunrise Office Park', type: 'Fire Mitigation', software: 'Xactimate', amount: 18200, status: 'Approved', adjuster: 'Linda Park' },
  { id: 'E-2038', job: 'J-1049', customer: 'Chen, Wei & Linda', type: 'Mold Remediation', software: 'Symbility', amount: 7800, status: 'Pending', adjuster: 'Bill Torres' },
  { id: 'E-2037', job: 'J-1047', customer: 'Rodriguez, Miguel', type: 'Storm Damage', software: 'Xactimate', amount: null, status: 'Draft', adjuster: 'Pending' },
];

export default function EstimatesPage() {
  const getStatusColor = (s: string) => {
    if (s === 'Approved') return 'bg-success/15 text-success';
    if (s === 'Draft') return 'bg-muted text-muted-foreground';
    if (s === 'Supplement') return 'bg-warning/15 text-warning';
    if (s === 'Submitted') return 'bg-info/15 text-info';
    if (s === 'Denied') return 'bg-destructive/15 text-destructive';
    return 'bg-primary/15 text-primary';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Estimates</h1>
          <p className="page-subtitle">Xactimate & Symbility estimate tracking</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">Open Xactimate</Button>
          <Button size="sm" className="gap-2"><Plus className="h-3.5 w-3.5" /> New Estimate</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {['Draft', 'Submitted', 'Pending', 'Approved', 'Denied'].map(status => (
          <div key={status} className="stat-card">
            <div className="section-label">{status}</div>
            <div className="text-2xl font-extrabold font-headline">
              {SAMPLE_ESTIMATES.filter(e => e.status.toLowerCase() === status.toLowerCase()).length}
            </div>
          </div>
        ))}
      </div>

      {/* Integration Status */}
      <div className="flex gap-3 flex-wrap">
        {[['Xactimate', true, 'Synced 4m ago'], ['Symbility', true, 'Synced 11m ago'], ['XactAnalysis', true, 'Claims synced']].map(([name, connected, note]) => (
          <div key={name as string} className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2">
            <div className={`h-2 w-2 rounded-full ${connected ? 'bg-success' : 'bg-destructive'}`} />
            <div>
              <div className="text-xs font-semibold">{name as string}</div>
              <div className="text-[10px] text-muted-foreground">{note as string}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Estimate</th>
                <th>Job</th>
                <th>Customer</th>
                <th>Type</th>
                <th>Software</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Adjuster</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {SAMPLE_ESTIMATES.map(e => (
                <tr key={e.id} className="cursor-pointer">
                  <td><span className="font-mono text-primary font-bold text-xs">{e.id}</span></td>
                  <td><span className="font-mono text-xs text-muted-foreground">{e.job}</span></td>
                  <td className="font-medium text-sm">{e.customer}</td>
                  <td className="text-sm text-muted-foreground">{e.type}</td>
                  <td><Badge variant="outline" className="text-[10px]">{e.software}</Badge></td>
                  <td className="font-semibold">{e.amount ? `$${e.amount.toLocaleString()}` : '—'}</td>
                  <td><Badge className={`stage-badge ${getStatusColor(e.status)}`}>{e.status}</Badge></td>
                  <td className="text-sm text-muted-foreground">{e.adjuster}</td>
                  <td><Button variant="outline" size="sm" className="h-7 text-xs">View</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
