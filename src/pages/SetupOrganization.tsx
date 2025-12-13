import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useOrganization } from '@/hooks/useOrganization';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import logoLight from '@/assets/logo-light.png';
import logoDark from '@/assets/logo-dark.png';
import { AppRole, getRoleDisplayName, getRoleDashboardFocus } from '@/hooks/useUserRole';

export default function SetupOrganization() {
  const [step, setStep] = useState(1);
  const [companyName, setCompanyName] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<AppRole>('owner');
  const [loading, setLoading] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const { organization, loading: orgLoading, refetchOrganization } = useOrganization();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Redirect if not logged in (after auth check completes)
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  // Redirect if user already has an organization
  useEffect(() => {
    if (!orgLoading && organization) {
      navigate('/');
    }
  }, [organization, orgLoading, navigate]);

  const roles: AppRole[] = [
    'owner',
    'office_admin',
    'recon_tech',
    'mitigation_tech',
    'contents_specialist',
    'reconstruction_pm',
    'field_crew',
    'subcontractor',
  ];

  const handleNext = () => {
    if (!companyName) {
      toast({
        title: 'Missing Information',
        description: 'Please enter your company name',
        variant: 'destructive',
      });
      return;
    }
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!companyName || !selectedRole) {
      toast({
        title: 'Missing Information',
        description: 'Please complete all required fields',
        variant: 'destructive',
      });
      return;
    }

    if (!user) {
      toast({
        title: 'Authentication Error',
        description: 'Please log in to create an organization',
        variant: 'destructive',
      });
      navigate('/login');
      return;
    }

    setLoading(true);

    try {
      // Create organization
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: companyName,
          address: companyAddress || null,
          phone: companyPhone || null,
          email: companyEmail || null,
          created_by: user.id,
        })
        .select()
        .single();

      if (orgError) throw orgError;

      // Add user as organization member with owner role
      const { error: memberError } = await supabase
        .from('organization_members')
        .insert({
          organization_id: org.id,
          user_id: user.id,
          role: 'owner', // Always owner for the person creating the org
          joined_at: new Date().toISOString(),
          is_active: true,
        });

      if (memberError) throw memberError;

      // Add user role based on selection (for dashboard customization)
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: user.id,
          organization_id: org.id,
          role: selectedRole,
          permissions: {},
        });

      if (roleError) throw roleError;

      toast({
        title: 'Organization Created',
        description: `${companyName} has been set up successfully`,
      });

      // Refetch organization data before navigating
      await refetchOrganization();
      navigate('/');
    } catch (error: any) {
      console.error('Error creating organization:', error);
      toast({
        title: 'Setup Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking auth
  if (authLoading || orgLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  // Don't render if not logged in (will redirect via useEffect)
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-6">
            <img src={logoLight} alt="ReCon Pro" className="h-32 w-auto dark:hidden" />
            <img src={logoDark} alt="ReCon Pro" className="h-32 w-auto hidden dark:block" />
          </div>
          <CardTitle className="text-2xl font-headline">
            {step === 1 ? 'Setup Your Organization' : 'Choose Your Role'}
          </CardTitle>
          <CardDescription>
            {step === 1 
              ? 'Tell us about your restoration company to get started'
              : 'Select your role to customize your dashboard experience'
            }
          </CardDescription>
          <div className="flex justify-center gap-2 pt-4">
            <div className={`h-2 w-20 rounded-full transition-colors ${step >= 1 ? 'bg-primary' : 'bg-muted'}`} />
            <div className={`h-2 w-20 rounded-full transition-colors ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {step === 1 ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input
                    id="companyName"
                    type="text"
                    placeholder="Pride Lands Restoration"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyAddress">Company Address</Label>
                  <Input
                    id="companyAddress"
                    type="text"
                    placeholder="123 Main St, City, State 12345"
                    value={companyAddress}
                    onChange={(e) => setCompanyAddress(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyPhone">Phone Number</Label>
                    <Input
                      id="companyPhone"
                      type="tel"
                      placeholder="(555) 123-4567"
                      value={companyPhone}
                      onChange={(e) => setCompanyPhone(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="companyEmail">Company Email</Label>
                    <Input
                      id="companyEmail"
                      type="email"
                      placeholder="info@yourcompany.com"
                      value={companyEmail}
                      onChange={(e) => setCompanyEmail(e.target.value)}
                    />
                  </div>
                </div>

                <Button type="button" onClick={handleNext} className="w-full bg-accent hover:bg-accent/90">
                  Continue to Role Selection →
                </Button>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="role">Your Role *</Label>
                  <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as AppRole)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role} value={role}>
                          <div className="flex items-center justify-between w-full">
                            <span>{getRoleDisplayName(role)}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground mt-1">
                    Dashboard Focus: <span className="text-accent font-medium">{getRoleDashboardFocus(selectedRole)}</span>
                  </p>
                </div>

                <div className="bg-muted/30 border border-muted p-4 rounded-lg space-y-3">
                  <h4 className="font-semibold text-sm flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-accent" />
                    Role Permissions Preview
                  </h4>
                  <div className="text-xs space-y-1.5 text-muted-foreground pl-4">
                    {selectedRole === 'owner' && (
                      <>
                        <p>✓ Full access to all projects and financials</p>
                        <p>✓ Approve changes and manage team members</p>
                        <p>✓ View KPIs, analytics, and profit insights</p>
                      </>
                    )}
                    {selectedRole === 'office_admin' && (
                      <>
                        <p>✓ Manage workflows and user onboarding</p>
                        <p>✓ Read-only access to financial reports</p>
                        <p>✓ Generate reports and manage equipment</p>
                      </>
                    )}
                    {(selectedRole === 'recon_tech' || selectedRole === 'mitigation_tech' || selectedRole === 'contents_specialist') && (
                      <>
                        <p>✓ View and edit assigned projects only</p>
                        <p>✓ Upload photos and logs for your work</p>
                        <p>✓ Mobile-optimized with offline support</p>
                      </>
                    )}
                    {selectedRole === 'reconstruction_pm' && (
                      <>
                        <p>✓ Manage reconstruction phases and subcontractors</p>
                        <p>✓ Approve change orders and punch lists</p>
                        <p>✓ View project budgets and timelines</p>
                      </>
                    )}
                    {selectedRole === 'field_crew' && (
                      <>
                        <p>✓ View today's schedule and assignments</p>
                        <p>✓ Quick check-ins with photo uploads</p>
                        <p>✓ Clock in/out for time tracking</p>
                      </>
                    )}
                    {selectedRole === 'subcontractor' && (
                      <>
                        <p>✓ View assigned projects only</p>
                        <p>✓ Submit timesheets and documentation</p>
                        <p>✓ Limited access to project details</p>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={() => setStep(1)} className="w-full">
                    ← Back
                  </Button>
                  <Button 
                    type="submit" 
                    className="w-full bg-accent hover:bg-accent/90" 
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Setting Up...
                      </>
                    ) : (
                      'Complete Setup'
                    )}
                  </Button>
                </div>
              </>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
