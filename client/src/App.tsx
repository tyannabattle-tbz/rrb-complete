import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from 'react';
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { Toaster } from 'sonner';

// ===== QUMUS Core Pages =====
import Home from "./pages/Home";
import QumusDashboard from "./pages/admin/QumusDashboard";
import QumusPolicyControls from "./pages/admin/QumusPolicyControls";
import { SettingsPanel } from "./pages/SettingsPanel";
import { APIDocumentation } from "./pages/APIDocumentation";
import AdminDashboard from "./pages/AdminDashboard";
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';
import NotificationCenter from "./pages/NotificationCenter";
import UserProfile from "./pages/UserProfile";
import { KeyboardShortcutsGuide } from "./components/KeyboardShortcutsGuide";
import WebhookManagement from "@/pages/WebhookManagement";
import AuditLogViewer from "@/pages/AuditLogViewer";
import { AppHeader } from './components/AppHeader';
import { OfflineStatusIndicator } from "./components/OfflineStatusIndicator";
import { usePostAuthRedirect } from './_core/hooks/usePostAuthRedirect';
import { analytics } from '@/lib/analytics';

export default function App() {
  usePostAuthRedirect();

  useEffect(() => {
    // Track page views
    analytics.trackPageView(window.location.pathname);
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <div className="min-h-screen bg-background text-foreground">
            <AppHeader />
            <OfflineStatusIndicator />
            <main className="flex-1">
              <Switch>
                {/* ===== QUMUS Core Routes ===== */}
                <Route path="/" component={Home} />
                <Route path="/admin/qumus" component={QumusDashboard} />
                <Route path="/admin/qumus/policies" component={QumusPolicyControls} />
                <Route path="/admin" component={AdminDashboard} />
                <Route path="/analytics" component={AnalyticsDashboard} />
                <Route path="/settings" component={SettingsPanel} />
                <Route path="/api-docs" component={APIDocumentation} />
                <Route path="/notifications" component={NotificationCenter} />
                <Route path="/profile" component={UserProfile} />
                <Route path="/webhooks" component={WebhookManagement} />
                <Route path="/audit-logs" component={AuditLogViewer} />
                <Route path="/keyboard-shortcuts" component={KeyboardShortcutsGuide} />
                
                {/* 404 Fallback */}
                <Route component={NotFound} />
              </Switch>
            </main>
          </div>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
