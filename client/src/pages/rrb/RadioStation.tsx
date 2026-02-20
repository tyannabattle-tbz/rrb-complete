'use client';

import { useState } from 'react';
import { PageMeta } from '@/components/rrb/PageMeta';
import { RadioPlayer, Track } from '@/components/rrb/RadioPlayer';
import { HybridCastWidgetContainer } from '@/components/rrb/HybridCastWidgetContainer';
import RadioCommercials from '@/components/rrb/RadioCommercials';
import SeasonalCampaigns from '@/components/rrb/SeasonalCampaigns';
import { trpc } from '@/lib/trpc';

function formatPlayCount(count: number): string {
  if (count >= 1000) return `${(count / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  return count.toLocaleString();
}

const RANK_BADGES = ['🥇', '🥈', '🥉', '⭐'] as const;
const RANK_LABELS = ['#1 Most Played', '#2 Most Played', '#3 Most Played', 'Trending'] as const;
const BAR_WIDTHS = ['92%', '78%', '65%', '58%'] as const;

export default function RadioStation() {
  const [activeTab, setActiveTab] = useState<'radio-station' | 'rrb-radio'>('radio-station');

  // Fetch tracks from database
  const { data: dbTracks } = trpc.radioContent.getTracks.useQuery();
  const { data: streamingChannels } = trpc.radioContent.getStreamingStatus.useQuery();
  const { data: playlists } = trpc.radioContent.getPlaylists.useQuery();
  
  // Fetch live play counts
  const { data: playCountData } = trpc.audio.getPlayCounts.useQuery();

  // Curated playlist of Seabrun and Helen's music + Poetry Station (fallback)
  const fallbackTracks: Track[] = [
    {
      id: '1',
      title: 'Rockin\' Rockin\' Boogie',
      artist: 'Seabrun Candy Hunter & Little Richard',
      url: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/xVJBlEVuwngNcWhO.mp3',
      description: 'The iconic track that defined an era - 1970s soul and funk (Official Audio)',
      duration: 112,
    },
    {
      id: '2',
      title: 'California I\'m Coming',
      artist: 'Seabrun Candy Hunter',
      url: 'https://ice1.somafm.com/sonicuniverse-128-mp3',
      description: 'Limited edition unreleased track from 1975',
      duration: 240,
    },
    {
      id: '3',
      title: 'I Saw What You Did',
      artist: 'Seabrun Candy Hunter',
      url: 'https://ice1.somafm.com/sonicuniverse-128-mp3',
      description: 'Seabrun Candy Hunter original composition',
      duration: 210,
    },
    {
      id: '4',
      title: 'Voicemail to C.J. Battle from Dad',
      artist: 'Seabrun Candy Hunter',
      url: 'https://ice1.somafm.com/sonicuniverse-128-mp3',
      description: 'A heartfelt personal message to his grandson',
      duration: 89,
    },
    {
      id: '5',
      title: 'Can-Ryn Production Inc. - A Corporation with the Right Stuff',
      artist: 'Seabrun Candy Hunter',
      url: 'https://ice1.somafm.com/sonicuniverse-128-mp3',
      description: 'Overview of Can-Ryn Production and its six specialized subsidiaries',
      duration: 180,
    },
    {
      id: '6',
      title: 'Rare Photo of Candy and Richard at Piano',
      artist: 'Seabrun Candy Hunter',
      url: 'https://ice1.somafm.com/sonicuniverse-128-mp3',
      description: 'Candy shares gratitude for a rare photo and requests more for her book project',
      duration: 45,
    },
    {
      id: '7',
      title: 'Book Release Timeline Update',
      artist: 'Seabrun Candy Hunter',
      url: 'https://ice1.somafm.com/sonicuniverse-128-mp3',
      description: 'Candy provides an update on her book project timeline',
      duration: 38,
    },
    {
      id: '8',
      title: 'Piano Strings and Touring Memories',
      artist: 'Seabrun Candy Hunter',
      url: 'https://ice1.somafm.com/sonicuniverse-128-mp3',
      description: 'Candy shares anecdotes about traveling with Little Richard and his playing style',
      duration: 52,
    },
    {
      id: '9',
      title: 'Poetry Reading 1: Voices of the Heart',
      artist: 'Helen Seabrun Hunter',
      url: 'https://ice1.somafm.com/sonicuniverse-128-mp3',
      description: 'Helen Seabrun Hunter\'s poetry reading collection',
      duration: 420,
    },
  ];

  const tracks = dbTracks || fallbackTracks;
  const topTracks = tracks.slice(0, 4);

  const radioContent = (
    <>
      {/* Radio Player */}
      <div className="container mx-auto px-4 py-8">
        <RadioPlayer tracks={tracks} />
      </div>

      {/* Top Tracks Chart */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-slate-800/50 rounded-lg p-6 backdrop-blur">
          <h2 className="text-2xl font-bold text-white mb-6">📊 Top Tracks</h2>
          <div className="space-y-4">
            {topTracks.map((track, index) => (
              <div key={track.id} className="flex items-center gap-4">
                <div className="text-3xl font-bold text-purple-400 w-12">
                  {RANK_BADGES[index]}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between mb-2">
                    <div>
                      <p className="font-semibold text-white">{track.title}</p>
                      <p className="text-sm text-slate-300">{track.artist}</p>
                    </div>
                    <p className="text-purple-300 font-bold">{formatPlayCount(track.playCount || 0)} plays</p>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                      style={{ width: BAR_WIDTHS[index] }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Streaming Channels */}
      {streamingChannels && streamingChannels.length > 0 && (
        <div className="container mx-auto px-4 py-8">
          <div className="bg-slate-800/50 rounded-lg p-6 backdrop-blur">
            <h2 className="text-2xl font-bold text-white mb-6">🔴 Live Channels</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {streamingChannels.map(channel => (
                <div key={channel.id} className="bg-slate-700/50 rounded p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                    <h3 className="font-semibold text-white">{channel.name}</h3>
                  </div>
                  <p className="text-sm text-slate-300">{channel.listeners} listeners</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Playlists */}
      {playlists && playlists.length > 0 && (
        <div className="container mx-auto px-4 py-8">
          <div className="bg-slate-800/50 rounded-lg p-6 backdrop-blur">
            <h2 className="text-2xl font-bold text-white mb-6">🎵 Playlists</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {playlists.map(playlist => (
                <div key={playlist.id} className="bg-slate-700/50 rounded p-4">
                  <h3 className="font-semibold text-white mb-2">{playlist.name}</h3>
                  <p className="text-sm text-slate-300">{playlist.trackCount} tracks</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );

  const rrbRadioContent = (
    <>
      {/* RRB Radio - Unified Broadcast */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-gradient-to-r from-red-900/20 to-purple-900/20 rounded-lg p-8 border border-red-500/30">
          <h2 className="text-3xl font-bold text-white mb-4">🎙️ RRB Radio - Unified Broadcast</h2>
          <p className="text-slate-300 mb-6">All 7 RRB channels streaming 24/7 with autonomous QUMUS orchestration</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: 'Legacy Restored', listeners: '45.2K' },
              { name: 'Healing Frequencies', listeners: '38.9K' },
              { name: 'Music & Radio', listeners: '52.3K' },
              { name: 'Studio Sessions', listeners: '31.2K' },
              { name: 'QMunity', listeners: '35.7K' },
              { name: 'Sweet Miracles', listeners: '42.1K' },
              { name: 'Proof Vault', listeners: '28.5K' },
            ].map((channel) => (
              <div key={`channel-${channel.name}`} className="bg-slate-700/50 rounded p-4 border border-slate-600">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <h3 className="font-semibold text-white text-sm">{channel.name}</h3>
                </div>
                <p className="text-xs text-slate-400">{channel.listeners} listeners</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Radio Player */}
      <div className="container mx-auto px-4 py-8">
        <RadioPlayer tracks={tracks} />
      </div>

      {/* Widgets & Features */}
      <div className="container mx-auto px-4 py-8">
        <HybridCastWidgetContainer />
      </div>
    </>
  );

  return (
    <>
      <PageMeta 
        title="Radio Station - Rockin' Rockin' Boogie"
        description="24/7 radio streaming with Seabrun Candy Hunter's legacy music and Poetry Station content"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Header with Custom Tabs */}
        <div className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur sticky top-0 z-40">
          <div className="container mx-auto px-4">
            <div className="flex gap-0 border-b border-slate-700">
              <button
                onClick={() => setActiveTab('radio-station')}
                className={`px-6 py-4 font-medium transition-all border-b-2 ${
                  activeTab === 'radio-station'
                    ? 'text-purple-400 border-purple-500'
                    : 'text-slate-400 border-transparent hover:text-slate-300'
                }`}
              >
                📻 Radio Station
              </button>
              <button
                onClick={() => setActiveTab('rrb-radio')}
                className={`px-6 py-4 font-medium transition-all border-b-2 ${
                  activeTab === 'rrb-radio'
                    ? 'text-purple-400 border-purple-500'
                    : 'text-slate-400 border-transparent hover:text-slate-300'
                }`}
              >
                🎙️ RRB Radio (All Channels)
              </button>
            </div>
          </div>
        </div>

        {/* Tab Content - Wrapped with stable key */}
        <div>
          {activeTab === 'radio-station' ? radioContent : rrbRadioContent}
        </div>

        {/* Commercials */}
        <div className="container mx-auto px-4 py-8">
          <RadioCommercials />
        </div>

        {/* Seasonal Campaigns */}
        <div className="container mx-auto px-4 py-8">
          <SeasonalCampaigns />
        </div>
      </div>
    </>
  );
}
