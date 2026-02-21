import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  CheckCircle2,
  AlertCircle,
  Zap,
  Radio,
  Play,
  Settings,
  Copy,
  ExternalLink,
  ChevronRight,
  Clock,
  Wifi,
  Volume2,
  Eye,
} from 'lucide-react';

interface Scenario {
  id: string;
  name: string;
  description: string;
  setupTime: number; // minutes
  testTime: number; // minutes
  complexity: 'easy' | 'medium' | 'hard';
  icon: React.ReactNode;
  steps: ScenarioStep[];
  requirements: string[];
  advantages: string[];
  backupPlan: string;
}

interface ScenarioStep {
  number: number;
  title: string;
  description: string;
  action: string;
  estimatedTime: number; // seconds
}

export const ScenarioPlanner: React.FC = () => {
  const [selectedScenario, setSelectedScenario] = useState<string>('rtmp-push');
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [showChecklist, setShowChecklist] = useState(false);

  const scenarios: Scenario[] = [
    {
      id: 'rtmp-push',
      name: 'RTMP Push (Most Common)',
      description: 'You push your broadcast TO the UN WCS server',
      setupTime: 5,
      testTime: 10,
      complexity: 'easy',
      icon: <Radio className="w-6 h-6" />,
      steps: [
        {
          number: 1,
          title: 'Get RTMP URL from UN WCS',
          description: 'Request their RTMP endpoint and stream key',
          action: 'Contact UN WCS technical team',
          estimatedTime: 0,
        },
        {
          number: 2,
          title: 'Open RTMP Configuration',
          description: 'Navigate to Dashboard → RTMP Configuration',
          action: 'Click RTMP Configuration button',
          estimatedTime: 30,
        },
        {
          number: 3,
          title: 'Add RTMP Endpoint',
          description: 'Enter the RTMP URL provided by UN WCS',
          action: 'Paste URL and save',
          estimatedTime: 60,
        },
        {
          number: 4,
          title: 'Test Connection',
          description: 'Verify UN WCS receiving your stream',
          action: 'Click "Test Connection" button',
          estimatedTime: 120,
        },
        {
          number: 5,
          title: 'Configure Backup Endpoint',
          description: 'Add secondary RTMP for failover',
          action: 'Add secondary URL',
          estimatedTime: 60,
        },
      ],
      requirements: [
        'RTMP URL from UN WCS',
        'Stream key (if required)',
        'Upload bandwidth: 10+ Mbps',
      ],
      advantages: [
        'Most reliable method',
        'Professional standard',
        'They control broadcast timing',
        'You maintain full stream control',
      ],
      backupPlan: 'Auto-failover to secondary RTMP endpoint, then YouTube Live',
    },
    {
      id: 'webrtc-direct',
      name: 'WebRTC Direct Connection',
      description: 'UN WCS connects directly to your platform via WebRTC',
      setupTime: 2,
      testTime: 5,
      complexity: 'easy',
      icon: <Wifi className="w-6 h-6" />,
      steps: [
        {
          number: 1,
          title: 'Copy Broadcast Viewer Link',
          description: 'Get the link for UN WCS operators to join',
          action: 'Copy: https://your-domain.com/broadcast-viewer',
          estimatedTime: 30,
        },
        {
          number: 2,
          title: 'Send Link to UN WCS',
          description: 'Provide link to UN WCS technical team',
          action: 'Send via email/secure channel',
          estimatedTime: 60,
        },
        {
          number: 3,
          title: 'UN WCS Opens Link',
          description: 'They open link in their broadcast control room',
          action: 'They see live stream and panelists',
          estimatedTime: 120,
        },
        {
          number: 4,
          title: 'They Record/Embed',
          description: 'UN WCS records or embeds from their end',
          action: 'They use their broadcast software',
          estimatedTime: 0,
        },
      ],
      requirements: [
        'Stable internet connection',
        'Platform accessible from UN WCS location',
        'No firewall blocking WebRTC',
      ],
      advantages: [
        'Direct connection, no intermediaries',
        'They see exactly what your audience sees',
        'Full engagement features available',
        'Easy for international connections',
      ],
      backupPlan: 'Provide alternative domain or mobile-optimized version',
    },
    {
      id: 'hls-streaming',
      name: 'HLS Streaming (Fallback)',
      description: 'You provide an HLS stream URL they can embed',
      setupTime: 3,
      testTime: 5,
      complexity: 'medium',
      icon: <Play className="w-6 h-6" />,
      steps: [
        {
          number: 1,
          title: 'Enable HLS Output',
          description: 'Activate HLS streaming in Dashboard',
          action: 'Dashboard → Stream Outputs → Enable HLS',
          estimatedTime: 60,
        },
        {
          number: 2,
          title: 'Copy HLS URL',
          description: 'Get the HLS stream URL',
          action: 'Copy: https://your-domain.com/streams/event.m3u8',
          estimatedTime: 30,
        },
        {
          number: 3,
          title: 'Send URL to UN WCS',
          description: 'Provide HLS URL for embedding',
          action: 'Send via email/secure channel',
          estimatedTime: 60,
        },
        {
          number: 4,
          title: 'UN WCS Embeds Player',
          description: 'They embed HLS URL in their web player',
          action: 'They configure their player',
          estimatedTime: 0,
        },
        {
          number: 5,
          title: 'Test Playback',
          description: 'Verify stream plays on their platform',
          action: 'Open their broadcast page and test',
          estimatedTime: 120,
        },
      ],
      requirements: [
        'CDN configured for HLS delivery',
        'Adaptive bitrate support',
        'HLS player on UN WCS platform',
      ],
      advantages: [
        'Works on all devices',
        'Adaptive bitrate (adjusts to connection)',
        'Can embed in any web player',
        'Good for international audiences',
      ],
      backupPlan: 'Switch to RTMP if HLS fails, or YouTube Live',
    },
    {
      id: 'youtube-live',
      name: 'YouTube Live Integration',
      description: 'Stream to YouTube, UN WCS embeds YouTube player',
      setupTime: 10,
      testTime: 15,
      complexity: 'medium',
      icon: <Volume2 className="w-6 h-6" />,
      steps: [
        {
          number: 1,
          title: 'Create YouTube Live Event',
          description: 'Set up live event in YouTube Studio',
          action: 'YouTube Studio → Create Live Event',
          estimatedTime: 300,
        },
        {
          number: 2,
          title: 'Get YouTube RTMP URL',
          description: 'Copy the RTMP URL from YouTube',
          action: 'Copy: rtmp://a.rtmp.youtube.com/live2/your-key',
          estimatedTime: 60,
        },
        {
          number: 3,
          title: 'Configure YouTube RTMP',
          description: 'Add YouTube RTMP to your platform',
          action: 'Dashboard → RTMP Configuration → Add YouTube',
          estimatedTime: 60,
        },
        {
          number: 4,
          title: 'Send YouTube URL to UN WCS',
          description: 'Provide YouTube video URL for embedding',
          action: 'Send YouTube link',
          estimatedTime: 60,
        },
        {
          number: 5,
          title: 'UN WCS Embeds Player',
          description: 'They embed YouTube player on their site',
          action: 'They use YouTube embed code',
          estimatedTime: 0,
        },
      ],
      requirements: [
        'YouTube account with live streaming enabled',
        'YouTube RTMP URL',
        'Upload bandwidth: 5+ Mbps',
      ],
      advantages: [
        'YouTube handles distribution',
        'Automatic archival',
        'Global reach',
        'Easy embedding',
      ],
      backupPlan: 'Switch to Facebook Live or custom RTMP',
    },
    {
      id: 'custom-integration',
      name: 'Custom Integration (Unknown)',
      description: 'UN WCS has a custom setup you haven\'t seen before',
      setupTime: 20,
      testTime: 30,
      complexity: 'hard',
      icon: <Settings className="w-6 h-6" />,
      steps: [
        {
          number: 1,
          title: 'Ask Technical Questions',
          description: 'Get detailed specs from UN WCS',
          action: 'Send technical requirements questionnaire',
          estimatedTime: 0,
        },
        {
          number: 2,
          title: 'Document Requirements',
          description: 'Record all technical specifications',
          action: 'Create setup document',
          estimatedTime: 300,
        },
        {
          number: 3,
          title: 'Configure Your Platform',
          description: 'Adapt your setup to their requirements',
          action: 'Modify settings based on specs',
          estimatedTime: 600,
        },
        {
          number: 4,
          title: 'Test in Staging',
          description: 'Test with UN WCS in test environment',
          action: 'Conduct test broadcast',
          estimatedTime: 900,
        },
        {
          number: 5,
          title: 'Final Verification',
          description: 'Confirm everything working as expected',
          action: 'Complete final checklist',
          estimatedTime: 300,
        },
      ],
      requirements: [
        'Technical specs from UN WCS',
        'Flexibility to adapt',
        'Extra time for testing',
        'Backup plans for all scenarios',
      ],
      advantages: [
        'Fully customized to their needs',
        'Professional integration',
        'Handles unique requirements',
        'Can adapt to future changes',
      ],
      backupPlan: 'Fall back to RTMP Push or YouTube Live',
    },
  ];

  const currentScenario = scenarios.find(s => s.id === selectedScenario);
  if (!currentScenario) return null;

  const totalSetupTime = currentScenario.setupTime + currentScenario.testTime;
  const progressPercent = (completedSteps.length / currentScenario.steps.length) * 100;

  const toggleStep = (stepNumber: number) => {
    setCompletedSteps(prev =>
      prev.includes(stepNumber) ? prev.filter(s => s !== stepNumber) : [...prev, stepNumber]
    );
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">UN WCS Event Scenario Planner</h1>
          <p className="text-slate-600">
            Prepare for all possible connection scenarios. You'll be ready for anything they require.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Scenario List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-4 space-y-2 sticky top-6">
              {scenarios.map(scenario => (
                <button
                  key={scenario.id}
                  onClick={() => {
                    setSelectedScenario(scenario.id);
                    setCompletedSteps([]);
                  }}
                  className={`w-full text-left p-3 rounded-lg transition-all ${
                    selectedScenario === scenario.id
                      ? 'bg-orange-500 text-white shadow-md'
                      : 'bg-slate-50 text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <div className="mt-0.5">{scenario.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm">{scenario.name}</div>
                      <div className="text-xs opacity-75">{totalSetupTime} min total</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Scenario Details */}
          <div className="lg:col-span-3">
            <Card className="bg-white shadow-lg">
              {/* Scenario Header */}
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-t-lg">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">{currentScenario.name}</h2>
                    <p className="opacity-90">{currentScenario.description}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getComplexityColor(currentScenario.complexity)}`}
                  >
                    {currentScenario.complexity.charAt(0).toUpperCase() +
                      currentScenario.complexity.slice(1)}
                  </span>
                </div>
              </div>

              {/* Scenario Content */}
              <div className="p-6 space-y-6">
                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-sm text-blue-600 font-semibold">Setup Time</div>
                    <div className="text-2xl font-bold text-blue-900">{currentScenario.setupTime} min</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-sm text-purple-600 font-semibold">Test Time</div>
                    <div className="text-2xl font-bold text-purple-900">{currentScenario.testTime} min</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-sm text-green-600 font-semibold">Total</div>
                    <div className="text-2xl font-bold text-green-900">{totalSetupTime} min</div>
                  </div>
                </div>

                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-slate-700">Setup Progress</span>
                    <span className="text-sm font-semibold text-orange-600">{Math.round(progressPercent)}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-orange-500 to-orange-600 h-full transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="steps" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="steps">Steps</TabsTrigger>
                    <TabsTrigger value="requirements">Requirements</TabsTrigger>
                    <TabsTrigger value="advantages">Advantages</TabsTrigger>
                    <TabsTrigger value="backup">Backup</TabsTrigger>
                  </TabsList>

                  {/* Steps Tab */}
                  <TabsContent value="steps" className="space-y-4 mt-6">
                    {currentScenario.steps.map(step => (
                      <div
                        key={step.number}
                        className="border-l-4 border-orange-500 pl-4 py-2 cursor-pointer hover:bg-slate-50 p-4 rounded"
                        onClick={() => toggleStep(step.number)}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-semibold ${
                              completedSteps.includes(step.number)
                                ? 'bg-green-500 text-white'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {completedSteps.includes(step.number) ? (
                              <CheckCircle2 className="w-5 h-5" />
                            ) : (
                              step.number
                            )}
                          </div>

                          <div className="flex-1">
                            <h4 className="font-semibold text-slate-900">{step.title}</h4>
                            <p className="text-sm text-slate-600 mt-1">{step.description}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Zap className="w-4 h-4 text-yellow-500" />
                              <span className="text-xs text-slate-600">{step.action}</span>
                            </div>
                            {step.estimatedTime > 0 && (
                              <div className="flex items-center gap-2 mt-2">
                                <Clock className="w-4 h-4 text-slate-400" />
                                <span className="text-xs text-slate-600">
                                  ~{Math.round(step.estimatedTime / 60)} min
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </TabsContent>

                  {/* Requirements Tab */}
                  <TabsContent value="requirements" className="space-y-3 mt-6">
                    {currentScenario.requirements.map((req, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-slate-700">{req}</p>
                      </div>
                    ))}
                  </TabsContent>

                  {/* Advantages Tab */}
                  <TabsContent value="advantages" className="space-y-3 mt-6">
                    {currentScenario.advantages.map((adv, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-slate-700">{adv}</p>
                      </div>
                    ))}
                  </TabsContent>

                  {/* Backup Tab */}
                  <TabsContent value="backup" className="mt-6">
                    <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg">
                      <h4 className="font-semibold text-yellow-900 mb-2">Backup Plan</h4>
                      <p className="text-sm text-yellow-800">{currentScenario.backupPlan}</p>
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-6 border-t border-slate-200">
                  <Button
                    onClick={() => setShowChecklist(!showChecklist)}
                    className="bg-orange-500 hover:bg-orange-600 text-white gap-2 flex-1"
                  >
                    <Eye className="w-4 h-4" />
                    {showChecklist ? 'Hide' : 'Show'} Checklist
                  </Button>

                  <Button variant="outline" className="gap-2 flex-1">
                    <Copy className="w-4 h-4" />
                    Copy Setup
                  </Button>

                  <Button variant="outline" className="gap-2 flex-1">
                    <ExternalLink className="w-4 h-4" />
                    Full Guide
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Pre-Event Checklist */}
        {showChecklist && (
          <Card className="bg-white shadow-lg p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Pre-Event Preparation Checklist</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  title: '2 Weeks Before',
                  items: [
                    'Contact UN WCS for technical specs',
                    'Get streaming requirements document',
                    'Obtain RTMP URL(s)',
                    'Test connection to their server',
                  ],
                },
                {
                  title: '1 Week Before',
                  items: [
                    'Complete technical rehearsal',
                    'Test all backup endpoints',
                    'Verify panelists can connect',
                    'Test chat, Q&A, polls',
                  ],
                },
                {
                  title: '3 Days Before',
                  items: [
                    'Final system health check',
                    'Update all documentation',
                    'Confirm panelist details',
                    'Verify all equipment',
                  ],
                },
                {
                  title: 'Day of Event',
                  items: [
                    'Start all systems',
                    'Test panelist connections',
                    'Verify UN WCS receiving stream',
                    'Final audio/video test',
                  ],
                },
              ].map((section, idx) => (
                <div key={idx} className="bg-slate-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-slate-900 mb-3">{section.title}</h3>
                  <ul className="space-y-2">
                    {section.items.map((item, itemIdx) => (
                      <li key={itemIdx} className="flex items-start gap-2">
                        <input type="checkbox" className="mt-1" />
                        <span className="text-sm text-slate-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ScenarioPlanner;
