import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/hooks/useOrganization';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Plus, Shield, MapPin, Phone, Mail, Loader2, CheckCircle, XCircle } from 'lucide-react';

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
  owner: { label: 'Owner / Admin', color: 'bg-primary/15 text-primary' },
  admin: { label: 'Admin', color: 'bg-primary/15 text-primary' },
  pm: { label: 'Project Manager', color: 'bg-info/15 text-info' },
  executive: { label: 'Executive', color: 'bg-info/15 text-info' },
  coordinator: { label: 'Office Admin', color: 'bg-success/15 text-success' },
  field: { label: 'Field Technician', color: 'bg-warning/15 text-warning' },
  estimator: { label: 'Estimator', color: 'bg-purple-500/15 text-purple-400' },
  subcontractor: { label: 'Subcontractor', color: 'bg-muted text-muted-foreground' },
};

const PERMISSIONS = [
  'View All Jobs', 'View Profit Margins', 'View Payroll', 'View Invoices',
  'Approve Expenses', 'Manage Users', 'Delete Jobs', 'Set Rates'
];

const PERM_MATRIX: Record<string, boolean[]> = {
  owner:        [true, true, true, true, true, true, true, true],
  admin:        [true, true, true, true, true, true, false, true],
  pm:           [false, false, false, false, true, false, false, false],
  executive:    [true, true, true, true, true, false, false, false],
  coordinator:  [true, false, false, true, false, false, false, false],
  field:        [false, false, false, false, false, false, false, false],
  estimator:    [true, false, false, false, false, false, false, false],
  subcontractor:[false, false, false, false, false, false, false, false],
};

export default function TeamPage() {
  const { organization } = useOrganization();
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!organization?.id) return;
    const fetch = async () => {
      const { data } = await supabase
        .from('organization_members')
        .select('*, profiles:user_id(full_name, email, phone, avatar_url, title)')
        .eq('organization_id', organization.id)
        .eq('is_active', true);
      setMembers(data || []);
      setLoading(false);
    };
    fetch();
  }, [organization?.id]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Team & Users</h1>
          <p className="page-subtitle">Role-based access control — {members.length} members</p>
        </div>
        <Button size="sm" className="gap-2"><Plus className="h-3.5 w-3.5" /> Invite User</Button>
      </div>

      {/* RBAC Info */}
      <div className="alert-card-warning">
        <Shield className="h-5 w-5 text-primary shrink-0" />
        <div>
          <div className="font-semibold text-sm">Role-Based Access Control</div>
          <div className="flex gap-3 mt-1 flex-wrap">
            {Object.entries(ROLE_LABELS).map(([key, { label, color }]) => (
              <Badge key={key} className={`stage-badge ${color}`}>{label}</Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Members Grid */}
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {members.map(m => {
            const profile = m.profiles;
            const roleInfo = ROLE_LABELS[m.role] || { label: m.role, color: 'bg-muted text-muted-foreground' };
            const initials = profile?.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2) || '?';
            return (
              <div key={m.id} className="bg-card border border-border rounded-lg p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-info flex items-center justify-center text-xs font-bold text-white shrink-0">
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate">{profile?.full_name || 'Unnamed'}</div>
                    <div className="text-xs text-muted-foreground truncate">{profile?.email}</div>
                  </div>
                </div>
                <Badge className={`stage-badge ${roleInfo.color}`}>{roleInfo.label}</Badge>
                {profile?.phone && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Phone className="h-3 w-3" /> {profile.phone}
                  </div>
                )}
                {profile?.title && (
                  <div className="text-xs text-muted-foreground">{profile.title}</div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Permissions Matrix */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <h2 className="text-sm font-semibold font-headline">Access Permissions Matrix</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th className="min-w-[160px]">Permission</th>
                {Object.entries(ROLE_LABELS).map(([key, { label }]) => (
                  <th key={key} className="text-center whitespace-nowrap">{label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERMISSIONS.map((perm, i) => (
                <tr key={perm}>
                  <td className="text-sm">{perm}</td>
                  {Object.keys(ROLE_LABELS).map(role => (
                    <td key={role} className="text-center">
                      {PERM_MATRIX[role]?.[i] ? (
                        <CheckCircle className="h-4 w-4 text-success mx-auto" />
                      ) : (
                        <XCircle className="h-4 w-4 text-muted-foreground/30 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
