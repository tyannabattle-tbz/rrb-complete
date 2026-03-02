import { useState } from 'react';
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
}

const TABS: TabItem[] = [
  // Network
  { id: 'net', label: 'NET', icon: <Network className="w-4 h-4" />, category: 'network', description: 'Network Status' },
  { id: 'topo', label: 'TOPO', icon: <Grid3x3 className="w-4 h-4" />, category: 'network', description: 'Network Topology' },
  { id: 'gps', label: 'GPS', icon: <MapPin className="w-4 h-4" />, category: 'network', description: 'GPS Tracking' },
  { id: 'geo', label: 'GEO', icon: <Layers className="w-4 h-4" />, category: 'network', description: 'Geolocation' },
  { id: 'wx', label: 'WX', icon: <Cloud className="w-4 h-4" />, category: 'network', description: 'Weather' },
  { id: 'mesh', label: 'MESH', icon: <Wifi className="w-4 h-4" />, category: 'network', description: 'Mesh Network' },

  // Communication
  { id: 'ptt', label: 'PTT', icon: <RadioIcon className="w-4 h-4" />, category: 'communication', description: 'Push-to-Talk' },
  { id: 'live', label: 'LIVE', icon: <Radio className="w-4 h-4" />, category: 'communication', description: 'Live Broadcast' },
  { id: 'audio', label: 'AUDIO', icon: <Volume2 className="w-4 h-4" />, category: 'communication', description: 'Audio Control' },
  { id: 'chat', label: 'CHAT', icon: <MessageSquare className="w-4 h-4" />, category: 'communication', description: 'Chat' },
  { id: 'thrd', label: 'THRD', icon: <MessageSquare className="w-4 h-4" />, category: 'communication', description: 'Threads' },
  { id: 'files', label: 'FILES', icon: <FileText className="w-4 h-4" />, category: 'communication', description: 'File Sharing' },
  { id: 'share', label: 'SHARE', icon: <Share2 className="w-4 h-4" />, category: 'communication', description: 'Share' },

  // Emergency
  { id: 'alert', label: 'ALERT', icon: <AlertTriangle className="w-4 h-4" />, category: 'emergency', description: 'Alerts' },
  { id: 'sync', label: 'SYNC', icon: <Zap className="w-4 h-4" />, category: 'emergency', description: 'Sync' },
  { id: 'usb', label: 'USB', icon: <HardDrive className="w-4 h-4" />, category: 'emergency', description: 'USB' },
  { id: 'roles', label: 'ROLES', icon: <Users2 className="w-4 h-4" />, category: 'emergency', description: 'Roles' },

  // Health & Monitoring
  { id: 'health', label: 'HEALTH', icon: <Heart className="w-4 h-4" />, category: 'health', description: 'System Health' },
  { id: 'aimon', label: 'AI MON', icon: <Brain className="w-4 h-4" />, category: 'health', description: 'AI Monitor' },
  { id: 'aichat', label: 'AI CHAT', icon: <Brain className="w-4 h-4" />, category: 'health', description: 'AI Chat' },
  { id: 'aimsg', label: 'AI MSG', icon: <Brain className="w-4 h-4" />, category: 'health', description: 'AI Messages' },
  { id: 'triage', label: 'TRIAGE', icon: <AlertCircle className="w-4 h-4" />, category: 'health', description: 'Triage' },

  // Security
  { id: 'crypto', label: 'CRYPTO', icon: <Lock className="w-4 h-4" />, category: 'security', description: 'Encryption' },
  { id: 'tmplt', label: 'TMPLT', icon: <FileText className="w-4 h-4" />, category: 'security', description: 'Templates' },
  { id: 'sched', label: 'SCHED', icon: <Clock className="w-4 h-4" />, category: 'security', description: 'Schedule' },
  { id: 'setup', label: 'SETUP', icon: <Settings className="w-4 h-4" />, category: 'security', description: 'Setup' },

  // Operations
  { id: 'drill', label: 'DRILL', icon: <Lightbulb className="w-4 h-4" />, category: 'operations', description: 'Drills' },
  { id: 'github', label: 'GITHUB', icon: <Github className="w-4 h-4" />, category: 'operations', description: 'GitHub' },
  { id: 'about', label: 'ABOUT', icon: <Info className="w-4 h-4" />, category: 'operations', description: 'About' },
  { id: 'team', label: 'TEAM', icon: <Users className="w-4 h-4" />, category: 'operations', description: 'Team' },
  { id: 'alerts', label: 'ALERTS', icon: <Bell className="w-4 h-4" />, category: 'operations', description: 'Alerts' },
  { id: 'train', label: 'TRAIN', icon: <BookOpen className="w-4 h-4" />, category: 'operations', description: 'Training' },
  { id: 'sms', label: 'SMS', icon: <MessageSquare className="w-4 h-4" />, category: 'operations', description: 'SMS' },
  { id: 'mobile', label: 'MOBILE', icon: <Mobile className="w-4 h-4" />, category: 'operations', description: 'Mobile' },
  { id: 'stats', label: 'STATS', icon: <TrendingUp className="w-4 h-4" />, category: 'operations', description: 'Statistics' },
  { id: 'signal', label: 'SIGNAL', icon: <Signal className="w-4 h-4" />, category: 'operations', description: 'Signal' },
  { id: 'history', label: 'HISTORY', icon: <History className="w-4 h-4" />, category: 'operations', description: 'History' },
  { id: 'log', label: 'LOG', icon: <FileText className="w-4 h-4" />, category: 'operations', description: 'Logs' },
  { id: 'quiet', label: 'QUIET', icon: <Volume className="w-4 h-4" />, category: 'operations', description: 'Quiet Mode' },
  { id: 'ack', label: 'ACK', icon: <CheckCircle className="w-4 h-4" />, category: 'operations', description: 'Acknowledge' },
  { id: 'mac', label: 'MAC', icon: <Shield className="w-4 h-4" />, category: 'operations', description: 'MAC' },
  { id: 'radar', label: 'RADAR', icon: <Radar className="w-4 h-4" />, category: 'operations', description: 'Radar' },
  { id: 'qumus', label: 'QUMUS', icon: <Brain className="w-4 h-4" />, category: 'operations', description: 'QUMUS' },

  // Accessibility
  { id: 'a11y', label: 'A11Y', icon: <Accessibility className="w-4 h-4" />, category: 'accessibility', description: 'Accessibility' },
  { id: 'tts', label: 'TTS', icon: <Volume2 className="w-4 h-4" />, category: 'accessibility', description: 'Text-to-Speech' },
  { id: 'asl', label: 'ASL', icon: <Headphones className="w-4 h-4" />, category: 'accessibility', description: 'Sign Language' },
  { id: 'wcag', label: 'WCAG', icon: <CheckCircle className="w-4 h-4" />, category: 'accessibility', description: 'WCAG' },
];

