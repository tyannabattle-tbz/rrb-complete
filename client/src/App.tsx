import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { PresetProvider } from "./contexts/PresetContext";
import { AudioProvider } from "./contexts/AudioContext";
import { GlobalAudioPlayer } from "./components/GlobalAudioPlayer";
import Home from "./pages/Home";
import { VideoPodcastDiscovery } from './pages/VideoPodcastDiscovery';
import { VideoPodcastPlayer } from './components/VideoPodcastPlayer';
import { WebRTCCallIn } from './components/WebRTCCallIn';
import AgentDashboard from "./pages/AgentDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import { AdminAnalyticsDashboard } from "./pages/AdminAnalyticsDashboard";
import { SettingsPanel } from "./pages/SettingsPanel";
import { APIDocumentation } from "./pages/APIDocumentation";
import { TeamManagement } from "./pages/TeamManagement";
import { KeyboardShortcutsGuide } from "./components/KeyboardShortcutsGuide";
import WebhookMarketplace from "./pages/WebhookMarketplace";
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';
import { ModerationQueue } from '@/components/ModerationQueue';
import { NotificationPreferences } from '@/components/NotificationPreferences';
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
import { UnifiedMobileSidebar } from './components/UnifiedMobileSidebar';
import { useSwipeGesture } from './hooks/useSwipeGesture';
import { usePostAuthRedirect } from './_core/hooks/usePostAuthRedirect';
import NewsletterSignup from '@/components/NewsletterSignup';
import { analytics } from '@/lib/analytics';
import QumusChatPage from '@/pages/QumusChatPage';
// Consolidated RadioStation import removed - using RRB version
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
// Removed duplicate - using RRB version instead
import DonationSuccess from '@/pages/DonationSuccess';
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
import SolbonesClassic from '@/pages/SolbonesClassic';
import SolbonesOnline from '@/pages/SolbonesOnline';
import SolbonesTournament from '@/pages/SolbonesTournament';
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
import { Toaster } from 'sonner';
import BroadcastControlDashboard from '@/pages/BroadcastControlDashboard';
import ContentScheduler from '@/pages/ContentScheduler';
import ModeratorTraining from '@/pages/ModeratorTraining';
import HealthMonitoringDashboard from '@/pages/HealthMonitoringDashboard';
import ScenarioPlanner from '@/pages/ScenarioPlanner';
import { BroadcastHub } from '@/pages/BroadcastHub';
import SquaddBroadcast from '@/pages/SquaddBroadcast';
import SolbonesBroadcast from '@/pages/SolbonesBroadcast';
import { AdminRoleManagement } from '@/pages/AdminRoleManagement';
import BroadcasterOnboarding from '@/pages/BroadcasterOnboarding';
import { SquaddStrategySession } from '@/components/SquaddStrategySession';


