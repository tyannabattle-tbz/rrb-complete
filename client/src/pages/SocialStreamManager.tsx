import React, { useState } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import {
  Radio, Tv, Play, Square, Plus, Trash2, Eye, EyeOff,
  ExternalLink, Clock, ArrowLeft, Copy,
  CheckCircle2, Loader2, Globe, Zap, Shield
} from 'lucide-react';

const PlatformIcon = ({ platform, size = 20 }: { platform: string; size?: number }) => {
  const colors: Record<string, string> = {
    youtube: '#FF0000', facebook: '#1877F2', instagram: '#E4405F',
    twitter: '#1DA1F2', tiktok: '#00F2EA', twitch: '#9146FF',
    linkedin: '#0A66C2', custom: '#6B7280',
  };
  return (
    <div className="rounded-lg flex items-center justify-center shrink-0"
      style={{ width: size + 8, height: size + 8, backgroundColor: `${colors[platform] || '#6B7280'}20` }}>
      <Tv style={{ width: size * 0.7, height: size * 0.7, color: colors[platform] || '#6B7280' }} />
    </div>
  );
};

export default function SocialStreamManager() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [newRtmpUrl, setNewRtmpUrl] = useState('');
  const [newStreamKey, setNewStreamKey] = useState('');
  const [showStreamKeys, setShowStreamKeys] = useState<Record<number, boolean>>({});
  const [selectedDests, setSelectedDests] = useState<number[]>([]);
  const [streamTitle, setStreamTitle] = useState('');
  const [isGoingLive, setIsGoingLive] = useState(false);

  const utils = trpc.useUtils();
  const { data: platforms } = trpc.socialStream.getPlatformInfo.useQuery();
  const { data: destinations, isLoading: destsLoading } = trpc.socialStream.getDestinations.useQuery(undefined, { enabled: !!user });
  const { data: activeStream } = trpc.socialStream.getActiveStream.useQuery(undefined, { enabled: !!user, refetchInterval: 5000 });
  const { data: stats } = trpc.socialStream.getStreamStats.useQuery(undefined, { enabled: !!user });
  const { data: history } = trpc.socialStream.getStreamHistory.useQuery(undefined, { enabled: !!user });

  const addMutation = trpc.socialStream.addDestination.useMutation({
    onSuccess: () => {
      toast({ title: 'Destination added', description: `${selectedPlatform} destination saved` });
      setShowAddForm(false); setSelectedPlatform(''); setNewLabel(''); setNewRtmpUrl(''); setNewStreamKey('');
      utils.socialStream.getDestinations.invalidate();
    },
    onError: (e) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const removeMutation = trpc.socialStream.removeDestination.useMutation({
    onSuccess: () => { toast({ title: 'Destination removed' }); utils.socialStream.getDestinations.invalidate(); },
  });

  const goLiveMutation = trpc.socialStream.goLive.useMutation({
    onSuccess: (data) => {
      setIsGoingLive(false);
      toast({ title: 'You are LIVE!', description: data.message });
      utils.socialStream.getActiveStream.invalidate();
      utils.socialStream.getStreamStats.invalidate();
    },
    onError: (e) => { setIsGoingLive(false); toast({ title: 'Failed to go live', description: e.message, variant: 'destructive' }); },
  });

  const stopMutation = trpc.socialStream.stopStream.useMutation({
    onSuccess: () => {
      toast({ title: 'Stream ended' });
      utils.socialStream.getActiveStream.invalidate();
      utils.socialStream.getStreamStats.invalidate();
      utils.socialStream.getStreamHistory.invalidate();
    },
  });

  const toggleDest = (id: number) => setSelectedDests(prev => prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]);

  const handleGoLive = () => {
    if (selectedDests.length === 0) { toast({ title: 'Select destinations', description: 'Choose at least one platform', variant: 'destructive' }); return; }
    if (!streamTitle.trim()) { toast({ title: 'Enter a title', description: 'Give your stream a title', variant: 'destructive' }); return; }
    setIsGoingLive(true);
    goLiveMutation.mutate({ title: streamTitle, destinationIds: selectedDests });
  };

  const handleAddDestination = () => {
    if (!selectedPlatform || !newLabel) return;
    addMutation.mutate({ platform: selectedPlatform as any, label: newLabel, rtmpUrl: newRtmpUrl || undefined, streamKey: newStreamKey || undefined });
  };

  const copyToClipboard = (text: string) => { navigator.clipboard.writeText(text); toast({ title: 'Copied to clipboard' }); };

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600); const m = Math.floor((seconds % 3600) / 60); const s = seconds % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m ${s}s`;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <Card className="bg-gray-900 border-gray-800 max-w-md w-full">
          <CardContent className="pt-8 pb-8 text-center">
            <Shield className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Sign In Required</h2>
            <p className="text-white/50 mb-4">You need to be signed in to manage streaming destinations.</p>
            <Button onClick={() => navigate('/')} className="bg-amber-600 hover:bg-amber-700">Go Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900/40 via-gray-900 to-blue-900/40 border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-4">
            <button onClick={() => navigate('/conference')} className="text-white/50 hover:text-white" aria-label="Back to conferences">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <Tv className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Social Streaming Manager</h1>
              <p className="text-white/50 text-sm">Stream from conference rooms to social platforms</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-gray-900/60 rounded-lg p-3 border border-gray-800">
              <div className="text-2xl font-bold text-purple-400">{stats?.destinations || 0}</div>
              <div className="text-xs text-white/40">Destinations</div>
            </div>
            <div className="bg-gray-900/60 rounded-lg p-3 border border-gray-800">
              <div className="text-2xl font-bold text-green-400">{stats?.liveNow || 0}</div>
              <div className="text-xs text-white/40">Live Now</div>
            </div>
            <div className="bg-gray-900/60 rounded-lg p-3 border border-gray-800">
              <div className="text-2xl font-bold text-amber-400">{stats?.totalStreams || 0}</div>
              <div className="text-xs text-white/40">Total Streams</div>
            </div>
            <div className="bg-gray-900/60 rounded-lg p-3 border border-gray-800">
              <div className="text-2xl font-bold text-blue-400">{stats?.totalMinutes || 0}</div>
              <div className="text-xs text-white/40">Minutes Streamed</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Active Stream Banner */}
        {activeStream && (
          <Card className="bg-gradient-to-r from-red-900/30 to-red-800/20 border-red-500/50">
            <CardContent className="pt-4 pb-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  <div>
                    <h3 className="font-bold text-red-400">LIVE: {activeStream.title}</h3>
                    <p className="text-white/50 text-sm">
                      Streaming to {activeStream.platforms?.join(', ')} &bull; {formatDuration(activeStream.duration || 0)}
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm"
                  onClick={() => stopMutation.mutate({ sessionId: activeStream.id })}
                  disabled={stopMutation.isPending}
                  className="border-red-500 text-red-400 hover:bg-red-500/20">
                  <Square className="w-3 h-3 mr-1" /> Stop Stream
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Destinations */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Stream Destinations</h2>
              <Button size="sm" onClick={() => setShowAddForm(!showAddForm)} className="bg-purple-600 hover:bg-purple-700">
                <Plus className="w-4 h-4 mr-1" /> Add Platform
              </Button>
            </div>

            {/* Add Destination Form */}
            {showAddForm && (
              <Card className="bg-gray-900/80 border-purple-500/30">
                <CardContent className="pt-4 pb-4 space-y-4">
                  <h3 className="font-semibold text-purple-400">Add Streaming Destination</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {platforms?.map((p) => (
                      <button key={p.id}
                        onClick={() => { setSelectedPlatform(p.id); setNewLabel(p.name); setNewRtmpUrl(p.defaultRtmpUrl); }}
                        className={`flex items-center gap-2 p-2.5 rounded-lg border transition-all text-sm ${
                          selectedPlatform === p.id ? 'border-purple-500 bg-purple-500/10' : 'border-gray-700 hover:border-gray-600 bg-gray-800/50'
                        }`}>
                        <PlatformIcon platform={p.id} size={16} />
                        <span className="text-white/80 truncate">{p.name}</span>
                      </button>
                    ))}
                  </div>
                  {selectedPlatform && (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <Label className="text-white/60 text-xs">Label</Label>
                          <Input value={newLabel} onChange={(e) => setNewLabel(e.target.value)} placeholder="My YouTube Channel" className="bg-gray-800 border-gray-700 text-white mt-1" />
                        </div>
                        <div>
                          <Label className="text-white/60 text-xs">RTMP URL</Label>
                          <Input value={newRtmpUrl} onChange={(e) => setNewRtmpUrl(e.target.value)} placeholder="rtmp://..." className="bg-gray-800 border-gray-700 text-white mt-1 font-mono text-xs" />
                        </div>
                      </div>
                      <div>
                        <Label className="text-white/60 text-xs">Stream Key</Label>
                        <Input value={newStreamKey} onChange={(e) => setNewStreamKey(e.target.value)} placeholder="Paste your stream key here" type="password" className="bg-gray-800 border-gray-700 text-white mt-1 font-mono text-xs" />
                        <p className="text-white/30 text-[10px] mt-1">
                          Get your stream key from{' '}
                          <a href={platforms?.find(p => p.id === selectedPlatform)?.setupUrl} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">
                            {platforms?.find(p => p.id === selectedPlatform)?.name} Studio <ExternalLink className="w-2.5 h-2.5 inline ml-0.5" />
                          </a>
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleAddDestination} disabled={addMutation.isPending || !newLabel} className="bg-purple-600 hover:bg-purple-700">
                          {addMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Plus className="w-3 h-3 mr-1" />} Save Destination
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setShowAddForm(false)} className="border-gray-700 text-white/60">Cancel</Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Destination List */}
            {destsLoading ? (
              <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-purple-400" /></div>
            ) : destinations && destinations.length > 0 ? (
              <div className="space-y-2">
                {destinations.map((dest: any) => (
                  <Card key={dest.id}
                    className={`bg-gray-900/60 border transition-all cursor-pointer ${
                      selectedDests.includes(dest.id) ? 'border-purple-500 bg-purple-500/5' : 'border-gray-800 hover:border-gray-700'
                    }`}
                    onClick={() => toggleDest(dest.id)}>
                    <CardContent className="pt-3 pb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${
                          selectedDests.includes(dest.id) ? 'border-purple-500 bg-purple-500' : 'border-gray-600'
                        }`}>
                          {selectedDests.includes(dest.id) && <CheckCircle2 className="w-3 h-3 text-white" />}
                        </div>
                        <PlatformIcon platform={dest.platform} size={20} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-white text-sm">{dest.label}</span>
                            <Badge variant="outline" className={`text-[9px] ${dest.is_enabled ? 'border-green-500/50 text-green-400' : 'border-gray-600 text-gray-500'}`}>
                              {dest.is_enabled ? 'Active' : 'Disabled'}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-white/30 text-[10px] font-mono truncate max-w-[200px]">{dest.rtmp_url || 'No RTMP URL set'}</span>
                            {dest.stream_key && (
                              <button onClick={(e) => { e.stopPropagation(); setShowStreamKeys(prev => ({ ...prev, [dest.id]: !prev[dest.id] })); }} className="text-white/30 hover:text-white/60">
                                {showStreamKeys[dest.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                              </button>
                            )}
                            {showStreamKeys[dest.id] && dest.stream_key && <span className="text-white/40 text-[10px] font-mono">{dest.stream_key}</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                          {dest.stream_key && (
                            <button onClick={() => copyToClipboard(`${dest.rtmp_url || ''}/${dest.stream_key || ''}`)} className="text-white/30 hover:text-white/60 p-1.5 rounded hover:bg-gray-800" title="Copy full stream URL">
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {dest.platformInfo?.setupUrl && (
                            <a href={dest.platformInfo.setupUrl} target="_blank" rel="noopener noreferrer" className="text-white/30 hover:text-white/60 p-1.5 rounded hover:bg-gray-800" title="Open platform studio">
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                          <button onClick={() => removeMutation.mutate({ id: dest.id })} className="text-red-400/50 hover:text-red-400 p-1.5 rounded hover:bg-red-500/10" title="Remove destination">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-gray-900/40 border-gray-800 border-dashed">
                <CardContent className="pt-8 pb-8 text-center">
                  <Globe className="w-10 h-10 text-white/20 mx-auto mb-3" />
                  <h3 className="text-white/60 font-medium mb-1">No Streaming Destinations</h3>
                  <p className="text-white/30 text-sm mb-4">Add your social media platforms to start streaming</p>
                  <Button size="sm" onClick={() => setShowAddForm(true)} className="bg-purple-600 hover:bg-purple-700">
                    <Plus className="w-4 h-4 mr-1" /> Add Your First Platform
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Stream History */}
            {history && history.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2"><Clock className="w-4 h-4 text-white/40" /> Stream History</h2>
                <div className="space-y-2">
                  {history.map((session: any) => (
                    <Card key={session.id} className="bg-gray-900/40 border-gray-800">
                      <CardContent className="pt-3 pb-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-white/80 text-sm font-medium">{session.title}</span>
                            <div className="flex items-center gap-2 mt-1">
                              {session.platforms?.map((p: string) => <Badge key={p} variant="outline" className="text-[9px] border-gray-700 text-white/40">{p}</Badge>)}
                              {session.duration && <span className="text-white/30 text-[10px]">{formatDuration(session.duration)}</span>}
                            </div>
                          </div>
                          <Badge variant="outline" className={`text-[10px] ${
                            session.status === 'live' ? 'border-red-500 text-red-400' : session.status === 'ended' ? 'border-gray-600 text-gray-400' : 'border-yellow-500 text-yellow-400'
                          }`}>{session.status}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Go Live Panel */}
          <div className="space-y-4">
            <Card className="bg-gray-900/80 border-gray-800 sticky top-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2"><Zap className="w-5 h-5 text-amber-400" /> Go Live</CardTitle>
                <CardDescription className="text-white/40">Stream to {selectedDests.length} selected platform{selectedDests.length !== 1 ? 's' : ''}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-white/60 text-xs">Stream Title</Label>
                  <Input value={streamTitle} onChange={(e) => setStreamTitle(e.target.value)} placeholder="e.g. RRB Live Broadcast" className="bg-gray-800 border-gray-700 text-white mt-1" />
                </div>
                {selectedDests.length > 0 && (
                  <div>
                    <Label className="text-white/60 text-xs mb-2 block">Selected Platforms</Label>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedDests.map(id => {
                        const dest = destinations?.find((d: any) => d.id === id);
                        if (!dest) return null;
                        return <Badge key={id} variant="outline" className="text-[10px] border-purple-500/50 text-purple-400">{dest.label}</Badge>;
                      })}
                    </div>
                  </div>
                )}
                {!activeStream ? (
                  <Button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3" onClick={handleGoLive}
                    disabled={isGoingLive || selectedDests.length === 0 || !streamTitle.trim()}>
                    {isGoingLive ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Going Live...</> : <><Radio className="w-4 h-4 mr-2" /> GO LIVE</>}
                  </Button>
                ) : (
                  <Button className="w-full bg-gray-700 hover:bg-gray-600 text-white" onClick={() => stopMutation.mutate({ sessionId: activeStream.id })} disabled={stopMutation.isPending}>
                    <Square className="w-4 h-4 mr-2" /> End Current Stream
                  </Button>
                )}
                <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
                  <h4 className="text-white/60 text-xs font-semibold mb-2">How It Works</h4>
                  <ol className="text-white/40 text-[11px] space-y-1.5 list-decimal list-inside">
                    <li>Add your social platform stream keys above</li>
                    <li>Select which platforms to stream to</li>
                    <li>Enter a stream title and hit GO LIVE</li>
                    <li>Use the RTMP URLs in OBS/Streamlabs or Restream Studio</li>
                    <li>Your conference room audio/video goes to all platforms</li>
                  </ol>
                </div>
                <div className="space-y-1.5">
                  <h4 className="text-white/60 text-xs font-semibold">Quick Links</h4>
                  <a href="https://studio.youtube.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-white/40 hover:text-white/70 text-xs py-1"><ExternalLink className="w-3 h-3" /> YouTube Studio</a>
                  <a href="https://www.facebook.com/live/producer" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-white/40 hover:text-white/70 text-xs py-1"><ExternalLink className="w-3 h-3" /> Facebook Live Producer</a>
                  <a href="https://www.tiktok.com/studio" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-white/40 hover:text-white/70 text-xs py-1"><ExternalLink className="w-3 h-3" /> TikTok Studio</a>
                  <a href="https://studio.twitter.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-white/40 hover:text-white/70 text-xs py-1"><ExternalLink className="w-3 h-3" /> Twitter/X Studio</a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