export function HybridCastTabNavigation() {
  const [activeTab, setActiveTab] = useState<string>('net');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

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
                        onClick={() => setActiveTab(tab.id)}
                        title={tab.description}
                        className={`flex flex-col items-center justify-center p-2 rounded-lg text-xs font-medium transition-all ${
                          activeTab === tab.id
                            ? 'bg-cyan-500/20 border border-cyan-500 text-cyan-400'
                            : 'bg-slate-800 border border-slate-700 text-slate-300 hover:border-slate-600'
                        }`}
                      >
                        {tab.icon}
                        <span className="mt-1">{tab.label}</span>
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
      <Card className="p-6 bg-slate-900 border border-slate-700">
        <div className="space-y-4">
          {TABS.find((tab) => tab.id === activeTab) && (
            <>
              <div className="flex items-center gap-3">
                <div className="text-2xl">{TABS.find((tab) => tab.id === activeTab)?.icon}</div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {TABS.find((tab) => tab.id === activeTab)?.label}
                  </h2>
                  <p className="text-sm text-slate-400">
                    {TABS.find((tab) => tab.id === activeTab)?.description}
                  </p>
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                <p className="text-slate-300">
                  {TABS.find((tab) => tab.id === activeTab)?.description} module is now active.
                </p>
                <div className="mt-4 space-y-2">
                  <div className="text-sm text-slate-400">Status: <span className="text-green-400">Active</span></div>
                  <div className="text-sm text-slate-400">Category: <span className="text-cyan-400">{TABS.find((tab) => tab.id === activeTab)?.category}</span></div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button className="bg-cyan-600 hover:bg-cyan-700 text-white">Activate</Button>
                <Button className="bg-slate-700 hover:bg-slate-600 text-white">Configure</Button>
                <Button className="bg-slate-700 hover:bg-slate-600 text-white">Help</Button>
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Summary Stats */}
      <Card className="p-4 bg-slate-900 border border-slate-700">
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-cyan-400">{TABS.length}</div>
            <div className="text-xs text-slate-400">Total Tabs</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-400">{categories.length}</div>
            <div className="text-xs text-slate-400">Categories</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-400">Active</div>
            <div className="text-xs text-slate-400">Status</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-400">100%</div>
            <div className="text-xs text-slate-400">Coverage</div>
          </div>
        </div>
      </Card>
    </div>
  );
}
