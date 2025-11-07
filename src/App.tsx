import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/hooks/useAuth";
import { OrganizationProvider } from "@/hooks/useOrganization";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import SetupOrganization from "./pages/SetupOrganization";
import ScopeGeneratorPage from "./pages/ScopeGeneratorPage";
import OrganizationSettings from "./pages/OrganizationSettings";
import OrganizationProfile from "./pages/OrganizationProfile";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import JobsSchedule from "./pages/JobsSchedule";
import RecurringJobs from "./pages/RecurringJobs";
import Analytics from "./pages/Analytics";
import Announcements from "./pages/Announcements";
import TeamChat from "./pages/TeamChat";
import Tasks from "./pages/Tasks";
import CheckIns from "./pages/CheckIns";
import Boards from "./pages/Boards";
import Activity from "./pages/Activity";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <OrganizationProvider>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/setup-organization" element={<SetupOrganization />} />
                <Route
                  path="/"
                  element={
                    <ProtectedRoute requireOrganization>
                      <Index />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/scope-generator"
                  element={
                    <ProtectedRoute requireOrganization>
                      <ScopeGeneratorPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/projects"
                  element={
                    <ProtectedRoute requireOrganization>
                      <Projects />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/projects/:id"
                  element={
                    <ProtectedRoute requireOrganization>
                      <ProjectDetail />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={<OrganizationSettings />}
                />
                <Route
                  path="/organization/profile"
                  element={
                    <ProtectedRoute requireOrganization>
                      <OrganizationProfile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/schedule"
                  element={
                    <ProtectedRoute requireOrganization>
                      <JobsSchedule />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/recurring-jobs"
                  element={
                    <ProtectedRoute requireOrganization>
                      <RecurringJobs />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/analytics"
                  element={
                    <ProtectedRoute requireOrganization>
                      <Analytics />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/announcements"
                  element={
                    <ProtectedRoute requireOrganization>
                      <Announcements />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/team-chat"
                  element={
                    <ProtectedRoute requireOrganization>
                      <TeamChat />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/boards"
                  element={
                    <ProtectedRoute requireOrganization>
                      <Boards />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/activity"
                  element={
                    <ProtectedRoute requireOrganization>
                      <Activity />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/tasks"
                  element={
                    <ProtectedRoute requireOrganization>
                      <Tasks />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/check-ins"
                  element={
                    <ProtectedRoute requireOrganization>
                      <CheckIns />
                    </ProtectedRoute>
                  }
                />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </OrganizationProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
