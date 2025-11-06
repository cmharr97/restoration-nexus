import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface Organization {
  id: string;
  name: string;
  logo_url: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  time_zone: string;
  cost_codes: any[];
  default_project_templates: any[];
  settings: any;
}

interface Membership {
  id: string;
  role: string;
  organization_id: string;
  is_active: boolean;
}

interface OrganizationContextType {
  organization: Organization | null;
  membership: Membership | null;
  loading: boolean;
  hasRole: (roles: string[]) => boolean;
  refetchOrganization: () => Promise<void>;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export function OrganizationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [membership, setMembership] = useState<Membership | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrganization = async () => {
    if (!user) {
      setOrganization(null);
      setMembership(null);
      setLoading(false);
      return;
    }

    try {
      // Get user's first active membership
      const { data: memberships, error: memberError } = await supabase
        .from('organization_members')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('joined_at', { ascending: false })
        .limit(1);

      if (memberError) throw memberError;

      if (memberships && memberships.length > 0) {
        setMembership(memberships[0]);

        // Fetch organization details
        const { data: org, error: orgError } = await supabase
          .from('organizations')
          .select('*')
          .eq('id', memberships[0].organization_id)
          .single();

        if (orgError) throw orgError;
        setOrganization(org as any);
      } else {
        setOrganization(null);
        setMembership(null);
      }
    } catch (error) {
      console.error('Error fetching organization:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganization();
  }, [user]);

  const hasRole = (roles: string[]): boolean => {
    if (!membership) return false;
    return roles.includes(membership.role);
  };

  const refetchOrganization = async () => {
    setLoading(true);
    await fetchOrganization();
  };

  return (
    <OrganizationContext.Provider value={{ 
      organization, 
      membership, 
      loading, 
      hasRole,
      refetchOrganization
    }}>
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganization() {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
}
