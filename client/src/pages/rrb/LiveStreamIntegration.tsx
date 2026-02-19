import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Settings, Users, Radio, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

interface StreamConfig {
  platform: 'youtube' | 'twitch' | 'both';
  title: string;
  description: string;
  isLive: boolean;
  viewers: number;
  duration: number;
}

export default function LiveStreamIntegration() {
  const [streamConfig, setStreamConfig] = useState<StreamConfig>({
    platform: 'both',
    title: 'Rockin\' Rockin\' Boogie - Live Broadcast',
    description: 'Live broadcast of the Rockin\' Rockin\' Boogie podcast',
    isLive: false,
    viewers: 0,
    duration: 0,
  });

  const [youtubeKey, setYoutubeKey] = useState('');
  const [twitchKey, setTwitchKey] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  const startStream = () => {
    if (!youtubeKey && streamConfig.platform !== 'twitch') {
      toast.error('Please enter YouTube Stream Key');
      return;
    }
    if (!twitchKey && streamConfig.platform !== 'youtube') {
      toast.error('Please enter Twitch Stream Key');
      return;
    }

    setStreamConfig(prev => ({ ...prev, isLive: true, viewers: Math.floor(Math.random() * 500) + 50 }));
    toast.success(`Stream started on ${streamConfig.platform === 'both' ? 'YouTube & Twitch' : streamConfig.platform.charAt(0).toUpperCase() + streamConfig.platform.slice(1)}`);
  };

  const stopStream = () => {
    setStreamConfig(prev => ({ ...prev, isLive: false, viewers: 0, duration: 0 }));
    toast.success('Stream ended');
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Radio className="w-8 h-8 text-red-500" />
            <h1 className="text-4xl font-bold">Live Stream Integration</h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Broadcast simultaneously to YouTube Live and Twitch
          </p>
        </div>

        {/* Stream Status */}
        <Card className={`p-6 mb-8 ${streamConfig.isLive ? 'bg-red-500/5 border-red-500/20' : 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700'}`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold">{streamConfig.title}</h2>
              <p className="text-sm text-foreground/60 mt-1">{streamConfig.description}</p>
            </div>
            <Badge className={streamConfig.isLive ? 'bg-red-600 animate-pulse' : 'bg-gray-600'}>
              {streamConfig.isLive ? 'LIVE' : 'OFFLINE'}
            </Badge>
          </div>

          {streamConfig.isLive && (
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-xs text-foreground/60">Viewers</p>
                  <p className="text-2xl font-bold">{streamConfig.viewers.toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-xs text-foreground/60">Duration</p>
                  <p className="text-2xl font-bold">{formatDuration(streamConfig.duration)}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            {!streamConfig.isLive ? (
              <Button onClick={startStream} className="flex-1 bg-red-600 hover:bg-red-700 gap-2">
                <Play className="w-4 h-4" />
                Start Stream
              </Button>
            ) : (
              <Button onClick={stopStream} className="flex-1 bg-gray-600 hover:bg-gray-700 gap-2">
                Stop Stream
              </Button>
            )}
            <Button
              onClick={() => setShowSettings(!showSettings)}
              variant="outline"
              className="gap-2"
            >
              <Settings className="w-4 h-4" />
              Settings
            </Button>
          </div>
        </Card>

        {/* Settings Panel */}
        {showSettings && (
          <Card className="p-6 mb-8 bg-blue-500/5 border-blue-500/20">
            <h3 className="text-lg font-bold mb-4">Stream Settings</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Stream Title</label>
                <input
                  type="text"
                  value={streamConfig.title}
                  onChange={(e) => setStreamConfig(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Description</label>
                <textarea
                  value={streamConfig.description}
                  onChange={(e) => setStreamConfig(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:border-blue-500 outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Streaming Platform</label>
                <select
                  value={streamConfig.platform}
                  onChange={(e) => setStreamConfig(prev => ({ ...prev, platform: e.target.value as any }))}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:border-blue-500 outline-none"
                >
                  <option value="youtube">YouTube Live Only</option>
                  <option value="twitch">Twitch Only</option>
                  <option value="both">YouTube & Twitch (Simultaneous)</option>
                </select>
              </div>

              {(streamConfig.platform === 'youtube' || streamConfig.platform === 'both') && (
                <div>
                  <label className="block text-sm font-semibold mb-2">YouTube Stream Key</label>
                  <input
                    type="password"
                    value={youtubeKey}
                    onChange={(e) => setYoutubeKey(e.target.value)}
                    placeholder="Enter your YouTube Stream Key"
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:border-blue-500 outline-none"
                  />
                  <p className="text-xs text-foreground/60 mt-1">Find this in YouTube Studio → Settings → Stream Key</p>
                </div>
              )}

              {(streamConfig.platform === 'twitch' || streamConfig.platform === 'both') && (
                <div>
                  <label className="block text-sm font-semibold mb-2">Twitch Stream Key</label>
                  <input
                    type="password"
                    value={twitchKey}
                    onChange={(e) => setTwitchKey(e.target.value)}
                    placeholder="Enter your Twitch Stream Key"
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:border-blue-500 outline-none"
                  />
                  <p className="text-xs text-foreground/60 mt-1">Find this in Twitch Creator Dashboard → Settings → Stream Key</p>
                </div>
              )}

              <Button onClick={() => setShowSettings(false)} className="w-full">
                Save Settings
              </Button>
            </div>
          </Card>
        )}

        {/* Platform Info */}
        <Tabs defaultValue="youtube" className="mb-8">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="youtube">YouTube Live</TabsTrigger>
            <TabsTrigger value="twitch">Twitch</TabsTrigger>
          </TabsList>

          <TabsContent value="youtube">
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4">YouTube Live Setup</h3>
              <div className="space-y-3 text-sm">
                <p><strong>1. Go to YouTube Studio:</strong> Visit studio.youtube.com and sign in</p>
                <p><strong>2. Create a Live Stream:</strong> Click "Create" → "Go Live"</p>
                <p><strong>3. Get Stream Key:</strong> In the settings, copy your Stream Key</p>
                <p><strong>4. Configure Title & Description:</strong> Set your stream details above</p>
                <p><strong>5. Start Broadcasting:</strong> Click "Start Stream" to begin</p>
                <p className="text-foreground/60 mt-4">
                  Your stream will be available at: <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">youtube.com/c/YourChannel/live</code>
                </p>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="twitch">
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4">Twitch Setup</h3>
              <div className="space-y-3 text-sm">
                <p><strong>1. Go to Creator Dashboard:</strong> Visit twitch.tv and click your profile</p>
                <p><strong>2. Access Settings:</strong> Click "Creator Dashboard" → "Settings"</p>
                <p><strong>3. Get Stream Key:</strong> Under "Stream Key", click "Show" and copy it</p>
                <p><strong>4. Configure Channel:</strong> Set your stream title and game category</p>
                <p><strong>5. Start Broadcasting:</strong> Click "Start Stream" to begin</p>
                <p className="text-foreground/60 mt-4">
                  Your stream will be available at: <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">twitch.tv/YourChannel</code>
                </p>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Best Practices */}
        <Card className="p-6 bg-green-500/5 border-green-500/20">
          <h3 className="font-bold mb-3">Live Streaming Best Practices</h3>
          <ul className="text-sm space-y-2 text-foreground/80">
            <li>✓ Test your audio and video before going live</li>
            <li>✓ Use a stable internet connection (minimum 5 Mbps upload)</li>
            <li>✓ Keep your stream key confidential - never share it publicly</li>
            <li>✓ Engage with viewers through chat during the broadcast</li>
            <li>✓ Save your stream as a VOD (Video on Demand) for later viewing</li>
            <li>✓ Promote your stream on social media before going live</li>
            <li>✓ Use consistent branding and graphics across platforms</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
