import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import "./index.css";
import { AuthProvider } from "./hooks/useAuth.tsx";
import { OrganizationProvider } from "./hooks/useOrganization.tsx";
import { UserRoleProvider } from "./hooks/useUserRole.tsx";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <AuthProvider>
      <OrganizationProvider>
        <UserRoleProvider>
          <App />
        </UserRoleProvider>
      </OrganizationProvider>
    </AuthProvider>
  </BrowserRouter>
);
