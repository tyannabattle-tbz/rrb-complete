import { Toaster } from "@/components/ui/sonner";
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
import QumusChatPage from '@/pages/QumusChatPage';
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
import { DonationCheckout } from '@/pages/DonationCheckout';
import { ProofVaultSearch } from '@/pages/ProofVaultSearch';
import { ListenerDashboard } from '@/pages/ListenerDashboard';
import MeditationHub from '@/pages/MeditationHub';
import { GPSRadarMapPage } from '@/pages/GPSRadarMapPage';
import ComprehensiveDashboardPage from '@/pages/ComprehensiveDashboardPage';
import UserPreferencesPanel from '@/components/UserPreferencesPanel';
import { AccessibilityPanel } from '@/components/AccessibilityPanel';
import { RealTimeTranscription } from '@/components/RealTimeTranscription';
import { LocationChatRooms } from '@/components/LocationChatRooms';
import { BroadcastVOD } from '@/components/BroadcastVOD';
import CollaborationPage from '@/pages/CollaborationPage';
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

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/agent" component={AgentDashboard} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/analytics" component={AdminAnalyticsDashboard} />
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
      <Route path="/chat" component={QumusChatInterface} />
      <Route path="/qumus-chat" component={QumusChatPage} />
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
      <Route path="/rockin-boogie-manager" component={RockinBoogieContentManager} />
      <Route path="/emergency-alerts" component={EmergencyAlertSystem} />
      <Route path="/analytics-reporting" component={AnalyticsReportingDashboard} />
      <Route path="/admin-decisions" component={AdminDecisionDashboard} />
      <Route path="/monitoring" component={PlatformMonitoringDashboard} />
      <Route path="/studio" component={Studio} />
      <Route path="/podcast" component={PodcastPlayer} />
      <Route path="/podcast-discovery" component={PodcastDiscovery} />
      <Route path="/donate" component={DonationCheckout} />
      <Route path="/proof-vault" component={ProofVaultSearch} />
      <Route path="/dashboard" component={ListenerDashboard} />
      <Route path="/preferences" component={UserPreferencesPanel} />
      <Route path="/comprehensive-dashboard" component={ComprehensiveDashboardPage} />
      <Route path="/transcription" component={RealTimeTranscription} />
      <Route path="/location-chat" component={LocationChatRooms} />
      <Route path="/vod-library" component={BroadcastVOD} />
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
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
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
            <AppHeaderEnhanced />
            <Router />
          </TooltipProvider>
        </PresetProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
