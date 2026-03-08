import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/hooks/useOrganization';
import { Badge } from '@/components/ui/badge';
import { Wrench, Loader2 } from 'lucide-react';

export default function EquipmentPage() {
  const { organization } = useOrganization();
  const [equipment, setEquipment] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!organization?.id) return;
    supabase.from('equipment').select('*').eq('organization_id', organization.id).order('equipment_type')
      .then(({ data }) => { setEquipment(data || []); setLoading(false); });
  }, [organization?.id]);

  const getStatusColor = (s: string) => {
    if (s === 'available') return 'bg-success/15 text-success';
    if (s === 'deployed' || s === 'in_use') return 'bg-primary/15 text-primary';
    if (s === 'maintenance') return 'bg-warning/15 text-warning';
    return 'bg-muted text-muted-foreground';
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>;

  const available = equipment.filter(e => e.status === 'available').length;
  const deployed = equipment.filter(e => ['deployed', 'in_use'].includes(e.status)).length;

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Equipment</h1>
        <p className="page-subtitle">Inventory and assignment tracking</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="stat-card"><div className="text-xs text-muted-foreground uppercase tracking-wider">Total</div><div className="text-2xl font-bold font-headline">{equipment.length}</div></div>
        <div className="stat-card"><div className="text-xs text-muted-foreground uppercase tracking-wider">Available</div><div className="text-2xl font-bold font-headline text-success">{available}</div></div>
        <div className="stat-card"><div className="text-xs text-muted-foreground uppercase tracking-wider">Deployed</div><div className="text-2xl font-bold font-headline text-primary">{deployed}</div></div>
        <div className="stat-card"><div className="text-xs text-muted-foreground uppercase tracking-wider">Maintenance</div><div className="text-2xl font-bold font-headline text-warning">{equipment.filter(e => e.status === 'maintenance').length}</div></div>
      </div>

      <div className="bg-card border border-border rounded-md overflow-hidden">
        {equipment.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">
            <Wrench className="h-8 w-8 mx-auto mb-2 text-muted-foreground/30" />
            No equipment added yet.
          </div>
        ) : (
          <table className="data-table">
            <thead><tr><th>Serial #</th><th>Type</th><th>Model</th><th>Status</th><th className="hidden md:table-cell">Runtime</th></tr></thead>
            <tbody>
              {equipment.map(item => (
                <tr key={item.id}>
                  <td className="font-mono text-xs">{item.serial_number}</td>
                  <td className="text-sm capitalize">{item.equipment_type?.replace(/_/g, ' ')}</td>
                  <td className="text-sm text-muted-foreground">{item.model || '—'}</td>
                  <td><Badge className={`stage-badge ${getStatusColor(item.status)}`}>{item.status}</Badge></td>
                  <td className="hidden md:table-cell text-xs text-muted-foreground">{item.runtime_hours || 0}h</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}