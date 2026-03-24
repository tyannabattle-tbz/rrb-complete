'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Trophy, Award, Zap, Heart, Share2, Target } from 'lucide-react';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedDate?: number;
  progress?: number;
}

interface LeaderboardEntry {
  rank: number;
  username: string;
  points: number;
  level: number;
  streakDays: number;
  badges: number;
}

interface UserProfile {
  username: string;
  level: number;
  totalPoints: number;
  currentStreak: number;
  listeningHours: number;
  badges: Badge[];
  rank: number;
}

const mockBadges: Badge[] = [
  {
    id: '1',
    name: 'First Listen',
    description: 'Listen to your first episode',
    icon: '🎧',
    earned: true,
    earnedDate: Date.now() - 86400000 * 30,
  },
  {
    id: '2',
    name: 'Healing Devotee',
    description: 'Listen to 10 hours of healing frequencies',
    icon: '✨',
    earned: true,
    earnedDate: Date.now() - 86400000 * 15,
  },
  {
    id: '3',
    name: 'Night Owl',
    description: 'Listen after midnight 5 times',
    icon: '🌙',
    earned: true,
    earnedDate: Date.now() - 86400000 * 7,
  },
  {
    id: '4',
    name: 'Podcast Binger',
    description: 'Listen to 50 podcast episodes',
    icon: '🎙️',
    earned: false,
    progress: 34,
  },
  {
    id: '5',
    name: 'Music Explorer',
    description: 'Listen to 100 different songs',
    icon: '🎵',
    earned: false,
    progress: 67,
  },
  {
    id: '6',
    name: '7-Day Streak',
    description: 'Listen for 7 consecutive days',
    icon: '🔥',
    earned: false,
    progress: 5,
  },
  {
    id: '7',
    name: 'Social Butterfly',
    description: 'Share content 10 times',
    icon: '🦋',
    earned: false,
    progress: 3,
  },
  {
    id: '8',
    name: 'Superfan',
    description: 'Reach level 10',
    icon: '⭐',
    earned: false,
    progress: 6,
  },
];

const mockLeaderboard: LeaderboardEntry[] = [
  { rank: 1, username: 'AudioMaster', points: 45230, level: 12, streakDays: 89, badges: 8 },
  { rank: 2, username: 'MeditationGuru', points: 38900, level: 11, streakDays: 67, badges: 7 },
  { rank: 3, username: 'PodcastAddict', points: 35670, level: 10, streakDays: 45, badges: 6 },
  { rank: 4, username: 'HealingSeeker', points: 32100, level: 9, streakDays: 34, badges: 5 },
  { rank: 5, username: 'MusicLover', points: 28450, level: 8, streakDays: 23, badges: 4 },
  { rank: 6, username: 'NightListener', points: 25800, level: 7, streakDays: 19, badges: 3 },
  { rank: 7, username: 'RadioFan', points: 22300, level: 6, streakDays: 15, badges: 2 },
  { rank: 8, username: 'SoundSeeker', points: 19600, level: 5, streakDays: 12, badges: 1 },
];

const mockUserProfile: UserProfile = {
  username: 'You',
  level: 8,
  totalPoints: 28450,
  currentStreak: 23,
  listeningHours: 156,
  badges: mockBadges,
  rank: 5,
};

