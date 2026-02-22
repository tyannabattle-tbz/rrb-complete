/**
 * Solbones Podcast Broadcast Platform
 * Independent broadcast system for Solbones with one-click go-live
 */

import React, { useState } from 'react';
import { OneClickGoLive } from '../components/OneClickGoLive';
import { Podcast, BarChart3, Settings, Headphones } from 'lucide-react';
import type { PlatformRole } from '../components/RoleBasedAccess';

export const SolbonesBroadcast: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'broadcast' | 'episodes' | 'settings'>(
    'broadcast'
  );
  const [isLive, setIsLive] = useState(false);
  // TODO: Get actual user role from auth context
  const userRole: PlatformRole = 'broadcaster';

  const platformConfig = {
    id: 'platform-solbones',
    name: 'Solbones Podcast',
    slug: 'solbones',
    primaryColor: '#6B46C1',
    secondaryColor: '#FFFFFF',
    domain: 'solbones.manus.space',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900 to-purple-800 border-b border-purple-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Solbones Podcast</h1>
              <p className="text-purple-200">
                Sacred Math Dice Game & Podcast Network with Healing Frequencies
              </p>
            </div>
            {isLive && (
              <div className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full">
                <span className="w-3 h-3 bg-white rounded-full animate-pulse"></span>
                <span className="text-white font-semibold">LIVE</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-slate-800 border-b border-slate-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('broadcast')}
              className={`py-4 px-2 font-semibold border-b-2 transition-colors ${
                activeTab === 'broadcast'
                  ? 'text-purple-400 border-purple-400'
                  : 'text-gray-400 border-transparent hover:text-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Podcast className="w-4 h-4" />
                <span>Broadcast</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('episodes')}
              className={`py-4 px-2 font-semibold border-b-2 transition-colors ${
                activeTab === 'episodes'
                  ? 'text-purple-400 border-purple-400'
                  : 'text-gray-400 border-transparent hover:text-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Headphones className="w-4 h-4" />
                <span>Episodes</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-4 px-2 font-semibold border-b-2 transition-colors ${
                activeTab === 'settings'
                  ? 'text-purple-400 border-purple-400'
                  : 'text-gray-400 border-transparent hover:text-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {activeTab === 'broadcast' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Go Live Section */}
            <div className="lg:col-span-1">
            <OneClickGoLive
              platformId={platformConfig.id}
              platformName={platformConfig.name}
              primaryColor={platformConfig.primaryColor}
              userRole={userRole}
              onGoLive={() => setIsLive(true)}
              onStop={() => setIsLive(false)}
            />
            </div>

            {/* Broadcast Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Recent Episodes */}
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">Recent Episodes</h2>
                <div className="space-y-4">
                  {[
                    {
                      title: 'Sacred Math Episode 47',
                      date: 'Feb 21, 2026',
                      listeners: 2847,
                      duration: '1h 23m',
                      frequency: '528Hz',
                    },
                    {
                      title: 'Healing Frequencies Deep Dive',
                      date: 'Feb 19, 2026',
                      listeners: 3124,
                      duration: '1h 45m',
                      frequency: '432Hz',
                    },
                    {
                      title: 'Solbones Dice Game Tutorial',
                      date: 'Feb 17, 2026',
                      listeners: 1956,
                      duration: '52m',
                      frequency: '639Hz',
                    },
                  ].map((episode, idx) => (
                    <div
                      key={idx}
                      className="flex items-start justify-between p-4 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="text-white font-semibold">{episode.title}</p>
                        <p className="text-gray-400 text-sm mt-1">
                          {episode.date} • {episode.frequency}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-semibold">{episode.listeners}</p>
                        <p className="text-gray-400 text-sm">listeners</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Healing Frequencies */}
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">Healing Frequencies</h2>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { freq: '174 Hz', benefit: 'Pain Relief' },
                    { freq: '285 Hz', benefit: 'Tissue Healing' },
                    { freq: '396 Hz', benefit: 'Liberation' },
                    { freq: '417 Hz', benefit: 'Change' },
                    { freq: '528 Hz', benefit: 'Love & DNA' },
                    { freq: '639 Hz', benefit: 'Connection' },
                    { freq: '741 Hz', benefit: 'Intuition' },
                    { freq: '852 Hz', benefit: 'Awakening' },
                  ].map((item, idx) => (
                    <button
                      key={idx}
                      className="p-3 bg-slate-700 hover:bg-purple-600 rounded-lg transition-colors text-left"
                    >
                      <p className="text-white font-semibold">{item.freq}</p>
                      <p className="text-gray-400 text-xs">{item.benefit}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'episodes' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Episode Library</h2>
              <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors">
                + New Episode
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  title: 'Sacred Math Episode 47',
                  description: 'Exploring the divine geometry of the universe',
                  listeners: 2847,
                  date: 'Feb 21, 2026',
                },
                {
                  title: 'Healing Frequencies Deep Dive',
                  description: 'Understanding Solfeggio frequencies and their benefits',
                  listeners: 3124,
                  date: 'Feb 19, 2026',
                },
                {
                  title: 'Solbones Dice Game Tutorial',
                  description: 'Learn how to play the sacred math dice game',
                  listeners: 1956,
                  date: 'Feb 17, 2026',
                },
              ].map((episode, idx) => (
                <div
                  key={idx}
                  className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-purple-500 transition-all"
                >
                  <h3 className="text-lg font-bold text-white mb-2">{episode.title}</h3>
                  <p className="text-gray-400 text-sm mb-4">{episode.description}</p>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">{episode.date}</span>
                    <span className="text-purple-400 font-semibold">{episode.listeners} listeners</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Platform Settings</h2>

            <div className="space-y-6">
              {/* Podcast Configuration */}
              <div className="border-b border-slate-700 pb-6">
                <h3 className="text-lg font-semibold text-white mb-4">Podcast Configuration</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Podcast Title
                    </label>
                    <input
                      type="text"
                      defaultValue="Solbones Podcast"
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      RSS Feed URL
                    </label>
                    <input
                      type="text"
                      placeholder="https://solbones.manus.space/rss"
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>
              </div>

              {/* Default Frequency */}
              <div className="border-b border-slate-700 pb-6">
                <h3 className="text-lg font-semibold text-white mb-4">Default Healing Frequency</h3>
                <select className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500">
                  <option>432Hz - Universal Frequency</option>
                  <option>528Hz - Love & DNA Repair</option>
                  <option>639Hz - Connection & Relationships</option>
                  <option>741Hz - Intuition & Insight</option>
                </select>
              </div>

              {/* Features */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Enabled Features</h3>
                <div className="space-y-3">
                  {[
                    { name: 'Live Streaming', enabled: true },
                    { name: 'Frequency Selection', enabled: true },
                    { name: 'RSS Distribution', enabled: true },
                    { name: 'Listener Analytics', enabled: true },
                    { name: 'Auto-Transcription', enabled: true },
                  ].map((feature, idx) => (
                    <label key={idx} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked={feature.enabled}
                        className="w-4 h-4 rounded"
                      />
                      <span className="text-gray-300">{feature.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-6 border-t border-slate-700">
                <button className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors">
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SolbonesBroadcast;
