import { BarChart3 } from 'lucide-react';

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Reports</h1>
        <p className="page-subtitle">Operational analytics and insights</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {[
          { title: 'Open Jobs by Stage', desc: 'Breakdown of active jobs across all workflow stages' },
          { title: 'Revenue by Month', desc: 'Monthly revenue tracking and trends' },
          { title: 'Supplement Pipeline', desc: 'Pending supplements and carrier response rates' },
          { title: 'Cycle Time by Stage', desc: 'Average time jobs spend in each stage' },
          { title: 'Lead Source Performance', desc: 'Conversion rates by lead source' },
          { title: 'Equipment Utilization', desc: 'Equipment deployment and runtime metrics' },
          { title: 'Tasks Overdue by Owner', desc: 'Team accountability and task completion rates' },
          { title: 'AR Aging Summary', desc: 'Outstanding receivables by age bracket' },
          { title: 'Jobs by Project Manager', desc: 'Workload distribution and performance' },
        ].map(report => (
          <div key={report.title} className="bg-card border border-border rounded-md p-4 hover:border-primary/30 transition-colors cursor-pointer">
            <BarChart3 className="h-5 w-5 text-primary/50 mb-2" />
            <h3 className="text-sm font-semibold">{report.title}</h3>
            <p className="text-xs text-muted-foreground mt-1">{report.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}