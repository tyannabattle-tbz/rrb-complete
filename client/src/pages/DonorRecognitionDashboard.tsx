import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Share2, Download, Twitter, Linkedin, Facebook } from 'lucide-react';

export default function DonorRecognitionDashboard() {
  const [selectedBadge, setSelectedBadge] = useState<string | null>(null);

  const [badges] = useState([
    {
      id: 'badge_001',
      type: 'first_donation',
      title: '🎉 First Donor',
      description: 'Made your first donation to the community',
      earnedAt: new Date(Date.now() - 30 * 24 * 60 * 60000),
      shareableUrl: 'https://flowpay.app/badges/badge_001',
    },
    {
      id: 'badge_002',
      type: 'hundred_contributor',
      title: '💯 $100 Contributor',
      description: 'Contributed $100 or more',
      earnedAt: new Date(Date.now() - 20 * 24 * 60 * 60000),
      shareableUrl: 'https://flowpay.app/badges/badge_002',
    },
    {
      id: 'badge_003',
      type: 'thousand_contributor',
      title: '🏆 $1K Contributor',
      description: 'Contributed $1,000 or more',
      earnedAt: new Date(Date.now() - 10 * 24 * 60 * 60000),
      shareableUrl: 'https://flowpay.app/badges/badge_003',
    },
    {
      id: 'badge_004',
      type: 'top_10_leaderboard',
      title: '⭐ Top 10 Supporter',
      description: 'Ranked in the top 10 supporters',
      earnedAt: new Date(Date.now() - 5 * 24 * 60 * 60000),
      shareableUrl: 'https://flowpay.app/badges/badge_004',
    },
  ]);

  const [leaderboard] = useState([
    {
      rank: 1,
      userName: 'Alice Chen',
      totalContributed: 15000,
      badges: ['first_donation', 'hundred_contributor', 'thousand_contributor', 'top_1_leaderboard'],
      recognitionLevel: 'platinum',
    },
    {
      rank: 2,
      userName: 'Bob Martinez',
      totalContributed: 12500,
      badges: ['first_donation', 'hundred_contributor', 'thousand_contributor', 'top_5_leaderboard'],
      recognitionLevel: 'gold',
    },
    {
      rank: 3,
      userName: 'Carol Singh',
      totalContributed: 9800,
      badges: ['first_donation', 'hundred_contributor', 'thousand_contributor', 'top_10_leaderboard'],
      recognitionLevel: 'gold',
    },
    {
      rank: 4,
      userName: 'David Kim',
      totalContributed: 7200,
      badges: ['first_donation', 'hundred_contributor', 'top_10_leaderboard'],
      recognitionLevel: 'silver',
    },
    {
      rank: 5,
      userName: 'Emma Johnson',
      totalContributed: 5600,
      badges: ['first_donation', 'hundred_contributor'],
      recognitionLevel: 'silver',
    },
  ]);

  const [achievementCards] = useState([
    {
      id: 'card_001',
      badgeType: 'first_donation',
      title: '🎉 First Donor',
      description: 'Made your first donation to the community',
      shareText: "I just made my first donation! 🎉 Join me in supporting the community.",
      twitterUrl: 'https://twitter.com/intent/tweet?text=I%20just%20made%20my%20first%20donation%21%20%F0%9F%8E%89',
      linkedinUrl: 'https://www.linkedin.com/sharing/share-offsite/',
      facebookUrl: 'https://www.facebook.com/sharer/sharer.php',
    },
    {
      id: 'card_002',
      badgeType: 'thousand_contributor',
      title: '🏆 $1K Contributor',
      description: 'Contributed $1,000 or more',
      shareText: "I'm a $1K+ contributor! 🏆 Help us reach our goals.",
      twitterUrl: 'https://twitter.com/intent/tweet?text=I%27m%20a%20%241K%2B%20contributor%21%20%F0%9F%8F%86',
      linkedinUrl: 'https://www.linkedin.com/sharing/share-offsite/',
      facebookUrl: 'https://www.facebook.com/sharer/sharer.php',
    },
    {
      id: 'card_003',
      badgeType: 'top_1_leaderboard',
      title: '👑 #1 Supporter',
      description: 'The #1 supporter in the community',
      shareText: "I'm the #1 supporter! 👑 Thank you for this honor.",
      twitterUrl: 'https://twitter.com/intent/tweet?text=I%27m%20the%20%231%20supporter%21%20%F0%9F%91%91',
      linkedinUrl: 'https://www.linkedin.com/sharing/share-offsite/',
      facebookUrl: 'https://www.facebook.com/sharer/sharer.php',
    },
  ]);

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'platinum':
        return 'bg-purple-500/20 text-purple-300';
      case 'gold':
        return 'bg-yellow-500/20 text-yellow-300';
      case 'silver':
        return 'bg-gray-500/20 text-gray-300';
      case 'bronze':
        return 'bg-orange-500/20 text-orange-300';
      default:
        return 'bg-gray-500/20 text-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Donor Recognition Dashboard</h1>
        <p className="text-gray-400 mt-1 text-sm md:text-base">Milestone badges, achievement cards, and leaderboard</p>
      </div>

      {/* My Badges */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">My Badges</CardTitle>
          <CardDescription>Achievements unlocked through contributions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4">
            {badges.map((badge) => (
              <div
                key={badge.id}
                className="bg-slate-700/50 rounded-lg p-3 md:p-4 border border-slate-600 hover:border-purple-500 transition-colors cursor-pointer text-center"
                onClick={() => setSelectedBadge(badge.id)}
              >
                <div className="text-4xl mb-2">{badge.title.split(' ')[0]}</div>
                <h4 className="font-bold text-white">{badge.title}</h4>
                <p className="text-xs text-gray-400 mt-2">{badge.description}</p>
                <p className="text-xs text-gray-500 mt-2">
                  Earned: {badge.earnedAt.toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Achievement Cards */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Shareable Achievement Cards</CardTitle>
          <CardDescription>Share your accomplishments on social media</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {achievementCards.map((card) => (
              <div key={card.id} className="bg-slate-700/50 rounded-lg p-4 border-l-4 border-purple-500">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-bold text-white">{card.title}</h4>
                    <p className="text-sm text-gray-400 mt-1">{card.description}</p>
                  </div>
                  <Button variant="outline" size="sm" className="text-white border-slate-600">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>

                <p className="text-sm text-gray-300 mb-3 italic">"{card.shareText}"</p>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                    onClick={() => window.open(card.twitterUrl, '_blank')}
                  >
                    <Twitter className="w-4 h-4 mr-1" />
                    Twitter
                  </Button>
                  <Button
                    size="sm"
                    className="bg-blue-700 hover:bg-blue-800 text-white"
                    onClick={() => window.open(card.linkedinUrl, '_blank')}
                  >
                    <Linkedin className="w-4 h-4 mr-1" />
                    LinkedIn
                  </Button>
                  <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => window.open(card.facebookUrl, '_blank')}
                  >
                    <Facebook className="w-4 h-4 mr-1" />
                    Facebook
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Leaderboard */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Community Leaderboard</CardTitle>
          <CardDescription>Top supporters with recognition badges</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {leaderboard.map((entry) => (
              <div
                key={entry.rank}
                className="flex items-center justify-between bg-slate-700/50 rounded-lg p-4 hover:bg-slate-700 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="text-2xl font-bold text-purple-400">#{entry.rank}</div>
                  <div>
                    <p className="font-bold text-white">{entry.userName}</p>
                    <p className="text-xs text-gray-400">
                      ${entry.totalContributed.toLocaleString()} contributed
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    {entry.badges.map((badge, idx) => (
                      <div key={idx} className="text-lg" title={badge}>
                        {badge === 'first_donation' && '🎉'}
                        {badge === 'hundred_contributor' && '💯'}
                        {badge === 'thousand_contributor' && '🏆'}
                        {badge === 'top_10_leaderboard' && '⭐'}
                        {badge === 'top_5_leaderboard' && '🌟'}
                        {badge === 'top_1_leaderboard' && '👑'}
                      </div>
                    ))}
                  </div>
                  <Badge className={getBadgeColor(entry.recognitionLevel)}>
                    {entry.recognitionLevel.toUpperCase()}
                  </Badge>
                  <Button variant="outline" size="sm" className="text-white border-slate-600">
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recognition Levels */}
      <Card className="bg-gradient-to-r from-purple-900 to-indigo-900 border-purple-700">
        <CardHeader>
          <CardTitle className="text-white">Recognition Levels</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-4xl mb-2">🥉</p>
              <p className="font-bold text-white">Bronze</p>
              <p className="text-sm text-gray-300">First donation</p>
            </div>
            <div className="text-center">
              <p className="text-4xl mb-2">🥈</p>
              <p className="font-bold text-white">Silver</p>
              <p className="text-sm text-gray-300">$100+ contributor</p>
            </div>
            <div className="text-center">
              <p className="text-4xl mb-2">🥇</p>
              <p className="font-bold text-white">Gold</p>
              <p className="text-sm text-gray-300">$1K+ contributor</p>
            </div>
            <div className="text-center">
              <p className="text-4xl mb-2">👑</p>
              <p className="font-bold text-white">Platinum</p>
              <p className="text-sm text-gray-300">Top 10 supporter</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
