import Navigation from "@/components/Navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { CreateLeadDialog } from "@/components/leads/CreateLeadDialog";
import { LeadKanban } from "@/components/leads/LeadKanban";

export default function Leads() {
  return (
    <ProtectedRoute requireOrganization>
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="lg:ml-64 mt-16 p-6">
          <div className="max-w-full space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Leads & CRM</h1>
                <p className="text-muted-foreground">Manage your restoration project pipeline</p>
              </div>
              <CreateLeadDialog />
            </div>

            <LeadKanban />
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
