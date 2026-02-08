import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Play, Pause, Upload, Trash2, Edit2, Send, Music, Video, Mic, BookOpen, Radio, Download } from 'lucide-react';
import { toast } from 'sonner';

interface ContentItem {
  id: string;
  title: string;
  type: 'commercial' | 'song' | 'video' | 'podcast' | 'audiobook';
  duration: number;
  status: 'draft' | 'ready' | 'streaming' | 'archived';
  createdAt: number;
}

interface StreamingSession {
  id: string;
  title: string;
  status: 'live' | 'scheduled' | 'completed';
  startTime: number;
  viewers: number;
  content: ContentItem[];
}

export default function MobileStudio() {
  const [content, setContent] = useState<ContentItem[]>([
    { id: '1', title: 'Nike Ad Campaign', type: 'commercial', duration: 30, status: 'ready', createdAt: Date.now() - 86400000 },
    { id: '2', title: 'Summer Hits Playlist', type: 'song', duration: 240, status: 'ready', createdAt: Date.now() - 172800000 },
    { id: '3', title: 'Product Launch Video', type: 'video', duration: 120, status: 'ready', createdAt: Date.now() - 259200000 },
    { id: '4', title: 'Tech Talk Podcast', type: 'podcast', duration: 60, status: 'ready', createdAt: Date.now() - 345600000 },
    { id: '5', title: 'Business Audiobook', type: 'audiobook', duration: 480, status: 'ready', createdAt: Date.now() - 432000000 },
  ]);

  const [sessions, setSessions] = useState<StreamingSession[]>([
    {
      id: '1',
      title: 'Morning Broadcast',
      status: 'live',
      startTime: Date.now() - 3600000,
      viewers: 2340,
      content: [content[0], content[1], content[2]],
    },
  ]);

  const [newContentTitle, setNewContentTitle] = useState('');
  const [newContentType, setNewContentType] = useState<'commercial' | 'song' | 'video' | 'podcast' | 'audiobook'>('commercial');
  const [newContentDuration, setNewContentDuration] = useState(30);
  const [isRecording, setIsRecording] = useState(false);
  const [currentSession, setCurrentSession] = useState<StreamingSession | null>(null);

  const createContent = () => {
    if (!newContentTitle.trim()) {
      toast.error('Please enter content title');
      return;
    }

    const newItem: ContentItem = {
      id: `content-${Date.now()}`,
      title: newContentTitle,
      type: newContentType,
      duration: newContentDuration,
      status: 'draft',
      createdAt: Date.now(),
    };

    setContent([newItem, ...content]);
    setNewContentTitle('');
    setNewContentDuration(30);
    toast.success('Content created successfully');
  };

  const publishContent = (id: string) => {
    setContent(content.map(c => 
      c.id === id ? { ...c, status: 'ready' as const } : c
    ));
    toast.success('Content published');
  };

  const startStreaming = (contentItems: ContentItem[]) => {
    const session: StreamingSession = {
      id: `session-${Date.now()}`,
      title: `Live Stream ${new Date().toLocaleTimeString()}`,
      status: 'live',
      startTime: Date.now(),
      viewers: Math.floor(Math.random() * 5000),
      content: contentItems,
    };

    setSessions([session, ...sessions]);
    setCurrentSession(session);
    toast.success('Streaming started');
  };

  const stopStreaming = (id: string) => {
    setSessions(sessions.map(s => 
      s.id === id ? { ...s, status: 'completed' as const } : s
    ));
    setCurrentSession(null);
    toast.success('Streaming stopped');
  };

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'commercial':
        return <Radio className="w-4 h-4" />;
      case 'song':
        return <Music className="w-4 h-4" />;
      case 'video':
        return <Video className="w-4 h-4" />;
      case 'podcast':
        return <Mic className="w-4 h-4" />;
      case 'audiobook':
        return <BookOpen className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const readyContent = content.filter(c => c.status === 'ready');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white">Mobile Studio</h1>
            <p className="text-slate-300">Create, manage, and stream content end-to-end</p>
          </div>
          {currentSession && (
            <div className="bg-red-600/20 border border-red-600 rounded-lg p-4 text-center">
              <p className="text-red-300 font-bold text-lg">🔴 LIVE</p>
              <p className="text-red-200 text-sm">{currentSession.viewers.toLocaleString()} viewers</p>
            </div>
          )}
        </div>

        <Tabs defaultValue="create" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-slate-800 border border-slate-700">
            <TabsTrigger value="create" className="gap-2">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Create</span>
            </TabsTrigger>
            <TabsTrigger value="library" className="gap-2">
              <Music className="w-4 h-4" />
              <span className="hidden sm:inline">Library</span>
            </TabsTrigger>
            <TabsTrigger value="streaming" className="gap-2">
              <Radio className="w-4 h-4" />
              <span className="hidden sm:inline">Streaming</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <Video className="w-4 h-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
          </TabsList>

          {/* Create Tab */}
          <TabsContent value="create" className="space-y-4">
            <Card className="bg-slate-800 border-slate-700 p-6">
              <h2 className="text-xl font-bold text-white mb-4">Create New Content</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-slate-300 mb-2 block">Content Title</label>
                  <Input
                    placeholder="Enter content title..."
                    value={newContentTitle}
                    onChange={e => setNewContentTitle(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>

                <div>
                  <label className="text-sm text-slate-300 mb-2 block">Content Type</label>
                  <select
                    value={newContentType}
                    onChange={e => setNewContentType(e.target.value as any)}
                    className="w-full bg-slate-700 border border-slate-600 text-white rounded px-3 py-2"
                  >
                    <option value="commercial">Commercial</option>
                    <option value="song">Song/Music</option>
                    <option value="video">Video</option>
                    <option value="podcast">Podcast</option>
                    <option value="audiobook">Audiobook</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm text-slate-300 mb-2 block">Duration (seconds)</label>
                  <Input
                    type="number"
                    min="1"
                    value={newContentDuration}
                    onChange={e => setNewContentDuration(parseInt(e.target.value))}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>

                <div className="flex gap-2 items-end">
                  <Button
                    onClick={() => setIsRecording(!isRecording)}
                    className={`${isRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'} flex-1 gap-2`}
                  >
                    <Mic className="w-4 h-4" />
                    {isRecording ? 'Stop Recording' : 'Start Recording'}
                  </Button>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button
                  onClick={createContent}
                  className="flex-1 bg-green-600 hover:bg-green-700 gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create Content
                </Button>
                <Button
                  onClick={() => toast.success('File uploaded')}
                  variant="outline"
                  className="flex-1 border-slate-600 gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Upload File
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* Library Tab */}
          <TabsContent value="library" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {content.map(item => (
                <Card key={item.id} className="bg-slate-800 border-slate-700 p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getContentIcon(item.type)}
                        <h3 className="font-bold text-white text-sm line-clamp-2">{item.title}</h3>
                      </div>
                    </div>

                    <div className="text-xs text-slate-400 space-y-1">
                      <p>{Math.floor(item.duration / 60)}m {item.duration % 60}s</p>
                      <p className={`px-2 py-1 rounded w-fit ${
                        item.status === 'ready' ? 'bg-green-600/20 text-green-300' :
                        item.status === 'draft' ? 'bg-yellow-600/20 text-yellow-300' :
                        'bg-blue-600/20 text-blue-300'
                      }`}>
                        {item.status}
                      </p>
                    </div>

                    <div className="flex gap-1">
                      {item.status === 'draft' && (
                        <Button
                          onClick={() => publishContent(item.id)}
                          size="sm"
                          className="flex-1 bg-green-600 hover:bg-green-700 h-8"
                        >
                          Publish
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 border-slate-600 h-8"
                      >
                        <Edit2 className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-600 text-red-400 hover:bg-red-600/20 h-8"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Streaming Tab */}
          <TabsContent value="streaming" className="space-y-4">
            <Card className="bg-slate-800 border-slate-700 p-6">
              <h2 className="text-xl font-bold text-white mb-4">Start Streaming</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-white mb-3">Select Content to Stream</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {readyContent.map(item => (
                      <Button
                        key={item.id}
                        onClick={() => startStreaming([item])}
                        className="bg-slate-700 hover:bg-slate-600 text-white h-24 flex flex-col items-center justify-center gap-2"
                      >
                        {getContentIcon(item.type)}
                        <span className="text-sm text-center line-clamp-2">{item.title}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                {currentSession && (
                  <div className="bg-red-600/20 border border-red-600 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-red-300 font-bold">Currently Streaming</p>
                        <p className="text-red-200 text-sm">{currentSession.title}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-red-300 font-bold text-lg">{currentSession.viewers.toLocaleString()}</p>
                        <p className="text-red-200 text-xs">viewers</p>
                      </div>
                    </div>
                    <Button
                      onClick={() => stopStreaming(currentSession.id)}
                      className="w-full bg-red-600 hover:bg-red-700"
                    >
                      Stop Streaming
                    </Button>
                  </div>
                )}
              </div>
            </Card>

            {/* Sessions History */}
            <Card className="bg-slate-800 border-slate-700 p-6">
              <h3 className="text-lg font-bold text-white mb-4">Streaming Sessions</h3>
              <div className="space-y-3">
                {sessions.map(session => (
                  <div key={session.id} className="bg-slate-700 rounded p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-white">{session.title}</h4>
                      <span className={`text-xs px-2 py-1 rounded ${
                        session.status === 'live' ? 'bg-red-600/20 text-red-300' :
                        session.status === 'scheduled' ? 'bg-yellow-600/20 text-yellow-300' :
                        'bg-slate-600/20 text-slate-300'
                      }`}>
                        {session.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400">{session.content.length} items • {session.viewers.toLocaleString()} viewers</p>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-slate-800 border-slate-700 p-4">
                <p className="text-slate-400 text-sm">Total Content</p>
                <p className="text-3xl font-bold text-blue-400 mt-2">{content.length}</p>
              </Card>
              <Card className="bg-slate-800 border-slate-700 p-4">
                <p className="text-slate-400 text-sm">Ready to Stream</p>
                <p className="text-3xl font-bold text-green-400 mt-2">{readyContent.length}</p>
              </Card>
              <Card className="bg-slate-800 border-slate-700 p-4">
                <p className="text-slate-400 text-sm">Total Duration</p>
                <p className="text-3xl font-bold text-purple-400 mt-2">{Math.floor(content.reduce((sum, c) => sum + c.duration, 0) / 60)}h</p>
              </Card>
              <Card className="bg-slate-800 border-slate-700 p-4">
                <p className="text-slate-400 text-sm">Active Sessions</p>
                <p className="text-3xl font-bold text-orange-400 mt-2">{sessions.filter(s => s.status === 'live').length}</p>
              </Card>
            </div>

            <Card className="bg-slate-800 border-slate-700 p-6">
              <h3 className="text-lg font-bold text-white mb-4">Content Distribution</h3>
              <div className="space-y-3">
                {['commercial', 'song', 'video', 'podcast', 'audiobook'].map(type => {
                  const count = content.filter(c => c.type === type as any).length;
                  return (
                    <div key={type} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-300 capitalize">{type}s</span>
                        <span className="text-white font-semibold">{count}</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${(count / content.length) * 100}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
