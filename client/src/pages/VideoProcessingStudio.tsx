import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Film, Zap, Settings, Play, Pause, Download, Share2 } from 'lucide-react';
import { toast } from 'sonner';

export default function VideoProcessingStudio() {
  const [activeProvider, setActiveProvider] = useState<'synthesia' | 'did' | 'runway'>('synthesia');
  const [isProcessing, setIsProcessing] = useState(false);

  const providers = [
    {
      id: 'synthesia',
      name: 'Synthesia',
      icon: '🎬',
      description: 'AI Avatar Video Generation',
      features: ['Avatar Selection', 'Voice Synthesis', 'Script-Based'],
      status: 'active',
    },
    {
      id: 'did',
      name: 'D-ID',
      icon: '👤',
      description: 'Digital Human Creation',
      features: ['Realistic Avatars', 'Emotion Control', 'Audio Sync'],
      status: 'active',
    },
    {
      id: 'runway',
      name: 'Runway ML',
      icon: '🎨',
      description: 'AI Video Generation',
      features: ['Text-to-Video', 'Style Transfer', 'Inpainting'],
      status: 'active',
    },
  ];

  const recentVideos = [
    {
      id: 'video-1',
      title: 'Product Demo',
      provider: 'Synthesia',
      status: 'completed',
      duration: '2:30',
      size: '245.8 MB',
      createdAt: '2 hours ago',
    },
    {
      id: 'video-2',
      title: 'Tutorial',
      provider: 'Runway ML',
      status: 'processing',
      progress: 65,
      duration: '1:15',
      createdAt: '30 minutes ago',
    },
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Video Processing Studio</h1>
          <p className="text-slate-600 mt-2">Generate professional videos with AI providers</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Settings className="w-4 h-4" />
            Settings
          </Button>
        </div>
      </div>

      {/* Provider Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {providers.map((provider) => (
          <Card
            key={provider.id}
            className={`cursor-pointer transition-all ${
              activeProvider === provider.id
                ? 'ring-2 ring-blue-600 shadow-lg'
                : 'hover:shadow-md'
            }`}
            onClick={() => setActiveProvider(provider.id as any)}
          >
            <CardContent className="pt-6">
              <div className="text-4xl mb-3">{provider.icon}</div>
              <h3 className="font-semibold text-slate-900">{provider.name}</h3>
              <p className="text-sm text-slate-600 mt-1">{provider.description}</p>
              <div className="flex gap-1 mt-3 flex-wrap">
                {provider.features.map((feature) => (
                  <Badge key={feature} variant="outline" className="text-xs">
                    {feature}
                  </Badge>
                ))}
              </div>
              <Badge className="mt-3 bg-green-100 text-green-800">{provider.status}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Provider Configuration */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Configure {providers.find(p => p.id === activeProvider)?.name}</CardTitle>
          <CardDescription>Set up API credentials and preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                API Key
              </label>
              <input
                type="password"
                placeholder="Enter your API key"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                API Secret
              </label>
              <input
                type="password"
                placeholder="Enter your API secret (if required)"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button className="bg-blue-600 hover:bg-blue-700">Save Credentials</Button>
            <Button variant="outline">Test Connection</Button>
          </div>
        </CardContent>
      </Card>

      {/* Video Generation */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Generate Video</CardTitle>
          <CardDescription>Create a new video with your selected provider</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">
              Script / Description
            </label>
            <textarea
              placeholder="Enter your script or video description..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={5}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Duration (seconds)
              </label>
              <input
                type="number"
                min="1"
                max="600"
                defaultValue="60"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Resolution
              </label>
              <select className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="720p">720p</option>
                <option value="1080p">1080p</option>
                <option value="4k">4K</option>
              </select>
            </div>
          </div>
          <Button
            onClick={() => {
              setIsProcessing(true);
              setTimeout(() => {
                setIsProcessing(false);
                toast.success('Video generation started!');
              }, 2000);
            }}
            disabled={isProcessing}
            className="w-full bg-blue-600 hover:bg-blue-700 gap-2"
          >
            <Zap className="w-4 h-4" />
            {isProcessing ? 'Generating...' : 'Generate Video'}
          </Button>
        </CardContent>
      </Card>

      {/* Recent Videos */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Recent Videos</CardTitle>
          <CardDescription>Your generated videos and processing status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentVideos.map((video) => (
              <div key={video.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Film className="w-8 h-8 text-blue-600" />
                  <div>
                    <h4 className="font-semibold text-slate-900">{video.title}</h4>
                    <p className="text-sm text-slate-600">{video.provider} • {video.createdAt}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {video.status === 'processing' && (
                    <div className="text-right">
                      <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 transition-all"
                          style={{ width: `${video.progress}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">{video.progress}%</p>
                    </div>
                  )}
                  {video.status === 'completed' && (
                    <Badge className="bg-green-100 text-green-800">Completed</Badge>
                  )}
                  <div className="flex gap-2">
                    {video.status === 'completed' && (
                      <>
                        <Button size="sm" variant="outline" className="gap-1">
                          <Play className="w-3 h-3" />
                          Preview
                        </Button>
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 gap-1">
                          <Download className="w-3 h-3" />
                          Download
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* API Status */}
      <Card className="shadow-lg bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-lg">API Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {['Synthesia', 'D-ID', 'Runway ML'].map((provider) => (
              <div key={provider} className="p-3 bg-white rounded-lg">
                <p className="text-sm font-semibold text-slate-900">{provider}</p>
                <Badge className="mt-2 bg-green-100 text-green-800">Connected</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
