import Navigation from "@/components/Navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { PersonalDashboard } from "@/components/dashboard/PersonalDashboard";
import { OwnerDashboard } from "@/components/dashboards/OwnerDashboard";
import { ReconTechDashboard } from "@/components/dashboards/ReconTechDashboard";
import { useUserRole } from "@/hooks/useUserRole";
import { Loader2 } from "lucide-react";

export default function Index() {
  const { userRole, loading } = useUserRole();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  const renderDashboard = () => {
    if (!userRole) return <PersonalDashboard />;

    switch (userRole.role) {
      case 'owner':
        return <OwnerDashboard />;
      case 'recon_tech':
        return <ReconTechDashboard />;
      default:
        return <PersonalDashboard />;
    }
  };

  return (
    <ProtectedRoute requireOrganization>
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="lg:ml-64 mt-16 p-6">
          <div className="max-w-7xl mx-auto">
            {renderDashboard()}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
