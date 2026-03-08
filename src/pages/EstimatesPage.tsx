import { FileText } from 'lucide-react';

export default function EstimatesPage() {
  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Estimates</h1>
        <p className="page-subtitle">Mitigation, reconstruction, and supplement estimates</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {['Draft', 'Submitted', 'Pending', 'Approved', 'Denied'].map(status => (
          <div key={status} className="stat-card">
            <div className="text-xs text-muted-foreground uppercase tracking-wider">{status}</div>
            <div className="text-2xl font-bold font-headline">0</div>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-md p-12 text-center">
        <FileText className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
        <p className="text-sm font-medium">Estimate Management</p>
        <p className="text-xs text-muted-foreground mt-1">Create and track mitigation estimates, reconstruction estimates, and supplements. Link estimates to jobs and track carrier responses.</p>
      </div>
    </div>
  );
}