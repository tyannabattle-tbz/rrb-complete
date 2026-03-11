/**
 * Media Blast Campaign Dashboard
 * Full campaign management for UN CSW70 and future campaigns.
 * Features: campaign overview, social media post queue, commercial scheduler,
 * platform analytics, QUMUS autonomous distribution, and campaign timeline.
 */

import React, { useState, useMemo } from 'react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

// CDN image URLs for campaign visuals
const CAMPAIGN_IMAGES = {
  banner: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663286151344/eSHiAmKDzW4pqcyH7Ttb7c/csw70-main-banner-PoNTVHDYBfYubkWUcts6ws.webp',
  socialSquare: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663286151344/eSHiAmKDzW4pqcyH7Ttb7c/csw70-social-card-square-ZpmbRBg2p33Le8JTaxCrsn.webp',
  youtubeThumb: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663286151344/eSHiAmKDzW4pqcyH7Ttb7c/csw70-youtube-thumbnail-hfGWWHHYgcDWC4YS4VGetX.webp',
  stories: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663286151344/eSHiAmKDzW4pqcyH7Ttb7c/csw70-stories-vertical-eTZKEii5t36MtFKtbJ5L9e.webp',
  overlay: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663286151344/eSHiAmKDzW4pqcyH7Ttb7c/csw70-stream-overlay-RWo6zjQqjGrsdmByEB6cX5.webp',
};

const PLATFORM_ICONS: Record<string, string> = {
  youtube: '▶',
  facebook: 'f',
  instagram: '📷',
  twitch: '🎮',
  rumble: '🔊',
  linkedin: 'in',
  tiktok: '♪',
  x: '𝕏',
};

const PLATFORM_COLORS: Record<string, string> = {
  youtube: '#FF0000',
  facebook: '#1877F2',
  instagram: '#E4405F',
  twitch: '#9146FF',
  rumble: '#85C742',
  linkedin: '#0A66C2',
  tiktok: '#000000',
  x: '#1DA1F2',
};

type TabType = 'overview' | 'posts' | 'commercials' | 'timeline' | 'visuals' | 'automation' | 'pipeline';

export default function MediaBlastCampaign() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const campaignId = 'csw70-2026';

  const { data: campaigns } = trpc.mediaBlast.getCampaigns.useQuery();
  const { data: campaign } = trpc.mediaBlast.getCampaign.useQuery({ campaignId });
  const { data: metrics } = trpc.mediaBlast.getCampaignMetrics.useQuery({ campaignId });
  const { data: timeline } = trpc.mediaBlast.getCampaignTimeline.useQuery({ campaignId });
  const { data: commercials } = trpc.mediaBlast.getCampaignCommercials.useQuery({ campaignId });
  const { data: posts } = trpc.mediaBlast.getCampaignPosts.useQuery({
    campaignId,
    platform: selectedPlatform === 'all' ? undefined : selectedPlatform,
    status: selectedStatus === 'all' ? undefined : selectedStatus as any,
  });

  const toggleAutomation = trpc.mediaBlast.toggleAutomation.useMutation({
    onSuccess: (data) => {
      toast.success(data.automationEnabled ? 'QUMUS Automation ACTIVATED' : 'Automation paused');
    },
  });

  const triggerBlast = trpc.mediaBlast.triggerBlast.useMutation({
    onSuccess: (data) => {
      toast.success(`Media blast triggered! ${data.posted} posts sent across platforms.`);
    },
  });

  const generateTts = trpc.mediaBlast.generateCommercialAudio.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        toast.success(`Audio generated for ${data.generated.length} commercials! ${data.fallback.length > 0 ? `(${data.fallback.length} using browser fallback)` : ''}`);
      } else {
        toast.error('Failed to generate commercial audio');
      }
    },
    onError: () => toast.error('TTS generation failed'),
  });

  const generateSingleTts = trpc.mediaBlast.generateSingleCommercialAudio.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        toast.success(`Audio generated! Duration: ${data.duration}s`);
      } else {
        toast.error('TTS generation failed — using browser fallback');
      }
    },
  });

  const { data: pipelineJobs } = trpc.mediaBlast.getPipelineJobs.useQuery();
  const { data: pipelineStats } = trpc.mediaBlast.getPipelineStats.useQuery();
  const { data: generatedAudio } = trpc.mediaBlast.getGeneratedAudio.useQuery();

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'posts', label: 'Post Queue', icon: '📝' },
    { id: 'commercials', label: 'Commercials', icon: '🎬' },
    { id: 'timeline', label: 'Timeline', icon: '📅' },
    { id: 'visuals', label: 'Visuals', icon: '🎨' },
    { id: 'automation', label: 'QUMUS AI', icon: '🤖' },
    { id: 'pipeline', label: 'Recording Pipeline', icon: '🔄' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a0a2e] via-[#16213e] to-[#0f3460] text-white">
      {/* Campaign Banner */}
      <div className="relative w-full h-48 md:h-64 overflow-hidden">
        <img
          src={CAMPAIGN_IMAGES.banner}
          alt="UN CSW70 Media Blast Campaign"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a0a2e] via-transparent to-transparent" />
        <div className="absolute bottom-4 left-4 md:left-8">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 bg-red-600 text-white text-xs font-bold rounded animate-pulse">LIVE</span>
            <span className="text-xs text-gray-300">March 9–19, 2026</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg">
            UN CSW70 Media Blast
          </h1>
          <p className="text-sm text-gray-300 mt-1">
            Rockin' Rockin' Boogie Radio × Canryn Production × Sweet Miracles
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="sticky top-0 z-30 bg-[#1a0a2e]/95 backdrop-blur-sm border-b border-purple-800/50">
        <div className="flex overflow-x-auto scrollbar-hide px-2 md:px-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-amber-400 text-amber-400'
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
        {activeTab === 'overview' && (
          <OverviewTab metrics={metrics} campaign={campaign} timeline={timeline} onTriggerBlast={() => triggerBlast.mutate({ campaignId })} />
        )}
        {activeTab === 'posts' && (
          <PostQueueTab
            posts={posts || []}
            selectedPlatform={selectedPlatform}
            setSelectedPlatform={setSelectedPlatform}
            selectedStatus={selectedStatus}
            setSelectedStatus={setSelectedStatus}
          />
        )}
        {activeTab === 'commercials' && (
          <CommercialsTab
            commercials={commercials || []}
            campaignId={campaignId}
            onGenerateAll={() => generateTts.mutate({ campaignId })}
            onGenerateSingle={(commercialId: string, djVoice?: string) => generateSingleTts.mutate({ campaignId, commercialId, djVoice: djVoice as any })}
            isGenerating={generateTts.isPending || generateSingleTts.isPending}
            generatedAudio={generatedAudio || []}
          />
        )}
        {activeTab === 'timeline' && (
          <TimelineTab timeline={timeline || []} />
        )}
        {activeTab === 'visuals' && (
          <VisualsTab />
        )}
        {activeTab === 'automation' && (
          <AutomationTab
            campaign={campaign}
            metrics={metrics}
            onToggleAutomation={(enabled: boolean) => toggleAutomation.mutate({ campaignId, enabled })}
          />
        )}
        {activeTab === 'pipeline' && (
          <RecordingPipelineTab
            jobs={pipelineJobs || []}
            stats={pipelineStats}
          />
        )}
      </div>
    </div>
  );
}

