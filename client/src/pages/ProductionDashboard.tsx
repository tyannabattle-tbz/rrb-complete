import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Mic,
  Zap,
  Clapperboard,
  Settings,
  HelpCircle,
} from 'lucide-react';
import VoiceCommandInterface from '@/components/voice/VoiceCommandInterface';
import BatchProcessingDashboard from '@/components/batch/BatchProcessingDashboard';
import AIStoryboardingEngine from '@/components/storyboard/AIStoryboardingEngine';

export const ProductionDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-white">Production Suite</h1>
          <p className="text-slate-400">
            Advanced tools for video production, batch processing, and creative planning
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4 bg-slate-800 border-slate-700">
            <div className="flex items-center gap-3">
              <Mic className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-xs text-slate-400">Voice Commands</p>
                <p className="text-2xl font-bold text-white">Active</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-slate-800 border-slate-700">
            <div className="flex items-center gap-3">
              <Zap className="w-8 h-8 text-yellow-500" />
              <div>
                <p className="text-xs text-slate-400">Batch Processing</p>
                <p className="text-2xl font-bold text-white">Ready</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-slate-800 border-slate-700">
            <div className="flex items-center gap-3">
              <Clapperboard className="w-8 h-8 text-purple-500" />
              <div>
                <p className="text-xs text-slate-400">Storyboarding</p>
                <p className="text-2xl font-bold text-white">Ready</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-slate-800 border-slate-700">
            <div className="flex items-center gap-3">
              <Settings className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-xs text-slate-400">System Status</p>
                <p className="text-2xl font-bold text-white">Optimal</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-4 bg-slate-800 border border-slate-700">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="voice">Voice Commands</TabsTrigger>
            <TabsTrigger value="batch">Batch Processing</TabsTrigger>
            <TabsTrigger value="storyboard">Storyboarding</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card className="p-6 bg-slate-800 border-slate-700">
              <h2 className="text-2xl font-bold text-white mb-4">
                Welcome to Production Suite
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Mic className="w-5 h-5 text-blue-500" />
                    <h3 className="font-semibold text-white">Voice Commands</h3>
                  </div>
                  <p className="text-sm text-slate-300">
                    Control your production workflow with natural voice commands.
                    Generate videos, manage batches, and create storyboards hands-free.
                  </p>
                  <Button
                    onClick={() => setActiveTab('voice')}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    Start Voice Control
                  </Button>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-500" />
                    <h3 className="font-semibold text-white">
                      Batch Processing
                    </h3>
                  </div>
                  <p className="text-sm text-slate-300">
                    Process multiple videos simultaneously with intelligent queue
                    management, priority scheduling, and real-time progress tracking.
                  </p>
                  <Button
                    onClick={() => setActiveTab('batch')}
                    className="w-full bg-yellow-600 hover:bg-yellow-700"
                  >
                    Manage Queues
                  </Button>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Clapperboard className="w-5 h-5 text-purple-500" />
                    <h3 className="font-semibold text-white">Storyboarding</h3>
                  </div>
                  <p className="text-sm text-slate-300">
                    Transform scripts into visual storyboards with AI-powered scene
                    breakdown, shot composition suggestions, and lighting recommendations.
                  </p>
                  <Button
                    onClick={() => setActiveTab('storyboard')}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    Create Storyboard
                  </Button>
                </div>
              </div>
            </Card>

            {/* Features Grid */}
            <Card className="p-6 bg-slate-800 border-slate-700">
              <h3 className="text-xl font-bold text-white mb-4">Key Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-white">Voice Interface</h4>
                  <ul className="text-sm text-slate-300 space-y-1">
                    <li>✓ Real-time speech recognition</li>
                    <li>✓ Intent parsing and execution</li>
                    <li>✓ Command history tracking</li>
                    <li>✓ Voice feedback system</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-white">Batch System</h4>
                  <ul className="text-sm text-slate-300 space-y-1">
                    <li>✓ Multi-queue management</li>
                    <li>✓ Priority scheduling</li>
                    <li>✓ Progress tracking</li>
                    <li>✓ Automatic retry logic</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-white">Storyboarding</h4>
                  <ul className="text-sm text-slate-300 space-y-1">
                    <li>✓ Script parsing</li>
                    <li>✓ Scene breakdown</li>
                    <li>✓ Shot suggestions</li>
                    <li>✓ PDF export</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-white">Integration</h4>
                  <ul className="text-sm text-slate-300 space-y-1">
                    <li>✓ Real-time updates</li>
                    <li>✓ Database persistence</li>
                    <li>✓ Error handling</li>
                    <li>✓ Analytics tracking</li>
                  </ul>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Voice Commands Tab */}
          <TabsContent value="voice">
            <Card className="p-6 bg-slate-800 border-slate-700">
              <VoiceCommandInterface />
            </Card>
          </TabsContent>

          {/* Batch Processing Tab */}
          <TabsContent value="batch">
            <Card className="p-6 bg-slate-800 border-slate-700">
              <BatchProcessingDashboard />
            </Card>
          </TabsContent>

          {/* Storyboarding Tab */}
          <TabsContent value="storyboard">
            <Card className="p-6 bg-slate-800 border-slate-700">
              <AIStoryboardingEngine />
            </Card>
          </TabsContent>
        </Tabs>

        {/* Help Section */}
        <Card className="p-6 bg-slate-800 border-slate-700">
          <div className="flex items-start gap-4">
            <HelpCircle className="w-6 h-6 text-blue-500 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-white mb-2">Need Help?</h3>
              <p className="text-sm text-slate-300">
                Each feature includes comprehensive help documentation and quick
                start guides. Hover over any icon or button to see tooltips, or
                visit the help tab within each feature for detailed instructions.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ProductionDashboard;
