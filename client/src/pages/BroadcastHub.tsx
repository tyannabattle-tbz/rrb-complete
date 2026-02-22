/**
 * Broadcast Hub
 * Unified discovery center for all broadcast platforms
 * Shows SQUADD, Solbones, and available custom platforms
 */

import React, { useState, useEffect } from 'react';
import { Radio, Users, Zap, ArrowRight, Star, TrendingUp } from 'lucide-react';
import { Link } from 'wouter';

interface BroadcastPlatform {
  id: string;
  name: string;
  slug: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  domain?: string;
  isLive: boolean;
  viewerCount: number;
  featured?: boolean;
}

export const BroadcastHub: React.FC = () => {
  const [platforms, setPlatforms] = useState<BroadcastPlatform[]>([
    {
      id: 'platform-squadd',
      name: 'SQUADD',
      slug: 'squadd',
      description: 'Strategy, Community, and Unified Development Broadcasting Platform',
      primaryColor: '#FF0000',
      secondaryColor: '#000000',
      domain: 'squadd.manus.space',
      isLive: true,
      viewerCount: 1247,
      featured: true,
    },
    {
      id: 'platform-solbones',
      name: 'Solbones Podcast',
      slug: 'solbones',
      description: 'Sacred Math Dice Game & Podcast Network with Healing Frequencies',
      primaryColor: '#6B46C1',
      secondaryColor: '#FFFFFF',
      domain: 'solbones.manus.space',
      isLive: false,
      viewerCount: 0,
      featured: true,
    },
  ]);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', name: 'All Platforms', icon: Radio },
    { id: 'live', name: 'Now Live', icon: Zap },
    { id: 'featured', name: 'Featured', icon: Star },
    { id: 'trending', name: 'Trending', icon: TrendingUp },
  ];

  const filteredPlatforms = platforms.filter((platform) => {
    if (selectedCategory === 'live') return platform.isLive;
    if (selectedCategory === 'featured') return platform.featured;
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 border-b border-slate-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3 mb-4">
            <Radio className="w-8 h-8 text-blue-400" />
            <h1 className="text-4xl font-bold text-white">Broadcast Hub</h1>
          </div>
          <p className="text-gray-400 text-lg">
            Discover and join live broadcasts across all platforms
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Category Filter */}
        <div className="mb-12">
          <div className="flex gap-3 overflow-x-auto pb-4">
            {categories.map((category) => {
              const Icon = category.icon;
              const isActive = selectedCategory === category.id;

              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {category.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Platforms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredPlatforms.map((platform) => (
            <Link
              key={platform.id}
              href={`/${platform.slug}`}
              className="group cursor-pointer"
            >
              <div className="h-full bg-slate-800 border border-slate-700 rounded-xl overflow-hidden hover:border-slate-600 transition-all hover:shadow-2xl">
                {/* Platform Header */}
                <div
                  className="h-24 p-6 flex items-end justify-between relative overflow-hidden"
                  style={{
                    backgroundColor: platform.primaryColor,
                  }}
                >
                  <div>
                    <h3 className="text-2xl font-bold text-white">{platform.name}</h3>
                  </div>

                  {/* Live Badge */}
                  {platform.isLive && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full">
                      <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                      <span className="text-white text-xs font-semibold">LIVE</span>
                    </div>
                  )}

                  {/* Featured Badge */}
                  {platform.featured && (
                    <div className="absolute top-3 right-3">
                      <Star className="w-5 h-5 text-yellow-300 fill-yellow-300" />
                    </div>
                  )}
                </div>

                {/* Platform Content */}
                <div className="p-6">
                  <p className="text-gray-300 text-sm mb-4">{platform.description}</p>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-slate-700 rounded-lg p-3">
                      <p className="text-gray-400 text-xs mb-1">Viewers</p>
                      <p className="text-white font-bold text-lg">
                        {platform.isLive ? platform.viewerCount : '-'}
                      </p>
                    </div>
                    <div className="bg-slate-700 rounded-lg p-3">
                      <p className="text-gray-400 text-xs mb-1">Status</p>
                      <p className="text-white font-bold text-lg">
                        {platform.isLive ? '🔴 Live' : '⚪ Offline'}
                      </p>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <button className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 group-hover:gap-3">
                    {platform.isLive ? 'Watch Now' : 'Visit Platform'}
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Create New Platform Section */}
        <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 border border-blue-700 rounded-xl p-8">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Want to Create Your Own Broadcast Platform?
              </h2>
              <p className="text-gray-300 mb-4">
                Use our customizable broadcast template to launch your own independent streaming
                platform with all the features you need.
              </p>
              <ul className="text-gray-300 text-sm space-y-2 mb-6">
                <li>✓ Custom branding and colors</li>
                <li>✓ Independent user management</li>
                <li>✓ One-click go-live functionality</li>
                <li>✓ Real-time analytics and engagement tools</li>
                <li>✓ Multi-platform streaming distribution</li>
              </ul>
            </div>
          </div>

          <Link href="/broadcast-template">
            <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Create Platform from Template
            </button>
          </Link>
        </div>

        {/* Featured Broadcasts */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-white mb-6">Featured Broadcasts</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* SQUADD Featured */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden hover:border-red-500 transition-all">
              <div className="h-32 bg-gradient-to-r from-red-600 to-red-700 p-4 flex items-end justify-between">
                <div>
                  <p className="text-gray-200 text-sm">SQUADD Strategy Session</p>
                  <h3 className="text-xl font-bold text-white">UN WCS Parallel Event</h3>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full">
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                  <span className="text-white text-xs font-semibold">LIVE</span>
                </div>
              </div>
              <div className="p-4">
                <p className="text-gray-400 text-sm mb-4">
                  Join SQUADD for their strategy session on the UN World Conference Series
                </p>
                <button className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors">
                  Watch Now
                </button>
              </div>
            </div>

            {/* Solbones Featured */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden hover:border-purple-500 transition-all">
              <div className="h-32 bg-gradient-to-r from-purple-600 to-purple-700 p-4 flex items-end justify-between">
                <div>
                  <p className="text-gray-200 text-sm">Solbones Podcast</p>
                  <h3 className="text-xl font-bold text-white">Sacred Math Episode 47</h3>
                </div>
                <div className="px-3 py-1 bg-white/20 rounded-full">
                  <span className="text-white text-xs font-semibold">Upcoming</span>
                </div>
              </div>
              <div className="p-4">
                <p className="text-gray-400 text-sm mb-4">
                  Explore sacred mathematics and healing frequencies with the Solbones community
                </p>
                <button className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors">
                  Set Reminder
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
