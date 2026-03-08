import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { Plus, Search, Target, Loader2, Phone, Mail } from 'lucide-react';

const LEAD_STATUSES = ['new', 'contacted', 'inspection_scheduled', 'inspection_complete', 'won', 'lost', 'dormant'];

export default function Leads() {
  const { organization } = useOrganization();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    customer_name: '', customer_phone: '', customer_email: '',
    address: '', damage_type: 'water' as any, urgency: 'medium' as any,
    source: '', notes: '',
  });

  useEffect(() => {
    if (!organization?.id) return;
    fetchLeads();
  }, [organization?.id]);

  const fetchLeads = async () => {
    const { data } = await supabase.from('leads').select('*').eq('organization_id', organization!.id).order('created_at', { ascending: false });
    setLeads(data || []);
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !organization) return;
    setCreating(true);
    const { error } = await supabase.from('leads').insert({
      organization_id: organization.id,
      created_by: user.id,
      ...form,
    });
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Lead created' }); setCreateOpen(false); fetchLeads(); }
    setCreating(false);
  };

  const getStatusColor = (s: string) => {
    const map: Record<string, string> = {
      new: 'bg-info/15 text-info', contacted: 'bg-primary/15 text-primary',
      inspection_scheduled: 'bg-warning/15 text-warning', inspection_complete: 'bg-success/15 text-success',
      won: 'bg-success/15 text-success', lost: 'bg-destructive/15 text-destructive',
      dormant: 'bg-muted text-muted-foreground',
    };
    return map[s] || 'bg-muted text-muted-foreground';
  };

  const formatStatus = (s: string) => s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  const filtered = leads.filter(l => {
    const matchSearch = !search || l.customer_name?.toLowerCase().includes(search.toLowerCase()) || l.address?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || l.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // Group by status for kanban
  const grouped = LEAD_STATUSES.reduce((acc, status) => {
    acc[status] = filtered.filter(l => l.status === status);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="page-header mb-0">
          <h1 className="page-title">Leads</h1>
          <p className="page-subtitle">{filtered.length} leads</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2"><Plus className="h-3.5 w-3.5" /> New Lead</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle className="font-headline">New Lead</DialogTitle></DialogHeader>
            <form onSubmit={handleCreate} className="space-y-3">
              <div><Label className="text-xs">Customer Name</Label><Input value={form.customer_name} onChange={e => setForm({ ...form, customer_name: e.target.value })} required /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">Phone</Label><Input value={form.customer_phone} onChange={e => setForm({ ...form, customer_phone: e.target.value })} /></div>
                <div><Label className="text-xs">Email</Label><Input value={form.customer_email} onChange={e => setForm({ ...form, customer_email: e.target.value })} /></div>
              </div>
              <div><Label className="text-xs">Address</Label><Input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Damage Type</Label>
                  <Select value={form.damage_type} onValueChange={v => setForm({ ...form, damage_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="water">Water</SelectItem>
                      <SelectItem value="fire">Fire</SelectItem>
                      <SelectItem value="storm">Storm</SelectItem>
                      <SelectItem value="mold">Mold</SelectItem>
                      <SelectItem value="sewage">Sewage</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Urgency</Label>
                  <Select value={form.urgency} onValueChange={v => setForm({ ...form, urgency: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="emergency">Emergency</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label className="text-xs">Source</Label><Input value={form.source} onChange={e => setForm({ ...form, source: e.target.value })} placeholder="e.g. Referral, Google, Insurance" /></div>
              <div><Label className="text-xs">Notes</Label><Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} /></div>
              <Button type="submit" className="w-full" disabled={creating}>
                {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Lead'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input placeholder="Search leads..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-8 text-sm" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px] h-8 text-sm"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {LEAD_STATUSES.map(s => <SelectItem key={s} value={s}>{formatStatus(s)}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Kanban Board */}
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-4">
          {LEAD_STATUSES.filter(s => statusFilter === 'all' || s === statusFilter).map(status => (
            <div key={status} className="min-w-[260px] w-[260px] shrink-0">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{formatStatus(status)}</span>
                <Badge variant="outline" className="text-[10px] h-5">{grouped[status]?.length || 0}</Badge>
              </div>
              <div className="space-y-2">
                {(grouped[status] || []).map(lead => (
                  <div key={lead.id} className="bg-card border border-border rounded-md p-3 space-y-2 hover:border-primary/30 transition-colors cursor-pointer">
                    <div className="text-sm font-medium">{lead.customer_name}</div>
                    <div className="text-xs text-muted-foreground">{lead.address || 'No address'}</div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="capitalize">{lead.damage_type}</span>
                      <Badge className={`stage-badge text-[10px] ${lead.urgency === 'emergency' ? 'bg-destructive/15 text-destructive' : lead.urgency === 'high' ? 'bg-warning/15 text-warning' : 'bg-muted text-muted-foreground'}`}>
                        {lead.urgency}
                      </Badge>
                    </div>
                    {lead.source && <div className="text-[10px] text-muted-foreground">Source: {lead.source}</div>}
                  </div>
                ))}
                {(!grouped[status] || grouped[status].length === 0) && (
                  <div className="text-xs text-muted-foreground text-center py-6 border border-dashed border-border rounded-md">
                    No leads
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}