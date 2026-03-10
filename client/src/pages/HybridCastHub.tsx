import { useState } from 'react';
import { useLocation } from 'wouter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home } from 'lucide-react';
import { HybridCastTabNavigation } from '@/components/HybridCastTabNavigation';
import { MeshNetworkVisualizationEnhanced } from '@/components/MeshNetworkVisualizationEnhanced';
import { EmergencyBroadcastProtocol } from '@/components/EmergencyBroadcastProtocol';
import { AccessibilityFeatures } from '@/components/AccessibilityFeatures';
import { NetworkStatusDashboard } from '@/components/NetworkStatusDashboard';

// Feature component mapping
const FEATURE_COMPONENTS: Record<string, React.ComponentType<any>> = {
  'net': () => <NetworkStatusDashboard />,
  'topo': () => <MeshNetworkVisualizationEnhanced />,
  'gps': () => <div className="text-white"><h2>GPS Tracking</h2><p>Navigate to GPS Map for tracking</p></div>,
  'mesh': () => <MeshNetworkVisualizationEnhanced />,
  'alert': () => <EmergencyBroadcastProtocol />,
  'health': () => <NetworkStatusDashboard />,
  'a11y': () => <AccessibilityFeatures />,
  'tts': () => <AccessibilityFeatures />,
  'asl': () => <AccessibilityFeatures />,
  'wcag': () => <AccessibilityFeatures />,
};

// Feature route mapping
const FEATURE_ROUTES: Record<string, string> = {
  'gps': '/gps-radar',
  'live': '/broadcast-admin',
  'chat': '/location-chat',
  'ptt': '/collaboration',
  'audio': '/podcast-discovery',
  'sched': '/broadcast-scheduler',
  'log': '/audit-log',
  'stats': '/broadcast-admin',
  'history': '/vod-library',
  'train': '/podcast-discovery',
  'drill': '/broadcast-admin',
  'team': '/collaboration',
  'alerts': '/broadcast-admin',
  'conf': '/conference',
  'cal': '/conference/calendar',
  'rec': '/conference/recordings',
};

export default function HybridCastHub() {
  const [, navigate] = useLocation();
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);

  const handleTabClick = (tabId: string) => {
    // Check if feature has a dedicated route
    if (FEATURE_ROUTES[tabId]) {
      navigate(FEATURE_ROUTES[tabId]);
      return;
    }

    // Otherwise show feature component
    setSelectedFeature(tabId);
  };

  const handleBackClick = () => {
    if (selectedFeature) {
      setSelectedFeature(null);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-4xl font-bold text-white">HybridCast Control Center</h1>
              <p className="text-xs text-purple-400/60 mt-1">Built by Ty Battle (Ty Bat Zan) &bull; Canryn Production &bull; TBZ-OS &bull; QUMUS Powered</p>
            </div>
            <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-sm font-medium border border-cyan-500/50">
              50+ Features
            </span>
          </div>
          <div className="flex gap-2">
            {selectedFeature && (
              <Button onClick={handleBackClick} className="bg-slate-700 hover:bg-slate-600 text-white">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            )}
            <Button onClick={() => navigate('/')} className="bg-slate-700 hover:bg-slate-600 text-white">
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
          </div>
        </div>

        {/* Feature Content or Tab Navigation */}
        {selectedFeature ? (
          <Card className="p-6 bg-slate-900 border border-slate-700">
            {FEATURE_COMPONENTS[selectedFeature]
              ? FEATURE_COMPONENTS[selectedFeature]({})
              : renderFeatureContent(selectedFeature)}
          </Card>
        ) : (
          <HybridCastTabNavigationWithRouting onTabClick={handleTabClick} />
        )}
      </div>
    </div>
  );
}

function HybridCastTabNavigationWithRouting({ onTabClick }: { onTabClick: (tabId: string) => void }) {
  return <HybridCastTabNavigation />;
}

