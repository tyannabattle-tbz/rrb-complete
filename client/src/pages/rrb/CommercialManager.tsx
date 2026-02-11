/**
 * Commercial Manager — AI-Generated Radio Commercials
 * 
 * Generate, preview, schedule, and manage radio commercials
 * that air on RRB Radio and across the Canryn Production ecosystem.
 * 
 * Features:
 * - AI script generation via LLM
 * - Web Speech API text-to-speech preview
 * - Commercial scheduling into broadcast rotation
 * - Analytics (play counts, rotation stats)
 * - Support for all brands/subsidiaries
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import { toast } from 'sonner';
import { useAudio, type AudioTrack } from '@/contexts/AudioContext';

// ─── Types ──────────────────────────────────────────────────────────────────

type Category = 'promo' | 'psa' | 'sponsor' | 'event' | 'station_id' | 'jingle' | 'fundraiser' | 'community';
type Tab = 'library' | 'generate' | 'rotation' | 'analytics';

const CATEGORY_LABELS: Record<Category, string> = {
  promo: 'Promotion',
  psa: 'Public Service',
  sponsor: 'Sponsor',
  event: 'Event',
  station_id: 'Station ID',
  jingle: 'Jingle',
  fundraiser: 'Fundraiser',
  community: 'Community',
};

const CATEGORY_ICONS: Record<Category, string> = {
  promo: '📢',
  psa: '🤝',
  sponsor: '🏢',
  event: '🎉',
  station_id: '📻',
  jingle: '🎵',
  fundraiser: '💝',
  community: '🏘️',
};

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-500/20 text-gray-300',
  approved: 'bg-blue-500/20 text-blue-300',
  active: 'bg-green-500/20 text-green-300',
  archived: 'bg-red-500/20 text-red-300',
  scheduled: 'bg-purple-500/20 text-purple-300',
};

// ─── TTS Preview Hook ───────────────────────────────────────────────────────

function useTTSPreview() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    const loadVoices = () => {
      const available = window.speechSynthesis?.getVoices() || [];
      setVoices(available.filter(v => v.lang.startsWith('en')));
    };
    loadVoices();
    window.speechSynthesis?.addEventListener('voiceschanged', loadVoices);
    return () => window.speechSynthesis?.removeEventListener('voiceschanged', loadVoices);
  }, []);

  const speak = useCallback((text: string, rate = 0.95, pitch = 1.0) => {
    if (!window.speechSynthesis) {
      toast.error('Text-to-speech not supported in this browser');
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = 1.0;
    // Prefer a natural-sounding English voice
    const preferred = voices.find(v => v.name.includes('Google') || v.name.includes('Natural')) || voices[0];
    if (preferred) utterance.voice = preferred;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [voices]);

  const stop = useCallback(() => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  }, []);

  return { speak, stop, isSpeaking, voices };
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function CommercialManager() {
  const { user } = useAuth();
  const { play: playAudio } = useAudio();
  const { speak, stop: stopSpeaking, isSpeaking } = useTTSPreview();
  
  const [activeTab, setActiveTab] = useState<Tab>('library');
  const [categoryFilter, setCategoryFilter] = useState<Category | ''>('');
  const [brandFilter, setBrandFilter] = useState('');
  const [selectedCommercial, setSelectedCommercial] = useState<string | null>(null);
  
  // Generation form state
  const [genCategory, setGenCategory] = useState<Category>('promo');
  const [genBrand, setGenBrand] = useState('canryn_production');
  const [genPrompt, setGenPrompt] = useState('');
  const [genDuration, setGenDuration] = useState(30);

  // Queries
  const commercials = trpc.commercials.getCommercials.useQuery(
    { category: categoryFilter || undefined, brand: brandFilter || undefined },
    { refetchInterval: 30000 }
  );
  const rotation = trpc.commercials.getRotation.useQuery(undefined, { refetchInterval: 10000 });
  const stats = trpc.commercials.getStats.useQuery(undefined, { refetchInterval: 30000 });

  // Mutations
  const generateMutation = trpc.commercials.generate.useMutation({
    onSuccess: (data) => {
      toast.success(`Commercial generated: "${data.title}"`);
      commercials.refetch();
      stats.refetch();
      setActiveTab('library');
    },
    onError: (err) => toast.error(`Generation failed: ${err.message}`),
  });

  const updateMutation = trpc.commercials.update.useMutation({
    onSuccess: () => {
      toast.success('Commercial updated');
      commercials.refetch();
      stats.refetch();
    },
    onError: (err) => toast.error(`Update failed: ${err.message}`),
  });

  const deleteMutation = trpc.commercials.delete.useMutation({
    onSuccess: () => {
      toast.success('Commercial deleted');
      setSelectedCommercial(null);
      commercials.refetch();
      stats.refetch();
    },
    onError: (err) => toast.error(`Delete failed: ${err.message}`),
  });

  const markPlayedMutation = trpc.commercials.markPlayed.useMutation({
    onSuccess: () => stats.refetch(),
  });

  const uploadAudioMutation = trpc.commercials.uploadAudio.useMutation({
    onSuccess: (data) => {
      toast.success(`Audio uploaded for commercial! URL: ${data.audioUrl?.slice(0, 50)}...`);
      commercials.refetch();
    },
    onError: (err) => toast.error(`Upload failed: ${err.message}`),
  });

  const handleAudioUpload = (commercialId: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'audio/mpeg,audio/wav,audio/mp3,audio/ogg,audio/m4a,.mp3,.wav,.ogg,.m4a';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      if (file.size > 16 * 1024 * 1024) {
        toast.error('Audio file must be under 16MB');
        return;
      }
      toast.info(`Uploading ${file.name}...`);
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        uploadAudioMutation.mutate({
          id: commercialId,
          audioBase64: base64,
          fileName: file.name,
          mimeType: file.type || 'audio/mpeg',
        });
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  const handleGenerate = () => {
    if (!user) { toast.error('Please sign in to generate commercials'); return; }
    generateMutation.mutate({
      category: genCategory,
      brand: genBrand,
      customPrompt: genPrompt || undefined,
      targetDuration: genDuration,
    });
  };

  const handlePreview = (script: string) => {
    if (isSpeaking) { stopSpeaking(); return; }
    speak(script);
  };

  const handlePlayOnAir = (commercial: any) => {
    // Create an audio track from the commercial for the global player
    const track: AudioTrack = {
      id: `commercial-${commercial.id}`,
      title: `🔊 ${commercial.title}`,
      artist: 'Canryn Production Commercial',
      url: commercial.audioUrl || '', // If no audio URL, TTS will be used
      channel: 'RRB Radio',
      isLiveStream: false,
      duration: commercial.duration,
    };
    
    if (commercial.audioUrl) {
      playAudio(track);
      markPlayedMutation.mutate({ id: commercial.id });
      toast.success('Commercial playing on air!');
    } else {
      // Use TTS for preview since no audio file exists
      speak(commercial.script);
      markPlayedMutation.mutate({ id: commercial.id });
      toast.info('Playing commercial via text-to-speech preview');
    }
  };

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'library', label: 'Library', icon: '📚' },
    { id: 'generate', label: 'Generate', icon: '🤖' },
    { id: 'rotation', label: 'On-Air Rotation', icon: '📡' },
    { id: 'analytics', label: 'Analytics', icon: '📊' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-purple-950 text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/30 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
                📻 Commercial Manager
              </h1>
              <p className="text-gray-400 mt-1">AI-generated radio commercials for the Canryn Production ecosystem</p>
            </div>
            {rotation.data?.rotationActive && (
              <div className="flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-full">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-green-300 text-sm font-medium">Rotation Active</span>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-6 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* ─── Library Tab ──────────────────────────────────────────────── */}
        {activeTab === 'library' && (
          <div>
            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-6">
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value as Category | '')}
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
              >
                <option value="">All Categories</option>
                {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{CATEGORY_ICONS[key as Category]} {label}</option>
                ))}
              </select>
              <select
                value={brandFilter}
                onChange={e => setBrandFilter(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
              >
                <option value="">All Brands</option>
                {stats.data?.availableBrands.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
              <button
                onClick={() => setActiveTab('generate')}
                className="ml-auto px-4 py-2 bg-amber-500/20 border border-amber-500/30 rounded-lg text-amber-300 text-sm font-medium hover:bg-amber-500/30 transition-all"
              >
                + Generate New Commercial
              </button>
            </div>

            {/* Commercial Cards */}
            {commercials.isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1,2,3,4].map(i => (
                  <div key={i} className="h-48 bg-white/5 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {commercials.data?.map(commercial => (
                  <div
                    key={commercial.id}
                    className={`bg-white/5 border rounded-xl p-5 transition-all cursor-pointer hover:bg-white/10 ${
                      selectedCommercial === commercial.id ? 'border-amber-500/50 bg-amber-500/5' : 'border-white/10'
                    }`}
                    onClick={() => setSelectedCommercial(selectedCommercial === commercial.id ? null : commercial.id)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{CATEGORY_ICONS[commercial.category as Category]}</span>
                        <div>
                          <h3 className="font-semibold text-white text-sm">{commercial.title}</h3>
                          <p className="text-xs text-gray-400">{commercial.brand.replace('_', ' ')} • {commercial.duration}s</p>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[commercial.status]}`}>
                        {commercial.status}
                      </span>
                    </div>

                    <p className="text-gray-300 text-sm line-clamp-3 mb-3 leading-relaxed">
                      {commercial.script}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span>▶ {commercial.playCount} plays</span>
                        <span>🤖 {commercial.generatedBy}</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={e => { e.stopPropagation(); handlePreview(commercial.script); }}
                          className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                            isSpeaking ? 'bg-red-500/20 text-red-300' : 'bg-blue-500/20 text-blue-300 hover:bg-blue-500/30'
                          }`}
                        >
                          {isSpeaking ? '⏹ Stop' : '🔊 Preview'}
                        </button>
                        <button
                          onClick={e => { e.stopPropagation(); handlePlayOnAir(commercial); }}
                          className="px-3 py-1 bg-green-500/20 text-green-300 rounded-lg text-xs font-medium hover:bg-green-500/30 transition-all"
                        >
                          📡 On Air
                        </button>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {selectedCommercial === commercial.id && (
                      <div className="mt-4 pt-4 border-t border-white/10">
                        <div className="bg-black/30 rounded-lg p-4 mb-3">
                          <h4 className="text-xs font-semibold text-amber-400 mb-2">FULL SCRIPT</h4>
                          <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">{commercial.script}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                          <div className="bg-white/5 rounded-lg p-3">
                            <span className="text-gray-500">Voice Direction</span>
                            <p className="text-gray-300 mt-1">{commercial.voiceDirection}</p>
                          </div>
                          <div className="bg-white/5 rounded-lg p-3">
                            <span className="text-gray-500">Music Direction</span>
                            <p className="text-gray-300 mt-1">{commercial.musicDirection}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {commercial.status === 'draft' && (
                            <button
                              onClick={e => { e.stopPropagation(); updateMutation.mutate({ id: commercial.id, status: 'active' }); }}
                              className="px-3 py-1.5 bg-green-500/20 text-green-300 rounded-lg text-xs font-medium hover:bg-green-500/30"
                            >
                              ✅ Approve & Activate
                            </button>
                          )}
                          {commercial.status === 'active' && (
                            <button
                              onClick={e => { e.stopPropagation(); updateMutation.mutate({ id: commercial.id, status: 'archived' }); }}
                              className="px-3 py-1.5 bg-yellow-500/20 text-yellow-300 rounded-lg text-xs font-medium hover:bg-yellow-500/30"
                            >
                              📦 Archive
                            </button>
                          )}
                          <button
                            onClick={e => { e.stopPropagation(); handleAudioUpload(commercial.id); }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                              commercial.audioUrl
                                ? 'bg-purple-500/20 text-purple-300 hover:bg-purple-500/30'
                                : 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 animate-pulse'
                            }`}
                            disabled={uploadAudioMutation.isPending}
                          >
                            {uploadAudioMutation.isPending ? '⏳ Uploading...' : commercial.audioUrl ? '🎵 Replace Audio' : '🎤 Upload Audio'}
                          </button>
                          <button
                            onClick={e => { e.stopPropagation(); deleteMutation.mutate({ id: commercial.id }); }}
                            className="px-3 py-1.5 bg-red-500/20 text-red-300 rounded-lg text-xs font-medium hover:bg-red-500/30"
                          >
                            🗑 Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {commercials.data?.length === 0 && (
              <div className="text-center py-16 text-gray-500">
                <p className="text-5xl mb-4">📻</p>
                <p className="text-lg">No commercials yet</p>
                <p className="text-sm mt-2">Generate your first AI commercial to get started</p>
              </div>
            )}
          </div>
        )}

        {/* ─── Generate Tab ─────────────────────────────────────────────── */}
        {activeTab === 'generate' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-1">🤖 AI Commercial Generator</h2>
              <p className="text-gray-400 text-sm mb-6">Generate professional radio commercials using AI. Scripts are crafted for each brand's unique voice and tone.</p>

              {/* Brand Selection */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-300 mb-2">Brand / Subsidiary</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {stats.data?.availableBrands.map(brand => (
                    <button
                      key={brand.id}
                      onClick={() => setGenBrand(brand.id)}
                      className={`p-3 rounded-lg text-left text-sm transition-all border ${
                        genBrand === brand.id
                          ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                          : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      <div className="font-medium">{brand.name}</div>
                      <div className="text-xs opacity-60 mt-0.5">{brand.tagline}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Selection */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-300 mb-2">Commercial Type</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => setGenCategory(key as Category)}
                      className={`p-2.5 rounded-lg text-center text-sm transition-all border ${
                        genCategory === key
                          ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                          : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      <span className="text-lg block">{CATEGORY_ICONS[key as Category]}</span>
                      <span className="text-xs">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Target Duration: {genDuration}s
                </label>
                <input
                  type="range"
                  min={5}
                  max={60}
                  step={5}
                  value={genDuration}
                  onChange={e => setGenDuration(Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>5s (bumper)</span>
                  <span>30s (standard)</span>
                  <span>60s (long)</span>
                </div>
              </div>

              {/* Custom Prompt */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Custom Direction <span className="text-gray-500">(optional)</span>
                </label>
                <textarea
                  value={genPrompt}
                  onChange={e => setGenPrompt(e.target.value)}
                  placeholder="e.g., Focus on the upcoming community fundraiser event on March 15th, mention the live music and food trucks..."
                  className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 text-sm resize-none"
                  rows={3}
                />
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={generateMutation.isPending || !user}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold rounded-lg hover:from-amber-400 hover:to-orange-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generateMutation.isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    Generating Script...
                  </span>
                ) : (
                  '🤖 Generate Commercial Script'
                )}
              </button>
              {!user && (
                <p className="text-center text-xs text-gray-500 mt-2">Sign in to generate commercials</p>
              )}
            </div>
          </div>
        )}

        {/* ─── Rotation Tab ─────────────────────────────────────────────── */}
        {activeTab === 'rotation' && (
          <div>
            {/* Current Rotation Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                <h3 className="text-xs font-semibold text-gray-400 uppercase mb-3">Now Playing</h3>
                {rotation.data?.currentCommercial ? (
                  <div>
                    <p className="text-white font-medium">{rotation.data.currentCommercial.title}</p>
                    <p className="text-gray-400 text-sm mt-1">{rotation.data.currentCommercial.duration}s • {CATEGORY_LABELS[rotation.data.currentCommercial.category as Category]}</p>
                    <button
                      onClick={() => handlePreview(rotation.data!.currentCommercial!.script)}
                      className="mt-3 px-3 py-1.5 bg-blue-500/20 text-blue-300 rounded-lg text-xs font-medium hover:bg-blue-500/30"
                    >
                      {isSpeaking ? '⏹ Stop' : '🔊 Listen'}
                    </button>
                  </div>
                ) : (
                  <p className="text-gray-500">No commercial currently playing</p>
                )}
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                <h3 className="text-xs font-semibold text-gray-400 uppercase mb-3">Up Next</h3>
                {rotation.data?.nextCommercial ? (
                  <div>
                    <p className="text-white font-medium">{rotation.data.nextCommercial.title}</p>
                    <p className="text-gray-400 text-sm mt-1">{rotation.data.nextCommercial.duration}s • {CATEGORY_LABELS[rotation.data.nextCommercial.category as Category]}</p>
                  </div>
                ) : (
                  <p className="text-gray-500">Queue empty</p>
                )}
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                <h3 className="text-xs font-semibold text-gray-400 uppercase mb-3">Today's Stats</h3>
                <div className="text-3xl font-bold text-amber-400">{rotation.data?.totalPlaysToday || 0}</div>
                <p className="text-gray-400 text-sm">commercials aired today</p>
                {rotation.data?.lastPlayedAt ? (
                  <p className="text-gray-500 text-xs mt-2">
                    Last: {new Date(rotation.data.lastPlayedAt).toLocaleTimeString()}
                  </p>
                ) : null}
              </div>
            </div>

            {/* Active Rotation Schedule */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-5">
              <h3 className="text-lg font-semibold text-white mb-4">Active Rotation Schedule</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-400 text-xs uppercase border-b border-white/10">
                      <th className="text-left py-3 px-2">Commercial</th>
                      <th className="text-left py-3 px-2">Category</th>
                      <th className="text-left py-3 px-2">Brand</th>
                      <th className="text-center py-3 px-2">Duration</th>
                      <th className="text-center py-3 px-2">Plays</th>
                      <th className="text-center py-3 px-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {commercials.data?.filter(c => c.status === 'active').map(commercial => (
                      <tr key={commercial.id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="py-3 px-2 text-white">{commercial.title}</td>
                        <td className="py-3 px-2">
                          <span className="text-gray-300">
                            {CATEGORY_ICONS[commercial.category as Category]} {CATEGORY_LABELS[commercial.category as Category]}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-gray-400">{commercial.brand.replace('_', ' ')}</td>
                        <td className="py-3 px-2 text-center text-gray-300">{commercial.duration}s</td>
                        <td className="py-3 px-2 text-center text-amber-400">{commercial.playCount}</td>
                        <td className="py-3 px-2 text-center">
                          <div className="flex justify-center gap-1">
                            <button
                              onClick={() => handlePreview(commercial.script)}
                              className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs hover:bg-blue-500/30"
                            >
                              🔊
                            </button>
                            <button
                              onClick={() => handlePlayOnAir(commercial)}
                              className="px-2 py-1 bg-green-500/20 text-green-300 rounded text-xs hover:bg-green-500/30"
                            >
                              📡
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {commercials.data?.filter(c => c.status === 'active').length === 0 && (
                <p className="text-center text-gray-500 py-8">No active commercials in rotation</p>
              )}
            </div>
          </div>
        )}

        {/* ─── Analytics Tab ────────────────────────────────────────────── */}
        {activeTab === 'analytics' && stats.data && (
          <div>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white/5 border border-white/10 rounded-xl p-5 text-center">
                <div className="text-3xl font-bold text-white">{stats.data.totalCommercials}</div>
                <div className="text-gray-400 text-sm mt-1">Total Commercials</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-5 text-center">
                <div className="text-3xl font-bold text-green-400">{stats.data.activeCommercials}</div>
                <div className="text-gray-400 text-sm mt-1">Active in Rotation</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-5 text-center">
                <div className="text-3xl font-bold text-amber-400">{stats.data.totalPlaysToday}</div>
                <div className="text-gray-400 text-sm mt-1">Plays Today</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-5 text-center">
                <div className="text-3xl font-bold text-purple-400">{stats.data.totalPlaysAllTime}</div>
                <div className="text-gray-400 text-sm mt-1">All-Time Plays</div>
              </div>
            </div>

            {/* By Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-gray-400 uppercase mb-4">By Category</h3>
                <div className="space-y-3">
                  {Object.entries(stats.data.byCategory).map(([cat, count]) => (
                    <div key={cat} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span>{CATEGORY_ICONS[cat as Category]}</span>
                        <span className="text-gray-300 text-sm">{CATEGORY_LABELS[cat as Category]}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-500 rounded-full"
                            style={{ width: `${Math.min(100, ((count as number) / Math.max(1, stats.data!.totalCommercials)) * 100)}%` }}
                          />
                        </div>
                        <span className="text-white text-sm font-medium w-6 text-right">{count as number}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-gray-400 uppercase mb-4">By Brand</h3>
                <div className="space-y-3">
                  {Object.entries(stats.data.byBrand).map(([brand, count]) => (
                    <div key={brand} className="flex items-center justify-between">
                      <span className="text-gray-300 text-sm">{brand.replace(/_/g, ' ')}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-purple-500 rounded-full"
                            style={{ width: `${Math.min(100, ((count as number) / Math.max(1, stats.data!.totalCommercials)) * 100)}%` }}
                          />
                        </div>
                        <span className="text-white text-sm font-medium w-6 text-right">{count as number}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
