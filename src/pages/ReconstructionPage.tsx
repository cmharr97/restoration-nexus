import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/hooks/useOrganization';
import { Badge } from '@/components/ui/badge';
import { Hammer, Loader2 } from 'lucide-react';

export default function ReconstructionPage() {
  const { organization } = useOrganization();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!organization?.id) return;
    supabase.from('projects').select('*').eq('organization_id', organization.id)
      .in('status', ['reconstruction_estimate', 'awaiting_approval', 'reconstruction_active', 'punch_list', 'final_walkthrough'])
      .order('updated_at', { ascending: false })
      .then(({ data }) => { setJobs(data || []); setLoading(false); });
  }, [organization?.id]);

  const formatStatus = (s: string) => s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  const getStatusColor = (s: string) => {
    if (s === 'reconstruction_active') return 'bg-primary/15 text-primary';
    if (s === 'punch_list') return 'bg-warning/15 text-warning';
    if (s === 'final_walkthrough') return 'bg-info/15 text-info';
    return 'bg-muted text-muted-foreground';
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>;

  const stages = ['reconstruction_estimate', 'awaiting_approval', 'reconstruction_active', 'punch_list', 'final_walkthrough'];

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Reconstruction</h1>
        <p className="page-subtitle">Jobs in reconstruction phases</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {stages.map(stage => (
          <div key={stage} className="stat-card">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{formatStatus(stage)}</div>
            <div className="text-2xl font-bold font-headline">{jobs.filter(j => j.status === stage).length}</div>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-md">
        <div className="px-4 py-3 border-b border-border">
          <h2 className="text-sm font-semibold font-headline">Reconstruction Jobs</h2>
        </div>
        {jobs.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">
            <Hammer className="h-8 w-8 mx-auto mb-2 text-muted-foreground/30" />
            No reconstruction jobs.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {jobs.map(job => (
              <Link key={job.id} to={`/jobs/${job.id}`} className="flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors">
                <div>
                  <div className="text-sm font-medium">{job.name}</div>
                  <div className="text-xs text-muted-foreground">{job.address} · {job.owner_name}</div>
                </div>
                <Badge className={`stage-badge ${getStatusColor(job.status)}`}>{formatStatus(job.status)}</Badge>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}