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
import { RRBRadioIntegration } from './pages/RRBRadioIntegration';
import { QumusChatInterface } from './components/QumusChatInterface';
import { AppHeader } from './components/AppHeader';
import { AppHeaderEnhanced } from './components/AppHeaderEnhanced';
import { MobileResponsiveLayout } from './components/MobileResponsiveLayout';
import PodcastPage from './pages/PodcastPage';
import ListenerAnalyticsDashboard from './pages/ListenerAnalyticsDashboard';
import SearchResults from './pages/SearchResults';
import { MobileHeaderClean } from './components/MobileHeaderClean';
import { Breadcrumbs } from './components/Breadcrumbs';
import { CanrynDashboard } from './pages/CanrynDashboard';
import { VideoProductionPage } from './pages/VideoProductionPage';
import { MobileBottomNav } from './components/MobileBottomNav';
import NewsletterSignup from '@/components/NewsletterSignup';
import { analytics } from '@/lib/analytics';
import { StudioSuite } from './pages/StudioSuite';
import { MediaLibrary } from './pages/MediaLibrary';
import RadioStation from './pages/RadioStation';
import QumusChatPage from '@/pages/QumusChatPage';
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
import Music from '@/pages/Music';
import Proof from '@/pages/Proof';
import Legacy from '@/pages/Legacy';
import RRBHome from '@/pages/RRBHome';
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
import QumusPort3000 from "@/pages/QumusPort3000";
import RRBPort3001 from "@/pages/RRBPort3001";
import HybridCastPort3002 from "@/pages/HybridCastPort3002";
import RRBMusicStreaming from "@/pages/RRBMusicStreaming";
import RRBLegacySite from "@/pages/RRBLegacySite";
import RRBEcosystemDashboard from "@/pages/RRBEcosystemDashboard";
import SolbonesGame from "@/pages/SolbonesGame";
import SweetMiraclesDonation from "@/pages/SweetMiraclesDonation";
import EcosystemMasterDashboard from "@/pages/EcosystemMasterDashboard";
import AdminControlPanel from "@/pages/AdminControlPanel";
import GrowthCampaigns from "@/pages/GrowthCampaigns";
import CommunityForums from "@/pages/CommunityForums";
import EmergencyDrills from "@/pages/EmergencyDrills";
import DonorGrowthCampaigns from "@/pages/DonorGrowthCampaigns";
import PoliciesControlPage from "@/pages/PoliciesControlPage";
import TaskQueuePage from "@/pages/TaskQueuePage";
import AuditTrailPage from "@/pages/AuditTrailPage";
import CommandCenterPage from "@/pages/CommandCenterPage";
import SystemHealthPage from "@/pages/SystemHealthPage";
import { Toaster } from 'sonner';
import { BreadcrumbNavigation } from '@/components/BreadcrumbNavigation';
import { MobileNavigationDrawer } from '@/components/MobileNavigationDrawer';
import SquaddGoals from '@/pages/SquaddGoals';
import SquaddMemberProfile from '@/pages/SquaddMemberProfile';
import SelmaEvent from '@/pages/SelmaEvent';
import LiveStreamPage from '@/pages/LiveStreamPage';
import InteractiveFlyer from '@/pages/InteractiveFlyer';
import GamesHub from '@/pages/GamesHub';
import WordFrequencyGame from '@/pages/WordFrequencyGame';
import FrequencyMatchGame from '@/pages/FrequencyMatchGame';
import RhythmRootsGame from '@/pages/RhythmRootsGame';
import LaShanna from '@/pages/LaShanna';
import Carlos from '@/pages/Carlos';
import Sean from '@/pages/Sean';
import Tyanna from '@/pages/Tyanna';
import Jaelon from '@/pages/Jaelon';
import { EventBanners } from '@/components/EventBanners';
import ValannaVoiceAssistant from '@/components/ValannaVoiceAssistant';
import SelmaSlideshow from '@/pages/SelmaSlideshow';
import CandyArchive from '@/pages/CandyArchive';
import CandyWhoWasCandy from '@/pages/CandyWhoWasCandy';
import CandyRRBSessions from '@/pages/CandyRRBSessions';
import CandyTimeline from '@/pages/CandyTimeline';
import CandyEvidenceMap from '@/pages/CandyEvidenceMap';
import CandyDocumentary from '@/pages/CandyDocumentary';
import NewsPage from '@/pages/NewsPage';
import FamilyTreePage from '@/pages/FamilyTreePage';
import DocumentationPage from '@/pages/DocumentationPage';
import ContentScheduler from '@/pages/ContentScheduler';
import RRBUpdateDashboard from '@/pages/RRBUpdateDashboard';
import RRBTeamUpdates from '@/pages/RRBTeamUpdates';
import AdManager from '@/pages/AdManager';
import ListenerAnalyticsLive from '@/pages/ListenerAnalyticsLive';
import WebhookManager from '@/pages/WebhookManager';
import StudioControlRoom from '@/pages/StudioControlRoom';
import ConventionHub from '@/pages/ConventionHub';
import { OnboardingTour } from '@/components/OnboardingTour';
import RRBConferenceHub from '@/pages/RRBConferenceHub';
import ConferenceRoom from '@/pages/ConferenceRoom';
import QumusCommandConsole from '@/pages/QumusCommandConsole';
import StreamAnalytics from '@/pages/StreamAnalytics';
import CommercialAnalytics from '@/pages/CommercialAnalytics';
import SocialMediaKit from '@/pages/SocialMediaKit';
import TyBattleProfile from '@/pages/TyBattleProfile';
import ConferenceCalendar from '@/pages/ConferenceCalendar';
import ConferenceAnalytics from '@/pages/ConferenceAnalytics';
import ConferenceRecordings from '@/pages/ConferenceRecordings';
import ConferenceRegister from '@/pages/ConferenceRegister';
import SpeakerProfile from '@/pages/SpeakerProfile';
import ConferenceCheckIn from '@/pages/ConferenceCheckIn';
import ConferenceTranslation from '@/pages/ConferenceTranslation';

