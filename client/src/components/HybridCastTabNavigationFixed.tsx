import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Radio,
  Network,
  Radio as RadioIcon,
  MapPin,
  Cloud,
  Wifi,
  MessageSquare,
  AlertTriangle,
  Heart,
  Lock,
  Settings,
  Users,
  FileText,
  Share2,
  Download,
  Eye,
  BarChart3,
  Bell,
  Zap,
  Smartphone,
  Layers,
  Signal,
  History,
  Volume2,
  Accessibility,
  Volume,
  Headphones,
  CheckCircle,
  HardDrive,
  Radar,
  Brain,
  Code,
  Github,
  Info,
  Users2,
  AlertCircle,
  BookOpen,
  Smartphone as Mobile,
  TrendingUp,
  Grid3x3,
  Waves,
  Lightbulb,
  Clock,
  Shield,
} from 'lucide-react';

interface TabItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  category: 'network' | 'communication' | 'emergency' | 'health' | 'security' | 'accessibility' | 'operations';
  description: string;
  route?: string;
}

const TABS: TabItem[] = [
  // Network
  { id: 'net', label: 'NET', icon: <Network className="w-4 h-4" />, category: 'network', description: 'Network Status', route: '/monitoring' },
  { id: 'topo', label: 'TOPO', icon: <Grid3x3 className="w-4 h-4" />, category: 'network', description: 'Network Topology', route: '/hybridcast-hub' },
  { id: 'gps', label: 'GPS', icon: <MapPin className="w-4 h-4" />, category: 'network', description: 'GPS Tracking', route: '/gps-radar' },
  { id: 'geo', label: 'GEO', icon: <Layers className="w-4 h-4" />, category: 'network', description: 'Geolocation', route: '/location-chat' },
  { id: 'wx', label: 'WX', icon: <Cloud className="w-4 h-4" />, category: 'network', description: 'Weather', route: '/monitoring' },
  { id: 'mesh', label: 'MESH', icon: <Wifi className="w-4 h-4" />, category: 'network', description: 'Mesh Network', route: '/hybridcast-hub' },

  // Communication
  { id: 'ptt', label: 'PTT', icon: <RadioIcon className="w-4 h-4" />, category: 'communication', description: 'Push-to-Talk', route: '/location-chat' },
  { id: 'live', label: 'LIVE', icon: <Radio className="w-4 h-4" />, category: 'communication', description: 'Live Broadcast', route: '/broadcast-admin' },
  { id: 'audio', label: 'AUDIO', icon: <Volume2 className="w-4 h-4" />, category: 'communication', description: 'Audio Control', route: '/podcast-discovery' },
  { id: 'chat', label: 'CHAT', icon: <MessageSquare className="w-4 h-4" />, category: 'communication', description: 'Chat', route: '/location-chat' },
  { id: 'thrd', label: 'THRD', icon: <MessageSquare className="w-4 h-4" />, category: 'communication', description: 'Threads', route: '/location-chat' },
  { id: 'files', label: 'FILES', icon: <FileText className="w-4 h-4" />, category: 'communication', description: 'File Sharing', route: '/broadcast-admin' },
  { id: 'share', label: 'SHARE', icon: <Share2 className="w-4 h-4" />, category: 'communication', description: 'Share', route: '/broadcast-admin' },

  // Emergency
  { id: 'alert', label: 'ALERT', icon: <AlertTriangle className="w-4 h-4" />, category: 'emergency', description: 'Alerts', route: '/broadcast-admin' },
  { id: 'sync', label: 'SYNC', icon: <Zap className="w-4 h-4" />, category: 'emergency', description: 'Sync', route: '/broadcast-admin' },
  { id: 'usb', label: 'USB', icon: <HardDrive className="w-4 h-4" />, category: 'emergency', description: 'USB', route: '/broadcast-admin' },
  { id: 'roles', label: 'ROLES', icon: <Users2 className="w-4 h-4" />, category: 'emergency', description: 'Roles', route: '/collaboration' },

  // Health & Monitoring
  { id: 'health', label: 'HEALTH', icon: <Heart className="w-4 h-4" />, category: 'health', description: 'System Health', route: '/service-health' },
  { id: 'aimon', label: 'AI MON', icon: <Brain className="w-4 h-4" />, category: 'health', description: 'AI Monitor', route: '/qumus-dashboard' },
  { id: 'aichat', label: 'AI CHAT', icon: <Brain className="w-4 h-4" />, category: 'health', description: 'AI Chat', route: '/enhanced-chat' },
  { id: 'aimsg', label: 'AI MSG', icon: <Brain className="w-4 h-4" />, category: 'health', description: 'AI Messages', route: '/qumus-chat' },
  { id: 'triage', label: 'TRIAGE', icon: <AlertCircle className="w-4 h-4" />, category: 'health', description: 'Triage', route: '/broadcast-admin' },

  // Security
  { id: 'crypto', label: 'CRYPTO', icon: <Lock className="w-4 h-4" />, category: 'security', description: 'Encryption', route: '/user-preferences' },
  { id: 'tmplt', label: 'TMPLT', icon: <FileText className="w-4 h-4" />, category: 'security', description: 'Templates', route: '/broadcast-scheduler' },
  { id: 'sched', label: 'SCHED', icon: <Clock className="w-4 h-4" />, category: 'security', description: 'Schedule', route: '/broadcast-scheduler' },
  { id: 'setup', label: 'SETUP', icon: <Settings className="w-4 h-4" />, category: 'security', description: 'Setup', route: '/user-preferences' },

  // Operations
  { id: 'drill', label: 'DRILL', icon: <Lightbulb className="w-4 h-4" />, category: 'operations', description: 'Drills', route: '/broadcast-admin' },
  { id: 'github', label: 'GITHUB', icon: <Github className="w-4 h-4" />, category: 'operations', description: 'GitHub', route: '/broadcast-admin' },
  { id: 'about', label: 'ABOUT', icon: <Info className="w-4 h-4" />, category: 'operations', description: 'About', route: '/' },
  { id: 'team', label: 'TEAM', icon: <Users className="w-4 h-4" />, category: 'operations', description: 'Team', route: '/collaboration' },
  { id: 'alerts', label: 'ALERTS', icon: <Bell className="w-4 h-4" />, category: 'operations', description: 'Alerts', route: '/broadcast-admin' },
  { id: 'train', label: 'TRAIN', icon: <BookOpen className="w-4 h-4" />, category: 'operations', description: 'Training', route: '/podcast-discovery' },
  { id: 'sms', label: 'SMS', icon: <MessageSquare className="w-4 h-4" />, category: 'operations', description: 'SMS', route: '/location-chat' },
  { id: 'mobile', label: 'MOBILE', icon: <Mobile className="w-4 h-4" />, category: 'operations', description: 'Mobile', route: '/broadcast-admin' },
  { id: 'stats', label: 'STATS', icon: <TrendingUp className="w-4 h-4" />, category: 'operations', description: 'Statistics', route: '/broadcast-admin' },
  { id: 'signal', label: 'SIGNAL', icon: <Signal className="w-4 h-4" />, category: 'operations', description: 'Signal', route: '/monitoring' },
  { id: 'history', label: 'HISTORY', icon: <History className="w-4 h-4" />, category: 'operations', description: 'History', route: '/vod-library' },
  { id: 'log', label: 'LOG', icon: <FileText className="w-4 h-4" />, category: 'operations', description: 'Logs', route: '/audit-log' },
  { id: 'quiet', label: 'QUIET', icon: <Volume className="w-4 h-4" />, category: 'operations', description: 'Quiet Mode', route: '/user-preferences' },
  { id: 'ack', label: 'ACK', icon: <CheckCircle className="w-4 h-4" />, category: 'operations', description: 'Acknowledge', route: '/broadcast-admin' },
  { id: 'mac', label: 'MAC', icon: <Shield className="w-4 h-4" />, category: 'operations', description: 'MAC', route: '/user-preferences' },
  { id: 'radar', label: 'RADAR', icon: <Radar className="w-4 h-4" />, category: 'operations', description: 'Radar', route: '/hybridcast-hub' },
  { id: 'qumus', label: 'QUMUS', icon: <Brain className="w-4 h-4" />, category: 'operations', description: 'QUMUS', route: '/qumus-dashboard' },

  // Accessibility
  { id: 'a11y', label: 'A11Y', icon: <Accessibility className="w-4 h-4" />, category: 'accessibility', description: 'Accessibility', route: '/user-preferences' },
  { id: 'tts', label: 'TTS', icon: <Volume2 className="w-4 h-4" />, category: 'accessibility', description: 'Text-to-Speech', route: '/user-preferences' },
  { id: 'asl', label: 'ASL', icon: <Headphones className="w-4 h-4" />, category: 'accessibility', description: 'Sign Language', route: '/user-preferences' },
  { id: 'wcag', label: 'WCAG', icon: <CheckCircle className="w-4 h-4" />, category: 'accessibility', description: 'WCAG Compliance', route: '/user-preferences' },
];

