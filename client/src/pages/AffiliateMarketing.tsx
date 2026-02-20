import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  TrendingUp,
  Link as LinkIcon,
  DollarSign,
  Users,
  BarChart3,
  Copy,
  Share2,
  Download,
  Eye,
  MousePointer,
  CheckCircle,
  AlertCircle,
  Zap,
  Award,
  Calendar,
  TrendingDown,
} from 'lucide-react';

interface AffiliateStats {
  affiliateId: string;
  name: string;
  status: 'active' | 'pending' | 'suspended';
  joinDate: string;
  totalReferrals: number;
  conversions: number;
  conversionRate: number;
  totalEarnings: number;
  pendingEarnings: number;
  lastPayoutDate: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
}

interface AffiliateCommission {
  source: 'subscriptions' | 'merchandise' | 'sponsorships';
  rate: number;
  description: string;
}

const AFFILIATE_STATS: AffiliateStats[] = [
  {
    affiliateId: 'aff_001',
    name: 'Music Influencer Pro',
    status: 'active',
    joinDate: '2025-06-15',
    totalReferrals: 2450,
    conversions: 612,
    conversionRate: 25,
    totalEarnings: 15300,
    pendingEarnings: 2840,
    lastPayoutDate: '2026-02-01',
    tier: 'platinum',
  },
  {
    affiliateId: 'aff_002',
    name: 'Content Creator Hub',
    status: 'active',
    joinDate: '2025-09-20',
    totalReferrals: 1820,
    conversions: 364,
    conversionRate: 20,
    totalEarnings: 9100,
    pendingEarnings: 1820,
    lastPayoutDate: '2026-02-01',
    tier: 'gold',
  },
  {
    affiliateId: 'aff_003',
    name: 'Wellness Community',
    status: 'active',
    joinDate: '2025-11-10',
    totalReferrals: 890,
    conversions: 178,
    conversionRate: 20,
    totalEarnings: 4450,
    pendingEarnings: 890,
    lastPayoutDate: '2026-02-01',
    tier: 'silver',
  },
  {
    affiliateId: 'aff_004',
    name: 'Gaming Network',
    status: 'active',
    joinDate: '2026-01-05',
    totalReferrals: 340,
    conversions: 51,
    conversionRate: 15,
    totalEarnings: 1275,
    pendingEarnings: 510,
    lastPayoutDate: null,
    tier: 'bronze',
  },
];

const COMMISSION_RATES: AffiliateCommission[] = [
  {
    source: 'subscriptions',
    rate: 30,
    description: '30% commission on new subscriptions (first 12 months)',
  },
  {
    source: 'merchandise',
    rate: 15,
    description: '15% commission on merchandise sales',
  },
  {
    source: 'sponsorships',
    rate: 20,
    description: '20% commission on sponsored content referrals',
  },
];

const TIER_BENEFITS = {
  bronze: {
    name: 'Bronze',
    minReferrals: 0,
    commissionBonus: 0,
    features: ['Affiliate dashboard', 'Marketing materials', 'Monthly payouts'],
  },
  silver: {
    name: 'Silver',
    minReferrals: 500,
    commissionBonus: 5,
    features: ['All Bronze features', '+5% commission bonus', 'Dedicated support', 'Advanced analytics'],
  },
  gold: {
    name: 'Gold',
    minReferrals: 1000,
    commissionBonus: 10,
    features: ['All Silver features', '+10% commission bonus', 'Priority support', 'Co-marketing opportunities'],
  },
  platinum: {
    name: 'Platinum',
    minReferrals: 2000,
    commissionBonus: 15,
    features: ['All Gold features', '+15% commission bonus', 'VIP support', 'Custom partnership deals'],
  },
};

