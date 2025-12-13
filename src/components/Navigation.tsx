import { LayoutDashboard, Users, FileText, Calendar, ClipboardList, Droplets, Wrench, Package, FileQuestion, Upload, DollarSign, UserCog, BarChart3, Settings, Menu, Search, Plus, Moon, Sun, LogOut, MessageSquare, MessageCircle, CheckSquare, Kanban as KanbanIcon, Activity as ActivityIcon, Repeat, Target } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useTheme } from "@/components/ThemeProvider";
import { useAuth } from "@/hooks/useAuth";
import { useOrganization } from "@/hooks/useOrganization";
import { useUserRole, getRoleDisplayName } from "@/hooks/useUserRole";
import NotificationBell from "@/components/NotificationBell";
import logoLight from "@/assets/logo-light.png";
import logoDark from "@/assets/logo-dark.png";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: Target, label: "Leads", path: "/leads" },
  { icon: ClipboardList, label: "Projects", path: "/projects" },
  { icon: Calendar, label: "Schedule", path: "/schedule" },
  { icon: MessageSquare, label: "Announcements", path: "/announcements" },
  { icon: MessageCircle, label: "Team Chat", path: "/team-chat" },
  { icon: CheckSquare, label: "Tasks", path: "/tasks" },
  { icon: KanbanIcon, label: "Boards", path: "/boards" },
  { icon: FileText, label: "Check-ins", path: "/check-ins" },
  { icon: ActivityIcon, label: "Activity", path: "/activity" },
  { icon: Repeat, label: "Recurring Jobs", path: "/recurring-jobs" },
  { icon: BarChart3, label: "Analytics", path: "/analytics" },
];

export default function Navigation() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { theme, setTheme } = useTheme();
  const { user, signOut } = useAuth();
  const { organization, membership } = useOrganization();
  const { userRole } = useUserRole();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<any>(null);
  useEffect(() => {
    if (user) {
      supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
        .then(({ data }) => setProfile(data));
    }
  }, [user]);

  const getUserInitials = () => {
    if (profile?.full_name) {
      const names = profile.full_name.split(' ');
      return names.map((n: string) => n[0]).join('').toUpperCase().substring(0, 2);
    }
    if (!user?.email) return '?';
    return user.email[0].toUpperCase();
  };

  return (
    <>
      {/* Topbar */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-card border-b border-border z-50 flex items-center px-4 gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="flex items-center gap-3">
          <img src={logoLight} alt="ReCon Pro" className="h-20 w-auto dark:hidden" />
          <img src={logoDark} alt="ReCon Pro" className="h-20 w-auto hidden dark:block" />
        </div>

        <div className="flex-1 max-w-2xl mx-auto hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="⌘K to search projects, claims, equipment..."
              className="pl-10 bg-secondary/50"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {organization && (
            organization.logo_url ? (
              <img 
                src={organization.logo_url} 
                alt={organization.name} 
                className="h-8 w-auto max-w-[120px] object-contain hidden lg:block"
              />
            ) : (
              <span className="text-sm text-muted-foreground hidden lg:block">
                {organization.name}
              </span>
            )
          )}
          <Button variant="default" size="sm" className="gap-2 bg-accent hover:bg-accent/90" onClick={() => navigate('/projects?create=1')}>
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Quick Add</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
          <NotificationBell />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <div className="h-8 w-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-semibold">
                  {getUserInitials()}
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div>
                  <p className="font-medium">
                    {profile?.full_name || user?.email}
                  </p>
                  {userRole && (
                    <Badge className="mt-1 bg-accent text-accent-foreground">
                      {getRoleDisplayName(userRole.role)}
                    </Badge>
                  )}
                  {membership && (
                    <p className="text-xs text-muted-foreground capitalize mt-1">
                      Org: {membership.role.replace(/_/g, ' ')}
                    </p>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/organization/profile" className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  Organization Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/settings" className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut} className="cursor-pointer text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-16 bottom-0 w-64 bg-sidebar border-r border-sidebar-border transition-transform duration-300 z-40 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="flex flex-col h-full overflow-y-auto py-4">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="flex items-center gap-3 px-4 py-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors group relative"
            >
              <item.icon className="h-5 w-5 text-muted-foreground group-hover:text-sidebar-accent-foreground" />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}

          <div className="mt-auto pt-4 border-t border-sidebar-border">
            <Link
              to="/settings"
              className="flex items-center gap-3 px-4 py-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
            >
              <Settings className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">Settings</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  );
}