export function HybridCastTabNavigationFixed() {
  const [activeTab, setActiveTab] = useState<string>('net');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [, navigate] = useLocation();

  const categories = [
    { id: 'network', label: 'Network', color: 'text-cyan-400' },
    { id: 'communication', label: 'Communication', color: 'text-blue-400' },
    { id: 'emergency', label: 'Emergency', color: 'text-red-400' },
    { id: 'health', label: 'Health', color: 'text-green-400' },
    { id: 'security', label: 'Security', color: 'text-purple-400' },
    { id: 'accessibility', label: 'Accessibility', color: 'text-yellow-400' },
    { id: 'operations', label: 'Operations', color: 'text-slate-400' },
  ];

  const getTabsByCategory = (category: string) => TABS.filter((tab) => tab.category === category);

  const handleTabClick = (tab: TabItem) => {
    setActiveTab(tab.id);
    if (tab.route) {
      navigate(tab.route);
    }
  };

  const activeTabData = TABS.find((tab) => tab.id === activeTab);

  return (
    <div className="space-y-4">
      {/* Tab Grid */}
      <Card className="p-4 bg-slate-900 border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4">HybridCast Navigation (50+ Tabs)</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((category) => {
            const categoryTabs = getTabsByCategory(category.id);
            const isExpanded = expandedCategory === category.id;

            return (
              <div key={category.id} className="space-y-2">
                <button
                  onClick={() => setExpandedCategory(isExpanded ? null : category.id)}
                  className={`w-full px-3 py-2 rounded-lg font-semibold text-sm transition-colors ${
                    isExpanded
                      ? 'bg-slate-800 border border-slate-600'
                      : 'bg-slate-800/50 border border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <span className={category.color}>{category.label}</span>
                </button>

                {isExpanded && (
                  <div className="grid grid-cols-3 gap-2 pl-2">
                    {categoryTabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => handleTabClick(tab)}
                        title={tab.description}
                        className={`flex flex-col items-center justify-center p-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                          activeTab === tab.id
                            ? 'bg-cyan-500/20 border border-cyan-500 text-cyan-400'
                            : 'bg-slate-800 border border-slate-700 text-slate-300 hover:border-slate-600 hover:bg-slate-700'
                        }`}
                      >
                        {tab.icon}
                        <span className="mt-1">{tab.label}</span>
                        {tab.route && <span className="text-xs text-cyan-400 mt-1">→</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Active Tab Content */}
      {activeTabData && (
        <Card className="p-6 bg-slate-900 border border-slate-700">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="text-2xl">{activeTabData.icon}</div>
              <div>
                <h2 className="text-2xl font-bold text-white">{activeTabData.label}</h2>
                <p className="text-sm text-slate-400">{activeTabData.description}</p>
              </div>
            </div>

            <div className="bg-slate-800 p-4 rounded-lg">
              <p className="text-slate-300 text-sm">
                {activeTabData.route
                  ? `Click the tab to navigate to ${activeTabData.label} feature. Arrow (→) indicates a dedicated page.`
                  : `${activeTabData.label} feature is available. Select to view details.`}
              </p>
            </div>

            {activeTabData.route && (
              <Button
                onClick={() => navigate(activeTabData.route!)}
                className="bg-cyan-600 hover:bg-cyan-700 text-white"
              >
                Open {activeTabData.label} →
              </Button>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
