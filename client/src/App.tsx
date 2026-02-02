import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
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
      <Route path="/profile/:userId" component={(props) => <UserProfile userId={props.userId} />} />
      <Route path="/community" component={Community} />
      <Route path="/creator-onboarding" component={CreatorOnboarding} />
      <Route path="/analytics" component={VideoAnalytics} />
      <Route path="/search" component={VideoSearch} />
      <Route path="/collaborate" component={CollaborativeEditor} />
      <Route path="/404" component={NotFound} />
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
        <TooltipProvider>
          <Toaster />
          <KeyboardShortcutsGuide />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
