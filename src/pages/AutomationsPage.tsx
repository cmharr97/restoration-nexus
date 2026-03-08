import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Zap, Plus, CheckCircle, AlertTriangle, Clock } from 'lucide-react';

const AUTOMATION_RULES = [
  { name: 'New job → assign intake tasks', trigger: 'Job Created', action: 'Create task list from template', status: 'Active', runs: 47 },
  { name: 'Mitigation active → require daily drying logs', trigger: 'Stage → Mitigation Active', action: 'Create daily log reminder', status: 'Active', runs: 23 },
  { name: 'No activity 3 days → alert PM', trigger: 'No job activity for 3 days', action: 'Notify assigned PM', status: 'Active', runs: 12 },
  { name: 'Supplement submitted → create follow-up task', trigger: 'Supplement created', action: 'Create 48hr follow-up task', status: 'Active', runs: 8 },
  { name: 'Invoice overdue → alert office admin', trigger: 'Invoice unpaid past due date', action: 'Notify office admin', status: 'Active', runs: 5 },
  { name: 'Customer selections overdue → notify PM', trigger: 'Selections pending > 7 days', action: 'Notify PM and customer', status: 'Draft', runs: 0 },
  { name: 'Stage → Reconstruction → create sequencing tasks', trigger: 'Stage → Reconstruction Active', action: 'Create trade sequence tasks', status: 'Active', runs: 15 },
  { name: 'Estimate submitted → start carrier follow-up', trigger: 'Estimate status → Submitted', action: 'Create 48hr follow-up reminders', status: 'Active', runs: 31 },
  { name: 'Dry out complete → prompt recon review', trigger: 'Stage → Mitigation Complete', action: 'Notify estimator for recon scope', status: 'Active', runs: 9 },
  { name: 'Supplement approved → update job margin', trigger: 'Supplement approved', action: 'Update projected gross profit', status: 'Draft', runs: 0 },
];

export default function AutomationsPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Automations</h1>
          <p className="page-subtitle">Workflow rules that keep operations moving</p>
        </div>
        <Button size="sm" className="gap-2"><Plus className="h-3.5 w-3.5" /> New Rule</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div className="stat-card">
          <div className="section-label">Active Rules</div>
          <div className="text-2xl font-extrabold font-headline text-success">{AUTOMATION_RULES.filter(r => r.status === 'Active').length}</div>
        </div>
        <div className="stat-card">
          <div className="section-label">Draft Rules</div>
          <div className="text-2xl font-extrabold font-headline text-muted-foreground">{AUTOMATION_RULES.filter(r => r.status === 'Draft').length}</div>
        </div>
        <div className="stat-card">
          <div className="section-label">Total Runs</div>
          <div className="text-2xl font-extrabold font-headline text-primary">{AUTOMATION_RULES.reduce((a, b) => a + b.runs, 0)}</div>
        </div>
      </div>

      <div className="space-y-2">
        {AUTOMATION_RULES.map((rule, i) => (
          <div key={i} className="bg-card border border-border rounded-lg p-4 flex items-center gap-4 hover:border-border/80 transition-colors cursor-pointer">
            <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${rule.status === 'Active' ? 'bg-success/15' : 'bg-muted'}`}>
              <Zap className={`h-4 w-4 ${rule.status === 'Active' ? 'text-success' : 'text-muted-foreground'}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm">{rule.name}</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                <span className="text-primary">When:</span> {rule.trigger} → <span className="text-primary">Then:</span> {rule.action}
              </div>
            </div>
            <div className="text-xs text-muted-foreground hidden md:block">{rule.runs} runs</div>
            <Badge className={`stage-badge ${rule.status === 'Active' ? 'bg-success/15 text-success' : 'bg-muted text-muted-foreground'}`}>
              {rule.status}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}