// ===== RRB (Rockin Rockin Boogie) Integrated Pages =====
import RRBHome from '@/pages/rrb/Home';
import RadioStationFixed from '@/pages/rrb/RadioStationFixed';
import DJControlPanelEnhanced from '@/pages/rrb/DJControlPanelEnhanced';
import ShowScheduleCalendar from '@/pages/rrb/ShowScheduleCalendar';
import AIAssistants from '@/pages/rrb/AIAssistants';
import RSSSubscribe from '@/pages/rrb/RSSSubscribe';
import RRBPodcasts from '@/pages/rrb/Podcasts';
import RRBBroadcast from '@/pages/rrb/Broadcast';
import RRBRSSFeedGenerator from '@/pages/rrb/RSSFeedGenerator';
import CallInFeature from '@/pages/rrb/CallInFeature';
import EpisodeTranscripts from '@/pages/rrb/EpisodeTranscripts';
import ListenerAnalytics from '@/pages/rrb/ListenerAnalytics';
import LiveStreamIntegration from '@/pages/rrb/LiveStreamIntegration';
import ListenerNotifications from '@/pages/rrb/ListenerNotifications';
import MerchandiseStore from '@/pages/rrb/MerchandiseStore';
import UnWcsEvent from '@/pages/UnWcsEvent';
import VirtualPanelModerator from '@/pages/VirtualPanelModerator';
import ModeratorDashboard from '@/pages/ModeratorDashboard';
import BroadcastViewer from '@/pages/BroadcastViewer';
import UnWcsStatusDashboard from '@/pages/UnWcsStatusDashboard';
import SimpleBroadcastViewer from '@/pages/SimpleBroadcastViewer';
import SimpleModeratorPanel from '@/pages/SimpleModeratorPanel';
import SimpleSetupWizard from '@/pages/SimpleSetupWizard';
import RRBAdminDashboard from '@/pages/rrb/AdminDashboard';
import RealtimeCollaboration from '@/pages/rrb/RealtimeCollaboration';
import MobileApp from '@/pages/rrb/MobileApp';
import DonationCheckout from '@/pages/rrb/DonationCheckout';
import { PodcastFeeds } from '@/pages/rrb/PodcastFeeds';
import { ChannelDiscovery } from '@/pages/rrb/ChannelDiscovery';
import RealtimeAnalyticsDashboard from '@/pages/rrb/RealtimeAnalyticsDashboard';
import { DonationCheckout as LegacyDonationCheckout } from '@/pages/DonationCheckout';
import LivePodcastProduction from '@/pages/LivePodcastProduction';
import RRBTheMusic from '@/pages/rrb/TheMusic';
import RRBTheLegacyPage from '@/pages/rrb/TheLegacyPage';
import RRBSweetMiraclesCompanyPage from '@/pages/rrb/SweetMiraclesCompanyPage';
import RRBBroadcastControlPanel from '@/pages/rrb/BroadcastControlPanel';
import RRBEcosystemDashboard from '@/pages/rrb/EcosystemDashboard';
import RRBIntelligenceDashboard from '@/pages/rrb/IntelligenceDashboard';
import RRBRoyaltyTracker from '@/pages/rrb/RoyaltyTracker';
import RRBEntertainmentMonitoringDashboard from '@/pages/rrb/EntertainmentMonitoringDashboard';
import RRBQumusMonitoringDashboard from '@/pages/rrb/QumusMonitoringDashboard';
import RRBQumusHumanReviewDashboard from '@/pages/rrb/QumusHumanReviewDashboard';
import RRBQumusAdminDashboard from '@/pages/rrb/QumusAdminDashboard';
import RRBQumusPolicyAnalyticsDashboard from '@/pages/rrb/QumusPolicyAnalyticsDashboard';
import CodeMaintenanceDashboard from '@/pages/rrb/CodeMaintenanceDashboard';
import PerformanceMonitoringDashboard from '@/pages/rrb/PerformanceMonitoringDashboard';
import ContentArchivalDashboard from '@/pages/rrb/ContentArchivalDashboard';
import RoyaltyAuditDashboard from '@/pages/rrb/RoyaltyAuditDashboard';
import CommunityEngagementDashboard from '@/pages/rrb/CommunityEngagementDashboard';
import AIContentDashboard from '@/pages/rrb/AIContentDashboard';
import RRBQumusBroadcastAdminDashboard from '@/pages/rrb/QumusBroadcastAdminDashboard';
import RRBAgentNetworkDashboard from '@/pages/rrb/AgentNetworkDashboard';
import RRBStateOfTheStudio from '@/pages/rrb/StateOfTheStudio';
import RRBQumusCommandConsole from '@/pages/rrb/QumusCommandConsole';
import RRBSweetMiraclesFundraising from '@/pages/rrb/SweetMiraclesFundraising';
import RRBContact from '@/pages/rrb/Contact';
import RRBComingSoon from '@/pages/rrb/ComingSoon';
import RRBGrandmaHelen from '@/pages/rrb/GrandmaHelen';
import SeabrunWhitneyHunterSr from '@/pages/rrb/SeabrunWhitneyHunterSr';
import FamilyTreeVisualization from '@/pages/rrb/FamilyTreeVisualization';
import RRBProofVault from '@/pages/rrb/ProofVault';
import RRBSystematicOmission from '@/pages/rrb/SystematicOmission';
import RRBFamilyTree from '@/pages/rrb/FamilyTree';
import RRBCandyThroughTheYears from '@/pages/rrb/CandyThroughTheYears';
import RRBObituary from '@/pages/rrb/Obituary';
import RRBLittleRichardConnection from '@/pages/rrb/LittleRichardConnection';
import RRBPoetryHour from '@/pages/rrb/PoetryHour';
import RRBVerifiedSources from '@/pages/rrb/VerifiedSources';
import RRBBooksAndMiracles from '@/pages/rrb/BooksAndMiracles';
import RRBBooks from '@/pages/rrb/Books';
import RRBPhotoGallery from '@/pages/rrb/PhotoGallery';
import RRBTestimonialsAndStories from '@/pages/rrb/TestimonialsAndStories';
import RRBProducerMentor from '@/pages/rrb/ProducerMentor';
import RRBMedicalJourney from '@/pages/rrb/MedicalJourney';
import RRBFamilyAchievements from '@/pages/rrb/FamilyAchievements';
import RRBFAQ from '@/pages/rrb/FAQ';
import RRBNews from '@/pages/rrb/News';
import RRBHealingMusicFrequencies from '@/pages/rrb/HealingMusicFrequencies';
import RRBFrequencyGuides from '@/pages/rrb/FrequencyGuides';
import RRBMeditationGuides from '@/pages/rrb/MeditationGuides';
import RRBCustomMeditationBuilder from '@/pages/rrb/CustomMeditationBuilder';
import RRBHybridCastPage from '@/pages/rrb/HybridCastPage';
import RRBAudiobooks from '@/pages/rrb/Audiobooks';
import RRBConcertsToursPerformances from '@/pages/rrb/ConcertsToursPerformances';
import RRBTourSchedule from '@/pages/rrb/TourSchedule';
import RRBSetlistArchive from '@/pages/rrb/SetlistArchive';
import RRBMediaHub from '@/pages/rrb/MediaHub';
import RRBDivisions from '@/pages/rrb/Divisions';
import RRBBusinessPartnerships from '@/pages/rrb/BusinessPartnerships';
import RRBEmployeeDirectory from '@/pages/rrb/EmployeeDirectory';
import RRBContactDirectory from '@/pages/rrb/ContactDirectory';
import RRBMerchandiseShop from '@/pages/rrb/MerchandiseShop';
import RRBSponsorships from '@/pages/rrb/Sponsorships';
import RRBAffiliateProgram from '@/pages/rrb/AffiliateProgram';
import RRBVideoTestimonials from '@/pages/rrb/VideoTestimonials';
import RRBNavigation from '@/components/rrb/Navigation';
import { LegalFooter as RRBLegalFooter } from '@/components/rrb/LegalFooter';
import RRBFamilyLegacy from '@/pages/rrb/FamilyLegacy';
import AnnasPromotions from '@/pages/rrb/AnnasPromotions';
import CanrynPublishingDivision from '@/pages/rrb/CanrynPublishingDivision';
import SeashaDivision from '@/pages/rrb/SeashaDivision';
import SeansMusicalWorld from '@/pages/rrb/SeansMusicalWorld';
import LittleCRecordingCo from '@/pages/rrb/LittleCRecordingCo';
import RRBSeansMusic from '@/pages/rrb/SeansMusic';
import RRBAnnas from '@/pages/rrb/Annas';
import RRBJaelonEnterprises from '@/pages/rrb/JaelonEnterprises';
import RRBLittleC from '@/pages/rrb/LittleC';
import { ChannelDiscovery as RRBChannelDiscovery } from '@/pages/rrb/ChannelDiscovery';

