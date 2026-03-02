import React from 'react';
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { PresetProvider } from "./contexts/PresetContext";
import Home from "./pages/Home";
import AgentDashboard from "./pages/AgentDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import { AdminAnalyticsDashboard } from "./pages/AdminAnalyticsDashboard";
import { SettingsPanel } from "./pages/SettingsPanel";
import { APIDocumentation } from "./pages/APIDocumentation";
import { TeamManagement } from "./pages/TeamManagement";
import { KeyboardShortcutsGuide } from "./components/KeyboardShortcutsGuide";
import WebhookMarketplace from "./pages/WebhookMarketplace";
import ModelFineTuning from "./pages/ModelFineTuning";
import ProductionDashboard from "./pages/ProductionDashboard";
import ChatManagement from "./pages/ChatManagement";
import NotificationCenter from "./pages/NotificationCenter";
import BatchTemplateManager from "./pages/BatchTemplateManager";
import CostOptimizationDashboard from "./pages/CostOptimizationDashboard";
import AdminMonitoringDashboard from "./pages/AdminMonitoringDashboard";
import VoiceFeedbackSettings from "./pages/VoiceFeedbackSettings";
import ScheduledExportManager from "./pages/ScheduledExportManager";
import FeatureAnalyticsDashboard from './pages/FeatureAnalyticsDashboard';
import VideoProcessingStudio from './pages/VideoProcessingStudio';
import AudioEditor from './pages/AudioEditor';
import VideoTimelineEditor from '@/pages/VideoTimelineEditor';
import { VideoQueueManager } from "./pages/VideoQueueManager";
import { RateLimitingDashboard } from "./pages/RateLimitingDashboard";
import { BackupManagement } from "./pages/BackupManagement";
import { UsageReports } from "./pages/UsageReports";
import MotionGenerationStudio from "./pages/MotionGenerationStudio";
import SharedVideoPage from "./pages/SharedVideoPage";
import VideoGallery from "./pages/VideoGallery";
import VideoEditor from "./components/VideoEditor";
import UserProfile from "./pages/UserProfile";
import Community from "./pages/Community";
import CreatorOnboarding from "./pages/CreatorOnboarding";
import VideoAnalytics from "./pages/VideoAnalytics";
import VideoSearch from "./pages/VideoSearch";
import CollaborativeEditor from "./pages/CollaborativeEditor";
import { HybridCastConfig } from "./pages/HybridCastConfig";
import { VideoWatermarkEditor } from "./pages/VideoWatermarkEditor";
import { BatchVideoGenerator } from './pages/BatchVideoGenerator';
import { QumusChatInterface } from './components/QumusChatInterface';
import { AppHeader } from './components/AppHeader';
import { AppHeaderEnhanced } from './components/AppHeaderEnhanced';
import { MobileResponsiveLayout } from './components/MobileResponsiveLayout';
import { MobileHeaderClean } from './components/MobileHeaderClean';
import { Breadcrumbs } from './components/Breadcrumbs';
import { CanrynDashboard } from './pages/CanrynDashboard';
import { VideoProductionPage } from './pages/VideoProductionPage';
import { MobileBottomNav } from './components/MobileBottomNav';
import NewsletterSignup from '@/components/NewsletterSignup';
import { analytics } from '@/lib/analytics';
import QumusChatPage from '@/pages/QumusChatPage';
import RadioStation from '@/pages/RadioStation';
import RockinRockinBoogiePage from '@/pages/RockinRockinBoogiePage';
import BroadcastOrchestrationHub from '@/pages/BroadcastOrchestrationHub';
import MobileStudio from '@/pages/MobileStudio';
import EnhancedChatPage from '@/pages/EnhancedChatPage';
import QumusMonitoringDashboard from '@/pages/QumusMonitoringDashboard';
import PolicyDecisionLogging from '@/pages/PolicyDecisionLogging';
import AdminDecisionDashboard from '@/pages/AdminDecisionDashboard';
import ComplianceAuditViewer from '@/pages/ComplianceAuditViewer';
import ServiceHealthAlerts from '@/pages/ServiceHealthAlerts';
import HumanOverrideSystem from '@/pages/HumanOverrideSystem';
import AdvancedAnalyticsDashboard from '@/pages/AdvancedAnalyticsDashboard';
import MobileResponsiveAdminPanel from '@/pages/MobileResponsiveAdminPanel';
import CustomDashboardBuilder from '@/pages/CustomDashboardBuilder';
import AutomatedRemediationWorkflows from '@/pages/AutomatedRemediationWorkflows';
import HybridCastBroadcastManagement from '@/pages/HybridCastBroadcastManagement';
import RockinBoogieContentManager from '@/pages/RockinBoogieContentManager';
import EmergencyAlertSystem from '@/pages/EmergencyAlertSystem';
import AnalyticsReportingDashboard from '@/pages/AnalyticsReportingDashboard';
import PlatformMonitoringDashboard from '@/pages/PlatformMonitoringDashboard';
import Studio from '@/pages/Studio';
import { PodcastPlayer } from '@/components/PodcastPlayer';
import PodcastDiscovery from '@/pages/PodcastDiscovery';
import { RockinBoogiePlayerEnhanced } from '@/components/RockinBoogiePlayerEnhanced';
import RockinBoogieManager from '@/pages/RockinBoogieManager';
import DecisionPolicyEditor from '@/pages/DecisionPolicyEditor';
import RockinBoogieAdminDashboard from '@/pages/RockinBoogieAdminDashboard';
import DocumentUpload from '@/pages/DocumentUpload';
import AuditTrailViewer from '@/pages/AuditTrailViewer';
import { AutonomousDashboardPage } from '@/pages/AutonomousDashboardPage';
import { DonationCheckout } from '@/pages/DonationCheckout';
import { ProofVaultSearch } from '@/pages/ProofVaultSearch';
import { ListenerDashboard } from '@/pages/ListenerDashboard';
import ComprehensiveDashboardPage from '@/pages/ComprehensiveDashboardPage';

