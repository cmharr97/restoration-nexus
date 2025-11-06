import { LayoutDashboard, Users, FileText, Calendar, ClipboardList, Droplets, Wrench, Package, FileQuestion, Upload, DollarSign, UserCog, BarChart3, Settings, Menu, Search, Bell, Plus, Moon, Sun, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useTheme } from "@/components/ThemeProvider";
import { useAuth } from "@/hooks/useAuth";
import { useOrganization } from "@/hooks/useOrganization";
import logoLight from "@/assets/logo-light.png";
import logoDark from "@/assets/logo-dark.png";
import { useState } from "react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: FileText, label: "AI Scope Generator", path: "/scope-generator" },
  { icon: Users, label: "CRM", path: "/crm" },
  { icon: ClipboardList, label: "Projects", path: "/projects", badge: 24 },
  { icon: Calendar, label: "Schedule", path: "/schedule" },
  { icon: Droplets, label: "Moisture", path: "/moisture" },
  { icon: Wrench, label: "Equipment", path: "/equipment" },
  { icon: Package, label: "Contents", path: "/contents" },
  { icon: FileQuestion, label: "RFIs", path: "/rfis", badge: 5 },
  { icon: Upload, label: "Submittals", path: "/submittals" },
  { icon: DollarSign, label: "Financials", path: "/financials" },
  { icon: UserCog, label: "Subcontractors", path: "/subcontractors" },
  { icon: BarChart3, label: "Reports", path: "/reports" },
];

export default function Navigation() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { theme, setTheme } = useTheme();
  const { user, signOut } = useAuth();
  const { organization, membership } = useOrganization();

  const getUserInitials = () => {
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
          <img src={logoLight} alt="ReCon Pro" className="h-16 w-auto dark:hidden" />
          <img src={logoDark} alt="ReCon Pro" className="h-16 w-auto hidden dark:block" />
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
            <span className="text-sm text-muted-foreground hidden lg:block">
              {organization.name}
            </span>
          )}
          <Button variant="default" size="sm" className="gap-2 bg-accent hover:bg-accent/90">
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
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-accent text-xs">
              8
            </Badge>
          </Button>
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
                  <p className="font-medium">{user?.email}</p>
                  {membership && (
                    <p className="text-xs text-muted-foreground capitalize">
                      {membership.role.replace(/_/g, ' ')}
                    </p>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/settings" className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  Organization Settings
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
              {item.badge && (
                <Badge variant="secondary" className="ml-auto bg-accent text-accent-foreground">
                  {item.badge}
                </Badge>
              )}
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