// Business Operations Pages
import BusinessBookkeeping from '@/pages/rrb/BusinessBookkeeping';
import BusinessHR from '@/pages/rrb/BusinessHR';
import BusinessAccounting from '@/pages/rrb/BusinessAccounting';
import BusinessLegal from '@/pages/rrb/BusinessLegal';
import RadioDirectory from '@/pages/rrb/RadioDirectory';
import AIBotCommandCenter from '@/pages/rrb/AIBotCommandCenter';
import CommercialManager from '@/pages/rrb/CommercialManager';
import AdvertisingServices from '@/pages/rrb/AdvertisingServices';

// Version: 6.3.0 - RRB fully integrated, radio streaming, swipe gestures
function Router() {
  return (
    <>
      <Breadcrumbs />
      <Switch>
      <Route path="/" component={RRBHome} />
      <Route path="/qumus" component={Home} />
      <Route path="/agent" component={AgentDashboard} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/analytics" component={AdminAnalyticsDashboard} />
      <Route path="/video-podcasts" component={VideoPodcastDiscovery} />
      <Route path="/videos/:id" component={() => <VideoPodcastPlayer videoId="test" title="Episode" duration={3600} />} />
      <Route path="/call-in" component={() => <WebRTCCallIn channelId="ch-001" />} />
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
      {/* Consolidated into /rrb/radio-station */}
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
      <Route path="/donate" component={LegacyDonationCheckout} />
      <Route path="/donation-success" component={DonationSuccess} />
      <Route path="/proof-vault" component={ProofVaultSearch} />
      <Route path="/dashboard" component={ListenerDashboard} />
      <Route path="/comprehensive-dashboard" component={ComprehensiveDashboardPage} />

      <Route path="/collaboration" component={CollaborationPage} />
      <Route path="/gps-radar" component={GPSRadarMapPage} />
      <Route path="/broadcast-admin" component={EmergencyBroadcastAdminPanel} />
      <Route path="/broadcast-scheduler" component={BroadcastScheduler} />
      <Route path="/content-scheduler" component={ContentScheduler} />
      <Route path="/listener-analytics" component={ListenerAnalytics} />
      <Route path="/audit-log" component={AuditLogViewer} />
      <Route path="/hybridcast-hub" component={HybridCastHub} />
      <Route path="/hybridcast-analytics" component={HybridCastAnalyticsDashboard} />
      <Route path="/hybridcast" component={HybridCastIntegration} />
      <Route path="/hybridcast-notifications" component={HybridCastNotificationCenter} />
      <Route path="/broadcast-templates" component={BroadcastTemplatesLibrary} />
      <Route path="/user-preferences" component={UserPreferences} />
      <Route path="/webhooks" component={WebhookManagement} />
      <Route path="/meditation" component={MeditationHub} />
      <Route path="/sweet-miracles" component={LegacyDonationCheckout} />
      <Route path="/solbones" component={Solbones} />
      <Route path="/solbones-classic" component={SolbonesClassic} />
      <Route path="/solbones-online" component={SolbonesOnline} />
      <Route path="/solbones-tournament" component={SolbonesTournament} />
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

      {/* ===== RRB (Rockin Rockin Boogie) Routes ===== */}
      <Route path="/rrb" component={RRBHome} /> {/* Keep /rrb as alias */}
      <Route path="/rrb/contact" component={RRBContact} />
      
      {/* RRB QUMUS Autonomous Orchestration */}
      <Route path="/rrb/qumus/monitoring" component={RRBQumusMonitoringDashboard} />
      <Route path="/rrb/qumus/human-review" component={RRBQumusHumanReviewDashboard} />
      <Route path="/rrb/qumus/admin" component={RRBQumusAdminDashboard} />
      <Route path="/rrb/qumus/analytics" component={RRBQumusPolicyAnalyticsDashboard} />
      <Route path="/rrb/qumus/code-maintenance" component={CodeMaintenanceDashboard} />
      <Route path="/code-maintenance" component={CodeMaintenanceDashboard} />
      <Route path="/rrb/qumus/performance-monitoring" component={PerformanceMonitoringDashboard} />
      <Route path="/performance-monitoring" component={PerformanceMonitoringDashboard} />
      <Route path="/rrb/qumus/content-archival" component={ContentArchivalDashboard} />
      <Route path="/content-archival" component={ContentArchivalDashboard} />
      <Route path="/rrb/qumus/royalty-audit" component={RoyaltyAuditDashboard} />
      <Route path="/royalty-audit" component={RoyaltyAuditDashboard} />
      <Route path="/rrb/qumus/community-engagement" component={CommunityEngagementDashboard} />
      <Route path="/community-engagement" component={CommunityEngagementDashboard} />
      <Route path="/rrb/qumus/ai-content" component={AIContentDashboard} />
      <Route path="/ai-content" component={AIContentDashboard} />
      <Route path="/rrb/qumus/agent-network" component={RRBAgentNetworkDashboard} />
      <Route path="/rrb/qumus/state-of-the-studio" component={RRBStateOfTheStudio} />
      <Route path="/rrb/state-of-the-studio" component={RRBStateOfTheStudio} />
      <Route path="/rrb/qumus/command-console" component={RRBQumusCommandConsole} />
      <Route path="/rrb/sweet-miracles/fundraising" component={RRBSweetMiraclesFundraising} />
      
      {/* RRB QUMUS Broadcast Orchestration */}
      <Route path="/rrb/broadcast/admin" component={RRBQumusBroadcastAdminDashboard} />
      <Route path="/rrb/broadcast/control" component={RRBBroadcastControlPanel} />
      
      {/* RRB Entertainment Platform */}
      <Route path="/rrb/entertainment/dashboard" component={RRBEntertainmentMonitoringDashboard} />
      
      {/* RRB Unified Ecosystem Dashboard */}
      <Route path="/rrb/ecosystem/dashboard" component={RRBEcosystemDashboard} />
      <Route path="/rrb/intelligence" component={RRBIntelligenceDashboard} />
      <Route path="/rrb/royalties" component={RRBRoyaltyTracker} />
      
      {/* RRB Legacy Foundation Pages */}
      <Route path="/rrb/the-legacy" component={RRBTheLegacyPage} />
      <Route path="/rrb/the-music" component={RRBTheMusic} />
      <Route path="/rrb/little-richard-connection" component={RRBLittleRichardConnection} />
      <Route path="/rrb/family-achievements" component={RRBFamilyAchievements} />
      <Route path="/rrb/family-legacy" component={RRBFamilyLegacy} />
      <Route path="/rrb/seans-music" component={RRBSeansMusic} />
      <Route path="/rrb/annas" component={RRBAnnas} />
      <Route path="/rrb/jaelon-enterprises" component={RRBJaelonEnterprises} />
      <Route path="/rrb/little-c" component={RRBLittleC} />
      <Route path="/rrb/grandma-helen" component={RRBGrandmaHelen} />
      <Route path="/rrb/seabrun-whitney-hunter-sr" component={SeabrunWhitneyHunterSr} />
      <Route path="/rrb/family-tree-visualization" component={FamilyTreeVisualization} />
      <Route path="/rrb/verified-sources" component={RRBVerifiedSources} />
      
      {/* RRB Legacy Restored Pages */}
      <Route path="/rrb/ai-assistants" component={AIAssistants} />
      <Route path="/ai-assistants" component={AIAssistants} />
      <Route path="/rrb/rss" component={RSSSubscribe} />
      <Route path="/rss" component={RSSSubscribe} />
      <Route path="/rrb/radio-station" component={RadioStationFixed} />
      <Route path="/rrb/dj-control" component={DJControlPanelEnhanced} />
      <Route path="/rrb/schedule" component={ShowScheduleCalendar} />
      <Route path="/rrb/podcast-feeds" component={PodcastFeeds} />
      <Route path="/rrb/realtime-analytics" component={RealtimeAnalyticsDashboard} />
      <Route path="/rrb/discover" component={ChannelDiscovery} />
      <Route path="/discover" component={ChannelDiscovery} />
      <Route path="/rrb/poetry-hour" component={RRBPoetryHour} />
      <Route path="/rrb/podcast-and-video" component={RRBPodcasts} />
      <Route path="/rrb/podcasts" component={RRBPodcasts} />
      <Route path="/rrb/broadcast" component={RRBBroadcast} />
      <Route path="/rrb/rss-feeds" component={RRBRSSFeedGenerator} />
      <Route path="/rrb/call-in" component={CallInFeature} />
      <Route path="/rrb/transcripts" component={EpisodeTranscripts} />
      <Route path="/rrb/analytics" component={ListenerAnalytics} />
      <Route path="/rrb/live-stream" component={LiveStreamIntegration} />
      <Route path="/rrb/notifications" component={ListenerNotifications} />
      <Route path="/rrb/merchandise" component={MerchandiseStore} />
      <Route path="/un-wcs-event" component={UnWcsEvent} />
      <Route path="/un-wcs-status" component={UnWcsStatusDashboard} />
      <Route path="/moderator-dashboard" component={ModeratorDashboard} />
      <Route path="/broadcast-viewer" component={BroadcastViewer} />
      <Route path="/broadcast-control" component={BroadcastControlDashboard} />
      <Route path="/moderator-training" component={ModeratorTraining} />
      <Route path="/health-monitoring" component={HealthMonitoringDashboard} />
      <Route path="/scenario-planner" component={ScenarioPlanner} />
      <Route path="/virtual-panel" component={VirtualPanelModerator} />
      <Route path="/simple-broadcast" component={SimpleBroadcastViewer} />
      <Route path="/simple-moderator" component={SimpleModeratorPanel} />
      <Route path="/setup-wizard" component={SimpleSetupWizard} />
      <Route path="/broadcast-hub" component={BroadcastHub} />
      <Route path="/squadd" component={SquaddBroadcast} />
      <Route path="/solbones" component={SolbonesBroadcast} />
      <Route path="/broadcaster/onboarding" component={BroadcasterOnboarding} />
      <Route path="/squadd/strategy-session" component={SquaddStrategySession} />
      <Route path="/admin/roles" component={AdminRoleManagement} />
      <Route path="/rrb/admin" component={RRBAdminDashboard} />
      <Route path="/rrb/collaboration" component={RealtimeCollaboration} />
      <Route path="/rrb/mobile" component={MobileApp} />
      <Route path="/rrb/donate" component={DonationCheckout} />
      <Route path="/live-podcast-production" component={LivePodcastProduction} />
      <Route path="/rrb/hybridcast" component={RRBHybridCastPage} />
      <Route path="/rrb/audiobooks" component={RRBAudiobooks} />
      <Route path="/rrb/proof-vault" component={RRBProofVault} />
      <Route path="/rrb/obituary" component={RRBObituary} />
      <Route path="/rrb/books-and-miracles" component={RRBBooksAndMiracles} />
      <Route path="/rrb/books" component={RRBBooks} />
      <Route path="/books" component={RRBBooks} />
      <Route path="/rrb/systematic-omission" component={RRBSystematicOmission} />
      <Route path="/rrb/candy-through-the-years" component={RRBCandyThroughTheYears} />
      <Route path="/rrb/photo-gallery" component={RRBPhotoGallery} />
      <Route path="/photo-gallery" component={RRBPhotoGallery} />
      <Route path="/rrb/family-tree" component={RRBFamilyTree} />
      <Route path="/rrb/testimonials-and-stories" component={RRBTestimonialsAndStories} />
      <Route path="/rrb/producer-mentor" component={RRBProducerMentor} />
      <Route path="/rrb/medical-journey" component={RRBMedicalJourney} />
      
      {/* RRB Legacy Continued Pages */}
      <Route path="/rrb/canryn-production" component={RRBSweetMiraclesCompanyPage} />
      <Route path="/rrb/divisions" component={RRBDivisions} />
      <Route path="/rrb/business-partnerships" component={RRBBusinessPartnerships} />
      <Route path="/rrb/employee-directory" component={RRBEmployeeDirectory} />
      <Route path="/rrb/contact-directory" component={RRBContactDirectory} />
      <Route path="/rrb/merchandise-shop" component={RRBMerchandiseShop} />
      <Route path="/rrb/sponsorships" component={RRBSponsorships} />
      <Route path="/rrb/affiliate-program" component={RRBAffiliateProgram} />
      <Route path="/rrb/video-testimonials" component={RRBVideoTestimonials} />
      <Route path="/rrb/news" component={RRBNews} />
      
      {/* RRB Additional Pages */}
      <Route path="/rrb/healing-music-frequencies" component={RRBHealingMusicFrequencies} />
      <Route path="/rrb/frequency-guides" component={RRBFrequencyGuides} />
      <Route path="/rrb/meditation-guides" component={RRBMeditationGuides} />
      <Route path="/rrb/custom-meditation-builder" component={RRBCustomMeditationBuilder} />
      <Route path="/rrb/concerts-tours-performances" component={RRBConcertsToursPerformances} />
      <Route path="/rrb/tour-schedule" component={RRBTourSchedule} />
      <Route path="/rrb/setlist-archive" component={RRBSetlistArchive} />
      <Route path="/rrb/media-hub" component={RRBMediaHub} />
      <Route path="/rrb/faq" component={RRBFAQ} />
      <Route path="/rrb/annas-promotions" component={AnnasPromotions} />
      <Route path="/rrb/canryn-publishing" component={CanrynPublishingDivision} />
      <Route path="/rrb/seasha-distribution" component={SeashaDivision} />
      <Route path="/rrb/seans-music-world" component={SeansMusicalWorld} />
      <Route path="/rrb/little-c-recording" component={LittleCRecordingCo} />

      {/* ===== Business Operations (Offline-First) ===== */}
      <Route path="/rrb/bookkeeping" component={BusinessBookkeeping} />
      <Route path="/rrb/hr" component={BusinessHR} />
      <Route path="/rrb/accounting" component={BusinessAccounting} />
      <Route path="/rrb/legal" component={BusinessLegal} />
      <Route path="/rrb/radio-directory" component={RadioDirectory} />
      <Route path="/rrb/ai-command-center" component={AIBotCommandCenter} />
      <Route path="/rrb/commercials" component={CommercialManager} />
      <Route path="/rrb/advertising" component={AdvertisingServices} />
      {/* Aliases for direct access */}
      <Route path="/bookkeeping" component={BusinessBookkeeping} />
      <Route path="/hr" component={BusinessHR} />
      <Route path="/accounting" component={BusinessAccounting} />
      <Route path="/legal" component={BusinessLegal} />
      <Route path="/radio-directory" component={RadioDirectory} />

      <Route path="/analytics" component={AnalyticsDashboard} />
      <Route path="/moderation" component={ModerationQueue} />
      <Route path="/notification-preferences" component={NotificationPreferences} />
      <Route component={NotFound} />
    </Switch>
    </>
  );
}

