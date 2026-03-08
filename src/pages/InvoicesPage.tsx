import { Receipt } from 'lucide-react';

export default function InvoicesPage() {
  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Invoices & Payments</h1>
        <p className="page-subtitle">Billing, AR aging, and payment tracking</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Outstanding', value: '$0', color: '' },
          { label: 'Overdue', value: '$0', color: 'text-destructive' },
          { label: 'Paid (MTD)', value: '$0', color: 'text-success' },
          { label: 'Pending', value: '0', color: '' },
        ].map(item => (
          <div key={item.label} className="stat-card">
            <div className="text-xs text-muted-foreground uppercase tracking-wider">{item.label}</div>
            <div className={`text-2xl font-bold font-headline ${item.color}`}>{item.value}</div>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-md p-12 text-center">
        <Receipt className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
        <p className="text-sm font-medium">Invoice Management</p>
        <p className="text-xs text-muted-foreground mt-1">Create invoices from job estimates, track payments, manage AR aging, and monitor deductible collection.</p>
      </div>
    </div>
  );
}