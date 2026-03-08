import { useState, useEffect } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useOrganization } from '@/hooks/useOrganization';
import { useUserRole, getRoleDisplayName } from '@/hooks/useUserRole';
import { useTheme } from '@/components/ThemeProvider';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import NotificationBell from '@/components/NotificationBell';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, Target, Briefcase, Calendar, CheckSquare,
  Droplets, Hammer, FileText, Receipt, Wrench, BarChart3,
  Settings, Search, Menu, X, LogOut, Sun, Moon,
  PanelLeftClose, PanelLeftOpen, Users, Truck, Building2,
  MessageSquare, Shield, DollarSign, FolderOpen, Zap,
  UserCheck, HandCoins, ClipboardList, Package
} from 'lucide-react';

const navSections = [
  {
    label: 'OPERATIONS',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
      { icon: Target, label: 'Leads', path: '/leads' },
      { icon: Briefcase, label: 'Jobs', path: '/jobs' },
      { icon: Calendar, label: 'Calendar', path: '/calendar' },
      { icon: CheckSquare, label: 'Tasks', path: '/tasks' },
      { icon: Building2, label: 'Customers', path: '/customers' },
    ]
  },
  {
    label: 'FIELD WORK',
    items: [
      { icon: Droplets, label: 'Mitigation', path: '/mitigation' },
      { icon: Hammer, label: 'Reconstruction', path: '/reconstruction' },
      { icon: Wrench, label: 'Equipment', path: '/equipment' },
      { icon: Truck, label: 'Subcontractors', path: '/subcontractors' },
    ]
  },
  {
    label: 'FINANCIAL',
    items: [
      { icon: FileText, label: 'Estimates', path: '/estimates' },
      { icon: ClipboardList, label: 'Supplements', path: '/supplements' },
      { icon: Receipt, label: 'Invoices', path: '/invoices' },
      { icon: DollarSign, label: 'Payments', path: '/payments' },
    ]
  },
  {
    label: 'ADMIN',
    items: [
      { icon: Users, label: 'Team', path: '/team' },
      { icon: BarChart3, label: 'Reports', path: '/reports' },
      { icon: Zap, label: 'Automations', path: '/automations' },
      { icon: Settings, label: 'Settings', path: '/settings' },
    ]
  },
];

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { organization } = useOrganization();
  const { userRole } = useUserRole();
  const { theme, setTheme } = useTheme();

  const [profile, setProfile] = useState<any>(null);
  useEffect(() => {
    if (user) {
      supabase.from('profiles').select('*').eq('id', user.id).single()
        .then(({ data }) => setProfile(data));
    }
  }, [user]);

  const getUserInitials = () => {
    if (profile?.full_name) {
      return profile.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2);
    }
    return user?.email?.[0]?.toUpperCase() || '?';
  };

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="h-14 flex items-center px-4 border-b border-sidebar-border shrink-0">
        {!collapsed ? (
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="font-headline text-sm font-extrabold text-primary-foreground tracking-tight">R</span>
            </div>
            <div>
              <span className="font-headline text-sm font-extrabold tracking-tight">ReCon</span>
              <span className="font-headline text-[9px] font-bold text-primary ml-0.5 tracking-[0.15em]">PRO</span>
            </div>
          </div>
        ) : (
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center mx-auto">
            <span className="font-headline text-sm font-extrabold text-primary-foreground">R</span>
          </div>
        )}
      </div>

      {/* Role Badge */}
      {!collapsed && userRole && (
        <div className="mx-3 mt-3 mb-1 bg-primary/10 border border-primary/20 rounded-lg px-3 py-2">
          <div className="flex items-center gap-2">
            <Shield className="h-3 w-3 text-primary" />
            <div>
              <div className="text-[10px] font-bold text-primary tracking-wide">{getRoleDisplayName(userRole.role)}</div>
              <div className="text-[10px] text-muted-foreground">{profile?.full_name || user?.email}</div>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2 px-2">
        {navSections.map(section => (
          <div key={section.label} className="mb-4">
            {!collapsed && (
              <div className="px-2.5 mb-1.5 section-label">
                {section.label}
              </div>
            )}
            <div className="space-y-0.5">
              {section.items.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "nav-item",
                    collapsed && "justify-center p-2.5",
                    isActive(item.path) ? "nav-item-active" : "nav-item-inactive"
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon className={cn("shrink-0", collapsed ? "h-5 w-5" : "h-4 w-4")} />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Collapse toggle */}
      <div className="hidden lg:block p-2 border-t border-sidebar-border shrink-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="w-full justify-center h-8 text-muted-foreground hover:text-foreground"
        >
          {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 bg-sidebar border-r border-sidebar-border transition-all duration-200 hidden lg:flex flex-col",
        collapsed ? "w-16" : "w-56"
      )}>
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border lg:hidden">
            <SidebarContent />
          </aside>
        </>
      )}

      {/* Main Content Area */}
      <div className={cn(
        "flex-1 flex flex-col min-h-screen transition-all duration-200",
        collapsed ? "lg:ml-16" : "lg:ml-56"
      )}>
        {/* Header */}
        <header className="sticky top-0 z-30 h-14 bg-background/95 backdrop-blur-md border-b border-border flex items-center px-4 gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden h-8 w-8"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Search */}
          <div className="flex-1 max-w-sm hidden sm:block">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search jobs, customers, claims..."
                className="pl-8 h-8 text-sm bg-muted/40 border-border/50 focus:bg-muted/60"
              />
            </div>
          </div>

          <div className="flex items-center gap-1.5 ml-auto">
            {organization && (
              <span className="text-xs text-muted-foreground hidden md:block mr-2">
                {organization.name}
              </span>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>

            <NotificationBell />

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                  <div className="h-7 w-7 rounded-full bg-gradient-to-br from-primary to-primary/60 text-primary-foreground flex items-center justify-center text-xs font-bold">
                    {getUserInitials()}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <p className="text-sm font-medium">{profile?.full_name || user?.email}</p>
                  {userRole && (
                    <Badge variant="outline" className="mt-1 text-[10px] border-primary/30 text-primary">
                      {getRoleDisplayName(userRole.role)}
                    </Badge>
                  )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" /> Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut} className="cursor-pointer text-destructive">
                  <LogOut className="mr-2 h-4 w-4" /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