function SwipeHandler() {
  // Swipe right from left edge opens sidebar, swipe left closes it
  useSwipeGesture({
    onSwipeRight: () => {
      window.dispatchEvent(new CustomEvent('mobileMenuToggle', { detail: { open: true } }));
    },
    onSwipeLeft: () => {
      window.dispatchEvent(new CustomEvent('mobileMenuToggle', { detail: { open: false } }));
      window.dispatchEvent(new Event('closeMobileMenu'));
    },
  });
  return null;
}

function PostAuthRedirectHandler() {
  // Handle redirect to intended destination after OAuth login
  usePostAuthRedirect();
  return null;
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        switchable
      >
        <PresetProvider>
          <AudioProvider>
            <TooltipProvider>
              <Toaster />
              <KeyboardShortcutsGuide />
              <SwipeHandler />
              <PostAuthRedirectHandler />
              
              {/* Full-height flex layout for mobile */}
              <div className="flex flex-col h-screen md:h-auto md:min-h-screen">
                {/* Mobile Header - shown only on mobile */}
                <div className="md:hidden flex-shrink-0">
                  <MobileHeaderClean />
                </div>
                
                {/* Desktop Header - shown only on desktop */}
                <div className="hidden md:block flex-shrink-0">
                  <AppHeaderEnhanced />
                </div>
                
                {/* Unified Mobile Sidebar - overlays when hamburger is clicked */}
                <UnifiedMobileSidebar />
                
                {/* Main Content - fills remaining space */}
                <div className="flex-1 overflow-hidden">
                  <MobileResponsiveLayout>
                    <Router />
                  </MobileResponsiveLayout>
                </div>
                
                {/* Mobile Bottom Navigation - fixed at bottom */}
                <div className="flex-shrink-0">
                  <MobileBottomNav />
                </div>
              </div>

              {/* Global Audio Player — persists across all pages */}
              <GlobalAudioPlayer />
            </TooltipProvider>
          </AudioProvider>
        </PresetProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
