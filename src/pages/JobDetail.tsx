import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/hooks/useOrganization';
import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  Loader2, ArrowLeft, MapPin, Phone, Mail, User, Shield,
  Camera, FileText, Clock, CheckSquare, MessageSquare,
  Calendar, DollarSign, Activity, Droplets, Hammer
} from 'lucide-react';

const STAGES = [
  'new_lead', 'inspection_scheduled', 'inspection_complete', 'authorization_signed',
  'mitigation_active', 'mitigation_complete', 'reconstruction_estimate', 'awaiting_approval',
  'reconstruction_active', 'punch_list', 'final_walkthrough', 'invoiced', 'paid', 'closed'
];

export default function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const { organization } = useOrganization();
  const { user } = useAuth();
  const { toast } = useToast();

  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [photos, setPhotos] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [activity, setActivity] = useState<any[]>([]);
  const [mitigationLogs, setMitigationLogs] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchJob();
    fetchRelatedData();
  }, [id]);

  const fetchJob = async () => {
    const { data, error } = await supabase.from('projects').select('*').eq('id', id!).single();
    if (error) { console.error(error); }
    else setJob(data);
    setLoading(false);
  };

  const fetchRelatedData = async () => {
    if (!id) return;
    const [photosRes, docsRes, activityRes, mitigationRes] = await Promise.all([
      supabase.from('project_photos').select('*').eq('project_id', id).order('created_at', { ascending: false }),
      supabase.from('project_documents').select('*').eq('project_id', id).order('created_at', { ascending: false }),
      supabase.from('project_activity_log').select('*').eq('project_id', id).order('created_at', { ascending: false }).limit(30),
      supabase.from('mitigation_logs').select('*').eq('project_id', id).order('log_date', { ascending: false }),
    ]);
    setPhotos(photosRes.data || []);
    setDocuments(docsRes.data || []);
    setActivity(activityRes.data || []);
    setMitigationLogs(mitigationRes.data || []);
  };

  const updateJob = async (updates: Record<string, any>) => {
    setSaving(true);
    const { error } = await supabase.from('projects').update(updates).eq('id', id!);
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else { setJob({ ...job, ...updates }); toast({ title: 'Saved' }); }
    setSaving(false);
  };

  const formatStatus = (s: string) => s?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || '';
  const getStatusColor = (status: string) => {
    if (['mitigation_active', 'reconstruction_active'].includes(status)) return 'bg-primary/15 text-primary';
    if (['paid', 'closed', 'mitigation_complete', 'authorization_signed'].includes(status)) return 'bg-success/15 text-success';
    if (['awaiting_approval', 'punch_list', 'reconstruction_estimate'].includes(status)) return 'bg-warning/15 text-warning';
    if (['invoiced', 'final_walkthrough'].includes(status)) return 'bg-info/15 text-info';
    return 'bg-muted text-muted-foreground';
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>;
  }

  if (!job) {
    return <div className="text-center py-20 text-muted-foreground">Job not found.</div>;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link to="/jobs" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-2">
            <ArrowLeft className="h-3 w-3" /> Back to Jobs
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="page-title">{job.name}</h1>
            <Badge className={`stage-badge ${getStatusColor(job.status)}`}>{formatStatus(job.status)}</Badge>
          </div>
          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
            {job.project_number && <span className="font-mono text-xs">{job.project_number}</span>}
            {job.address && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{job.address}{job.city && `, ${job.city}`}{job.state && ` ${job.state}`}</span>}
            {job.job_type && <span className="capitalize">{job.job_type.replace(/_/g, ' ')}</span>}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Select value={job.status} onValueChange={v => updateJob({ status: v })}>
            <SelectTrigger className="h-8 text-xs w-[180px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {STAGES.map(s => <SelectItem key={s} value={s}>{formatStatus(s)}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-muted/50 h-9 p-0.5 flex-wrap">
          <TabsTrigger value="overview" className="text-xs h-8">Overview</TabsTrigger>
          <TabsTrigger value="claim" className="text-xs h-8">Claim</TabsTrigger>
          <TabsTrigger value="mitigation" className="text-xs h-8">Mitigation</TabsTrigger>
          <TabsTrigger value="reconstruction" className="text-xs h-8">Reconstruction</TabsTrigger>
          <TabsTrigger value="tasks" className="text-xs h-8">Tasks</TabsTrigger>
          <TabsTrigger value="photos" className="text-xs h-8">Photos ({photos.length})</TabsTrigger>
          <TabsTrigger value="documents" className="text-xs h-8">Documents ({documents.length})</TabsTrigger>
          <TabsTrigger value="financials" className="text-xs h-8">Financials</TabsTrigger>
          <TabsTrigger value="timeline" className="text-xs h-8">Timeline</TabsTrigger>
        </TabsList>

        {/* OVERVIEW TAB */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Job Summary */}
            <div className="bg-card border border-border rounded-md p-4 space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Job Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Type</span><span className="capitalize font-medium">{job.job_type?.replace(/_/g, ' ')}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Priority</span><span className="capitalize font-medium">{job.priority || 'Medium'}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Loss Type</span><span className="capitalize font-medium">{job.loss_type || '—'}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Date of Loss</span><span>{job.loss_date ? new Date(job.loss_date).toLocaleDateString() : '—'}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Created</span><span>{new Date(job.created_at).toLocaleDateString()}</span></div>
              </div>
              {job.loss_description && (
                <div className="pt-2 border-t border-border">
                  <div className="text-xs text-muted-foreground mb-1">Loss Description</div>
                  <p className="text-sm">{job.loss_description}</p>
                </div>
              )}
            </div>

            {/* Customer */}
            <div className="bg-card border border-border rounded-md p-4 space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Customer</h3>
              <div className="space-y-2">
                {job.owner_name && <div className="flex items-center gap-2 text-sm"><User className="h-3.5 w-3.5 text-muted-foreground" />{job.owner_name}</div>}
                {job.owner_phone && <div className="flex items-center gap-2 text-sm"><Phone className="h-3.5 w-3.5 text-muted-foreground" /><a href={`tel:${job.owner_phone}`} className="text-primary hover:underline">{job.owner_phone}</a></div>}
                {job.owner_email && <div className="flex items-center gap-2 text-sm"><Mail className="h-3.5 w-3.5 text-muted-foreground" /><a href={`mailto:${job.owner_email}`} className="text-primary hover:underline">{job.owner_email}</a></div>}
                {job.address && <div className="flex items-center gap-2 text-sm"><MapPin className="h-3.5 w-3.5 text-muted-foreground" />{job.address}{job.city && `, ${job.city}`}{job.state && ` ${job.state}`} {job.zip}</div>}
              </div>
            </div>

            {/* Insurance */}
            <div className="bg-card border border-border rounded-md p-4 space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Insurance</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Carrier</span><span className="font-medium">{job.insurance_carrier || '—'}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Claim #</span><span className="font-mono text-xs">{job.claim_number || '—'}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Policy #</span><span className="font-mono text-xs">{job.policy_number || '—'}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Adjuster</span><span>{job.adjuster_name || '—'}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">TPA</span><span>{job.tpa_name || '—'}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Deductible</span><span>{job.deductible ? `$${Number(job.deductible).toLocaleString()}` : '—'}</span></div>
              </div>
            </div>

            {/* Quick Financial Snapshot */}
            <div className="bg-card border border-border rounded-md p-4 space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Financial Snapshot</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Estimated</span><span className="font-medium">{job.estimated_cost ? `$${Number(job.estimated_cost).toLocaleString()}` : '—'}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Actual</span><span className="font-medium">{job.actual_cost ? `$${Number(job.actual_cost).toLocaleString()}` : '—'}</span></div>
              </div>
            </div>

            {/* Description / Notes */}
            <div className="bg-card border border-border rounded-md p-4 space-y-3 md:col-span-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Notes</h3>
              <p className="text-sm text-muted-foreground">{job.notes || job.description || 'No notes added yet.'}</p>
            </div>
          </div>
        </TabsContent>

        {/* CLAIM TAB */}
        <TabsContent value="claim" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-card border border-border rounded-md p-4 space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Claim Information</h3>
              <div className="space-y-3">
                <div><Label className="text-xs text-muted-foreground">Insurance Carrier</Label><Input defaultValue={job.insurance_carrier || ''} onBlur={e => updateJob({ insurance_carrier: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label className="text-xs text-muted-foreground">Claim Number</Label><Input defaultValue={job.claim_number || ''} onBlur={e => updateJob({ claim_number: e.target.value })} /></div>
                  <div><Label className="text-xs text-muted-foreground">Policy Number</Label><Input defaultValue={job.policy_number || ''} onBlur={e => updateJob({ policy_number: e.target.value })} /></div>
                </div>
                <div><Label className="text-xs text-muted-foreground">TPA / Program</Label><Input defaultValue={job.tpa_name || ''} onBlur={e => updateJob({ tpa_name: e.target.value })} /></div>
                <div><Label className="text-xs text-muted-foreground">Deductible</Label><Input type="number" defaultValue={job.deductible || ''} onBlur={e => updateJob({ deductible: e.target.value ? parseFloat(e.target.value) : null })} /></div>
              </div>
            </div>
            <div className="bg-card border border-border rounded-md p-4 space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Adjuster</h3>
              <div className="space-y-3">
                <div><Label className="text-xs text-muted-foreground">Name</Label><Input defaultValue={job.adjuster_name || ''} onBlur={e => updateJob({ adjuster_name: e.target.value })} /></div>
                <div><Label className="text-xs text-muted-foreground">Phone</Label><Input defaultValue={job.adjuster_phone || ''} onBlur={e => updateJob({ adjuster_phone: e.target.value })} /></div>
                <div><Label className="text-xs text-muted-foreground">Email</Label><Input defaultValue={job.adjuster_email || ''} onBlur={e => updateJob({ adjuster_email: e.target.value })} /></div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* MITIGATION TAB */}
        <TabsContent value="mitigation" className="space-y-4">
          <div className="bg-card border border-border rounded-md">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h3 className="text-sm font-semibold font-headline">Drying Logs</h3>
              <Badge variant="outline" className="text-xs">{mitigationLogs.length} entries</Badge>
            </div>
            {mitigationLogs.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-sm">
                <Droplets className="h-8 w-8 mx-auto mb-2 text-muted-foreground/30" />
                No drying logs recorded yet.
              </div>
            ) : (
              <div className="divide-y divide-border">
                {mitigationLogs.map(log => (
                  <div key={log.id} className="px-4 py-3">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">{new Date(log.log_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                      <Badge variant="outline" className="text-[10px]">{log.status || 'Active'}</Badge>
                    </div>
                    <div className="flex gap-6 mt-2 text-xs text-muted-foreground">
                      {log.temperature && <span>Temp: {log.temperature}°F</span>}
                      {log.relative_humidity && <span>RH: {log.relative_humidity}%</span>}
                      {log.drying_progress != null && <span>Progress: {log.drying_progress}%</span>}
                    </div>
                    {log.notes && <p className="text-xs text-muted-foreground mt-1">{log.notes}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* RECONSTRUCTION TAB */}
        <TabsContent value="reconstruction" className="space-y-4">
          <div className="bg-card border border-border rounded-md p-8 text-center">
            <Hammer className="h-8 w-8 mx-auto mb-2 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">Reconstruction workflow — trade sequencing, selections, change orders, and punch lists will be managed here.</p>
          </div>
        </TabsContent>

        {/* TASKS TAB */}
        <TabsContent value="tasks" className="space-y-4">
          <div className="bg-card border border-border rounded-md p-8 text-center">
            <CheckSquare className="h-8 w-8 mx-auto mb-2 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">Job tasks and punch list items will be managed here.</p>
          </div>
        </TabsContent>

        {/* PHOTOS TAB */}
        <TabsContent value="photos" className="space-y-4">
          <div className="bg-card border border-border rounded-md">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h3 className="text-sm font-semibold font-headline">Photos</h3>
              <Badge variant="outline" className="text-xs">{photos.length} photos</Badge>
            </div>
            {photos.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-sm">
                <Camera className="h-8 w-8 mx-auto mb-2 text-muted-foreground/30" />
                No photos uploaded yet.
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 p-4">
                {photos.map(photo => (
                  <div key={photo.id} className="aspect-square bg-muted rounded-md overflow-hidden">
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                      <Camera className="h-5 w-5" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* DOCUMENTS TAB */}
        <TabsContent value="documents" className="space-y-4">
          <div className="bg-card border border-border rounded-md">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h3 className="text-sm font-semibold font-headline">Documents</h3>
              <Badge variant="outline" className="text-xs">{documents.length} files</Badge>
            </div>
            {documents.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-sm">
                <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground/30" />
                No documents uploaded yet.
              </div>
            ) : (
              <div className="divide-y divide-border">
                {documents.map(doc => (
                  <div key={doc.id} className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-sm font-medium">{doc.file_name}</div>
                        <div className="text-xs text-muted-foreground">{doc.document_type || 'General'} · {doc.file_size ? `${Math.round(doc.file_size / 1024)}KB` : ''}</div>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">{new Date(doc.created_at).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* FINANCIALS TAB */}
        <TabsContent value="financials" className="space-y-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="stat-card">
              <div className="text-xs text-muted-foreground uppercase tracking-wider">Estimated</div>
              <div className="text-xl font-bold font-headline">{job.estimated_cost ? `$${Number(job.estimated_cost).toLocaleString()}` : '—'}</div>
            </div>
            <div className="stat-card">
              <div className="text-xs text-muted-foreground uppercase tracking-wider">Actual Cost</div>
              <div className="text-xl font-bold font-headline">{job.actual_cost ? `$${Number(job.actual_cost).toLocaleString()}` : '—'}</div>
            </div>
            <div className="stat-card">
              <div className="text-xs text-muted-foreground uppercase tracking-wider">Deductible</div>
              <div className="text-xl font-bold font-headline">{job.deductible ? `$${Number(job.deductible).toLocaleString()}` : '—'}</div>
            </div>
            <div className="stat-card">
              <div className="text-xs text-muted-foreground uppercase tracking-wider">Margin</div>
              <div className="text-xl font-bold font-headline">—</div>
            </div>
          </div>
        </TabsContent>

        {/* TIMELINE TAB */}
        <TabsContent value="timeline" className="space-y-4">
          <div className="bg-card border border-border rounded-md">
            <div className="px-4 py-3 border-b border-border">
              <h3 className="text-sm font-semibold font-headline">Activity Timeline</h3>
            </div>
            {activity.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-sm">
                <Activity className="h-8 w-8 mx-auto mb-2 text-muted-foreground/30" />
                No activity recorded.
              </div>
            ) : (
              <div className="divide-y divide-border">
                {activity.map(item => (
                  <div key={item.id} className="px-4 py-3 flex gap-3">
                    <div className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />
                    <div>
                      <div className="text-sm"><span className="font-medium capitalize">{item.action}</span> <span className="text-muted-foreground">{item.entity_type}</span></div>
                      <div className="text-xs text-muted-foreground">{new Date(item.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}