export default function ListenerEngagementGamification() {
  const [activeTab, setActiveTab] = useState<'badges' | 'leaderboard' | 'rewards'>('badges');
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

  const earnedBadges = mockUserProfile.badges.filter(b => b.earned);
  const progressBadges = mockUserProfile.badges.filter(b => !b.earned);

  const nextLevelPoints = mockUserProfile.level * 5000;
  const currentLevelProgress = (mockUserProfile.totalPoints % nextLevelPoints) / nextLevelPoints * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Listener Engagement Gamification</h1>
          <p className="text-slate-400">Earn badges, climb leaderboards, and unlock rewards</p>
        </div>

        {/* User Profile Card */}
        <Card className="bg-gradient-to-r from-purple-900 to-blue-900 border-purple-700 mb-8">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              <div>
                <p className="text-purple-200 text-sm mb-1">Level</p>
                <p className="text-4xl font-bold text-white">{mockUserProfile.level}</p>
              </div>
              <div>
                <p className="text-purple-200 text-sm mb-1">Total Points</p>
                <p className="text-2xl font-bold text-white">{mockUserProfile.totalPoints.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-purple-200 text-sm mb-1">Current Streak</p>
                <p className="text-2xl font-bold text-orange-300 flex items-center gap-1">
                  <Zap className="w-5 h-5" />
                  {mockUserProfile.currentStreak}
                </p>
              </div>
              <div>
                <p className="text-purple-200 text-sm mb-1">Listening Hours</p>
                <p className="text-2xl font-bold text-white">{mockUserProfile.listeningHours}</p>
              </div>
              <div>
                <p className="text-purple-200 text-sm mb-1">Rank</p>
                <p className="text-2xl font-bold text-yellow-300 flex items-center gap-1">
                  <Trophy className="w-5 h-5" />
                  #{mockUserProfile.rank}
                </p>
              </div>
            </div>

            {/* Level Progress */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-purple-200 text-sm">Progress to Level {mockUserProfile.level + 1}</span>
                <span className="text-white text-sm font-semibold">
                  {Math.floor(currentLevelProgress)}%
                </span>
              </div>
              <Progress value={currentLevelProgress} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-slate-700">
          {['badges', 'leaderboard', 'rewards'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 font-semibold transition ${
                activeTab === tab
                  ? 'text-purple-400 border-b-2 border-purple-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Badges Tab */}
        {activeTab === 'badges' && (
          <div className="space-y-8">
            {/* Earned Badges */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <Award className="w-6 h-6 text-yellow-400" />
                Earned Badges ({earnedBadges.length})
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {earnedBadges.map(badge => (
                  <Card
                    key={badge.id}
                    className="bg-slate-800 border-slate-700 hover:border-yellow-500 transition cursor-pointer"
                    onClick={() => setSelectedBadge(badge)}
                  >
                    <CardContent className="pt-6 text-center">
                      <div className="text-5xl mb-2">{badge.icon}</div>
                      <p className="text-white font-semibold text-sm mb-1">{badge.name}</p>
                      <p className="text-slate-400 text-xs">
                        {badge.earnedDate
                          ? new Date(badge.earnedDate).toLocaleDateString()
                          : 'Recently earned'}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* In Progress Badges */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <Target className="w-6 h-6 text-blue-400" />
                In Progress ({progressBadges.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {progressBadges.map(badge => (
                  <Card key={badge.id} className="bg-slate-800 border-slate-700">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="text-4xl">{badge.icon}</div>
                        <div className="flex-1">
                          <p className="text-white font-semibold mb-1">{badge.name}</p>
                          <p className="text-slate-400 text-sm mb-3">{badge.description}</p>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-400">Progress</span>
                              <span className="text-white font-semibold">{badge.progress}%</span>
                            </div>
                            <Progress value={badge.progress || 0} className="h-2" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Leaderboard Tab */}
        {activeTab === 'leaderboard' && (
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Global Leaderboard</CardTitle>
              <CardDescription>Top listeners by points and engagement</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {mockLeaderboard.map(entry => (
                  <div
                    key={entry.rank}
                    className={`flex items-center gap-4 p-4 rounded-lg transition ${
                      entry.rank === mockUserProfile.rank
                        ? 'bg-purple-900/30 border border-purple-500'
                        : 'bg-slate-700 hover:bg-slate-600'
                    }`}
                  >
                    <div className="text-2xl font-bold text-white w-8 text-center">
                      {entry.rank === 1 && '🥇'}
                      {entry.rank === 2 && '🥈'}
                      {entry.rank === 3 && '🥉'}
                      {entry.rank > 3 && entry.rank}
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-semibold">{entry.username}</p>
                      <div className="flex gap-3 text-xs text-slate-400">
                        <span>Level {entry.level}</span>
                        <span>🔥 {entry.streakDays} day streak</span>
                        <span>🏆 {entry.badges} badges</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold text-lg">{entry.points.toLocaleString()}</p>
                      <p className="text-slate-400 text-xs">points</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Rewards Tab */}
        {activeTab === 'rewards' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: 'Ad-Free Listening',
                cost: 500,
                description: 'Remove ads for 1 month',
                icon: '🎧',
              },
              {
                name: 'Premium Content',
                cost: 1000,
                description: 'Access exclusive episodes',
                icon: '👑',
              },
              {
                name: 'Custom Playlist',
                cost: 250,
                description: 'Create unlimited playlists',
                icon: '🎵',
              },
              {
                name: 'Early Access',
                cost: 750,
                description: 'Get new content first',
                icon: '⚡',
              },
              {
                name: 'Exclusive Merch',
                cost: 1500,
                description: 'Limited edition merchandise',
                icon: '👕',
              },
              {
                name: 'VIP Badge',
                cost: 300,
                description: 'Show off your status',
                icon: '⭐',
              },
            ].map((reward, idx) => (
              <Card key={idx} className="bg-slate-800 border-slate-700 hover:border-purple-500 transition">
                <CardContent className="pt-6">
                  <div className="text-4xl mb-3">{reward.icon}</div>
                  <h3 className="text-white font-semibold mb-1">{reward.name}</h3>
                  <p className="text-slate-400 text-sm mb-4">{reward.description}</p>
                  <Button
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    disabled={mockUserProfile.totalPoints < reward.cost}
                  >
                    {reward.cost} Points
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
