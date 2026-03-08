import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Truck, Plus, FileText, Shield, Phone, Mail } from 'lucide-react';

const SAMPLE_SUBS = [
  { name: 'Hill Country Drywall', trade: 'Drywall', contact: 'Jake Torres', phone: '(512) 555-0101', status: 'Active', coiStatus: 'Current', w9: true, activeJobs: 3 },
  { name: 'Austin Flooring Pros', trade: 'Flooring', contact: 'Lisa Chen', phone: '(512) 555-0202', status: 'Active', coiStatus: 'Current', w9: true, activeJobs: 1 },
  { name: 'Lone Star Electric', trade: 'Electrical', contact: 'Mike Rodriguez', phone: '(512) 555-0303', status: 'Active', coiStatus: 'Expiring', w9: true, activeJobs: 2 },
  { name: 'Capital City Plumbing', trade: 'Plumbing', contact: 'Dan Weber', phone: '(512) 555-0404', status: 'Active', coiStatus: 'Current', w9: false, activeJobs: 0 },
  { name: 'Precision Paint Co', trade: 'Paint', contact: 'Sarah Kim', phone: '(512) 555-0505', status: 'Inactive', coiStatus: 'Expired', w9: true, activeJobs: 0 },
  { name: 'Texas HVAC Solutions', trade: 'HVAC', contact: 'Rob Martinez', phone: '(512) 555-0606', status: 'Active', coiStatus: 'Current', w9: true, activeJobs: 1 },
  { name: 'Metro Roofing', trade: 'Roofing', contact: 'James Park', phone: '(512) 555-0707', status: 'Active', coiStatus: 'Current', w9: true, activeJobs: 2 },
];

export default function SubcontractorsPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Subcontractors</h1>
          <p className="page-subtitle">Trade partners, compliance & work orders</p>
        </div>
        <Button size="sm" className="gap-2"><Plus className="h-3.5 w-3.5" /> Add Subcontractor</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Subs', value: SAMPLE_SUBS.length },
          { label: 'Active', value: SAMPLE_SUBS.filter(s => s.status === 'Active').length },
          { label: 'COI Expiring', value: SAMPLE_SUBS.filter(s => s.coiStatus === 'Expiring').length },
          { label: 'Missing W9', value: SAMPLE_SUBS.filter(s => !s.w9).length },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="section-label">{s.label}</div>
            <div className="text-2xl font-extrabold font-headline">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Subs List */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Trade</th>
                <th>Contact</th>
                <th>Status</th>
                <th>COI</th>
                <th>W9</th>
                <th>Active Jobs</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {SAMPLE_SUBS.map((sub, i) => (
                <tr key={i} className="cursor-pointer">
                  <td className="font-medium text-sm">{sub.name}</td>
                  <td><Badge variant="outline" className="text-[10px]">{sub.trade}</Badge></td>
                  <td className="text-sm text-muted-foreground">{sub.contact}</td>
                  <td><Badge className={`stage-badge ${sub.status === 'Active' ? 'bg-success/15 text-success' : 'bg-muted text-muted-foreground'}`}>{sub.status}</Badge></td>
                  <td>
                    <Badge className={`stage-badge ${sub.coiStatus === 'Current' ? 'bg-success/15 text-success' : sub.coiStatus === 'Expiring' ? 'bg-warning/15 text-warning' : 'bg-destructive/15 text-destructive'}`}>
                      {sub.coiStatus}
                    </Badge>
                  </td>
                  <td>{sub.w9 ? <span className="text-success text-xs">✓</span> : <span className="text-destructive text-xs">Missing</span>}</td>
                  <td className="text-center font-medium">{sub.activeJobs}</td>
                  <td>
                    <div className="flex gap-1">
                      <Button variant="outline" size="sm" className="h-7 text-xs"><Phone className="h-3 w-3" /></Button>
                      <Button variant="outline" size="sm" className="h-7 text-xs"><FileText className="h-3 w-3" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
