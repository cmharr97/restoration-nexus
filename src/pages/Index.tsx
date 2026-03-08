import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/hooks/useOrganization';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Briefcase, AlertTriangle, Clock, DollarSign, CheckSquare,
  ArrowRight, Droplets, Hammer, TrendingUp, Plus, FileText,
  Target, Zap, Calendar, Users
} from 'lucide-react';

export default function Dashboard() {
  const { organization } = useOrganization();
  const [stats, setStats] = useState({
    activeJobs: 0, openTasks: 0, mitigationActive: 0,
    reconstructionActive: 0, leadsNew: 0, overdueTaskCount: 0,
    invoicedAmount: 0, jobCount: 0
  });
  const [recentJobs, setRecentJobs] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!organization?.id) return;
    const orgId = organization.id;

    const fetchData = async () => {
      const [jobsRes, leadsRes, activityRes] = await Promise.all([
        supabase.from('projects').select('*').eq('organization_id', orgId).order('updated_at', { ascending: false }).limit(50),
        supabase.from('leads').select('*').eq('organization_id', orgId).eq('status', 'new'),
        supabase.from('project_activity_log').select('*').eq('organization_id', orgId).order('created_at', { ascending: false }).limit(10),
      ]);

      const jobs = jobsRes.data || [];
      const activeStatuses = ['pending', 'active', 'in_progress', 'mitigation_active', 'reconstruction_active', 'new_lead', 'inspection_scheduled', 'authorization_signed', 'awaiting_approval', 'punch_list'];
      const active = jobs.filter(j => activeStatuses.includes(j.status));
      const mitJobs = jobs.filter(j => j.status === 'mitigation_active');
      const reconJobs = jobs.filter(j => j.status === 'reconstruction_active');
      const invoicedJobs = jobs.filter(j => j.status === 'invoiced');

      setStats({
        activeJobs: active.length,
        openTasks: 0,
        mitigationActive: mitJobs.length,
        reconstructionActive: reconJobs.length,
        leadsNew: leadsRes.data?.length || 0,
        overdueTaskCount: 0,
        invoicedAmount: invoicedJobs.reduce((sum, j) => sum + (j.estimated_cost || 0), 0),
        jobCount: jobs.length,
      });

      setRecentJobs(jobs.slice(0, 8));
      setRecentActivity(activityRes.data || []);
      setLoading(false);
    };

    fetchData();
  }, [organization?.id]);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      new_lead: 'bg-info/15 text-info',
      mitigation_active: 'bg-primary/15 text-primary',
      reconstruction_active: 'bg-warning/15 text-warning',
      invoiced: 'bg-success/15 text-success',
      paid: 'bg-success/15 text-success',
      closed: 'bg-muted text-muted-foreground',
    };
    return colors[status] || 'bg-muted text-muted-foreground';
  };

  const formatStatus = (status: string) => status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
        </div>
        <Link to="/jobs?create=1">
          <Button size="sm" className="gap-2"><Plus className="h-3.5 w-3.5" /> New Job</Button>
        </Link>
      </div>

      {/* Urgent Alerts */}
      {stats.mitigationActive > 0 && (
        <div className="alert-card-warning">
          <Droplets className="h-5 w-5 text-primary shrink-0" />
          <div className="flex-1">
            <div className="font-semibold text-sm">{stats.mitigationActive} active mitigation job{stats.mitigationActive > 1 ? 's' : ''}</div>
            <div className="text-xs text-muted-foreground">Daily drying logs required</div>
          </div>
          <Link to="/mitigation"><Button variant="outline" size="sm" className="text-xs">Drying Logs</Button></Link>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Active Jobs', value: stats.activeJobs, icon: Briefcase, color: 'text-primary' },
          { label: 'New Leads', value: stats.leadsNew, icon: Target, color: 'text-info' },
          { label: 'Mitigation', value: stats.mitigationActive, icon: Droplets, color: 'text-primary' },
          { label: 'Reconstruction', value: stats.reconstructionActive, icon: Hammer, color: 'text-warning' },
          { label: 'Open Tasks', value: stats.openTasks, icon: CheckSquare, color: 'text-muted-foreground' },
          { label: 'Awaiting Payment', value: `$${(stats.invoicedAmount / 1000).toFixed(0)}K`, icon: DollarSign, color: 'text-success' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="stat-card">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Icon className="h-3.5 w-3.5" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.06em]">{label}</span>
            </div>
            <div className={`text-2xl font-extrabold font-headline ${color}`}>{value}</div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Recent Jobs */}
        <div className="lg:col-span-2 bg-card border border-border rounded-lg">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h2 className="text-sm font-semibold font-headline">Job Pipeline</h2>
            <Link to="/jobs" className="text-xs text-primary hover:underline flex items-center gap-1">
              View All <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {recentJobs.length === 0 && !loading && (
              <div className="p-8 text-center text-muted-foreground text-sm">
                No jobs yet. Create your first job to get started.
              </div>
            )}
            {recentJobs.map(job => (
              <Link
                key={job.id}
                to={`/jobs/${job.id}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-primary font-mono font-bold">{job.project_number || 'N/A'}</span>
                    <span className="text-sm font-medium truncate">{job.name}</span>
                    {job.priority === 'urgent' && <Badge className="stage-badge bg-destructive/15 text-destructive">URGENT</Badge>}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
                    {job.owner_name && <span>{job.owner_name}</span>}
                    {job.insurance_carrier && <><span>·</span><span>{job.insurance_carrier}</span></>}
                    {job.claim_number && <><span>·</span><span className="font-mono">{job.claim_number}</span></>}
                  </div>
                </div>
                <Badge className={`stage-badge shrink-0 ml-3 ${getStatusColor(job.status)}`}>
                  {formatStatus(job.status)}
                </Badge>
              </Link>
            ))}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="bg-card border border-border rounded-lg">
          <div className="px-4 py-3 border-b border-border">
            <h2 className="text-sm font-semibold font-headline">Recent Activity</h2>
          </div>
          <div className="divide-y divide-border max-h-[500px] overflow-y-auto">
            {recentActivity.length === 0 && (
              <div className="p-6 text-center text-muted-foreground text-sm">No activity recorded yet.</div>
            )}
            {recentActivity.map(activity => (
              <div key={activity.id} className="px-4 py-3">
                <div className="text-sm">
                  <span className="font-medium capitalize">{activity.action}</span>{' '}
                  <span className="text-muted-foreground">{activity.entity_type}</span>
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {new Date(activity.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