export function AffiliateMarketing() {
  const [activeTab, setActiveTab] = useState<'overview' | 'affiliates' | 'commissions' | 'resources'>('overview');
  const [selectedAffiliate, setSelectedAffiliate] = useState<AffiliateStats | null>(null);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  const totalReferrals = AFFILIATE_STATS.reduce((sum, a) => sum + a.totalReferrals, 0);
  const totalConversions = AFFILIATE_STATS.reduce((sum, a) => sum + a.conversions, 0);
  const totalEarnings = AFFILIATE_STATS.reduce((sum, a) => sum + a.totalEarnings, 0);
  const totalPending = AFFILIATE_STATS.reduce((sum, a) => sum + a.pendingEarnings, 0);
  const averageConversionRate = (totalConversions / totalReferrals) * 100;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(id);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black">
      {/* Header */}
      <div className="bg-black bg-opacity-50 border-b border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-8 h-8 text-green-500" /> Affiliate Marketing Program
            </h1>
            <Button className="gap-2 bg-green-600 hover:bg-green-700">
              <Users className="w-4 h-4" /> Invite Affiliates
            </Button>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'affiliates', label: 'Affiliates' },
              { id: 'commissions', label: 'Commission Structure' },
              { id: 'resources', label: 'Resources' },
            ].map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab(tab.id as any)}
              >
                {tab.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-gray-800 border-gray-700 p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Referrals</p>
                    <p className="text-3xl font-bold text-blue-400 mt-2">{totalReferrals.toLocaleString()}</p>
                    <p className="text-blue-300 text-xs mt-2">↑ 12% this month</p>
                  </div>
                  <LinkIcon className="w-8 h-8 text-blue-500" />
                </div>
              </Card>

              <Card className="bg-gray-800 border-gray-700 p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Conversions</p>
                    <p className="text-3xl font-bold text-green-400 mt-2">{totalConversions.toLocaleString()}</p>
                    <p className="text-green-300 text-xs mt-2">{averageConversionRate.toFixed(1)}% conversion rate</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
              </Card>

              <Card className="bg-gray-800 border-gray-700 p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Paid Out</p>
                    <p className="text-3xl font-bold text-purple-400 mt-2">${totalEarnings.toLocaleString()}</p>
                    <p className="text-purple-300 text-xs mt-2">All time earnings</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-purple-500" />
                </div>
              </Card>

              <Card className="bg-gray-800 border-gray-700 p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Pending Payouts</p>
                    <p className="text-3xl font-bold text-orange-400 mt-2">${totalPending.toLocaleString()}</p>
                    <p className="text-orange-300 text-xs mt-2">Next payout: Mar 1</p>
                  </div>
                  <AlertCircle className="w-8 h-8 text-orange-500" />
                </div>
              </Card>
            </div>

            {/* Top Performers */}
            <Card className="bg-gray-800 border-gray-700 p-6">
              <h3 className="text-lg font-bold text-white mb-4">Top Performing Affiliates</h3>
              <div className="space-y-3">
                {AFFILIATE_STATS.sort((a, b) => b.totalEarnings - a.totalEarnings)
                  .slice(0, 3)
                  .map((affiliate, index) => (
                    <div key={affiliate.affiliateId} className="p-4 bg-gray-700 rounded-lg border border-gray-600">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center font-bold text-gray-900">
                            {index + 1}
                          </div>
                          <div>
                            <p className="text-white font-semibold">{affiliate.name}</p>
                            <p className="text-gray-400 text-sm">{affiliate.totalReferrals} referrals</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-green-400 font-bold">${affiliate.totalEarnings.toLocaleString()}</p>
                          <span className="text-xs px-2 py-1 bg-yellow-900 text-yellow-200 rounded">
                            {affiliate.tier.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </Card>

            {/* Conversion Trends */}
            <Card className="bg-gray-800 border-gray-700 p-6">
              <h3 className="text-lg font-bold text-white mb-4">Conversion Trends</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-gradient-to-r from-green-900 to-green-800 rounded-lg border border-green-700">
                  <p className="text-green-300 text-sm">📈 Best Performing Source</p>
                  <p className="text-white font-bold text-2xl mt-2">Subscriptions</p>
                  <p className="text-green-200 text-xs mt-2">68% of total conversions</p>
                </div>
                <div className="p-4 bg-gradient-to-r from-blue-900 to-blue-800 rounded-lg border border-blue-700">
                  <p className="text-blue-300 text-sm">🎯 Avg Conversion Value</p>
                  <p className="text-white font-bold text-2xl mt-2">$25.00</p>
                  <p className="text-blue-200 text-xs mt-2">Per successful referral</p>
                </div>
                <div className="p-4 bg-gradient-to-r from-purple-900 to-purple-800 rounded-lg border border-purple-700">
                  <p className="text-purple-300 text-sm">⏱️ Avg Time to Convert</p>
                  <p className="text-white font-bold text-2xl mt-2">3.2 days</p>
                  <p className="text-purple-200 text-xs mt-2">From click to purchase</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Affiliates Tab */}
        {activeTab === 'affiliates' && (
          <div className="space-y-6">
            <div className="space-y-3">
              {AFFILIATE_STATS.map((affiliate) => (
                <Card
                  key={affiliate.affiliateId}
                  className="bg-gray-800 border-gray-700 p-4 hover:bg-gray-750 transition cursor-pointer"
                  onClick={() => setSelectedAffiliate(affiliate)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-white">{affiliate.name}</h3>
                        <span
                          className={`text-xs px-2 py-1 rounded font-semibold ${
                            affiliate.status === 'active'
                              ? 'bg-green-900 text-green-200'
                              : affiliate.status === 'pending'
                              ? 'bg-yellow-900 text-yellow-200'
                              : 'bg-red-900 text-red-200'
                          }`}
                        >
                          {affiliate.status.toUpperCase()}
                        </span>
                        <span className="text-xs px-2 py-1 bg-blue-900 text-blue-200 rounded uppercase font-semibold">
                          {affiliate.tier}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                        <div>
                          <p className="text-gray-400">Referrals</p>
                          <p className="text-white font-semibold">{affiliate.totalReferrals}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Conversions</p>
                          <p className="text-white font-semibold">{affiliate.conversions}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Conv. Rate</p>
                          <p className="text-white font-semibold">{affiliate.conversionRate}%</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Total Earned</p>
                          <p className="text-green-400 font-semibold">${affiliate.totalEarnings.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Pending</p>
                          <p className="text-orange-400 font-semibold">${affiliate.pendingEarnings.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Commission Structure Tab */}
        {activeTab === 'commissions' && (
          <div className="space-y-6">
            <Card className="bg-gray-800 border-gray-700 p-6">
              <h2 className="text-xl font-bold text-white mb-4">Commission Rates</h2>
              <div className="space-y-3">
                {COMMISSION_RATES.map((commission) => (
                  <div key={commission.source} className="p-4 bg-gray-700 rounded-lg border border-gray-600">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-semibold capitalize">{commission.source.replace(/_/g, ' ')}</p>
                        <p className="text-gray-400 text-sm mt-1">{commission.description}</p>
                      </div>
                      <p className="text-3xl font-bold text-green-400">{commission.rate}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="bg-gray-800 border-gray-700 p-6">
              <h3 className="text-lg font-bold text-white mb-4">Tier Benefits & Bonuses</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(TIER_BENEFITS).map(([tier, benefits]) => (
                  <div key={tier} className="p-4 bg-gray-700 rounded-lg border border-gray-600">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-lg font-bold text-white capitalize">{benefits.name} Tier</h4>
                      {benefits.commissionBonus > 0 && (
                        <span className="text-green-400 font-bold">+{benefits.commissionBonus}% Bonus</span>
                      )}
                    </div>
                    <p className="text-gray-400 text-sm mb-3">
                      Minimum {benefits.minReferrals.toLocaleString()} referrals
                    </p>
                    <ul className="space-y-2">
                      {benefits.features.map((feature) => (
                        <li key={feature} className="text-gray-300 text-sm flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-400" /> {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Resources Tab */}
        {activeTab === 'resources' && (
          <div className="space-y-6">
            <Card className="bg-gray-800 border-gray-700 p-6">
              <h2 className="text-xl font-bold text-white mb-4">Marketing Materials</h2>
              <div className="space-y-3">
                {[
                  { name: 'Affiliate Link', value: 'https://rockinrockinboogie.com?aff=YOUR_ID' },
                  { name: 'Banner (300x250)', value: 'Download' },
                  { name: 'Banner (728x90)', value: 'Download' },
                  { name: 'Social Media Kit', value: 'Download' },
                ].map((resource) => (
                  <div key={resource.name} className="p-4 bg-gray-700 rounded-lg border border-gray-600">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-semibold">{resource.name}</p>
                        {resource.value.startsWith('http') && (
                          <p className="text-gray-400 text-sm mt-1 truncate">{resource.value}</p>
                        )}
                      </div>
                      {resource.value.startsWith('http') ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(resource.value, resource.name)}
                        >
                          {copiedLink === resource.name ? '✓ Copied' : <Copy className="w-4 h-4" />}
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" className="gap-2">
                          <Download className="w-4 h-4" /> {resource.value}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="bg-gray-800 border-gray-700 p-6">
              <h3 className="text-lg font-bold text-white mb-4">Documentation</h3>
              <div className="space-y-2">
                {['Affiliate Program Guide', 'Commission Policy', 'Terms & Conditions', 'FAQ'].map((doc) => (
                  <Button key={doc} variant="outline" className="w-full justify-start gap-2">
                    <Download className="w-4 h-4" /> {doc}
                  </Button>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
