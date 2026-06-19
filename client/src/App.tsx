import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { DashboardLayoutSkeleton } from "@/components/DashboardLayoutSkeleton";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import GeneratePage from "./pages/GeneratePage";
import SetorPage from "./pages/SetorPage";
import RiwayatPage from "./pages/RiwayatPage";
import SettingsPage from "./pages/SettingsPage";
import AdminPage from "./pages/AdminPage";
import { useEffect, useRef } from "react";
import { getLoginUrl } from "./const";

function Router() {
  const { user, loading } = useAuth();
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (loading) return;
    if (user) {
      hasRedirected.current = false;
      return;
    }
    if (hasRedirected.current) return;

    const loginUrl = getLoginUrl();
    if (!loginUrl || loginUrl === "/") return;
    if (window.location.href === loginUrl) return;

    hasRedirected.current = true;
    window.location.href = loginUrl;
  }, [loading, user]);

  if (loading || !user) {
    return <DashboardLayoutSkeleton />;
  }

  return (
    <DashboardLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/generate" component={GeneratePage} />
        <Route path="/setor" component={SetorPage} />
        <Route path="/riwayat" component={RiwayatPage} />
        <Route path="/settings" component={SettingsPage} />
        <Route
          path="/admin"
          component={() =>
            user.role === "admin" ? <AdminPage /> : <NotFound />
          }
        />
        <Route component={NotFound} />
      </Switch>
    </DashboardLayout>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <AuthProvider>
            <Router />
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
