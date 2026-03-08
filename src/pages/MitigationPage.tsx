import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/hooks/useOrganization';
import { Badge } from '@/components/ui/badge';
import { Droplets, Loader2, AlertTriangle } from 'lucide-react';

export default function MitigationPage() {
  const { organization } = useOrganization();
  const [jobs, setJobs] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!organization?.id) return;
    const fetchData = async () => {
      const [jobsRes, logsRes] = await Promise.all([
        supabase.from('projects').select('*').eq('organization_id', organization.id).in('status', ['mitigation_active', 'active']).eq('job_type', 'mitigation'),
        supabase.from('mitigation_logs').select('*').eq('organization_id', organization.id).order('log_date', { ascending: false }).limit(20),
      ]);
      setJobs(jobsRes.data || []);
      setLogs(logsRes.data || []);
      setLoading(false);
    };
    fetchData();
  }, [organization?.id]);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Mitigation</h1>
        <p className="page-subtitle">Active drying jobs and monitoring</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="stat-card">
          <div className="text-xs text-muted-foreground uppercase tracking-wider">Active Jobs</div>
          <div className="text-2xl font-bold font-headline">{jobs.length}</div>
        </div>
        <div className="stat-card">
          <div className="text-xs text-muted-foreground uppercase tracking-wider">Logs Today</div>
          <div className="text-2xl font-bold font-headline">{logs.filter(l => l.log_date === new Date().toISOString().split('T')[0]).length}</div>
        </div>
        <div className="stat-card">
          <div className="text-xs text-muted-foreground uppercase tracking-wider">Needs Log</div>
          <div className="text-2xl font-bold font-headline text-warning">{jobs.filter(j => !logs.find(l => l.project_id === j.id && l.log_date === new Date().toISOString().split('T')[0])).length}</div>
        </div>
        <div className="stat-card">
          <div className="text-xs text-muted-foreground uppercase tracking-wider">Total Logs</div>
          <div className="text-2xl font-bold font-headline">{logs.length}</div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-md">
        <div className="px-4 py-3 border-b border-border">
          <h2 className="text-sm font-semibold font-headline">Active Mitigation Jobs</h2>
        </div>
        {jobs.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">
            <Droplets className="h-8 w-8 mx-auto mb-2 text-muted-foreground/30" />
            No active mitigation jobs.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {jobs.map(job => {
              const todayLog = logs.find(l => l.project_id === job.id && l.log_date === new Date().toISOString().split('T')[0]);
              return (
                <Link key={job.id} to={`/jobs/${job.id}`} className="flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors">
                  <div>
                    <div className="text-sm font-medium">{job.name}</div>
                    <div className="text-xs text-muted-foreground">{job.address || 'No address'} · {job.owner_name || 'No customer'}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!todayLog && <Badge className="stage-badge bg-warning/15 text-warning text-[10px]"><AlertTriangle className="h-3 w-3 mr-1" />Needs Log</Badge>}
                    {todayLog && <Badge className="stage-badge bg-success/15 text-success text-[10px]">Logged</Badge>}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}