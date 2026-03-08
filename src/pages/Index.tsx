import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/hooks/useOrganization';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Briefcase, AlertTriangle, Clock, DollarSign, CheckSquare,
  ArrowRight, Droplets, Hammer, TrendingUp, Plus, FileText
} from 'lucide-react';

interface DashboardStats {
  activeJobs: number;
  openTasks: number;
  mitigationActive: number;
  reconstructionActive: number;
  leadsNew: number;
  overdueTaskCount: number;
}

export default function Dashboard() {
  const { organization } = useOrganization();
  const [stats, setStats] = useState<DashboardStats>({
    activeJobs: 0, openTasks: 0, mitigationActive: 0,
    reconstructionActive: 0, leadsNew: 0, overdueTaskCount: 0
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
      const activeStatuses = ['pending', 'active', 'in_progress', 'mitigation_active', 'reconstruction_active'];
      const active = jobs.filter(j => activeStatuses.includes(j.status));
      const mitJobs = jobs.filter(j => j.status === 'mitigation_active' || j.job_type === 'mitigation');
      const reconJobs = jobs.filter(j => j.status === 'reconstruction_active' || j.job_type === 'reconstruction');

      setStats({
        activeJobs: active.length,
        openTasks: 0,
        mitigationActive: mitJobs.filter(j => activeStatuses.includes(j.status)).length,
        reconstructionActive: reconJobs.filter(j => activeStatuses.includes(j.status)).length,
        leadsNew: leadsRes.data?.length || 0,
        overdueTaskCount: 0,
      });

      setRecentJobs(jobs.slice(0, 8));
      setRecentActivity(activityRes.data || []);
      setLoading(false);
    };

    fetchData();
  }, [organization?.id]);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-success/15 text-success',
      in_progress: 'bg-success/15 text-success',
      mitigation_active: 'bg-info/15 text-info',
      reconstruction_active: 'bg-warning/15 text-warning',
      pending: 'bg-muted text-muted-foreground',
      completed: 'bg-muted text-muted-foreground',
      closed: 'bg-muted text-muted-foreground',
      invoiced: 'bg-primary/15 text-primary',
    };
    return colors[status] || 'bg-muted text-muted-foreground';
  };

  const formatStatus = (status: string) => status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="page-header mb-0">
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Operations overview</p>
        </div>
        <Link to="/jobs">
          <Button size="sm" className="gap-2">
            <Plus className="h-3.5 w-3.5" />
            New Job
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="stat-card">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Briefcase className="h-3.5 w-3.5" />
            <span className="text-xs font-medium uppercase tracking-wider">Active Jobs</span>
          </div>
          <div className="text-2xl font-bold font-headline">{stats.activeJobs}</div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Target className="h-3.5 w-3.5" />
            <span className="text-xs font-medium uppercase tracking-wider">New Leads</span>
          </div>
          <div className="text-2xl font-bold font-headline">{stats.leadsNew}</div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Droplets className="h-3.5 w-3.5" />
            <span className="text-xs font-medium uppercase tracking-wider">Mitigation</span>
          </div>
          <div className="text-2xl font-bold font-headline">{stats.mitigationActive}</div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Hammer className="h-3.5 w-3.5" />
            <span className="text-xs font-medium uppercase tracking-wider">Reconstruction</span>
          </div>
          <div className="text-2xl font-bold font-headline">{stats.reconstructionActive}</div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-2 text-muted-foreground">
            <CheckSquare className="h-3.5 w-3.5" />
            <span className="text-xs font-medium uppercase tracking-wider">Open Tasks</span>
          </div>
          <div className="text-2xl font-bold font-headline">{stats.openTasks}</div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-2 text-muted-foreground">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span className="text-xs font-medium uppercase tracking-wider">Overdue</span>
          </div>
          <div className="text-2xl font-bold font-headline text-destructive">{stats.overdueTaskCount}</div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Jobs */}
        <div className="lg:col-span-2 bg-card border border-border rounded-md">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h2 className="text-sm font-semibold font-headline">Recent Jobs</h2>
            <Link to="/jobs" className="text-xs text-primary hover:underline flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
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
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground font-mono">
                      {job.project_number || 'N/A'}
                    </span>
                    <span className="text-sm font-medium truncate">{job.name}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {job.address && `${job.address}${job.city ? `, ${job.city}` : ''}`}
                    {job.owner_name && ` · ${job.owner_name}`}
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
        <div className="bg-card border border-border rounded-md">
          <div className="px-4 py-3 border-b border-border">
            <h2 className="text-sm font-semibold font-headline">Recent Activity</h2>
          </div>
          <div className="divide-y divide-border max-h-[500px] overflow-y-auto">
            {recentActivity.length === 0 && (
              <div className="p-6 text-center text-muted-foreground text-sm">
                No activity recorded yet.
              </div>
            )}
            {recentActivity.map(activity => (
              <div key={activity.id} className="px-4 py-3">
                <div className="text-sm">
                  <span className="font-medium capitalize">{activity.action}</span>
                  {' '}
                  <span className="text-muted-foreground">{activity.entity_type}</span>
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {new Date(activity.created_at).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Target(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
    </svg>
  );
}