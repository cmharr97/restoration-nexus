import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { useOrganization } from '@/hooks/useOrganization';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Building2, Users, Save } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function OrganizationSettings() {
  return (
    <ProtectedRoute requireOrganization requiredRoles={['owner', 'admin']}>
      <OrganizationSettingsContent />
    </ProtectedRoute>
  );
}

function OrganizationSettingsContent() {
  const { organization, refetchOrganization } = useOrganization();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Company settings
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [timeZone, setTimeZone] = useState('America/New_York');

  useEffect(() => {
    if (organization) {
      setName(organization.name);
      setAddress(organization.address || '');
      setPhone(organization.phone || '');
      setEmail(organization.email || '');
      setWebsite(organization.website || '');
      setTimeZone(organization.time_zone);
    }
  }, [organization]);

  const handleSaveCompany = async () => {
    if (!organization) return;

    setLoading(true);

    try {
      const { error } = await supabase
        .from('organizations')
        .update({
          name,
          address: address || null,
          phone: phone || null,
          email: email || null,
          website: website || null,
          time_zone: timeZone,
        })
        .eq('id', organization.id);

      if (error) throw error;

      await refetchOrganization();

      toast({
        title: 'Settings Saved',
        description: 'Company information updated successfully',
      });
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Save Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!organization) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="lg:ml-64 mt-16 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold font-headline mb-2">Organization Settings</h1>
            <p className="text-muted-foreground text-lg">
              Manage your company profile and team members
            </p>
          </div>

          <Tabs defaultValue="company" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="company" className="gap-2">
                <Building2 className="h-4 w-4" />
                Company Profile
              </TabsTrigger>
              <TabsTrigger value="team" className="gap-2">
                <Users className="h-4 w-4" />
                Team Members
              </TabsTrigger>
            </TabsList>

            <TabsContent value="company">
              <Card>
                <CardHeader>
                  <CardTitle className="font-headline">Company Information</CardTitle>
                  <CardDescription>
                    Update your organization's profile and contact details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Company Name *</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="123 Main St, City, State 12345"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="(555) 123-4567"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="info@company.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      type="url"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="https://yourcompany.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timeZone">Time Zone</Label>
                    <Input
                      id="timeZone"
                      value={timeZone}
                      onChange={(e) => setTimeZone(e.target.value)}
                      placeholder="America/New_York"
                    />
                  </div>

                  <Button
                    onClick={handleSaveCompany}
                    disabled={loading || !name}
                    className="bg-accent hover:bg-accent/90 gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="team">
              <TeamManagement />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}

function TeamManagement() {
  const { organization } = useOrganization();
  const { toast } = useToast();
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('coordinator');
  const [inviting, setInviting] = useState(false);

  const roles = [
    { value: 'owner', label: 'Owner' },
    { value: 'admin', label: 'Admin' },
    { value: 'executive', label: 'Executive' },
    { value: 'pm', label: 'Project Manager' },
    { value: 'estimator', label: 'Estimator' },
    { value: 'insurance_coordinator', label: 'Insurance Coordinator' },
    { value: 'mitigation_lead', label: 'Mitigation Lead' },
    { value: 'mitigation_tech', label: 'Mitigation Tech' },
    { value: 'reconstruction_lead', label: 'Reconstruction Lead' },
    { value: 'contents_lead', label: 'Contents Lead' },
    { value: 'coordinator', label: 'Coordinator' },
    { value: 'finance', label: 'Finance' },
    { value: 'equipment_manager', label: 'Equipment Manager' },
  ];

  useEffect(() => {
    fetchMembers();
  }, [organization]);

  const fetchMembers = async () => {
    if (!organization) return;

    try {
      const { data, error } = await supabase
        .from('organization_members')
        .select(`
          *,
          profiles:user_id (
            email,
            full_name,
            avatar_url,
            phone,
            title
          )
        `)
        .eq('organization_id', organization.id)
        .order('joined_at', { ascending: false });

      if (error) throw error;
      setMembers(data || []);
    } catch (error: any) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail || !organization) return;

    setInviting(true);

    try {
      // In a real implementation, you would:
      // 1. Send an invite email via edge function
      // 2. Create a pending invitation record
      // For now, we'll just show a toast
      toast({
        title: 'Invitation Feature',
        description: `Invite system would send email to ${inviteEmail} with ${inviteRole} role`,
      });

      setInviteEmail('');
      setInviteRole('coordinator');
    } finally {
      setInviting(false);
    }
  };

  const handleRoleChange = async (memberId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('organization_members')
        .update({ role: newRole as any })
        .eq('id', memberId);

      if (error) throw error;

      await fetchMembers();

      toast({
        title: 'Role Updated',
        description: 'Member role has been changed successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Update Failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDeactivate = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from('organization_members')
        .update({ is_active: false })
        .eq('id', memberId);

      if (error) throw error;

      await fetchMembers();

      toast({
        title: 'Member Deactivated',
        description: 'Team member has been deactivated',
      });
    } catch (error: any) {
      toast({
        title: 'Deactivation Failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Invite Form */}
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Invite Team Member</CardTitle>
          <CardDescription>
            Send an invitation to add a new member to your organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="inviteEmail">Email Address</Label>
              <Input
                id="inviteEmail"
                type="email"
                placeholder="member@company.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>

            <div className="w-48 space-y-2">
              <Label htmlFor="inviteRole">Role</Label>
              <select
                id="inviteRole"
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {roles.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-8">
              <Button
                onClick={handleInvite}
                disabled={inviting || !inviteEmail}
                className="bg-accent hover:bg-accent/90"
              >
                {inviting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Inviting...
                  </>
                ) : (
                  'Send Invite'
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team Members List */}
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Team Members</CardTitle>
          <CardDescription>
            Manage roles and permissions for your team
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-accent" />
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No team members yet. Invite your first member above.
            </div>
          ) : (
            <div className="space-y-3">
              {members.map((member: any) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 bg-secondary rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-semibold">
                      {member.profiles?.full_name?.[0]?.toUpperCase() || 
                       member.profiles?.email?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <p className="font-medium">
                        {member.profiles?.full_name || member.profiles?.email}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {member.profiles?.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={member.role}
                      onChange={(e) => handleRoleChange(member.id, e.target.value)}
                      className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                      disabled={member.role === 'owner'}
                    >
                      {roles.map((role) => (
                        <option key={role.value} value={role.value}>
                          {role.label}
                        </option>
                      ))}
                    </select>

                    {member.role !== 'owner' && member.is_active && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeactivate(member.id)}
                      >
                        Deactivate
                      </Button>
                    )}

                    {!member.is_active && (
                      <span className="text-sm text-muted-foreground">Inactive</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
