'use client';

import React, { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { PageMeta } from '@/components/rrb/PageMeta';
import { Play, Pause, Plus, Trash2, Clock, Radio, Mic, Phone, Archive, DollarSign, X } from 'lucide-react';

export default function DJControlPanelEnhanced() {
  const [selectedChannel, setSelectedChannel] = useState('rock');
  const [djName, setDjName] = useState('');
  const [showTitle, setShowTitle] = useState('');
  const [showDescription, setShowDescription] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [isStartingShow, setIsStartingShow] = useState(false);
  const [activeTab, setActiveTab] = useState<'show' | 'callin' | 'archive' | 'donations'>('show');

  // Call-in state
  const [callerName, setCallerName] = useState('');
  const [callerEmail, setCallerEmail] = useState('');
  const [callerTopic, setCallerTopic] = useState('');

  // Donation state
  const [donationAmount, setDonationAmount] = useState(5);
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [donationMessage, setDonationMessage] = useState('');

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

  // Get waiting calls
  const { data: waitingCalls, refetch: refetchCalls } = trpc.liveShowFeatures.getWaitingCalls.useQuery(
    { showId: currentShow?.id || '' },
    { enabled: !!currentShow?.id }
  );

  // Get channel recordings
  const { data: recordings } = trpc.liveShowFeatures.getChannelRecordings.useQuery({
    channelId: selectedChannel,
    limit: 10,
  });

  // Get archive stats
  const { data: archiveStats } = trpc.liveShowFeatures.getArchiveStats.useQuery({
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

  // Create call-in request
  const createCallInMutation = trpc.liveShowFeatures.createCallInRequest.useMutation({
    onSuccess: () => {
      refetchCalls();
      setCallerName('');
      setCallerEmail('');
      setCallerTopic('');
    },
  });

  // Create donation
  const createDonationMutation = trpc.liveShowFeatures.createShowDonation.useMutation({
    onSuccess: (data) => {
      if (data.success && data.checkoutUrl) {
        window.open(data.checkoutUrl, '_blank');
      }
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

  const handleCreateCallIn = () => {
    if (!callerName || !callerEmail || !callerTopic || !currentShow) {
      alert('Please fill in all fields');
      return;
    }

    createCallInMutation.mutate({
      channelId: selectedChannel,
      showId: currentShow.id,
      callerName,
      callerEmail,
      topic: callerTopic,
    });
  };

  const handleCreateDonation = () => {
    if (!donorName || !donorEmail || !currentShow) {
      alert('Please fill in all fields');
      return;
    }

    createDonationMutation.mutate({
      showId: currentShow.id,
      channelId: selectedChannel,
      amount: donationAmount,
      donorName,
      donorEmail,
      message: donationMessage,
    });
  };

  return (
    <>
      <PageMeta title="DJ Control Panel" description="Manage live DJ shows with call-in, archives, and donations" />

      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-white mb-2">🎙️ DJ Control Panel</h1>
          <p className="text-slate-400 mb-8">Manage live DJ shows with call-in, archives, and listener donations</p>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
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

              {/* Archive Stats */}
              {archiveStats && (
                <div className="mt-6 bg-slate-800/50 border border-purple-500/30 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">📊 Archive Stats</h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <div className="text-slate-400">Total Shows</div>
                      <div className="text-2xl font-bold text-orange-400">{archiveStats.totalShows}</div>
                    </div>
                    <div>
                      <div className="text-slate-400">Avg Listeners</div>
                      <div className="text-xl font-bold text-green-400">{archiveStats.averageListeners}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Feature Tabs */}
            <div className="lg:col-span-3 space-y-6">
              {/* Tab Navigation */}
              <div className="flex gap-2 border-b border-purple-500/30">
                <button
                  onClick={() => setActiveTab('show')}
                  className={`px-4 py-2 font-semibold transition-all ${
                    activeTab === 'show'
                      ? 'text-orange-400 border-b-2 border-orange-400'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Mic className="w-4 h-4 inline mr-2" />
                  Show Control
                </button>
                <button
                  onClick={() => setActiveTab('callin')}
                  className={`px-4 py-2 font-semibold transition-all ${
                    activeTab === 'callin'
                      ? 'text-orange-400 border-b-2 border-orange-400'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Phone className="w-4 h-4 inline mr-2" />
                  Call-In ({waitingCalls?.length || 0})
                </button>
                <button
                  onClick={() => setActiveTab('archive')}
                  className={`px-4 py-2 font-semibold transition-all ${
                    activeTab === 'archive'
                      ? 'text-orange-400 border-b-2 border-orange-400'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Archive className="w-4 h-4 inline mr-2" />
                  Archive
                </button>
                <button
                  onClick={() => setActiveTab('donations')}
                  className={`px-4 py-2 font-semibold transition-all ${
                    activeTab === 'donations'
                      ? 'text-orange-400 border-b-2 border-orange-400'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <DollarSign className="w-4 h-4 inline mr-2" />
                  Donations
                </button>
              </div>

              {/* Show Control Tab */}
              {activeTab === 'show' && (
                <div className="space-y-6">
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
                </div>
              )}

              {/* Call-In Tab */}
              {activeTab === 'callin' && (
                <div className="space-y-6">
                  {currentShow ? (
                    <>
                      {/* Waiting Calls */}
                      {waitingCalls && waitingCalls.length > 0 && (
                        <div className="bg-slate-800/50 border border-purple-500/30 rounded-lg p-6">
                          <h3 className="text-xl font-semibold text-white mb-4">📞 Waiting Callers ({waitingCalls.length})</h3>
                          <div className="space-y-3">
                            {waitingCalls.map(call => (
                              <div key={call.id} className="bg-slate-700/50 p-4 rounded-lg flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="font-semibold text-white">{call.callerName}</div>
                                  <div className="text-sm text-slate-400">{call.topic}</div>
                                </div>
                                <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold">
                                  Connect
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* New Call-In Request */}
                      <div className="bg-slate-800/50 border border-purple-500/30 rounded-lg p-6">
                        <h3 className="text-xl font-semibold text-white mb-4">📞 New Call-In Request</h3>

                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-semibold text-white mb-2">Your Name</label>
                            <input
                              type="text"
                              value={callerName}
                              onChange={e => setCallerName(e.target.value)}
                              placeholder="Enter your name"
                              className="w-full px-4 py-2 bg-slate-700 border border-purple-500/30 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-white mb-2">Email</label>
                            <input
                              type="email"
                              value={callerEmail}
                              onChange={e => setCallerEmail(e.target.value)}
                              placeholder="Enter your email"
                              className="w-full px-4 py-2 bg-slate-700 border border-purple-500/30 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-white mb-2">Topic</label>
                            <input
                              type="text"
                              value={callerTopic}
                              onChange={e => setCallerTopic(e.target.value)}
                              placeholder="What do you want to talk about?"
                              className="w-full px-4 py-2 bg-slate-700 border border-purple-500/30 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
                            />
                          </div>

                          <button
                            onClick={handleCreateCallIn}
                            disabled={createCallInMutation.isPending}
                            className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                          >
                            <Phone className="w-5 h-5" />
                            {createCallInMutation.isPending ? 'Requesting...' : 'Request Call-In'}
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="bg-slate-800/50 border border-purple-500/30 rounded-lg p-6 text-center">
                      <p className="text-slate-400">Start a show to enable call-in features</p>
                    </div>
                  )}
                </div>
              )}

              {/* Archive Tab */}
              {activeTab === 'archive' && (
                <div className="bg-slate-800/50 border border-purple-500/30 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">📚 Show Archive</h3>
                  {recordings && recordings.length > 0 ? (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {recordings.map(recording => (
                        <div key={recording.id} className="bg-slate-700/50 p-4 rounded-lg">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="font-semibold text-white">{recording.title}</div>
                              <div className="text-sm text-slate-400">by {recording.djName}</div>
                              <div className="text-xs text-slate-500 mt-1">
                                {Math.floor(recording.duration / 60)}m • {recording.listenerCount} listeners
                              </div>
                            </div>
                            <a
                              href={recording.recordingUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded text-sm font-semibold"
                            >
                              Play
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-400">No recordings yet</p>
                  )}
                </div>
              )}

              {/* Donations Tab */}
              {activeTab === 'donations' && (
                <div className="bg-slate-800/50 border border-purple-500/30 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">💝 Support This Show</h3>

                  {currentShow ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-white mb-2">Donation Amount ($)</label>
                        <div className="flex gap-2">
                          {[5, 10, 25, 50].map(amount => (
                            <button
                              key={amount}
                              onClick={() => setDonationAmount(amount)}
                              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                                donationAmount === amount
                                  ? 'bg-orange-500 text-white'
                                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                              }`}
                            >
                              ${amount}
                            </button>
                          ))}
                        </div>
                        <input
                          type="number"
                          value={donationAmount}
                          onChange={e => setDonationAmount(parseFloat(e.target.value))}
                          min="1"
                          placeholder="Custom amount"
                          className="w-full mt-2 px-4 py-2 bg-slate-700 border border-purple-500/30 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-white mb-2">Your Name</label>
                        <input
                          type="text"
                          value={donorName}
                          onChange={e => setDonorName(e.target.value)}
                          placeholder="Enter your name"
                          className="w-full px-4 py-2 bg-slate-700 border border-purple-500/30 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-white mb-2">Email</label>
                        <input
                          type="email"
                          value={donorEmail}
                          onChange={e => setDonorEmail(e.target.value)}
                          placeholder="Enter your email"
                          className="w-full px-4 py-2 bg-slate-700 border border-purple-500/30 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-white mb-2">Message (optional)</label>
                        <textarea
                          value={donationMessage}
                          onChange={e => setDonationMessage(e.target.value)}
                          placeholder="Leave a message for the DJ"
                          rows={2}
                          className="w-full px-4 py-2 bg-slate-700 border border-purple-500/30 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
                        />
                      </div>

                      <button
                        onClick={handleCreateDonation}
                        disabled={createDonationMutation.isPending}
                        className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        <DollarSign className="w-5 h-5" />
                        {createDonationMutation.isPending ? 'Processing...' : `Donate $${donationAmount}`}
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="text-slate-400">A show must be live to accept donations</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
