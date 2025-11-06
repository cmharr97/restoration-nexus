import { useState, useEffect } from 'react';
import { useOrganization } from '@/hooks/useOrganization';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';
import { Building2, Upload, Save, X, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { z } from 'zod';

const organizationSchema = z.object({
  name: z.string().min(2, 'Company name must be at least 2 characters').max(100, 'Company name too long'),
  address: z.string().max(200, 'Address too long').optional(),
  phone: z.string().max(20, 'Phone number too long').optional(),
  email: z.string().email('Invalid email format').max(100, 'Email too long').optional().or(z.literal('')),
  website: z.string().url('Invalid website URL').max(200, 'Website URL too long').optional().or(z.literal('')),
});

type AuditLog = {
  id: string;
  action: string;
  field_name: string | null;
  old_value: string | null;
  new_value: string | null;
  created_at: string;
  profiles?: {
    full_name: string | null;
    email: string;
  };
};

export default function OrganizationProfile() {
  const { organization, refetchOrganization, hasRole } = useOrganization();
  const { user } = useAuth();
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    website: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isAdmin = hasRole(['owner', 'admin']);

  useEffect(() => {
    if (organization) {
      setFormData({
        name: organization.name || '',
        address: organization.address || '',
        phone: organization.phone || '',
        email: organization.email || '',
        website: organization.website || '',
      });
      fetchAuditLogs();
    }
  }, [organization]);

  const fetchAuditLogs = async () => {
    if (!organization?.id) return;

    try {
      const { data, error } = await supabase
        .from('organization_audit_log' as any)
        .select(`
          *,
          profiles:user_id (
            full_name,
            email
          )
        `)
        .eq('organization_id', organization.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setAuditLogs((data as any) || []);
    } catch (error: any) {
      console.error('Error fetching audit logs:', error);
    }
  };

  const validateForm = () => {
    try {
      organizationSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSave = async () => {
    if (!validateForm() || !organization?.id) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('organizations' as any)
        .update({
          name: formData.name,
          address: formData.address || null,
          phone: formData.phone || null,
          email: formData.email || null,
          website: formData.website || null,
        } as any)
        .eq('id', organization.id);

      if (error) throw error;

      toast({
        title: 'Profile Updated',
        description: 'Organization profile has been updated successfully',
      });

      await refetchOrganization();
      await fetchAuditLogs();
      setEditing(false);
    } catch (error: any) {
      console.error('Error updating organization:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update organization profile',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (organization) {
      setFormData({
        name: organization.name || '',
        address: organization.address || '',
        phone: organization.phone || '',
        email: organization.email || '',
        website: organization.website || '',
      });
    }
    setErrors({});
    setEditing(false);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !organization?.id) return;

    // Validate file
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: 'Invalid File Type',
        description: 'Please upload a JPG, PNG, WEBP, or SVG image',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File Too Large',
        description: 'Logo must be less than 5MB',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    try {
      // Delete old logo if exists
      if (organization.logo_url) {
        const oldPath = organization.logo_url.split('/').slice(-2).join('/');
        await supabase.storage.from('organization-logos').remove([oldPath]);
      }

      // Upload new logo
      const fileExt = file.name.split('.').pop();
      const fileName = `${organization.id}/logo-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('organization-logos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('organization-logos')
        .getPublicUrl(fileName);

      // Update organization
      const { error: updateError } = await supabase
        .from('organizations' as any)
        .update({ logo_url: urlData.publicUrl } as any)
        .eq('id', organization.id);

      if (updateError) throw updateError;

      toast({
        title: 'Logo Updated',
        description: 'Organization logo has been updated successfully',
      });

      await refetchOrganization();
      await fetchAuditLogs();
    } catch (error: any) {
      console.error('Error uploading logo:', error);
      toast({
        title: 'Upload Failed',
        description: error.message || 'Failed to upload logo',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const getFieldLabel = (fieldName: string) => {
    const labels: Record<string, string> = {
      name: 'Company Name',
      address: 'Address',
      phone: 'Phone',
      email: 'Email',
      website: 'Website',
      logo: 'Logo',
    };
    return labels[fieldName] || fieldName;
  };

  if (!organization) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-background ml-64 p-8">
          <p className="text-muted-foreground">No organization found</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-background ml-64 p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-headline font-bold">Organization Profile</h1>
              <p className="text-muted-foreground mt-1">
                Manage your company information and branding
              </p>
            </div>
            {isAdmin && !editing && (
              <Button onClick={() => setEditing(true)}>
                Edit Profile
              </Button>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>
                {isAdmin 
                  ? 'Update your organization details and logo'
                  : 'View your organization details'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Logo Section */}
              <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={organization.logo_url || ''} alt={organization.name} />
                  <AvatarFallback className="text-2xl">
                    <Building2 className="h-12 w-12" />
                  </AvatarFallback>
                </Avatar>
                {isAdmin && (
                  <div>
                    <Label htmlFor="logo-upload" className="cursor-pointer">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                        <Upload className="h-4 w-4" />
                        {uploading ? 'Uploading...' : 'Upload Logo'}
                      </div>
                    </Label>
                    <Input
                      id="logo-upload"
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/svg+xml"
                      onChange={handleLogoUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      JPG, PNG, WEBP, or SVG (max 5MB)
                    </p>
                  </div>
                )}
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Company Name *</Label>
                  {editing ? (
                    <>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className={errors.name ? 'border-destructive' : ''}
                      />
                      {errors.name && (
                        <p className="text-sm text-destructive mt-1">{errors.name}</p>
                      )}
                    </>
                  ) : (
                    <p className="text-sm mt-1">{organization.name}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="address">Address</Label>
                  {editing ? (
                    <>
                      <Textarea
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        rows={2}
                        className={errors.address ? 'border-destructive' : ''}
                      />
                      {errors.address && (
                        <p className="text-sm text-destructive mt-1">{errors.address}</p>
                      )}
                    </>
                  ) : (
                    <p className="text-sm mt-1">{organization.address || 'Not set'}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    {editing ? (
                      <>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className={errors.phone ? 'border-destructive' : ''}
                        />
                        {errors.phone && (
                          <p className="text-sm text-destructive mt-1">{errors.phone}</p>
                        )}
                      </>
                    ) : (
                      <p className="text-sm mt-1">{organization.phone || 'Not set'}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    {editing ? (
                      <>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className={errors.email ? 'border-destructive' : ''}
                        />
                        {errors.email && (
                          <p className="text-sm text-destructive mt-1">{errors.email}</p>
                        )}
                      </>
                    ) : (
                      <p className="text-sm mt-1">{organization.email || 'Not set'}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="website">Website</Label>
                  {editing ? (
                    <>
                      <Input
                        id="website"
                        type="url"
                        value={formData.website}
                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                        placeholder="https://example.com"
                        className={errors.website ? 'border-destructive' : ''}
                      />
                      {errors.website && (
                        <p className="text-sm text-destructive mt-1">{errors.website}</p>
                      )}
                    </>
                  ) : (
                    <p className="text-sm mt-1">
                      {organization.website ? (
                        <a
                          href={organization.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {organization.website}
                        </a>
                      ) : (
                        'Not set'
                      )}
                    </p>
                  )}
                </div>
              </div>

              {editing && isAdmin && (
                <div className="flex gap-2 pt-4">
                  <Button onClick={handleSave} disabled={saving}>
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button variant="outline" onClick={handleCancel} disabled={saving}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Audit Trail */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Change History
              </CardTitle>
              <CardDescription>
                Recent changes to organization profile
              </CardDescription>
            </CardHeader>
            <CardContent>
              {auditLogs.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No changes recorded yet
                </p>
              ) : (
                <div className="space-y-3">
                  {auditLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-start gap-3 p-3 border rounded-lg hover:bg-accent/5 transition-colors"
                    >
                      <div className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="secondary" className="text-xs">
                            {getFieldLabel(log.field_name || '')}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {log.profiles?.full_name || log.profiles?.email || 'Unknown user'}
                          </span>
                        </div>
                        {log.old_value && log.new_value && (
                          <div className="text-sm space-y-1">
                            <p className="text-muted-foreground">
                              <span className="line-through">{log.old_value}</span>
                            </p>
                            <p className="text-foreground font-medium">{log.new_value}</p>
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
