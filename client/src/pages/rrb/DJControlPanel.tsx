'use client';

import React, { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { PageMeta } from '@/components/rrb/PageMeta';
import { Play, Pause, Plus, Trash2, Clock, Radio, Mic } from 'lucide-react';

export default function DJControlPanel() {
  const [selectedChannel, setSelectedChannel] = useState('rock');
  const [djName, setDjName] = useState('');
  const [showTitle, setShowTitle] = useState('');
  const [showDescription, setShowDescription] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [isStartingShow, setIsStartingShow] = useState(false);

  // Get all channels
  const { data: channels } = trpc.streams.getAllChannels.useQuery();

  // Get current DJ show
  const { data: currentShow, refetch: refetchShow } = trpc.streams.getCurrentDJShow.useQuery({
    channelId: selectedChannel,
  });

  // Get playlist
  const { data: playlist } = trpc.streams.getPlaylist.useQuery({
    channelId: selectedChannel,
  });

  // Start DJ show mutation
  const startShowMutation = trpc.streams.startDJShow.useMutation({
    onSuccess: () => {
      refetchShow();
      setDjName('');
      setShowTitle('');
      setShowDescription('');
      setIsStartingShow(false);
    },
  });

  // End DJ show mutation
  const endShowMutation = trpc.streams.endDJShow.useMutation({
    onSuccess: () => {
      refetchShow();
    },
  });

  const handleStartShow = () => {
    if (!djName || !showTitle) {
      alert('Please fill in DJ name and show title');
      return;
    }

    setIsStartingShow(true);
    startShowMutation.mutate({
      channelId: selectedChannel,
      djName,
      title: showTitle,
      description: showDescription,
      durationMinutes,
    });
  };

  const handleEndShow = () => {
    if (currentShow) {
      endShowMutation.mutate({
        channelId: selectedChannel,
        showId: currentShow.id,
      });
    }
  };

  return (
    <>
      <PageMeta title="DJ Control Panel" description="Manage live DJ shows and streaming" />

      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-white mb-2">🎙️ DJ Control Panel</h1>
          <p className="text-slate-400 mb-8">Manage live DJ shows and streaming for all channels</p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Channel Selection */}
            <div className="lg:col-span-1">
              <div className="bg-slate-800/50 border border-purple-500/30 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-4">📻 Select Channel</h2>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {channels?.map(channel => (
                    <button
                      key={channel.id}
                      onClick={() => setSelectedChannel(channel.id)}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                        selectedChannel === channel.id
                          ? 'bg-orange-500 text-white'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      <div className="font-semibold">{channel.name}</div>
                      <div className="text-xs opacity-75">{channel.category}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Channel Stats */}
              {channels && (
                <div className="mt-6 bg-slate-800/50 border border-purple-500/30 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">📊 Channel Stats</h3>
                  {channels.find(ch => ch.id === selectedChannel) && (
                    <>
                      <div className="space-y-3">
                        <div>
                          <div className="text-sm text-slate-400">Listeners</div>
                          <div className="text-2xl font-bold text-orange-400">
                            {channels.find(ch => ch.id === selectedChannel)?.listenerCount || 0}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-slate-400">Status</div>
                          <div className="text-lg font-semibold text-green-400">
                            {channels.find(ch => ch.id === selectedChannel)?.isLive ? '🔴 LIVE' : '⚫ OFFLINE'}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Right: DJ Show Management */}
            <div className="lg:col-span-2 space-y-6">
              {/* Current Show */}
              {currentShow ? (
                <div className="bg-gradient-to-r from-red-600/20 to-orange-600/20 border border-red-500/50 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Radio className="w-6 h-6 text-red-500 animate-pulse" />
                        {currentShow.title}
                      </h3>
                      <p className="text-slate-400 mt-1">Hosted by {currentShow.djName}</p>
                    </div>
                    <button
                      onClick={handleEndShow}
                      disabled={endShowMutation.isPending}
                      className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50"
                    >
                      {endShowMutation.isPending ? 'Ending...' : 'End Show'}
                    </button>
                  </div>
                  <p className="text-slate-300 mb-4">{currentShow.description}</p>
                  <div className="text-sm text-slate-400">
                    Remaining: {Math.ceil((currentShow.endTime - Date.now()) / 60000)} minutes
                  </div>
                </div>
              ) : (
                <div className="bg-slate-800/50 border border-purple-500/30 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">🎬 Start New Show</h3>

                  <div className="space-y-4">
                    {/* DJ Name */}
                    <div>
                      <label className="block text-sm font-semibold text-white mb-2">DJ Name</label>
                      <input
                        type="text"
                        value={djName}
                        onChange={e => setDjName(e.target.value)}
                        placeholder="Enter DJ name"
                        className="w-full px-4 py-2 bg-slate-700 border border-purple-500/30 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    {/* Show Title */}
                    <div>
                      <label className="block text-sm font-semibold text-white mb-2">Show Title</label>
                      <input
                        type="text"
                        value={showTitle}
                        onChange={e => setShowTitle(e.target.value)}
                        placeholder="Enter show title"
                        className="w-full px-4 py-2 bg-slate-700 border border-purple-500/30 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-semibold text-white mb-2">Description</label>
                      <textarea
                        value={showDescription}
                        onChange={e => setShowDescription(e.target.value)}
                        placeholder="Enter show description"
                        rows={3}
                        className="w-full px-4 py-2 bg-slate-700 border border-purple-500/30 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    {/* Duration */}
                    <div>
                      <label className="block text-sm font-semibold text-white mb-2">Duration (minutes)</label>
                      <input
                        type="number"
                        value={durationMinutes}
                        onChange={e => setDurationMinutes(parseInt(e.target.value))}
                        min="15"
                        max="480"
                        className="w-full px-4 py-2 bg-slate-700 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    {/* Start Button */}
                    <button
                      onClick={handleStartShow}
                      disabled={isStartingShow || startShowMutation.isPending}
                      className="w-full px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <Mic className="w-5 h-5" />
                      {isStartingShow || startShowMutation.isPending ? 'Starting...' : 'Start Show'}
                    </button>
                  </div>
                </div>
              )}

              {/* Playlist */}
              <div className="bg-slate-800/50 border border-purple-500/30 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-white mb-4">🎵 Channel Playlist</h3>
                {playlist && playlist.length > 0 ? (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {playlist.map((track, idx) => (
                      <div key={track.id} className="bg-slate-700/50 p-3 rounded-lg flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-semibold text-white">{track.title}</div>
                          <div className="text-sm text-slate-400">{track.artist}</div>
                        </div>
                        <div className="text-xs text-slate-400 ml-4">{Math.floor(track.duration / 60)}m</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400">No tracks in playlist</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
