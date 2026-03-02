import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Film, Droplet, BarChart3, Share2, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface GenerationResult {
  id: string;
  type: 'video' | 'watermark' | 'analytics' | 'marketing';
  status: 'processing' | 'completed' | 'failed';
  result?: string;
  timestamp: number;
}

export function FunctionalFeatures() {
  const [results, setResults] = useState<GenerationResult[]>([]);
  const [loading, setLoading] = useState(false);

  // Video Generation
  const handleVideoGeneration = async (prompt: string) => {
    if (!prompt.trim()) {
      toast.error('Please enter a video prompt');
      return;
    }
    setLoading(true);
    const resultId = `result-${Date.now()}`;
    setResults(prev => [...prev, {
      id: resultId,
      type: 'video',
      status: 'processing',
      timestamp: Date.now(),
    }]);

    // Simulate processing
    setTimeout(() => {
      setResults(prev => prev.map(r => 
        r.id === resultId 
          ? { ...r, status: 'completed', result: `Generated video from: "${prompt}"` }
          : r
      ));
      toast.success('Video generated successfully');
      setLoading(false);
    }, 2000);
  };

  // Watermarking
  const handleWatermarking = async (text: string) => {
    if (!text.trim()) {
      toast.error('Please enter watermark text');
      return;
    }
    setLoading(true);
    const resultId = `result-${Date.now()}`;
    setResults(prev => [...prev, {
      id: resultId,
      type: 'watermark',
      status: 'processing',
      timestamp: Date.now(),
    }]);

    setTimeout(() => {
      setResults(prev => prev.map(r => 
        r.id === resultId 
          ? { ...r, status: 'completed', result: `Watermark applied: "${text}"` }
          : r
      ));
      toast.success('Watermark applied successfully');
      setLoading(false);
    }, 1500);
  };

  // Analytics
  const handleAnalytics = async (metric: string) => {
    if (!metric.trim()) {
      toast.error('Please select a metric');
      return;
    }
    setLoading(true);
    const resultId = `result-${Date.now()}`;
    setResults(prev => [...prev, {
      id: resultId,
      type: 'analytics',
      status: 'processing',
      timestamp: Date.now(),
    }]);

    setTimeout(() => {
      const mockData = {
        'views': '12,450 total views',
        'engagement': '8.5% engagement rate',
        'shares': '342 shares',
        'watch-time': '2,341 hours watched',
      };
      setResults(prev => prev.map(r => 
        r.id === resultId 
          ? { ...r, status: 'completed', result: `${metric}: ${mockData[metric as keyof typeof mockData] || 'Data generated'}` }
          : r
      ));
      toast.success('Analytics generated');
      setLoading(false);
    }, 1500);
  };

  // Marketing
  const handleMarketing = async (campaign: string) => {
    if (!campaign.trim()) {
      toast.error('Please enter campaign details');
      return;
    }
    setLoading(true);
    const resultId = `result-${Date.now()}`;
    setResults(prev => [...prev, {
      id: resultId,
      type: 'marketing',
      status: 'processing',
      timestamp: Date.now(),
    }]);

    setTimeout(() => {
      setResults(prev => prev.map(r => 
        r.id === resultId 
          ? { ...r, status: 'completed', result: `Campaign created: "${campaign}" - Ready to publish` }
          : r
      ));
      toast.success('Marketing campaign created');
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="space-y-6 p-6">
      <Tabs defaultValue="video" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="video" className="gap-2">
            <Film className="w-4 h-4" />
            <span className="hidden sm:inline">Video</span>
          </TabsTrigger>
          <TabsTrigger value="watermark" className="gap-2">
            <Droplet className="w-4 h-4" />
            <span className="hidden sm:inline">Watermark</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="marketing" className="gap-2">
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">Marketing</span>
          </TabsTrigger>
        </TabsList>

        {/* Video Generation */}
        <TabsContent value="video" className="space-y-4">
          <Card className="bg-slate-800 border-slate-700 p-6">
            <h3 className="text-lg font-bold text-white mb-4">Video Generation</h3>
            <div className="space-y-3">
              <Input
                id="video-prompt"
                placeholder="Describe the video you want to generate..."
                className="bg-slate-700 border-slate-600 text-white"
              />
              <Button
                onClick={() => {
                  const input = document.getElementById('video-prompt') as HTMLInputElement;
                  handleVideoGeneration(input.value);
                  input.value = '';
                }}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Film className="w-4 h-4 mr-2" />}
                Generate Video
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* Watermarking */}
        <TabsContent value="watermark" className="space-y-4">
          <Card className="bg-slate-800 border-slate-700 p-6">
            <h3 className="text-lg font-bold text-white mb-4">Add Watermark</h3>
            <div className="space-y-3">
              <Input
                id="watermark-text"
                placeholder="Enter watermark text..."
                className="bg-slate-700 border-slate-600 text-white"
              />
              <Button
                onClick={() => {
                  const input = document.getElementById('watermark-text') as HTMLInputElement;
                  handleWatermarking(input.value);
                  input.value = '';
                }}
                disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Droplet className="w-4 h-4 mr-2" />}
                Apply Watermark
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* Analytics */}
        <TabsContent value="analytics" className="space-y-4">
          <Card className="bg-slate-800 border-slate-700 p-6">
            <h3 className="text-lg font-bold text-white mb-4">View Analytics</h3>
            <div className="space-y-3">
              <select
                id="analytics-metric"
                className="w-full bg-slate-700 border border-slate-600 text-white rounded px-3 py-2"
              >
                <option value="">Select a metric...</option>
                <option value="views">Total Views</option>
                <option value="engagement">Engagement Rate</option>
                <option value="shares">Shares</option>
                <option value="watch-time">Watch Time</option>
              </select>
              <Button
                onClick={() => {
                  const select = document.getElementById('analytics-metric') as HTMLSelectElement;
                  handleAnalytics(select.value);
                }}
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <BarChart3 className="w-4 h-4 mr-2" />}
                Generate Report
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* Marketing */}
        <TabsContent value="marketing" className="space-y-4">
          <Card className="bg-slate-800 border-slate-700 p-6">
            <h3 className="text-lg font-bold text-white mb-4">Create Campaign</h3>
            <div className="space-y-3">
              <Input
                id="marketing-campaign"
                placeholder="Describe your marketing campaign..."
                className="bg-slate-700 border-slate-600 text-white"
              />
              <Button
                onClick={() => {
                  const input = document.getElementById('marketing-campaign') as HTMLInputElement;
                  handleMarketing(input.value);
                  input.value = '';
                }}
                disabled={loading}
                className="w-full bg-orange-600 hover:bg-orange-700"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Share2 className="w-4 h-4 mr-2" />}
                Create Campaign
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Results */}
      {results.length > 0 && (
        <Card className="bg-slate-800 border-slate-700 p-6">
          <h3 className="text-lg font-bold text-white mb-4">Results</h3>
          <div className="space-y-3">
            {results.map(result => (
              <div key={result.id} className="bg-slate-700 rounded p-4 flex items-start gap-3">
                {result.status === 'processing' && <Loader2 className="w-5 h-5 animate-spin text-blue-400 mt-0.5 flex-shrink-0" />}
                {result.status === 'completed' && <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />}
                {result.status === 'failed' && <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />}
                <div className="flex-1">
                  <p className="text-slate-200 capitalize font-medium">{result.type}</p>
                  <p className="text-slate-400 text-sm">{result.result || 'Processing...'}</p>
                  <p className="text-slate-500 text-xs mt-1">{new Date(result.timestamp).toLocaleTimeString()}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
