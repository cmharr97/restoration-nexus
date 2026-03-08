import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/hooks/useOrganization';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Plus, Search, Filter, Briefcase, Loader2 } from 'lucide-react';

const JOB_STAGES = [
  { value: 'all', label: 'All Stages' },
  { value: 'new_lead', label: 'New Lead' },
  { value: 'inspection_scheduled', label: 'Inspection Scheduled' },
  { value: 'inspection_complete', label: 'Inspection Complete' },
  { value: 'authorization_signed', label: 'Authorization Signed' },
  { value: 'mitigation_active', label: 'Mitigation Active' },
  { value: 'mitigation_complete', label: 'Mitigation Complete' },
  { value: 'reconstruction_estimate', label: 'Recon Estimate' },
  { value: 'awaiting_approval', label: 'Awaiting Approval' },
  { value: 'reconstruction_active', label: 'Reconstruction Active' },
  { value: 'punch_list', label: 'Punch List' },
  { value: 'final_walkthrough', label: 'Final Walkthrough' },
  { value: 'invoiced', label: 'Invoiced' },
  { value: 'paid', label: 'Paid' },
  { value: 'closed', label: 'Closed' },
];

const PRIORITIES = ['all', 'urgent', 'high', 'medium', 'low'];

export default function Jobs() {
  const { organization } = useOrganization();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [createOpen, setCreateOpen] = useState(searchParams.get('create') === '1');

  // Create form
  const [formData, setFormData] = useState({
    name: '', address: '', city: '', state: '', zip: '',
    owner_name: '', owner_phone: '', owner_email: '',
    insurance_carrier: '', claim_number: '', policy_number: '',
    adjuster_name: '', adjuster_phone: '', adjuster_email: '',
    loss_type: '', loss_description: '', loss_date: '',
    job_type: 'mitigation' as const,
    priority: 'medium',
    description: '',
    tpa_name: '', deductible: '',
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!organization?.id) return;
    fetchJobs();
  }, [organization?.id]);

  const fetchJobs = async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('organization_id', organization!.id)
      .order('created_at', { ascending: false });
    if (!error) setJobs(data || []);
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !organization) return;
    setCreating(true);

    const { data, error } = await supabase.from('projects').insert({
      organization_id: organization.id,
      created_by: user.id,
      name: formData.name,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      zip: formData.zip,
      owner_name: formData.owner_name,
      owner_phone: formData.owner_phone,
      owner_email: formData.owner_email,
      insurance_carrier: formData.insurance_carrier,
      claim_number: formData.claim_number,
      policy_number: formData.policy_number,
      adjuster_name: formData.adjuster_name,
      adjuster_phone: formData.adjuster_phone,
      adjuster_email: formData.adjuster_email,
      loss_type: formData.loss_type,
      loss_description: formData.loss_description,
      loss_date: formData.loss_date || null,
      job_type: formData.job_type,
      priority: formData.priority,
      description: formData.description,
      tpa_name: formData.tpa_name,
      deductible: formData.deductible ? parseFloat(formData.deductible) : null,
      status: 'new_lead',
    }).select().single();

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Job created' });
      setCreateOpen(false);
      navigate(`/jobs/${data.id}`);
    }
    setCreating(false);
  };

  const filtered = jobs.filter(job => {
    const matchesSearch = !search ||
      job.name?.toLowerCase().includes(search.toLowerCase()) ||
      job.owner_name?.toLowerCase().includes(search.toLowerCase()) ||
      job.address?.toLowerCase().includes(search.toLowerCase()) ||
      job.claim_number?.toLowerCase().includes(search.toLowerCase()) ||
      job.project_number?.toLowerCase().includes(search.toLowerCase());
    const matchesStage = stageFilter === 'all' || job.status === stageFilter;
    const matchesPriority = priorityFilter === 'all' || job.priority === priorityFilter;
    return matchesSearch && matchesStage && matchesPriority;
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      new_lead: 'bg-info/15 text-info',
      inspection_scheduled: 'bg-info/15 text-info',
      inspection_complete: 'bg-info/15 text-info',
      authorization_signed: 'bg-success/15 text-success',
      mitigation_active: 'bg-primary/15 text-primary',
      mitigation_complete: 'bg-success/15 text-success',
      reconstruction_estimate: 'bg-warning/15 text-warning',
      awaiting_approval: 'bg-warning/15 text-warning',
      reconstruction_active: 'bg-primary/15 text-primary',
      punch_list: 'bg-warning/15 text-warning',
      final_walkthrough: 'bg-info/15 text-info',
      invoiced: 'bg-success/15 text-success',
      paid: 'bg-success/15 text-success',
      closed: 'bg-muted text-muted-foreground',
      active: 'bg-success/15 text-success',
      pending: 'bg-muted text-muted-foreground',
    };
    return colors[status] || 'bg-muted text-muted-foreground';
  };

  const getPriorityColor = (p: string) => {
    if (p === 'urgent') return 'text-destructive';
    if (p === 'high') return 'text-warning';
    return 'text-muted-foreground';
  };

  const formatStatus = (s: string) => s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="page-header mb-0">
          <h1 className="page-title">Jobs</h1>
          <p className="page-subtitle">{filtered.length} total</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2"><Plus className="h-3.5 w-3.5" /> New Job</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-headline">Create New Job</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-6">
              {/* Job Info */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Job Info</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <Label className="text-xs">Job Name</Label>
                    <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required placeholder="e.g. Smith Residence Water Loss" />
                  </div>
                  <div>
                    <Label className="text-xs">Primary Service</Label>
                    <Select value={formData.job_type} onValueChange={v => setFormData({ ...formData, job_type: v as any })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mitigation">Mitigation</SelectItem>
                        <SelectItem value="reconstruction">Reconstruction</SelectItem>
                        <SelectItem value="recon">Recon / Inspection</SelectItem>
                        <SelectItem value="contents">Contents</SelectItem>
                        <SelectItem value="emergency">Emergency Services</SelectItem>
                        <SelectItem value="inspection">Inspection Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Priority</Label>
                    <Select value={formData.priority} onValueChange={v => setFormData({ ...formData, priority: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="urgent">Urgent</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Property */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Property & Customer</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2"><Label className="text-xs">Street Address</Label><Input value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} /></div>
                  <div><Label className="text-xs">City</Label><Input value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} /></div>
                  <div className="grid grid-cols-2 gap-2">
                    <div><Label className="text-xs">State</Label><Input value={formData.state} onChange={e => setFormData({ ...formData, state: e.target.value })} /></div>
                    <div><Label className="text-xs">ZIP</Label><Input value={formData.zip} onChange={e => setFormData({ ...formData, zip: e.target.value })} /></div>
                  </div>
                  <div><Label className="text-xs">Customer Name</Label><Input value={formData.owner_name} onChange={e => setFormData({ ...formData, owner_name: e.target.value })} /></div>
                  <div><Label className="text-xs">Customer Phone</Label><Input value={formData.owner_phone} onChange={e => setFormData({ ...formData, owner_phone: e.target.value })} /></div>
                  <div className="col-span-2"><Label className="text-xs">Customer Email</Label><Input value={formData.owner_email} onChange={e => setFormData({ ...formData, owner_email: e.target.value })} /></div>
                </div>
              </div>

              {/* Insurance */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Insurance & Claims</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label className="text-xs">Insurance Carrier</Label><Input value={formData.insurance_carrier} onChange={e => setFormData({ ...formData, insurance_carrier: e.target.value })} /></div>
                  <div><Label className="text-xs">Claim Number</Label><Input value={formData.claim_number} onChange={e => setFormData({ ...formData, claim_number: e.target.value })} /></div>
                  <div><Label className="text-xs">Policy Number</Label><Input value={formData.policy_number} onChange={e => setFormData({ ...formData, policy_number: e.target.value })} /></div>
                  <div><Label className="text-xs">TPA / Program</Label><Input value={formData.tpa_name} onChange={e => setFormData({ ...formData, tpa_name: e.target.value })} /></div>
                  <div><Label className="text-xs">Adjuster Name</Label><Input value={formData.adjuster_name} onChange={e => setFormData({ ...formData, adjuster_name: e.target.value })} /></div>
                  <div><Label className="text-xs">Deductible</Label><Input type="number" value={formData.deductible} onChange={e => setFormData({ ...formData, deductible: e.target.value })} /></div>
                </div>
              </div>

              {/* Loss */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Loss Details</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Loss Type</Label>
                    <Select value={formData.loss_type} onValueChange={v => setFormData({ ...formData, loss_type: v })}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="water">Water</SelectItem>
                        <SelectItem value="fire">Fire</SelectItem>
                        <SelectItem value="storm">Storm / Wind</SelectItem>
                        <SelectItem value="mold">Mold</SelectItem>
                        <SelectItem value="sewage">Sewage / Biohazard</SelectItem>
                        <SelectItem value="vandalism">Vandalism</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div><Label className="text-xs">Date of Loss</Label><Input type="date" value={formData.loss_date} onChange={e => setFormData({ ...formData, loss_date: e.target.value })} /></div>
                  <div className="col-span-2"><Label className="text-xs">Loss Description</Label><Textarea value={formData.loss_description} onChange={e => setFormData({ ...formData, loss_description: e.target.value })} rows={2} /></div>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={creating}>
                {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Job'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input placeholder="Search jobs..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-8 text-sm" />
        </div>
        <Select value={stageFilter} onValueChange={setStageFilter}>
          <SelectTrigger className="w-[180px] h-8 text-sm"><SelectValue /></SelectTrigger>
          <SelectContent>
            {JOB_STAGES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-[130px] h-8 text-sm"><SelectValue /></SelectTrigger>
          <SelectContent>
            {PRIORITIES.map(p => <SelectItem key={p} value={p}>{p === 'all' ? 'All Priority' : p.charAt(0).toUpperCase() + p.slice(1)}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Jobs Table */}
      <div className="bg-card border border-border rounded-md overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Briefcase className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No jobs found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Job #</th>
                  <th>Name</th>
                  <th className="hidden md:table-cell">Customer</th>
                  <th className="hidden lg:table-cell">Address</th>
                  <th className="hidden md:table-cell">Type</th>
                  <th>Stage</th>
                  <th className="hidden lg:table-cell">Priority</th>
                  <th className="hidden xl:table-cell">Carrier</th>
                  <th className="hidden xl:table-cell">Updated</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(job => (
                  <tr key={job.id} className="cursor-pointer" onClick={() => navigate(`/jobs/${job.id}`)}>
                    <td className="text-xs font-mono text-muted-foreground">{job.project_number || '—'}</td>
                    <td className="font-medium text-sm max-w-[200px] truncate">{job.name}</td>
                    <td className="hidden md:table-cell text-sm">{job.owner_name || '—'}</td>
                    <td className="hidden lg:table-cell text-sm text-muted-foreground max-w-[180px] truncate">{job.address || '—'}</td>
                    <td className="hidden md:table-cell">
                      <span className="text-xs capitalize">{job.job_type?.replace(/_/g, ' ') || '—'}</span>
                    </td>
                    <td>
                      <Badge className={`stage-badge ${getStatusColor(job.status)}`}>
                        {formatStatus(job.status)}
                      </Badge>
                    </td>
                    <td className={`hidden lg:table-cell text-xs font-medium capitalize ${getPriorityColor(job.priority)}`}>
                      {job.priority || 'Medium'}
                    </td>
                    <td className="hidden xl:table-cell text-xs text-muted-foreground">{job.insurance_carrier || '—'}</td>
                    <td className="hidden xl:table-cell text-xs text-muted-foreground">
                      {new Date(job.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}