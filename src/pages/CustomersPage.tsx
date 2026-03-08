import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/hooks/useOrganization';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Building2, Search, Plus, Phone, Mail, MapPin, Briefcase, Loader2 } from 'lucide-react';

export default function CustomersPage() {
  const { organization } = useOrganization();
  const [customers, setCustomers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!organization?.id) return;
    const fetchCustomers = async () => {
      // Aggregate customers from jobs
      const { data } = await supabase
        .from('projects')
        .select('owner_name, owner_phone, owner_email, address, city, state, insurance_carrier, id, status, estimated_cost')
        .eq('organization_id', organization.id)
        .order('created_at', { ascending: false });

      if (data) {
        // Group by customer name
        const customerMap = new Map<string, any>();
        data.forEach(job => {
          if (!job.owner_name) return;
          const key = job.owner_name.toLowerCase().trim();
          if (customerMap.has(key)) {
            const existing = customerMap.get(key);
            existing.jobCount++;
            existing.totalValue += job.estimated_cost || 0;
            existing.jobs.push(job);
          } else {
            customerMap.set(key, {
              name: job.owner_name,
              phone: job.owner_phone,
              email: job.owner_email,
              address: job.address,
              city: job.city,
              state: job.state,
              carrier: job.insurance_carrier,
              jobCount: 1,
              totalValue: job.estimated_cost || 0,
              jobs: [job],
            });
          }
        });
        setCustomers(Array.from(customerMap.values()));
      }
      setLoading(false);
    };
    fetchCustomers();
  }, [organization?.id]);

  const filtered = customers.filter(c =>
    !search || c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search) || c.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Customers</h1>
          <p className="page-subtitle">Homeowners, property managers & commercial clients</p>
        </div>
        <Button size="sm" className="gap-2"><Plus className="h-3.5 w-3.5" /> Add Customer</Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input placeholder="Search customers..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-8 text-sm" />
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
      ) : filtered.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <Building2 className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">No customers found. Create a job to add customers automatically.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((c, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-3 bg-card border border-border rounded-lg hover:border-border/80 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary/80 to-info/80 flex items-center justify-center text-xs font-bold text-white shrink-0">
                  {c.name?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <div className="font-semibold text-sm">{c.name}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                    {c.carrier && <span>{c.carrier}</span>}
                    {c.address && <><span>·</span><span>{c.address}{c.city && `, ${c.city}`}</span></>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-center hidden md:block">
                  <div className="text-base font-bold font-headline">{c.jobCount}</div>
                  <div className="text-[10px] text-muted-foreground">Jobs</div>
                </div>
                <div className="text-right hidden md:block">
                  <div className="text-sm font-bold text-success">{c.totalValue > 0 ? `$${c.totalValue.toLocaleString()}` : '—'}</div>
                  <div className="text-[10px] text-muted-foreground">Total Value</div>
                </div>
                <div className="flex gap-1.5">
                  {c.phone && (
                    <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={(e) => { e.stopPropagation(); window.open(`tel:${c.phone}`); }}>
                      <Phone className="h-3 w-3" /> Call
                    </Button>
                  )}
                  {c.email && (
                    <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={(e) => { e.stopPropagation(); window.open(`mailto:${c.email}`); }}>
                      <Mail className="h-3 w-3" /> Email
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
