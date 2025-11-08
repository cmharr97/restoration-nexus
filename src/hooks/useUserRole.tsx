import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useOrganization } from './useOrganization';

export type AppRole = 
  | 'owner'
  | 'office_admin'
  | 'recon_tech'
  | 'mitigation_tech'
  | 'contents_specialist'
  | 'reconstruction_pm'
  | 'field_crew'
  | 'subcontractor';

interface UserRole {
  id: string;
  user_id: string;
  organization_id: string;
  role: AppRole;
  permissions: Record<string, boolean>;
  created_at: string;
}

interface RolePermissions {
  viewAllProjects: boolean;
  editSchedules: boolean;
  uploadPhotos: boolean;
  accessFinancials: 'none' | 'read' | 'full';
  approveChanges: boolean;
  seeCustomerPortal: boolean;
}

interface UserRoleContextType {
  userRole: UserRole | null;
  rolePermissions: RolePermissions | null;
  loading: boolean;
  hasPermission: (permission: keyof RolePermissions) => boolean;
  canAccessFinancials: (level: 'read' | 'full') => boolean;
  refetchRole: () => Promise<void>;
}

const UserRoleContext = createContext<UserRoleContextType | undefined>(undefined);

const ROLE_PERMISSIONS: Record<AppRole, RolePermissions> = {
  owner: {
    viewAllProjects: true,
    editSchedules: true,
    uploadPhotos: true,
    accessFinancials: 'full',
    approveChanges: true,
    seeCustomerPortal: true,
  },
  office_admin: {
    viewAllProjects: true,
    editSchedules: true,
    uploadPhotos: false,
    accessFinancials: 'read',
    approveChanges: false,
    seeCustomerPortal: true,
  },
  recon_tech: {
    viewAllProjects: false,
    editSchedules: false,
    uploadPhotos: true,
    accessFinancials: 'none',
    approveChanges: false,
    seeCustomerPortal: false,
  },
  mitigation_tech: {
    viewAllProjects: false,
    editSchedules: false,
    uploadPhotos: true,
    accessFinancials: 'none',
    approveChanges: false,
    seeCustomerPortal: false,
  },
  contents_specialist: {
    viewAllProjects: false,
    editSchedules: false,
    uploadPhotos: true,
    accessFinancials: 'none',
    approveChanges: false,
    seeCustomerPortal: false,
  },
  reconstruction_pm: {
    viewAllProjects: true,
    editSchedules: true,
    uploadPhotos: true,
    accessFinancials: 'read',
    approveChanges: true,
    seeCustomerPortal: true,
  },
  field_crew: {
    viewAllProjects: false,
    editSchedules: false,
    uploadPhotos: true,
    accessFinancials: 'none',
    approveChanges: false,
    seeCustomerPortal: false,
  },
  subcontractor: {
    viewAllProjects: false,
    editSchedules: false,
    uploadPhotos: false,
    accessFinancials: 'none',
    approveChanges: false,
    seeCustomerPortal: false,
  },
};

export function UserRoleProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { organization } = useOrganization();
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserRole = async () => {
    if (!user || !organization?.id) {
      setUserRole(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id)
        .eq('organization_id', organization.id)
        .single();

      if (error) throw error;
      setUserRole(data as any);
    } catch (error) {
      console.error('Error fetching user role:', error);
      setUserRole(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserRole();
  }, [user, organization?.id]);

  const rolePermissions = userRole ? ROLE_PERMISSIONS[userRole.role] : null;

  const hasPermission = (permission: keyof RolePermissions): boolean => {
    if (!rolePermissions) return false;
    const value = rolePermissions[permission];
    return typeof value === 'boolean' ? value : false;
  };

  const canAccessFinancials = (level: 'read' | 'full'): boolean => {
    if (!rolePermissions) return false;
    const access = rolePermissions.accessFinancials;
    if (access === 'none') return false;
    if (level === 'read') return access === 'read' || access === 'full';
    return access === 'full';
  };

  const refetchRole = async () => {
    setLoading(true);
    await fetchUserRole();
  };

  return (
    <UserRoleContext.Provider
      value={{
        userRole,
        rolePermissions,
        loading,
        hasPermission,
        canAccessFinancials,
        refetchRole,
      }}
    >
      {children}
    </UserRoleContext.Provider>
  );
}

export function useUserRole() {
  const context = useContext(UserRoleContext);
  if (context === undefined) {
    throw new Error('useUserRole must be used within a UserRoleProvider');
  }
  return context;
}

export function getRoleDisplayName(role: AppRole): string {
  const names: Record<AppRole, string> = {
    owner: 'Owner',
    office_admin: 'Office Admin',
    recon_tech: 'Recon Tech',
    mitigation_tech: 'Mitigation Tech',
    contents_specialist: 'Contents Specialist',
    reconstruction_pm: 'Reconstruction PM',
    field_crew: 'Field Crew',
    subcontractor: 'Subcontractor',
  };
  return names[role];
}

export function getRoleDashboardFocus(role: AppRole): string {
  const focus: Record<AppRole, string> = {
    owner: 'KPIs & Profit',
    office_admin: 'Admin & Workflows',
    recon_tech: 'My Recon Tasks',
    mitigation_tech: 'My Drying Jobs',
    contents_specialist: 'My Inventory',
    reconstruction_pm: 'Phase Overviews',
    field_crew: "Today's Schedule",
    subcontractor: 'Assigned Subs',
  };
  return focus[role];
}