// Version: 3.0.0 - Mobile-first header redesign
function Router() {
  // Determine which home page to show based on hostname
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const isRRBDomain = hostname.includes('rockinrockinboogie.com') || hostname.includes('rrb');
  const HomeComponent = isRRBDomain ? RRBHome : Home;
  
  return (
    <>
      <Switch>
      <Route path="/" component={HomeComponent} />
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
      <Route path="/music" component={Music} />
      <Route path="/proof" component={Proof} />
      <Route path="/legacy" component={Legacy} />
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
      <Route path="/rrb-radio" component={RRBRadioIntegration} />
      <Route path="/studio-suite" component={StudioSuite} />
      <Route path="/media-library" component={MediaLibrary} />
      <Route path="/podcasts" component={PodcastPage} />
      <Route path="/listener-analytics" component={ListenerAnalyticsDashboard} />
      <Route path="/search" component={SearchResults} />
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
      <Route path="/studio-controls" component={Studio} />
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
      <Route path="/qumus" component={QumusPort3000} />
      <Route path="/rrb" component={RRBPort3001} />
      <Route path="/legacy" component={RRBLegacySite} />
      <Route path="/ecosystem-dashboard" component={EcosystemMasterDashboard} />
      <Route path="/admin" component={AdminControlPanel} />
      <Route path="/emergency" component={HybridCastPort3002} />
      <Route path="/rrb/broadcast" component={RRBDashboard} />
      <Route path="/rrb/donations" component={SweetMiraclesManager} />
      <Route path="/rrb/listeners" component={RRBListenerAnalytics} />
      <Route path="/rrb/analytics" component={RRBListenerAnalytics} />
      <Route path="/rrb/broadcast-manager" component={RRBBroadcastManager} />
      <Route path="/rrb/sweet-miracles" component={SweetMiraclesManager} />
      <Route path="/growth-campaigns" component={GrowthCampaigns} />
      <Route path="/community-forums" component={CommunityForums} />
      <Route path="/emergency-drills" component={EmergencyDrills} />
      <Route path="/donor-campaigns" component={DonorGrowthCampaigns} />
      <Route path="/policies" component={PoliciesControlPage} />
      <Route path="/tasks" component={TaskQueuePage} />
      <Route path="/audit" component={AuditTrailPage} />
      <Route path="/commands" component={CommandCenterPage} />
      <Route path="/health" component={SystemHealthPage} />
      <Route path="/squadd" component={SquaddGoals} />
      <Route path="/squadd/:slug" component={SquaddMemberProfile} />
      <Route path="/ty-battle" component={TyBattleProfile} />
      <Route path="/selma" component={SelmaEvent} />
      <Route path="/live" component={LiveStreamPage} />
      <Route path="/flyer" component={InteractiveFlyer} />
      <Route path="/games" component={GamesHub} />
      <Route path="/games/word-frequency" component={WordFrequencyGame} />
      <Route path="/games/frequency-match" component={FrequencyMatchGame} />
      <Route path="/games/rhythm-roots" component={RhythmRootsGame} />
      <Route path="/lashanna" component={LaShanna} />
      <Route path="/carlos" component={Carlos} />
      <Route path="/sean" component={Sean} />
      <Route path="/tyanna" component={Tyanna} />
      <Route path="/jaelon" component={Jaelon} />
      <Route path="/selma-slideshow" component={SelmaSlideshow} />
      <Route path="/archive" component={CandyArchive} />
      <Route path="/archive/who-was-candy" component={CandyWhoWasCandy} />
      <Route path="/archive/rrb-sessions" component={CandyRRBSessions} />
      <Route path="/archive/timeline" component={CandyTimeline} />
      <Route path="/archive/evidence-map" component={CandyEvidenceMap} />
      <Route path="/archive/documentary" component={CandyDocumentary} />
      <Route path="/news" component={NewsPage} />
      <Route path="/family" component={FamilyTreePage} />
      <Route path="/docs" component={DocumentationPage} />
      <Route path="/scheduler" component={ContentScheduler} />
      <Route path="/rrb-update" component={RRBUpdateDashboard} />
      <Route path="/rrb-team-updates" component={RRBTeamUpdates} />
      <Route path="/ad-manager" component={AdManager} />
      <Route path="/listener-analytics-live" component={ListenerAnalyticsLive} />
      <Route path="/webhook-manager" component={WebhookManager} />
      <Route path="/studio" component={StudioControlRoom} />
      <Route path="/convention-hub" component={ConventionHub} />
      <Route path="/conference/room/:id" component={ConferenceRoom} />
      <Route path="/conference/calendar" component={ConferenceCalendar} />
      <Route path="/conference/analytics" component={ConferenceAnalytics} />
      <Route path="/conference/recordings" component={ConferenceRecordings} />
      <Route path="/conference/register/:id" component={ConferenceRegister} />
      <Route path="/conference/checkin/:id" component={ConferenceCheckIn} />
      <Route path="/conference/translation/:id" component={ConferenceTranslation} />
      <Route path="/conference/speaker/:id" component={SpeakerProfile} />
      <Route path="/conference" component={RRBConferenceHub} />
      <Route path="/command-console" component={QumusCommandConsole} />
      <Route path="/stream-analytics" component={StreamAnalytics} />
      <Route path="/commercial-analytics" component={CommercialAnalytics} />
      <Route path="/social-media-kit" component={SocialMediaKit} />
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
      // Store token in localStorage as fallback session (must match useAuth key)
      localStorage.setItem('session_token', token);
      localStorage.setItem('qumus_session_token', token);
      // Set token expiry (24 hours) so useAuth doesn't clear it
      const expiresAt = new Date().getTime() + 24 * 60 * 60 * 1000;
      localStorage.setItem('session_token_expires', expiresAt.toString());
      // Remove token from URL to clean up address bar
      window.history.replaceState({}, document.title, window.location.pathname);
      console.log('[App] OAuth token stored in localStorage');
    }
  }, []);

  // Check if we're on the slideshow page - render without any site chrome
  const isSlideshow = typeof window !== 'undefined' && window.location.pathname === '/selma-slideshow';

  if (isSlideshow) {
    return (
      <ErrorBoundary>
        <SelmaSlideshow />
      </ErrorBoundary>
    );
  }

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
            
            {/* Event Banners - positioned below fixed header */}
            <div className="pt-16">
              <EventBanners />
            </div>
            
            {/* Main Content */}
            <MobileResponsiveLayout>
              <Router />
            </MobileResponsiveLayout>
            
            {/* Mobile Bottom Navigation */}
            <MobileBottomNav />
            
            {/* Valanna - QUMUS AI Brain Voice Assistant */}
            <ValannaVoiceAssistant />
            
            {/* Getting Started Onboarding Tour */}
            <OnboardingTour />
          </TooltipProvider>
        </PresetProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
