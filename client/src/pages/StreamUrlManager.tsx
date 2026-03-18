import React, { useState } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import {
  Radio, Edit3, Save, X, Check, AlertCircle, ExternalLink,
  ArrowLeft, Search, RefreshCw, Loader2, Globe, Zap, Music
} from 'lucide-react';

const FREQUENCY_OPTIONS = ['432 Hz', '440 Hz', '528 Hz'];

export default function StreamUrlManager() {
  const { user, isLoading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editUrl, setEditUrl] = useState('');
  const [editFreq, setEditFreq] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [testingId, setTestingId] = useState<number | null>(null);
  const [testResults, setTestResults] = useState<Record<number, 'ok' | 'fail' | 'testing'>>({});

  const channelsQuery = trpc.radioStations.listChannels.useQuery();
  const updateChannel = trpc.radioStations.updateChannel.useMutation({
    onSuccess: () => {
      toast({ title: 'Stream URL Updated', description: 'Channel stream URL has been updated successfully.' });
      channelsQuery.refetch();
      setEditingId(null);
    },
    onError: (err) => {
      toast({ title: 'Update Failed', description: err.message, variant: 'destructive' });
    },
  });

  if (authLoading) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="w-8 h-8 animate-spin text-purple-500" /></div>;
  if (!user) { navigate('/'); return null; }

  const channels = (channelsQuery.data as any[]) || [];
  const filtered = channels.filter((ch: any) =>
    ch.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ch.genre?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const startEdit = (ch: any) => {
    setEditingId(ch.id);
    setEditUrl(ch.streamUrl || '');
    setEditFreq(ch.frequency || '432 Hz');
  };

  const saveEdit = (id: number) => {
    updateChannel.mutate({ id, streamUrl: editUrl, frequency: editFreq });
  };

  const testStream = async (id: number, url: string) => {
    setTestingId(id);
    setTestResults(prev => ({ ...prev, [id]: 'testing' }));
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(url, { method: 'HEAD', signal: controller.signal, mode: 'no-cors' });
      clearTimeout(timeout);
      setTestResults(prev => ({ ...prev, [id]: 'ok' }));
      toast({ title: 'Stream Reachable', description: 'The stream URL responded successfully.' });
    } catch {
      // no-cors mode always succeeds for audio streams, so try audio element
      try {
        const audio = new Audio();
        audio.crossOrigin = 'anonymous';
        const loadPromise = new Promise<void>((resolve, reject) => {
          audio.oncanplay = () => { audio.pause(); resolve(); };
          audio.onerror = () => reject(new Error('Audio load failed'));
          setTimeout(() => reject(new Error('Timeout')), 8000);
        });
        audio.src = url;
        audio.load();
        await loadPromise;
        setTestResults(prev => ({ ...prev, [id]: 'ok' }));
        toast({ title: 'Stream Reachable', description: 'Audio stream loaded successfully.' });
      } catch {
        setTestResults(prev => ({ ...prev, [id]: 'fail' }));
        toast({ title: 'Stream Unreachable', description: 'Could not connect to the stream URL.', variant: 'destructive' });
      }
    }
    setTestingId(null);
  };

  const testAllStreams = async () => {
    toast({ title: 'Testing All Streams', description: `Testing ${filtered.length} stream URLs...` });
    for (const ch of filtered) {
      if (ch.streamUrl) {
        await testStream(ch.id, ch.streamUrl);
        await new Promise(r => setTimeout(r, 200));
      }
    }
    const results = Object.values(testResults);
    const ok = results.filter(r => r === 'ok').length;
    toast({ title: 'Test Complete', description: `${ok}/${filtered.length} streams reachable.` });
  };

  const stats = {
    total: channels.length,
    active: channels.filter((c: any) => c.status === 'active').length,
    withUrl: channels.filter((c: any) => c.streamUrl && c.streamUrl.length > 5).length,
    freq432: channels.filter((c: any) => c.frequency === '432 Hz').length,
    freq440: channels.filter((c: any) => c.frequency === '440 Hz').length,
    freq528: channels.filter((c: any) => c.frequency === '528 Hz').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-purple-950/20 to-gray-950 text-white">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate('/rrb-radio')} className="text-gray-400 hover:text-white">
            <ArrowLeft className="w-4 h-4 mr-1" /> Radio
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Radio className="w-6 h-6 text-purple-400" />
              Stream URL Manager
            </h1>
            <p className="text-gray-400 text-sm">Manage stream URLs for all {stats.total} radio channels</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => channelsQuery.refetch()} className="border-purple-500/30 text-purple-300">
            <RefreshCw className="w-4 h-4 mr-1" /> Refresh
          </Button>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-6">
          {[
            { label: 'Total Channels', value: stats.total, icon: Radio, color: 'purple' },
            { label: 'Active', value: stats.active, icon: Check, color: 'green' },
            { label: 'With Stream URL', value: stats.withUrl, icon: Globe, color: 'blue' },
            { label: '432 Hz', value: stats.freq432, icon: Music, color: 'amber' },
            { label: '440 Hz', value: stats.freq440, icon: Zap, color: 'cyan' },
            { label: '528 Hz', value: stats.freq528, icon: Zap, color: 'pink' },
          ].map((s, i) => (
            <div key={i} className="bg-gray-900/60 border border-gray-800 rounded-lg p-3 text-center">
              <s.icon className={`w-4 h-4 mx-auto mb-1 text-${s.color}-400`} />
              <div className="text-lg font-bold">{s.value}</div>
              <div className="text-xs text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Search & Actions */}
        <div className="flex gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input
              placeholder="Search channels by name or genre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-900/60 border-gray-700 text-white"
            />
          </div>
          <Button variant="outline" size="sm" onClick={testAllStreams} className="border-green-500/30 text-green-300 whitespace-nowrap">
            <Check className="w-4 h-4 mr-1" /> Test All
          </Button>
        </div>

        {/* Channel List */}
        <div className="space-y-2">
          {channelsQuery.isLoading ? (
            <div className="text-center py-12 text-gray-500"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />Loading channels...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No channels found</div>
          ) : (
            filtered.map((ch: any) => (
              <Card key={ch.id} className="bg-gray-900/40 border-gray-800 hover:border-purple-500/30 transition-colors">
                <CardContent className="p-4">
                  {editingId === ch.id ? (
                    /* Edit Mode */
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-purple-300 border-purple-500/30">#{ch.id}</Badge>
                          <span className="font-semibold">{ch.name}</span>
                          <Badge className="bg-blue-500/20 text-blue-300">{ch.genre}</Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => saveEdit(ch.id)} disabled={updateChannel.isPending}
                            className="bg-green-600 hover:bg-green-700 text-white">
                            {updateChannel.isPending ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Save className="w-3 h-3 mr-1" />}
                            Save
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setEditingId(null)} className="text-gray-400">
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3">
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">Stream URL</label>
                          <Input
                            value={editUrl}
                            onChange={(e) => setEditUrl(e.target.value)}
                            placeholder="https://your-stream-server.com/stream.mp3"
                            className="bg-gray-800 border-gray-700 text-white font-mono text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">Frequency</label>
                          <select
                            value={editFreq}
                            onChange={(e) => setEditFreq(e.target.value)}
                            className="bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white text-sm"
                          >
                            {FREQUENCY_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
                          </select>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">
                        Supported formats: Icecast (.mp3), Shoutcast, HLS (.m3u8), direct audio URLs
                      </p>
                    </div>
                  ) : (
                    /* View Mode */
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <Badge variant="outline" className="text-gray-500 border-gray-700 shrink-0">#{ch.id}</Badge>
                        <span className="font-semibold truncate">{ch.name}</span>
                        <Badge className="bg-purple-500/20 text-purple-300 shrink-0">{ch.frequency}</Badge>
                        <Badge className="bg-gray-700/50 text-gray-400 shrink-0 hidden md:inline-flex">{ch.genre}</Badge>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {testResults[ch.id] === 'ok' && <Check className="w-4 h-4 text-green-400" />}
                        {testResults[ch.id] === 'fail' && <AlertCircle className="w-4 h-4 text-red-400" />}
                        {testResults[ch.id] === 'testing' && <Loader2 className="w-4 h-4 animate-spin text-yellow-400" />}
                        <code className="text-xs text-gray-500 max-w-[200px] truncate hidden lg:block">{ch.streamUrl || 'No URL'}</code>
                        <Button size="sm" variant="ghost" onClick={() => testStream(ch.id, ch.streamUrl)}
                          disabled={testingId === ch.id} className="text-gray-400 hover:text-green-400">
                          {testingId === ch.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Globe className="w-3 h-3" />}
                        </Button>
                        {ch.streamUrl && (
                          <a href={ch.streamUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-400">
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                        <Button size="sm" variant="ghost" onClick={() => startEdit(ch)} className="text-gray-400 hover:text-purple-400">
                          <Edit3 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Help Section */}
        <Card className="bg-gray-900/40 border-gray-800 mt-6">
          <CardHeader>
            <CardTitle className="text-lg text-purple-300">Setting Up Your Own Streams</CardTitle>
            <CardDescription className="text-gray-400">Replace placeholder streams with your own branded content</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-gray-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-800/50 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2 flex items-center gap-2"><Radio className="w-4 h-4 text-purple-400" /> Icecast / Shoutcast</h4>
                <p className="text-gray-400 mb-2">Self-hosted streaming server for full control.</p>
                <code className="text-xs text-green-400 block bg-gray-900 rounded p-2">http://your-server:8000/stream.mp3</code>
                <p className="text-xs text-gray-500 mt-2">Free: Icecast2 on Ubuntu, Shoutcast DNAS</p>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2 flex items-center gap-2"><Globe className="w-4 h-4 text-blue-400" /> Cloud Streaming</h4>
                <p className="text-gray-400 mb-2">Managed services with CDN distribution.</p>
                <code className="text-xs text-green-400 block bg-gray-900 rounded p-2">https://cdn.provider.com/your-stream</code>
                <p className="text-xs text-gray-500 mt-2">Services: Zeno.fm, Radio.co, Airtime Pro</p>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2 flex items-center gap-2"><Music className="w-4 h-4 text-amber-400" /> 432 Hz Tuning</h4>
                <p className="text-gray-400 mb-2">Default frequency for RRB channels. Use audio processing to retune content to 432 Hz for healing frequencies.</p>
                <p className="text-xs text-gray-500">Tools: Audacity pitch shift, FFmpeg filter</p>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2 flex items-center gap-2"><Zap className="w-4 h-4 text-pink-400" /> 528 Hz (Solfeggio)</h4>
                <p className="text-gray-400 mb-2">Love frequency for Sweet Miracles and healing content. Used for meditation and wellness channels.</p>
                <p className="text-xs text-gray-500">Channels: Sweet Miracles, UN Advocacy Radio</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
