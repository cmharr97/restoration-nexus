import Navigation from "@/components/Navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { PersonalDashboard } from "@/components/dashboard/PersonalDashboard";

export default function Index() {
  return (
    <ProtectedRoute requireOrganization>
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="lg:ml-64 mt-16 p-6">
          <div className="max-w-7xl mx-auto">
            <PersonalDashboard />
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