// ============ OVERVIEW TAB ============
function OverviewTab({ metrics, campaign, timeline, onTriggerBlast }: any) {
  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Posts" value={metrics?.totalPosts || 0} icon="📝" color="purple" />
        <StatCard label="Posted" value={metrics?.postedCount || 0} icon="✅" color="green" />
        <StatCard label="Scheduled" value={metrics?.scheduledCount || 0} icon="⏰" color="amber" />
        <StatCard label="Platforms" value={campaign?.platforms?.length || 0} icon="📡" color="blue" />
      </div>

      {/* Engagement Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard label="Total Views" value={formatNumber(metrics?.totalViews || 0)} icon="👁" color="cyan" />
        <StatCard label="Likes" value={formatNumber(metrics?.totalLikes || 0)} icon="❤️" color="red" />
        <StatCard label="Shares" value={formatNumber(metrics?.totalShares || 0)} icon="🔄" color="blue" />
        <StatCard label="Comments" value={formatNumber(metrics?.totalComments || 0)} icon="💬" color="green" />
        <StatCard label="Engagement" value={`${metrics?.engagementRate || 0}%`} icon="📈" color="amber" />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={onTriggerBlast}
          className="flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-red-600 to-orange-600 rounded-xl font-bold text-lg hover:from-red-700 hover:to-orange-700 transition-all shadow-lg"
        >
          <span className="text-2xl">🚀</span>
          TRIGGER MEDIA BLAST
        </button>
        <a
          href="https://app.restream.io/studio"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl font-bold text-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg"
        >
          <span className="text-2xl">📺</span>
          OPEN RESTREAM
        </a>
        <a
          href="/conference"
          className="flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl font-bold text-lg hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg"
        >
          <span className="text-2xl">🎙</span>
          GO LIVE
        </a>
      </div>

      {/* Platform Breakdown */}
      <div className="bg-white/5 rounded-xl p-6 border border-purple-800/30">
        <h3 className="text-lg font-bold text-amber-400 mb-4">Platform Performance</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {campaign?.platforms?.map((platform: string) => {
            const pm = metrics?.platformMetrics?.[platform];
            return (
              <div key={platform} className="bg-white/5 rounded-lg p-3 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                    style={{ backgroundColor: PLATFORM_COLORS[platform] || '#666' }}
                  >
                    {PLATFORM_ICONS[platform] || '?'}
                  </span>
                  <span className="font-medium capitalize">{platform}</span>
                </div>
                <div className="text-xs text-gray-400 space-y-1">
                  <div className="flex justify-between">
                    <span>Posts</span>
                    <span className="text-white">{pm?.posts || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Views</span>
                    <span className="text-white">{formatNumber(pm?.views || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Likes</span>
                    <span className="text-white">{formatNumber(pm?.likes || 0)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Campaign Info */}
      <div className="bg-white/5 rounded-xl p-6 border border-purple-800/30">
        <h3 className="text-lg font-bold text-amber-400 mb-3">Campaign Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-400">Event</p>
            <p className="font-medium">70th Commission on the Status of Women (CSW70)</p>
          </div>
          <div>
            <p className="text-gray-400">Location</p>
            <p className="font-medium">United Nations Headquarters, New York, NY</p>
          </div>
          <div>
            <p className="text-gray-400">Theme</p>
            <p className="font-medium">Rights. Justice. Action.</p>
          </div>
          <div>
            <p className="text-gray-400">Campaign Duration</p>
            <p className="font-medium">March 8–21, 2026 (Pre-event through post-event)</p>
          </div>
          <div>
            <p className="text-gray-400">Streaming</p>
            <p className="font-medium">Restream to 8 platforms (5 active, 3 pending)</p>
          </div>
          <div>
            <p className="text-gray-400">Accessibility</p>
            <p className="font-medium">20 languages, closed captions, sign language, screen reader</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ POST QUEUE TAB ============
function PostQueueTab({ posts, selectedPlatform, setSelectedPlatform, selectedStatus, setSelectedStatus }: any) {
  const platforms = ['all', 'youtube', 'facebook', 'instagram', 'twitch', 'rumble', 'linkedin', 'tiktok', 'x'];
  const statuses = ['all', 'draft', 'scheduled', 'posted', 'failed'];

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-sm text-gray-400 mr-2">Platform:</span>
        {platforms.map(p => (
          <button
            key={p}
            onClick={() => setSelectedPlatform(p)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              selectedPlatform === p
                ? 'bg-amber-500 text-black'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            {p === 'all' ? 'All' : p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-sm text-gray-400 mr-2">Status:</span>
        {statuses.map(s => (
          <button
            key={s}
            onClick={() => setSelectedStatus(s)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              selectedStatus === s
                ? 'bg-amber-500 text-black'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Post Count */}
      <div className="text-sm text-gray-400">
        Showing {posts?.length || 0} posts
      </div>

      {/* Post List */}
      <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
        {posts?.map((post: any) => (
          <div key={post.id} className="bg-white/5 rounded-lg p-4 border border-white/10 hover:border-purple-500/30 transition-colors">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <span
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                  style={{ backgroundColor: PLATFORM_COLORS[post.platform] || '#666' }}
                >
                  {PLATFORM_ICONS[post.platform] || '?'}
                </span>
                <span className="text-xs font-medium capitalize text-gray-300">{post.platform}</span>
              </div>
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                post.status === 'posted' ? 'bg-green-600/30 text-green-400' :
                post.status === 'scheduled' ? 'bg-amber-600/30 text-amber-400' :
                post.status === 'failed' ? 'bg-red-600/30 text-red-400' :
                'bg-gray-600/30 text-gray-400'
              }`}>
                {post.status}
              </span>
            </div>
            <p className="text-sm text-gray-200 mt-2 whitespace-pre-line line-clamp-3">
              {post.content}
            </p>
            <div className="flex flex-wrap gap-1 mt-2">
              {post.hashtags?.slice(0, 4).map((tag: string) => (
                <span key={tag} className="text-xs text-purple-400">{tag}</span>
              ))}
            </div>
            <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
              <span>Scheduled: {new Date(post.scheduledAt).toLocaleString()}</span>
              {post.engagementMetrics && (
                <div className="flex gap-3">
                  <span>👁 {post.engagementMetrics.views}</span>
                  <span>❤️ {post.engagementMetrics.likes}</span>
                  <span>🔄 {post.engagementMetrics.shares}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============ COMMERCIALS TAB ============
function CommercialsTab({ commercials, campaignId, onGenerateAll, onGenerateSingle, isGenerating, generatedAudio }: {
  commercials: any[];
  campaignId: string;
  onGenerateAll: () => void;
  onGenerateSingle: (commercialId: string, djVoice?: string) => void;
  isGenerating: boolean;
  generatedAudio: any[];
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);

  const getAudioForCommercial = (id: string) => {
    return generatedAudio.find((a: any) => a.id === id);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-amber-400">Commercial Spots</h2>
          <p className="text-sm text-gray-400">
            Three commercial spots for CSW70 campaign. Narrated by Seraph AI (onyx voice) and Candy AI (echo voice — dad).
          </p>
        </div>
        <button
          onClick={onGenerateAll}
          disabled={isGenerating}
          className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
            isGenerating
              ? 'bg-purple-800 text-purple-400 cursor-wait'
              : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg shadow-purple-500/20'
          }`}
        >
          {isGenerating ? '⏳ Generating...' : '🎙 Generate All Audio (TTS)'}
        </button>
      </div>

      {/* Generated Audio Status */}
      {generatedAudio.length > 0 && (
        <div className="bg-green-900/20 rounded-lg p-3 border border-green-500/30">
          <div className="flex items-center gap-2 text-green-400 text-sm font-medium">
            <span>✓</span>
            <span>{generatedAudio.length} commercial audio files generated</span>
          </div>
          <div className="flex gap-4 mt-2">
            {generatedAudio.map((audio: any) => (
              <div key={audio.id} className="text-xs text-gray-400">
                <span className="text-green-400">{audio.title}</span> — {audio.duration}s ({audio.djVoice})
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        {commercials.map(commercial => {
          const audio = getAudioForCommercial(commercial.id);
          return (
            <div key={commercial.id} className="bg-white/5 rounded-xl border border-purple-800/30 overflow-hidden">
              <button
                onClick={() => setExpandedId(expandedId === commercial.id ? null : commercial.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{audio ? '🔊' : '🎬'}</span>
                  <div className="text-left">
                    <h3 className="font-bold text-white">{commercial.title}</h3>
                    <p className="text-xs text-gray-400">
                      {commercial.duration}s • {commercial.scheduledTimes.join(', ')} ET daily •{' '}
                      <span className={audio ? 'text-green-400' : commercial.status === 'produced' ? 'text-green-400' : 'text-amber-400'}>
                        {audio ? 'audio ready' : commercial.status}
                      </span>
                    </p>
                  </div>
                </div>
                <span className="text-gray-400">{expandedId === commercial.id ? '▲' : '▼'}</span>
              </button>
              {expandedId === commercial.id && (
                <div className="px-4 pb-4 border-t border-white/10 pt-3">
                  {/* Audio Player */}
                  {audio && (
                    <div className="mb-4 bg-purple-900/30 rounded-lg p-3 border border-purple-500/20">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => {
                            if (playingId === commercial.id) {
                              setPlayingId(null);
                              document.querySelectorAll('audio').forEach(a => a.pause());
                            } else {
                              setPlayingId(commercial.id);
                              const audioEl = document.getElementById(`audio-${commercial.id}`) as HTMLAudioElement;
                              audioEl?.play();
                            }
                          }}
                          className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center hover:bg-purple-700 transition-colors"
                        >
                          {playingId === commercial.id ? '⏸' : '▶'}
                        </button>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-white">{audio.title}</div>
                          <div className="text-xs text-gray-400">Voice: {audio.djVoice} • {audio.duration}s</div>
                        </div>
                        <a href={audio.audioUrl} download className="text-xs text-purple-400 hover:text-purple-300">Download</a>
                      </div>
                      <audio
                        id={`audio-${commercial.id}`}
                        src={audio.audioUrl}
                        onEnded={() => setPlayingId(null)}
                        className="hidden"
                      />
                    </div>
                  )}

                  <pre className="text-sm text-gray-300 whitespace-pre-wrap font-sans leading-relaxed">
                    {commercial.script}
                  </pre>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      onClick={() => onGenerateSingle(commercial.id, commercial.script.includes('Candy AI') ? 'candy' : 'seraph')}
                      disabled={isGenerating}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isGenerating ? 'bg-purple-800 text-purple-400' : 'bg-purple-600 hover:bg-purple-700'
                      }`}
                    >
                      {isGenerating ? '⏳ Generating...' : `🎙 Generate Audio (${commercial.script.includes('Candy AI') ? 'Candy — echo' : 'Seraph — onyx'})`}
                    </button>
                    <button className="px-4 py-2 bg-white/10 rounded-lg text-sm font-medium hover:bg-white/20 transition-colors">
                      Edit Script
                    </button>
                    <a
                      href="/studio-suite"
                      className="px-4 py-2 bg-amber-600 rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors"
                    >
                      Open in Studio
                    </a>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Broadcast Schedule */}
      <div className="bg-white/5 rounded-xl p-6 border border-purple-800/30 mt-6">
        <h3 className="text-lg font-bold text-amber-400 mb-4">Broadcast Schedule (Daily)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b border-white/10">
                <th className="pb-2 pr-4">Time (ET)</th>
                <th className="pb-2 pr-4">Commercial</th>
                <th className="pb-2 pr-4">Duration</th>
                <th className="pb-2">Status</th>
              </tr>
            </thead>
            <tbody className="text-gray-200">
              <tr className="border-b border-white/5">
                <td className="py-2 pr-4">7:55 AM</td>
                <td className="py-2 pr-4">The Announcement</td>
                <td className="py-2 pr-4">30s</td>
                <td className="py-2"><span className="text-green-400">Active</span></td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="py-2 pr-4">9:00 AM</td>
                <td className="py-2 pr-4">Why It Matters</td>
                <td className="py-2 pr-4">60s</td>
                <td className="py-2"><span className="text-green-400">Active</span></td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="py-2 pr-4">12:00 PM</td>
                <td className="py-2 pr-4">Join the Movement</td>
                <td className="py-2 pr-4">15s</td>
                <td className="py-2"><span className="text-green-400">Active</span></td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="py-2 pr-4">3:00 PM</td>
                <td className="py-2 pr-4">The Announcement</td>
                <td className="py-2 pr-4">30s</td>
                <td className="py-2"><span className="text-green-400">Active</span></td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="py-2 pr-4">6:00 PM</td>
                <td className="py-2 pr-4">Why It Matters</td>
                <td className="py-2 pr-4">60s</td>
                <td className="py-2"><span className="text-green-400">Active</span></td>
              </tr>
              <tr>
                <td className="py-2 pr-4">9:00 PM</td>
                <td className="py-2 pr-4">Join the Movement</td>
                <td className="py-2 pr-4">15s</td>
                <td className="py-2"><span className="text-green-400">Active</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ============ TIMELINE TAB ============
function TimelineTab({ timeline }: { timeline: any[] }) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-amber-400">Campaign Timeline</h2>
      <p className="text-sm text-gray-400">
        March 8–21, 2026 — Pre-event, live coverage, and post-event content schedule.
      </p>

      <div className="space-y-2">
        {timeline.map((day: any, idx: number) => {
          const date = new Date(day.date + 'T12:00:00Z');
          const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
          const monthDay = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          const isToday = day.date === new Date().toISOString().split('T')[0];
          const progress = day.posts > 0 ? (day.posted / day.posts * 100) : 0;

          return (
            <div
              key={day.date}
              className={`flex items-center gap-4 p-3 rounded-lg border transition-colors ${
                isToday
                  ? 'bg-amber-500/10 border-amber-500/30'
                  : 'bg-white/5 border-white/10'
              }`}
            >
              {/* Date */}
              <div className="w-16 text-center flex-shrink-0">
                <div className="text-xs text-gray-400">{dayName}</div>
                <div className={`text-sm font-bold ${isToday ? 'text-amber-400' : 'text-white'}`}>
                  {monthDay}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="flex-1">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-400">{day.posts} posts across {day.platforms.length} platforms</span>
                  <span className={progress === 100 ? 'text-green-400' : 'text-amber-400'}>
                    {day.posted}/{day.posts} posted
                  </span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      progress === 100 ? 'bg-green-500' : progress > 0 ? 'bg-amber-500' : 'bg-gray-600'
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Platform Icons */}
              <div className="flex gap-1 flex-shrink-0">
                {day.platforms.slice(0, 5).map((p: string) => (
                  <span
                    key={p}
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[10px]"
                    style={{ backgroundColor: PLATFORM_COLORS[p] || '#666' }}
                    title={p}
                  >
                    {PLATFORM_ICONS[p]?.[0] || '?'}
                  </span>
                ))}
                {day.platforms.length > 5 && (
                  <span className="text-xs text-gray-400">+{day.platforms.length - 5}</span>
                )}
              </div>

              {/* Status */}
              {isToday && (
                <span className="px-2 py-0.5 bg-red-600 text-white text-xs font-bold rounded animate-pulse flex-shrink-0">
                  TODAY
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============ VISUALS TAB ============
function VisualsTab() {
  const visuals = [
    { name: 'Main Banner (16:9)', url: CAMPAIGN_IMAGES.banner, desc: 'YouTube/Facebook cover, stream background' },
    { name: 'Social Card (1:1)', url: CAMPAIGN_IMAGES.socialSquare, desc: 'Instagram/Facebook feed posts' },
    { name: 'YouTube Thumbnail (16:9)', url: CAMPAIGN_IMAGES.youtubeThumb, desc: 'YouTube live stream thumbnail' },
    { name: 'Stories/Reels (9:16)', url: CAMPAIGN_IMAGES.stories, desc: 'Instagram Stories, TikTok, Reels' },
    { name: 'Stream Overlay (21:9)', url: CAMPAIGN_IMAGES.overlay, desc: 'Lower-third overlay for live streams' },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-amber-400">Campaign Visuals</h2>
      <p className="text-sm text-gray-400">
        Professional broadcast graphics for all platforms. Click to download or copy URL.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {visuals.map(visual => (
          <div key={visual.name} className="bg-white/5 rounded-xl border border-purple-800/30 overflow-hidden">
            <img
              src={visual.url}
              alt={visual.name}
              className="w-full h-48 object-contain bg-black/50"
            />
            <div className="p-3">
              <h3 className="font-bold text-white text-sm">{visual.name}</h3>
              <p className="text-xs text-gray-400 mt-1">{visual.desc}</p>
              <div className="flex gap-2 mt-2">
                <a
                  href={visual.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 bg-purple-600 rounded text-xs font-medium hover:bg-purple-700 transition-colors"
                >
                  Download
                </a>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(visual.url);
                    toast.success('URL copied to clipboard');
                  }}
                  className="px-3 py-1 bg-white/10 rounded text-xs font-medium hover:bg-white/20 transition-colors"
                >
                  Copy URL
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Hashtag Kit */}
      <div className="bg-white/5 rounded-xl p-6 border border-purple-800/30">
        <h3 className="text-lg font-bold text-amber-400 mb-3">Hashtag Kit</h3>
        <div className="space-y-3">
          <div>
            <p className="text-xs text-gray-400 mb-1">Primary (Every Post)</p>
            <div className="flex flex-wrap gap-2">
              {['#CSW70', '#RightsJusticeAction', '#RRBRadio', '#AVoiceForTheVoiceless'].map(tag => (
                <span key={tag} className="px-2 py-1 bg-purple-600/30 text-purple-300 rounded text-sm cursor-pointer hover:bg-purple-600/50"
                  onClick={() => { navigator.clipboard.writeText(tag); toast.success(`Copied: ${tag}`); }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Secondary (Rotate)</p>
            <div className="flex flex-wrap gap-2">
              {['#UNWomen', '#GenderEquality', '#GenderJustice', '#WomensRights', '#AccessToJustice'].map(tag => (
                <span key={tag} className="px-2 py-1 bg-white/10 text-gray-300 rounded text-sm cursor-pointer hover:bg-white/20"
                  onClick={() => { navigator.clipboard.writeText(tag); toast.success(`Copied: ${tag}`); }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Brand</p>
            <div className="flex flex-wrap gap-2">
              {['#CanrynProduction', '#SweetMiracles', '#RockinRockinBoogie', '#BlackWomenInMedia', '#BlackWomenInTech'].map(tag => (
                <span key={tag} className="px-2 py-1 bg-amber-600/30 text-amber-300 rounded text-sm cursor-pointer hover:bg-amber-600/50"
                  onClick={() => { navigator.clipboard.writeText(tag); toast.success(`Copied: ${tag}`); }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <button
            onClick={() => {
              const all = '#CSW70 #RightsJusticeAction #RRBRadio #AVoiceForTheVoiceless #UNWomen #GenderEquality #CanrynProduction #SweetMiracles';
              navigator.clipboard.writeText(all);
              toast.success('All hashtags copied!');
            }}
            className="px-4 py-2 bg-amber-600 rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors"
          >
            Copy All Hashtags
          </button>
        </div>
      </div>
    </div>
  );
}

// ============ AUTOMATION TAB ============
function AutomationTab({ campaign, metrics, onToggleAutomation }: any) {
  const automationPolicies = [
    { name: 'Morning Blast', time: '8:00 AM ET', desc: 'Auto-post daily opening across all platforms', status: 'active' },
    { name: 'Midday Update', time: '12:00 PM ET', desc: 'AI-generated highlight post from live coverage', status: 'active' },
    { name: 'Evening Recap', time: '6:00 PM ET', desc: 'Auto-compiled daily summary post', status: 'active' },
    { name: 'Commercial Rotation', time: 'Every 30 min', desc: 'Play commercials during live streams', status: 'active' },
    { name: 'Engagement Bot', time: 'Real-time', desc: 'Auto-respond to comments with event info', status: 'active' },
    { name: 'Cross-Platform Share', time: 'On publish', desc: 'Auto-share between platforms when content goes live', status: 'active' },
    { name: 'Analytics Collection', time: 'Hourly', desc: 'Track reach, engagement, and viewer counts', status: 'active' },
    { name: 'Translation Bot', time: 'On publish', desc: 'Auto-translate posts for international reach', status: 'active' },
  ];

  const aiAgents = [
    { name: 'Seraph AI', role: 'Narrator — Commercials & Live Commentary', status: 'active', icon: '🎙' },
    { name: 'Candy AI', role: 'Narrator — Impact Stories & Empathy', status: 'active', icon: '💜' },
    { name: 'QUMUS Brain', role: 'Autonomous Scheduling & Distribution', status: 'active', icon: '🧠' },
    { name: 'Valanna', role: 'Voice Assistant & User Interaction', status: 'active', icon: '🗣' },
    { name: 'Social Media Bots', role: 'Auto-posting across 8 platforms', status: 'active', icon: '🤖' },
    { name: 'Engagement Bots', role: 'Comment responses & community management', status: 'active', icon: '💬' },
    { name: 'Analytics Bot', role: 'Real-time tracking and reporting', status: 'active', icon: '📊' },
    { name: 'Caption Bot', role: 'Generate closed captions for all video', status: 'active', icon: '📝' },
  ];

  return (
    <div className="space-y-6">
      {/* Master Toggle */}
      <div className="bg-gradient-to-r from-purple-900/50 to-indigo-900/50 rounded-xl p-6 border border-purple-500/30">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-amber-400">QUMUS Autonomous Campaign Control</h2>
            <p className="text-sm text-gray-400 mt-1">
              90% autonomous operation • 10% human override • Real-time monitoring
            </p>
          </div>
          <button
            onClick={() => onToggleAutomation(!campaign?.automationEnabled)}
            className={`px-6 py-3 rounded-xl font-bold text-lg transition-all ${
              campaign?.automationEnabled
                ? 'bg-green-600 hover:bg-green-700 shadow-green-500/20 shadow-lg'
                : 'bg-red-600 hover:bg-red-700 shadow-red-500/20 shadow-lg'
            }`}
          >
            {campaign?.automationEnabled ? '🟢 ACTIVE' : '🔴 PAUSED'}
          </button>
        </div>
      </div>

      {/* AI Agents */}
      <div className="bg-white/5 rounded-xl p-6 border border-purple-800/30">
        <h3 className="text-lg font-bold text-amber-400 mb-4">AI Agents & Bots</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {aiAgents.map(agent => (
            <div key={agent.name} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
              <span className="text-2xl">{agent.icon}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-white text-sm">{agent.name}</span>
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                </div>
                <p className="text-xs text-gray-400">{agent.role}</p>
              </div>
              <span className="text-xs text-green-400 font-medium uppercase">{agent.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Automation Policies */}
      <div className="bg-white/5 rounded-xl p-6 border border-purple-800/30">
        <h3 className="text-lg font-bold text-amber-400 mb-4">Automation Policies</h3>
        <div className="space-y-2">
          {automationPolicies.map(policy => (
            <div key={policy.name} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                <div>
                  <span className="font-medium text-white text-sm">{policy.name}</span>
                  <span className="text-xs text-gray-400 ml-2">({policy.time})</span>
                </div>
              </div>
              <p className="text-xs text-gray-400 hidden md:block">{policy.desc}</p>
              <span className="text-xs text-green-400 font-medium">{policy.status.toUpperCase()}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Decision Log */}
      <div className="bg-white/5 rounded-xl p-6 border border-purple-800/30">
        <h3 className="text-lg font-bold text-amber-400 mb-4">Recent QUMUS Decisions</h3>
        <div className="space-y-2 text-sm">
          {[
            { time: '11:02 AM', decision: 'Auto-posted Day 3 morning blast to 8 platforms', confidence: '98%', type: 'auto' },
            { time: '10:45 AM', decision: 'Generated midday highlight from Ghana delegation speech', confidence: '95%', type: 'auto' },
            { time: '10:30 AM', decision: 'Rotated Commercial #2 "Why It Matters" on live stream', confidence: '99%', type: 'auto' },
            { time: '10:15 AM', decision: 'Auto-responded to 23 comments with event info links', confidence: '92%', type: 'auto' },
            { time: '9:55 AM', decision: 'Translated morning post to Spanish, French, Twi, Swahili', confidence: '96%', type: 'auto' },
            { time: '9:30 AM', decision: 'Flagged sensitive content for human review', confidence: '87%', type: 'human' },
          ].map((log, idx) => (
            <div key={idx} className="flex items-center gap-3 p-2 bg-white/5 rounded">
              <span className="text-xs text-gray-500 w-16 flex-shrink-0">{log.time}</span>
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${log.type === 'auto' ? 'bg-green-500' : 'bg-amber-500'}`} />
              <span className="text-gray-300 flex-1">{log.decision}</span>
              <span className="text-xs text-gray-500">{log.confidence}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============ RECORDING PIPELINE TAB ============
function RecordingPipelineTab({ jobs, stats }: { jobs: any[]; stats: any }) {
  const destinations = [
    { id: 'rrb-radio-replay', name: 'RRB Radio Replay Library', icon: '📻', desc: 'On-demand replay content for listeners' },
    { id: 'media-blast-content', name: 'Media Blast Campaign', icon: '📢', desc: 'Social media clips and campaign content' },
    { id: 'studio-suite-editing', name: 'Studio Suite', icon: '🎛', desc: 'Professional editing and post-production' },
    { id: 'streaming-platforms', name: 'Streaming Platforms', icon: '📺', desc: 'YouTube, Facebook, Twitch, Rumble, etc.' },
    { id: 'qumus-automation', name: 'QUMUS Automation', icon: '🧠', desc: 'AI analysis, scheduling, and monitoring' },
  ];

  return (
    <div className="space-y-6">
      {/* Pipeline Overview */}
      <div className="bg-gradient-to-r from-purple-900/50 to-indigo-900/50 rounded-xl p-6 border border-purple-500/30">
        <h2 className="text-xl font-bold text-amber-400">Recording Pipeline</h2>
        <p className="text-sm text-gray-400 mt-1">
          All meeting and conference recordings are automatically routed to 5 destinations via QUMUS.
          90% autonomous operation with human override.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          <div className="bg-white/5 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-white">{stats?.totalJobs || 0}</div>
            <div className="text-xs text-gray-400">Total Jobs</div>
          </div>
          <div className="bg-white/5 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-green-400">{stats?.completed || 0}</div>
            <div className="text-xs text-gray-400">Completed</div>
          </div>
          <div className="bg-white/5 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-amber-400">{stats?.processing || 0}</div>
            <div className="text-xs text-gray-400">Processing</div>
          </div>
          <div className="bg-white/5 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-red-400">{stats?.failed || 0}</div>
            <div className="text-xs text-gray-400">Failed</div>
          </div>
        </div>
      </div>

      {/* Destination Routes */}
      <div className="bg-white/5 rounded-xl p-6 border border-purple-800/30">
        <h3 className="text-lg font-bold text-amber-400 mb-4">Pipeline Destinations</h3>
        <div className="space-y-3">
          {destinations.map((dest, idx) => {
            const destStat = stats?.destinations?.find((d: any) => d.name === dest.name);
            return (
              <div key={dest.id} className="flex items-center gap-4 p-4 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-600/30 text-xl">
                  {dest.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white">{dest.name}</span>
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                  </div>
                  <p className="text-xs text-gray-400">{dest.desc}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-green-400">{destStat?.completed || 0} delivered</div>
                  {(destStat?.failed || 0) > 0 && (
                    <div className="text-xs text-red-400">{destStat.failed} failed</div>
                  )}
                </div>
                <div className="w-8 text-center text-gray-500">
                  {idx < destinations.length - 1 ? '→' : '✓'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Flow Diagram */}
      <div className="bg-white/5 rounded-xl p-6 border border-purple-800/30">
        <h3 className="text-lg font-bold text-amber-400 mb-4">Recording Flow</h3>
        <div className="flex items-center justify-center gap-2 flex-wrap text-sm">
          <div className="px-4 py-2 bg-blue-600/30 rounded-lg border border-blue-500/30 text-blue-300 font-medium">
            Recording Ends
          </div>
          <span className="text-gray-500">→</span>
          <div className="px-4 py-2 bg-purple-600/30 rounded-lg border border-purple-500/30 text-purple-300 font-medium">
            QUMUS Pipeline
          </div>
          <span className="text-gray-500">→</span>
          <div className="flex flex-col gap-1">
            <div className="px-3 py-1 bg-green-600/20 rounded border border-green-500/20 text-green-300 text-xs">📻 RRB Radio</div>
            <div className="px-3 py-1 bg-green-600/20 rounded border border-green-500/20 text-green-300 text-xs">📢 Media Blast</div>
            <div className="px-3 py-1 bg-green-600/20 rounded border border-green-500/20 text-green-300 text-xs">🎛 Studio Suite</div>
            <div className="px-3 py-1 bg-green-600/20 rounded border border-green-500/20 text-green-300 text-xs">📺 Streaming</div>
            <div className="px-3 py-1 bg-green-600/20 rounded border border-green-500/20 text-green-300 text-xs">🧠 QUMUS AI</div>
          </div>
        </div>
      </div>

      {/* Recent Pipeline Jobs */}
      <div className="bg-white/5 rounded-xl p-6 border border-purple-800/30">
        <h3 className="text-lg font-bold text-amber-400 mb-4">Recent Pipeline Jobs</h3>
        {jobs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <span className="text-4xl block mb-2">🔄</span>
            <p>No recordings have been processed yet.</p>
            <p className="text-xs mt-1">When a meeting or conference recording ends, it will automatically appear here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {jobs.map((job: any) => (
              <div key={job.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full ${
                    job.status === 'completed' ? 'bg-green-500' :
                    job.status === 'processing' ? 'bg-amber-500 animate-pulse' :
                    'bg-red-500'
                  }`} />
                  <div>
                    <span className="font-medium text-white text-sm">{job.recordingTitle}</span>
                    <span className="text-xs text-gray-400 ml-2">({job.sourceType})</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-gray-400">
                    {job.completedDestinations}/{job.destinationCount} destinations
                  </span>
                  <span className={`text-xs font-medium ${
                    job.status === 'completed' ? 'text-green-400' :
                    job.status === 'processing' ? 'text-amber-400' :
                    'text-red-400'
                  }`}>
                    {job.status.toUpperCase()}
                  </span>
                  <span className="text-xs text-gray-500">{new Date(job.createdAt).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ============ UTILITY COMPONENTS ============
function StatCard({ label, value, icon, color }: { label: string; value: string | number; icon: string; color: string }) {
  const colorClasses: Record<string, string> = {
    purple: 'from-purple-600/20 to-purple-800/20 border-purple-500/30',
    green: 'from-green-600/20 to-green-800/20 border-green-500/30',
    amber: 'from-amber-600/20 to-amber-800/20 border-amber-500/30',
    blue: 'from-blue-600/20 to-blue-800/20 border-blue-500/30',
    cyan: 'from-cyan-600/20 to-cyan-800/20 border-cyan-500/30',
    red: 'from-red-600/20 to-red-800/20 border-red-500/30',
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color] || colorClasses.purple} rounded-xl p-4 border`}>
      <div className="flex items-center justify-between">
        <span className="text-2xl">{icon}</span>
      </div>
      <div className="mt-2">
        <div className="text-2xl font-bold text-white">{value}</div>
        <div className="text-xs text-gray-400 mt-1">{label}</div>
      </div>
    </div>
  );
}

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}
