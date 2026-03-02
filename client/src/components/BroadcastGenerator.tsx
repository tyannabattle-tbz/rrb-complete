import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Radio, Mic, Clock, FileText, Send, Play, Pause, Download, Share2 } from 'lucide-react';
import { toast } from 'sonner';

interface BroadcastTemplate {
  id: string;
  name: string;
  type: 'news' | 'music' | 'talk' | 'educational' | 'entertainment';
  duration: number;
  description: string;
}

interface GeneratedBroadcast {
  id: string;
  title: string;
  template: string;
  duration: number;
  content: string;
  status: 'draft' | 'scheduled' | 'broadcasting' | 'completed';
  createdAt: number;
}

export function BroadcastGenerator() {
  const [broadcasts, setBroadcasts] = useState<GeneratedBroadcast[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('news');
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastContent, setBroadcastContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const templates: BroadcastTemplate[] = [
    { id: 'news', name: 'News Broadcast', type: 'news', duration: 30, description: 'Professional news bulletin' },
    { id: 'music', name: 'Music Program', type: 'music', duration: 60, description: 'Music selection and commentary' },
    { id: 'talk', name: 'Talk Show', type: 'talk', duration: 90, description: 'Interview and discussion format' },
    { id: 'educational', name: 'Educational', type: 'educational', duration: 45, description: 'Learning and information content' },
    { id: 'entertainment', name: 'Entertainment', type: 'entertainment', duration: 60, description: 'Entertainment and lifestyle' },
  ];

  const generateBroadcast = async () => {
    if (!broadcastTitle.trim()) {
      toast.error('Please enter a broadcast title');
      return;
    }

    setIsGenerating(true);
    const template = templates.find(t => t.id === selectedTemplate);
    
    // Simulate broadcast generation
    setTimeout(() => {
      const newBroadcast: GeneratedBroadcast = {
        id: `broadcast-${Date.now()}`,
        title: broadcastTitle,
        template: selectedTemplate,
        duration: template?.duration || 60,
        content: broadcastContent || `Generated ${template?.name} content for: ${broadcastTitle}`,
        status: 'draft',
        createdAt: Date.now(),
      };
      
      setBroadcasts([newBroadcast, ...broadcasts]);
      setBroadcastTitle('');
      setBroadcastContent('');
      setIsGenerating(false);
      toast.success('Broadcast generated successfully');
    }, 2000);
  };

  const scheduleBroadcast = (id: string) => {
    setBroadcasts(broadcasts.map(b => 
      b.id === id ? { ...b, status: 'scheduled' as const } : b
    ));
    toast.success('Broadcast scheduled');
  };

  const publishBroadcast = (id: string) => {
    setBroadcasts(broadcasts.map(b => 
      b.id === id ? { ...b, status: 'broadcasting' as const } : b
    ));
    toast.success('Broadcast published to HybridCast');
  };

  const downloadBroadcast = (id: string) => {
    const broadcast = broadcasts.find(b => b.id === id);
    if (broadcast) {
      const content = `BROADCAST: ${broadcast.title}\nTemplate: ${broadcast.template}\nDuration: ${broadcast.duration}m\n\n${broadcast.content}`;
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${broadcast.title.replace(/\s+/g, '-')}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Broadcast downloaded');
    }
  };

  return (
    <div className="space-y-6 p-6">
      <Tabs defaultValue="generator" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-slate-800 border border-slate-700">
          <TabsTrigger value="generator" className="gap-2">
            <Radio className="w-4 h-4" />
            <span className="hidden sm:inline">Generator</span>
          </TabsTrigger>
          <TabsTrigger value="templates" className="gap-2">
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Templates</span>
          </TabsTrigger>
          <TabsTrigger value="broadcasts" className="gap-2">
            <Clock className="w-4 h-4" />
            <span className="hidden sm:inline">Broadcasts</span>
          </TabsTrigger>
        </TabsList>

        {/* Generator Tab */}
        <TabsContent value="generator" className="space-y-4">
          <Card className="bg-slate-800 border-slate-700 p-6">
            <h3 className="text-lg font-bold text-white mb-4">Create Broadcast</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-slate-300 mb-2 block">Select Template</label>
                <select
                  value={selectedTemplate}
                  onChange={e => setSelectedTemplate(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 text-white rounded px-3 py-2"
                >
                  {templates.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.duration}m) - {t.description}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm text-slate-300 mb-2 block">Broadcast Title</label>
                <Input
                  placeholder="Enter broadcast title..."
                  value={broadcastTitle}
                  onChange={e => setBroadcastTitle(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>

              <div>
                <label className="text-sm text-slate-300 mb-2 block">Content (Optional)</label>
                <textarea
                  placeholder="Enter or paste broadcast content..."
                  value={broadcastContent}
                  onChange={e => setBroadcastContent(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 text-white rounded px-3 py-2 h-32 resize-none"
                />
              </div>

              <Button
                onClick={generateBroadcast}
                disabled={isGenerating}
                className="w-full bg-blue-600 hover:bg-blue-700 gap-2"
              >
                <Mic className="w-4 h-4" />
                {isGenerating ? 'Generating...' : 'Generate Broadcast'}
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map(template => (
              <Card key={template.id} className="bg-slate-800 border-slate-700 p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-lg font-bold text-white">{template.name}</h4>
                      <p className="text-sm text-slate-400">{template.description}</p>
                    </div>
                    <div className="bg-blue-600/20 rounded px-2 py-1">
                      <p className="text-xs text-blue-300 font-semibold">{template.duration}m</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => {
                      setSelectedTemplate(template.id);
                      toast.success(`${template.name} selected`);
                    }}
                    className="w-full bg-slate-700 hover:bg-slate-600"
                  >
                    Use Template
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Broadcasts Tab */}
        <TabsContent value="broadcasts" className="space-y-4">
          {broadcasts.length === 0 ? (
            <Card className="bg-slate-800 border-slate-700 p-8 text-center">
              <Radio className="w-12 h-12 text-slate-500 mx-auto mb-3 opacity-50" />
              <p className="text-slate-300">No broadcasts generated yet. Create one to get started.</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {broadcasts.map(broadcast => (
                <Card key={broadcast.id} className="bg-slate-800 border-slate-700 p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-white">{broadcast.title}</h4>
                        <p className="text-sm text-slate-400">
                          {templates.find(t => t.id === broadcast.template)?.name} • {broadcast.duration}m
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          {new Date(broadcast.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        broadcast.status === 'draft' ? 'bg-yellow-600/20 text-yellow-300' :
                        broadcast.status === 'scheduled' ? 'bg-blue-600/20 text-blue-300' :
                        broadcast.status === 'broadcasting' ? 'bg-green-600/20 text-green-300' :
                        'bg-slate-600/20 text-slate-300'
                      }`}>
                        {broadcast.status.toUpperCase()}
                      </div>
                    </div>

                    <p className="text-sm text-slate-300 line-clamp-2">{broadcast.content}</p>

                    <div className="flex gap-2 flex-wrap">
                      {broadcast.status === 'draft' && (
                        <>
                          <Button
                            onClick={() => scheduleBroadcast(broadcast.id)}
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 gap-1"
                          >
                            <Clock className="w-3 h-3" />
                            Schedule
                          </Button>
                          <Button
                            onClick={() => publishBroadcast(broadcast.id)}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 gap-1"
                          >
                            <Send className="w-3 h-3" />
                            Publish
                          </Button>
                        </>
                      )}
                      <Button
                        onClick={() => downloadBroadcast(broadcast.id)}
                        size="sm"
                        variant="outline"
                        className="border-slate-600 gap-1"
                      >
                        <Download className="w-3 h-3" />
                        Download
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-slate-600 gap-1"
                      >
                        <Share2 className="w-3 h-3" />
                        Share
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
