/**
 * SQUADD Broadcast Platform
 * Independent broadcast system for SQUADD with one-click go-live
 */

import React, { useState } from 'react';
import { OneClickGoLive } from '../components/OneClickGoLive';
import { SquaddStrategySession } from '../components/SquaddStrategySession';
import { Users, BarChart3, Settings, Share2 } from 'lucide-react';
import type { PlatformRole } from '../components/RoleBasedAccess';

export const SquaddBroadcast: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'broadcast' | 'analytics' | 'settings'>(
    'broadcast'
  );
  const [isLive, setIsLive] = useState(false);
  // TODO: Get actual user role from auth context
  const userRole: PlatformRole = 'broadcaster';

  const platformConfig = {
    id: 'platform-squadd',
    name: 'SQUADD',
    slug: 'squadd',
    primaryColor: '#FF0000',
    secondaryColor: '#000000',
    domain: 'squadd.manus.space',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-900 to-red-800 border-b border-red-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">SQUADD Broadcast</h1>
              <p className="text-red-200">
                Strategy, Community, and Unified Development Broadcasting Platform
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
                  ? 'text-red-400 border-red-400'
                  : 'text-gray-400 border-transparent hover:text-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <span>🔴 Broadcast</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-4 px-2 font-semibold border-b-2 transition-colors ${
                activeTab === 'analytics'
                  ? 'text-red-400 border-red-400'
                  : 'text-gray-400 border-transparent hover:text-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                <span>Analytics</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-4 px-2 font-semibold border-b-2 transition-colors ${
                activeTab === 'settings'
                  ? 'text-red-400 border-red-400'
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
              {/* SQUADD Strategy Session - Panelist Only */}
              <SquaddStrategySession />
              {/* Recent Broadcasts */}
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">Recent Broadcasts</h2>
                <div className="space-y-4">
                  {[
                    {
                      title: 'UN WCS Strategy Session',
                      date: 'Feb 21, 2026',
                      viewers: 1247,
                      duration: '2h 15m',
                    },
                    {
                      title: 'SQUADD Community Q&A',
                      date: 'Feb 20, 2026',
                      viewers: 892,
                      duration: '1h 30m',
                    },
                    {
                      title: 'Strategy Planning Meeting',
                      date: 'Feb 19, 2026',
                      viewers: 654,
                      duration: '1h 45m',
                    },
                  ].map((broadcast, idx) => (
                    <div key={idx} className="flex items-start justify-between p-4 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors">
                      <div className="flex-1">
                        <p className="text-white font-semibold">{broadcast.title}</p>
                        <p className="text-gray-400 text-sm mt-1">{broadcast.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-semibold">{broadcast.viewers}</p>
                        <p className="text-gray-400 text-sm">viewers</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-4">
                <button className="p-4 bg-slate-800 border border-slate-700 rounded-xl hover:border-red-500 transition-colors text-left">
                  <Users className="w-6 h-6 text-red-400 mb-2" />
                  <p className="text-white font-semibold">Manage Panelists</p>
                  <p className="text-gray-400 text-sm">Add or remove speakers</p>
                </button>
                <button className="p-4 bg-slate-800 border border-slate-700 rounded-xl hover:border-red-500 transition-colors text-left">
                  <Share2 className="w-6 h-6 text-red-400 mb-2" />
                  <p className="text-white font-semibold">Share Broadcast</p>
                  <p className="text-gray-400 text-sm">Get share links</p>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Broadcast Analytics</h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Total Broadcasts', value: '12', change: '+2 this month' },
                { label: 'Total Viewers', value: '8,547', change: '+1,234 this month' },
                { label: 'Avg Duration', value: '1h 42m', change: '+15m increase' },
                { label: 'Engagement Rate', value: '78%', change: '+5% improvement' },
              ].map((stat, idx) => (
                <div key={idx} className="bg-slate-700 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-2">{stat.label}</p>
                  <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
                  <p className="text-green-400 text-xs">{stat.change}</p>
                </div>
              ))}
            </div>

            <div className="bg-slate-700 rounded-lg p-6 h-64 flex items-center justify-center">
              <p className="text-gray-400">Analytics chart will display here</p>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Platform Settings</h2>

            <div className="space-y-6">
              {/* OBS Configuration */}
              <div className="border-b border-slate-700 pb-6">
                <h3 className="text-lg font-semibold text-white mb-4">OBS Configuration</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      RTMP Stream URL
                    </label>
                    <input
                      type="text"
                      placeholder="rtmp://streaming.example.com/live"
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Stream Key
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••••••••••"
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>
              </div>

              {/* Features */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Enabled Features</h3>
                <div className="space-y-3">
                  {[
                    { name: 'Live Chat', enabled: true },
                    { name: 'Q&A System', enabled: true },
                    { name: 'Live Polls', enabled: true },
                    { name: 'Donations', enabled: true },
                    { name: 'Auto-Recording', enabled: true },
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
                <button className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors">
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

export default SquaddBroadcast;