import CollaborationPage from '@/pages/CollaborationPage';
import { GPSRadarMapPage } from '@/pages/GPSRadarMapPage';
import EmergencyBroadcastAdminPanel from '@/pages/EmergencyBroadcastAdminPanel';
import BroadcastScheduler from '@/pages/BroadcastScheduler';
import AuditLogViewer from '@/pages/AuditLogViewer';
import HybridCastHub from '@/pages/HybridCastHub';
import HybridCastAnalyticsDashboard from '@/pages/HybridCastAnalyticsDashboard';
import HybridCastIntegration from '@/pages/HybridCastIntegration';
import HybridCastNotificationCenter from '@/pages/HybridCastNotificationCenter';
import BroadcastTemplatesLibrary from '@/pages/BroadcastTemplatesLibrary';
import UserPreferences from '@/pages/UserPreferences';
import WebhookManagement from '@/pages/WebhookManagement';
import Solbones from '@/pages/Solbones';
import ClientPortal from '@/pages/ClientPortal';
import Review from '@/pages/Review';
import AdminModeration from '@/pages/AdminModeration';
import MeditationHub from '@/pages/MeditationHub';
import RRBBroadcastMonitoring from '@/components/RRBBroadcastMonitoring';
import ContentRecommendationEngine from '@/components/ContentRecommendationEngine';
import SweetMiraclesDashboard from '@/pages/SweetMiraclesDashboard';
import DroneLogisticsTracker from '@/components/DroneLogisticsTracker';
import DroneVideoCapture from '@/components/DroneVideoCapture';
import MapArsenal from '@/components/MapArsenal';
import RRBDashboard from "@/pages/RRBDashboard";
import RRBBroadcastManager from "@/pages/RRBBroadcastManager";
import SweetMiraclesManager from "@/pages/SweetMiraclesManager";
import RRBListenerAnalytics from "@/pages/RRBListenerAnalytics";
import FuturePastBridge from "@/pages/FuturePastBridge";
import RRBRadioLanding from "@/pages/RRBRadioLanding";
import RRBPort3001 from "@/pages/RRBPort3001";
import HybridCastLanding from "@/pages/HybridCastLanding";
import { PortAwareRouter } from "@/components/PortAwareRouter";
import { Toaster } from 'sonner';

