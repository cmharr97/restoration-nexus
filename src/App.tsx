import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppLayout from "@/components/layout/AppLayout";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import SetupOrganization from "./pages/SetupOrganization";
import Dashboard from "./pages/Index";
import Jobs from "./pages/Jobs";
import JobDetail from "./pages/JobDetail";
import Leads from "./pages/Leads";
import JobsSchedule from "./pages/JobsSchedule";
import Tasks from "./pages/Tasks";
import MitigationPage from "./pages/MitigationPage";
import ReconstructionPage from "./pages/ReconstructionPage";
import EquipmentPage from "./pages/EquipmentPage";
import EstimatesPage from "./pages/EstimatesPage";
import InvoicesPage from "./pages/InvoicesPage";
import ReportsPage from "./pages/ReportsPage";
import OrganizationSettings from "./pages/OrganizationSettings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/setup-organization" element={<SetupOrganization />} />

          {/* Redirect old paths */}
          <Route path="/projects" element={<Navigate to="/jobs" replace />} />
          <Route path="/projects/:id" element={<Navigate to="/jobs/:id" replace />} />
          <Route path="/schedule" element={<Navigate to="/calendar" replace />} />

          {/* Protected routes with app layout */}
          <Route element={<ProtectedRoute requireOrganization><AppLayout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="leads" element={<Leads />} />
            <Route path="jobs" element={<Jobs />} />
            <Route path="jobs/:id" element={<JobDetail />} />
            <Route path="calendar" element={<JobsSchedule />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="mitigation" element={<MitigationPage />} />
            <Route path="reconstruction" element={<ReconstructionPage />} />
            <Route path="equipment" element={<EquipmentPage />} />
            <Route path="estimates" element={<EstimatesPage />} />
            <Route path="invoices" element={<InvoicesPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="settings" element={<OrganizationSettings />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;