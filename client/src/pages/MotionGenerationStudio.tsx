import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Film, Zap, Wand2, Play, Download, Clock, Settings } from 'lucide-react';
import { toast } from 'sonner';

export default function MotionGenerationStudio() {
  const [activeTab, setActiveTab] = useState<'create' | 'templates' | 'history'>('create');
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    duration: 10,
    style: 'cinematic',
    resolution: '1080p',
    fps: 30,
  });

  const handleGenerateVideo = async () => {
    if (!formData.description.trim()) {
      toast.error('Please enter a video description');
      return;
    }

    setIsGenerating(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      toast.success('Video generation started! Processing your request...');
      setFormData({ ...formData, description: '' });
    } catch (error) {
      toast.error('Failed to generate video');
    } finally {
      setIsGenerating(false);
    }
  };

  const templates = [
    {
      id: 'template-1',
      name: 'Product Showcase',
      category: 'Marketing',
      duration: 30,
      preview: '🎬',
      description: 'Professional product demonstration',
    },
    {
      id: 'template-2',
      name: 'Tutorial',
      category: 'Education',
      duration: 15,
      preview: '📚',
      description: 'Step-by-step tutorial animation',
    },
    {
      id: 'template-3',
      name: 'Social Teaser',
      category: 'Social',
      duration: 10,
      preview: '📱',
      description: 'Short engaging teaser',
    },
    {
      id: 'template-4',
      name: 'Explainer',
      category: 'Education',
      duration: 60,
      preview: '💡',
      description: 'Comprehensive explainer video',
    },
  ];

  const recentVideos = [
    {
      id: 'clip-1',
      title: 'Product Demo',
      status: 'completed',
      duration: 30,
      size: '125.5 MB',
      createdAt: '2 days ago',
    },
    {
      id: 'clip-2',
      title: 'Tutorial',
      status: 'completed',
      duration: 15,
      size: '45.2 MB',
      createdAt: '1 day ago',
    },
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Motion Generation Studio</h1>
          <p className="text-slate-600 mt-2">Create professional videos, animations, and motion graphics</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Settings className="w-4 h-4" />
            Settings
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        {[
          { id: 'create', label: 'Create', icon: Wand2 },
          { id: 'templates', label: 'Templates', icon: Film },
          { id: 'history', label: 'History', icon: Clock },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Create Tab */}
      {activeTab === 'create' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Generate Video</CardTitle>
                <CardDescription>Describe what you want to see and we'll create it for you</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Video Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the video you want to create. Be as detailed as possible..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={6}
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
                      max="300"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      Style
                    </label>
                    <select
                      value={formData.style}
                      onChange={(e) => setFormData({ ...formData, style: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="cinematic">Cinematic</option>
                      <option value="animated">Animated</option>
                      <option value="motion-graphics">Motion Graphics</option>
                      <option value="documentary">Documentary</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      Resolution
                    </label>
                    <select
                      value={formData.resolution}
                      onChange={(e) => setFormData({ ...formData, resolution: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="720p">720p</option>
                      <option value="1080p">1080p</option>
                      <option value="4k">4K</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      FPS
                    </label>
                    <select
                      value={formData.fps}
                      onChange={(e) => setFormData({ ...formData, fps: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="24">24</option>
                      <option value="30">30</option>
                      <option value="60">60</option>
                    </select>
                  </div>
                </div>

                <Button
                  onClick={handleGenerateVideo}
                  disabled={isGenerating}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2"
                >
                  <Wand2 className="w-4 h-4" />
                  {isGenerating ? 'Generating...' : 'Generate Video'}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Quick Tips */}
          <div className="space-y-4">
            <Card className="shadow-lg bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-lg">Tips for Best Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-blue-900">
                <p>• Be specific with your description</p>
                <p>• Include desired colors and mood</p>
                <p>• Mention key scenes or transitions</p>
                <p>• Specify any text or captions needed</p>
                <p>• Longer descriptions = better results</p>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Quotas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600">Videos this month</span>
                    <span className="font-semibold">12/100</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '12%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600">Minutes used</span>
                    <span className="font-semibold">245/1000</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '24.5%' }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {templates.map((template) => (
            <Card key={template.id} className="shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <div className="text-4xl mb-3">{template.preview}</div>
                <h3 className="font-semibold text-slate-900">{template.name}</h3>
                <p className="text-sm text-slate-600 mt-1">{template.description}</p>
                <div className="flex items-center justify-between mt-3">
                  <Badge variant="outline" className="text-xs">
                    {template.category}
                  </Badge>
                  <span className="text-xs text-slate-500">{template.duration}s</span>
                </div>
                <Button className="w-full mt-3 bg-blue-600 hover:bg-blue-700" size="sm">
                  <Play className="w-3 h-3 mr-1" />
                  Use Template
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {recentVideos.map((video) => (
            <Card key={video.id} className="shadow-lg">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Film className="w-10 h-10 text-blue-600" />
                    <div>
                      <h3 className="font-semibold text-slate-900">{video.title}</h3>
                      <p className="text-sm text-slate-600">{video.createdAt}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <Badge className="bg-green-100 text-green-800 mb-1">
                        {video.status}
                      </Badge>
                      <p className="text-sm text-slate-600">{video.size}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="gap-1">
                        <Play className="w-4 h-4" />
                        Preview
                      </Button>
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700 gap-1">
                        <Download className="w-4 h-4" />
                        Download
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Features */}
      <Card className="shadow-lg bg-slate-50">
        <CardHeader>
          <CardTitle>Motion Generation Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: Wand2, title: 'AI-Powered', desc: 'Advanced AI generates videos from descriptions' },
              { icon: Zap, title: 'Fast Processing', desc: 'Quick turnaround times for your videos' },
              { icon: Film, title: 'Multiple Styles', desc: 'Cinematic, animated, motion graphics & more' },
            ].map((feature, idx) => (
              <div key={idx} className="p-4 bg-white rounded-lg">
                <feature.icon className="w-6 h-6 text-blue-600 mb-2" />
                <h4 className="font-semibold text-slate-900">{feature.title}</h4>
                <p className="text-sm text-slate-600 mt-1">{feature.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