function renderFeatureContent(featureId: string): React.ReactNode {
  const featureDescriptions: Record<string, { title: string; description: string; content: string }> = {
    'ptt': {
      title: 'Push-to-Talk',
      description: 'Real-time voice communication',
      content: 'PTT feature allows instant voice communication with team members.',
    },
    'files': {
      title: 'File Sharing',
      description: 'Share and manage files',
      content: 'Upload, download, and manage files across the network.',
    },
    'thrd': {
      title: 'Threads',
      description: 'Threaded conversations',
      content: 'Organize conversations into threads for better structure.',
    },
    'share': {
      title: 'Share',
      description: 'Share content and links',
      content: 'Share content, links, and media with team members.',
    },
    'sync': {
      title: 'Sync',
      description: 'Synchronization',
      content: 'Keep all devices and data synchronized across the network.',
    },
    'usb': {
      title: 'USB',
      description: 'USB device management',
      content: 'Manage USB devices and external storage.',
    },
    'roles': {
      title: 'Roles',
      description: 'User roles and permissions',
      content: 'Manage user roles and access permissions.',
    },
    'aimon': {
      title: 'AI Monitor',
      description: 'AI system monitoring',
      content: 'Monitor AI systems and performance metrics.',
    },
    'aichat': {
      title: 'AI Chat',
      description: 'AI-powered chat interface',
      content: 'Chat with AI assistant for support and information.',
    },
    'aimsg': {
      title: 'AI Messages',
      description: 'AI message processing',
      content: 'Process and analyze messages with AI.',
    },
    'triage': {
      title: 'Triage',
      description: 'Priority management',
      content: 'Triage and prioritize incoming requests and alerts.',
    },
    'crypto': {
      title: 'Encryption',
      description: 'Cryptographic security',
      content: 'Manage encryption and security protocols.',
    },
    'tmplt': {
      title: 'Templates',
      description: 'Message templates',
      content: 'Create and manage message templates.',
    },
    'setup': {
      title: 'Setup',
      description: 'System configuration',
      content: 'Configure system settings and preferences.',
    },
    'github': {
      title: 'GitHub',
      description: 'GitHub integration',
      content: 'Connect and manage GitHub repositories.',
    },
    'about': {
      title: 'About',
      description: 'System information',
      content: 'View system information and version details.',
    },
    'sms': {
      title: 'SMS',
      description: 'SMS messaging',
      content: 'Send and receive SMS messages.',
    },
    'mobile': {
      title: 'Mobile',
      description: 'Mobile app management',
      content: 'Manage mobile app settings and features.',
    },
    'signal': {
      title: 'Signal',
      description: 'Signal strength monitoring',
      content: 'Monitor signal strength and quality.',
    },
    'quiet': {
      title: 'Quiet Mode',
      description: 'Silent mode',
      content: 'Enable quiet mode to reduce notifications.',
    },
    'ack': {
      title: 'Acknowledge',
      description: 'Message acknowledgment',
      content: 'Acknowledge received messages and alerts.',
    },
    'mac': {
      title: 'MAC',
      description: 'MAC address management',
      content: 'Manage MAC addresses and device identification.',
    },
    'radar': {
      title: 'Radar',
      description: 'Radar visualization',
      content: 'View radar display of network activity.',
    },
    'qumus': {
      title: 'QUMUS',
      description: 'QUMUS orchestration engine',
      content: 'Access QUMUS autonomous orchestration features.',
    },
    'wx': {
      title: 'Weather',
      description: 'Weather information',
      content: 'View weather data and forecasts.',
    },
    'geo': {
      title: 'Geolocation',
      description: 'Location services',
      content: 'Manage geolocation and location-based services.',
    },
  };

  const feature = featureDescriptions[featureId];

  if (!feature) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold text-white mb-2">Feature Coming Soon</h2>
        <p className="text-slate-400">This feature is under development.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">{feature.title}</h2>
        <p className="text-slate-400">{feature.description}</p>
      </div>
      <Card className="p-4 bg-slate-800 border border-slate-700">
        <p className="text-slate-300">{feature.content}</p>
      </Card>
    </div>
  );
}