// Version: 3.0.0 - Mobile-first header redesign
function Router() {
  return (
    <>
      <Breadcrumbs />
      <Switch>
      <Route path="/" component={() => <PortAwareRouter qumusComponent={FuturePastBridge} rrbComponent={RRBPort3001} hybridcastComponent={HybridCastLanding} />} />
      <Route path="/home" component={Home} />
      <Route path="/agent" component={AgentDashboard} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/analytics" component={AdminAnalyticsDashboard} />
      <Route path="/canryn" component={CanrynDashboard} />
      <Route path="/settings" component={SettingsPanel} />
      <Route path="/api-docs" component={APIDocumentation} />
      <Route path="/team" component={TeamManagement} />
      <Route path="/marketplace" component={WebhookMarketplace} />
      <Route path="/finetuning" component={ModelFineTuning} />
      <Route path="/production" component={ProductionDashboard} />
      <Route path="/chat-management" component={ChatManagement} />
      <Route path="/notifications" component={NotificationCenter} />
      <Route path="/batch-templates" component={BatchTemplateManager} />
      <Route path="/cost-optimization" component={CostOptimizationDashboard} />
      <Route path="/admin/monitoring" component={AdminMonitoringDashboard} />
      <Route path="/voice-feedback" component={VoiceFeedbackSettings} />
      <Route path="/scheduled-exports" component={ScheduledExportManager} />
      <Route path="/feature-analytics" component={FeatureAnalyticsDashboard} />
      <Route path="/video-processing" component={VideoProcessingStudio} />
      <Route path="/audio-editor" component={AudioEditor} />
      <Route path="/video-timeline" component={VideoTimelineEditor} />
      <Route path="/video-queue" component={VideoQueueManager} />
      <Route path="/motion-studio" component={MotionGenerationStudio} />
      <Route path="/share/video/:videoId" component={SharedVideoPage} />
      <Route path="/gallery" component={VideoGallery} />
      <Route path="/editor/:videoId" component={() => <VideoEditor videoUrl="" videoId="" />} />
      <Route path="/profile/:userId" component={(props: any) => <UserProfile userId={props.params.userId} />} />
      <Route path="/community" component={Community} />
      <Route path="/creator-onboarding" component={CreatorOnboarding} />
      <Route path="/analytics" component={VideoAnalytics} />
      <Route path="/search" component={VideoSearch} />
      <Route path="/collaborate" component={CollaborativeEditor} />
      <Route path="/hybridcast-config" component={HybridCastConfig} />
      <Route path="/watermark-editor" component={VideoWatermarkEditor} />
      <Route path="/batch" component={BatchVideoGenerator} />
      <Route path="/video-production" component={VideoProductionPage} />
      <Route path="/chat" component={QumusChatInterface} />
      <Route path="/qumus-chat" component={QumusChatPage} />
      <Route path="/radio-station" component={RadioStation} />
      <Route path="/enhanced-chat" component={EnhancedChatPage} />
      <Route path="/qumus-dashboard" component={QumusMonitoringDashboard} />
      <Route path="/policy-decisions" component={PolicyDecisionLogging} />
      <Route path="/compliance-audit" component={ComplianceAuditViewer} />
      <Route path="/service-health" component={ServiceHealthAlerts} />
      <Route path="/human-override" component={HumanOverrideSystem} />
      <Route path="/analytics-advanced" component={AdvancedAnalyticsDashboard} />
      <Route path="/admin-mobile" component={MobileResponsiveAdminPanel} />
      <Route path="/dashboard-builder" component={CustomDashboardBuilder} />
      <Route path="/remediation-workflows" component={AutomatedRemediationWorkflows} />
      <Route path="/hybridcast-broadcast" component={HybridCastBroadcastManagement} />
      <Route path="/rockin-boogie-content" component={RockinBoogiePlayerEnhanced} />
      <Route path="/rockin-boogie" component={RockinRockinBoogiePage} />
      <Route path="/rockin-boogie-manager" component={RockinBoogieManager} />
      <Route path="/broadcast-hub" component={BroadcastOrchestrationHub} />
      <Route path="/mobile-studio" component={MobileStudio} />
      <Route path="/policy-editor" component={DecisionPolicyEditor} />
      <Route path="/rockin-admin" component={RockinBoogieAdminDashboard} />
      <Route path="/document-upload" component={DocumentUpload} />
      <Route path="/audit-trail" component={AuditTrailViewer} />
      <Route path="/emergency-alerts" component={EmergencyAlertSystem} />
      <Route path="/analytics-reporting" component={AnalyticsReportingDashboard} />
      <Route path="/admin-decisions" component={AdminDecisionDashboard} />
      <Route path="/autonomous-dashboard" component={AutonomousDashboardPage} />
      <Route path="/monitoring" component={PlatformMonitoringDashboard} />
      <Route path="/studio" component={Studio} />
      <Route path="/podcast" component={PodcastPlayer} />
      <Route path="/podcast-discovery" component={PodcastDiscovery} />
      <Route path="/donate" component={DonationCheckout} />
      <Route path="/proof-vault" component={ProofVaultSearch} />
      <Route path="/dashboard" component={ListenerDashboard} />
      <Route path="/comprehensive-dashboard" component={ComprehensiveDashboardPage} />

      <Route path="/collaboration" component={CollaborationPage} />
      <Route path="/gps-radar" component={GPSRadarMapPage} />
      <Route path="/broadcast-admin" component={EmergencyBroadcastAdminPanel} />
      <Route path="/broadcast-scheduler" component={BroadcastScheduler} />
      <Route path="/audit-log" component={AuditLogViewer} />
      <Route path="/hybridcast-hub" component={HybridCastHub} />
      <Route path="/hybridcast-analytics" component={HybridCastAnalyticsDashboard} />
      <Route path="/hybridcast" component={HybridCastIntegration} />
      <Route path="/hybridcast-notifications" component={HybridCastNotificationCenter} />
      <Route path="/broadcast-templates" component={BroadcastTemplatesLibrary} />
      <Route path="/user-preferences" component={UserPreferences} />
      <Route path="/webhooks" component={WebhookManagement} />
      <Route path="/meditation" component={MeditationHub} />
      <Route path="/sweet-miracles" component={DonationCheckout} />
      <Route path="/solbones" component={Solbones} />
      <Route path="/client-portal" component={ClientPortal} />
      <Route path="/review" component={Review} />
      <Route path="/admin-moderation" component={AdminModeration} />
      <Route path="/broadcast-monitoring" component={RRBBroadcastMonitoring} />
      <Route path="/recommendations" component={ContentRecommendationEngine} />
      <Route path="/impact-dashboard" component={SweetMiraclesDashboard} />
      <Route path="/drone-logistics" component={DroneLogisticsTracker} />
      <Route path="/drone-video" component={DroneVideoCapture} />
      <Route path="/map-arsenal" component={MapArsenal} />
      <Route path="/qumus-monitoring" component={QumusMonitoringDashboard} />
      <Route path="/rrb" component={RRBDashboard} />
      <Route path="/rrb/broadcast" component={RRBDashboard} />
      <Route path="/rrb/donations" component={RRBDashboard} />
      <Route path="/rrb/listeners" component={RRBListenerAnalytics} />
      <Route path="/rrb/analytics" component={RRBListenerAnalytics} />
      <Route path="/rrb/listeners" component={RRBDashboard} />
      <Route path="/rrb/analytics" component={RRBDashboard} />
      <Route path="/rrb/broadcast-manager" component={RRBBroadcastManager} />
      <Route path="/rrb/sweet-miracles" component={SweetMiraclesManager} />
      <Route path="/rrb/donations" component={SweetMiraclesManager} />
      <Route path="/rrb/listeners" component={RRBListenerAnalytics} />
      <Route path="/rrb/analytics" component={RRBListenerAnalytics} />
      <Route component={NotFound} />
    </Switch>
    </>
  );
}

function App() {
  // Extract and store OAuth token from URL if present
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      // Store token in localStorage as fallback session
      localStorage.setItem('qumus_session_token', token);
      // Remove token from URL to clean up address bar
      window.history.replaceState({}, document.title, window.location.pathname);
      console.log('[App] OAuth token stored in localStorage');
    }
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        switchable
      >
        <PresetProvider>
          <TooltipProvider>
            <Toaster />
            <KeyboardShortcutsGuide />
            
            {/* Mobile Header - shown only on mobile */}
            <div className="md:hidden">
              <MobileHeaderClean />
            </div>
            
            {/* Desktop Header - shown only on desktop */}
            <div className="hidden md:block">
              <AppHeaderEnhanced />
            </div>
            
            {/* Main Content */}
            <MobileResponsiveLayout>
              <Router />
            </MobileResponsiveLayout>
            
            {/* Mobile Bottom Navigation */}
            <MobileBottomNav />
          </TooltipProvider>
        </PresetProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
