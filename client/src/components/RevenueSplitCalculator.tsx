import React, { useState, useMemo } from 'react';
import { DollarSign, Users, TrendingUp, Download, Calculator } from 'lucide-react';

interface BandMember {
  id: string;
  name: string;
  role: string;
  contributionPercentage: number;
  tierMultiplier: number;
}

interface RevenueData {
  totalRevenue: number;
  platformBreakdown: {
    youtube: number;
    twitch: number;
    facebook: number;
    donations: number;
  };
  bandMembers: BandMember[];
}

export const RevenueSplitCalculator: React.FC = () => {
  const [revenueData, setRevenueData] = useState<RevenueData>({
    totalRevenue: 2847.50,
    platformBreakdown: {
      youtube: 1425.00,
      twitch: 950.00,
      facebook: 342.50,
      donations: 130.00,
    },
    bandMembers: [
      {
        id: 'chris',
        name: 'Chris Battle Sr.',
        role: 'Lead Vocals & Producer',
        contributionPercentage: 35,
        tierMultiplier: 1.5,
      },
      {
        id: 'cj',
        name: 'C.J. Battle',
        role: 'Backing Vocals & Harmony',
        contributionPercentage: 25,
        tierMultiplier: 1.2,
      },
      {
        id: 'kairen',
        name: 'Kairen Battle',
        role: 'Drums & Percussion',
        contributionPercentage: 20,
        tierMultiplier: 1.1,
      },
      {
        id: 'ap',
        name: 'AP/Amandes Studio',
        role: 'Audio Engineering & Mix',
        contributionPercentage: 20,
        tierMultiplier: 1.3,
      },
    ],
  });

  const [showDetails, setShowDetails] = useState(false);

  // Calculate splits
  const calculations = useMemo(() => {
    const baseAmount = revenueData.totalRevenue * 0.85; // 85% to band, 15% platform fees
    const platformFees = revenueData.totalRevenue * 0.15;

    const memberSplits = revenueData.bandMembers.map(member => {
      const baseShare = baseAmount * (member.contributionPercentage / 100);
      const tierBonus = baseShare * (member.tierMultiplier - 1) * 0.2; // 20% of tier multiplier as bonus
      const totalShare = baseShare + tierBonus;
      
      return {
        ...member,
        baseShare,
        tierBonus,
        totalShare,
        percentage: (totalShare / revenueData.totalRevenue) * 100,
      };
    });

    const totalMemberPayouts = memberSplits.reduce((sum, m) => sum + m.totalShare, 0);

    return {
      baseAmount,
      platformFees,
      memberSplits,
      totalMemberPayouts,
    };
  }, [revenueData]);

  const handleRevenueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setRevenueData(prev => ({
      ...prev,
      totalRevenue: value,
    }));
  };

  const handlePlatformChange = (platform: keyof typeof revenueData.platformBreakdown, value: number) => {
    setRevenueData(prev => ({
      ...prev,
      platformBreakdown: {
        ...prev.platformBreakdown,
        [platform]: value,
      },
    }));
  };

  const handleContributionChange = (memberId: string, percentage: number) => {
    setRevenueData(prev => ({
      ...prev,
      bandMembers: prev.bandMembers.map(m =>
        m.id === memberId ? { ...m, contributionPercentage: percentage } : m
      ),
    }));
  };

  return (
    <div className="w-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6 rounded-lg space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-white flex items-center gap-2">
          <DollarSign className="w-8 h-8 text-green-400" />
          Revenue Split Calculator
        </h2>
        <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 transition">
          <Download className="w-4 h-4" />
          Export Report
        </button>
      </div>

      {/* Revenue Input Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
          <label className="text-slate-300 text-sm font-semibold mb-2 block">Total Revenue</label>
          <div className="flex items-center gap-2">
            <span className="text-2xl text-green-400">$</span>
            <input
              type="number"
              value={revenueData.totalRevenue}
              onChange={handleRevenueChange}
              className="flex-1 bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white text-lg font-semibold focus:outline-none focus:border-green-500"
              step="0.01"
            />
          </div>
          <div className="text-xs text-slate-400 mt-2">From this performance session</div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
          <label className="text-slate-300 text-sm font-semibold mb-2 block">Platform Fees</label>
          <div className="text-2xl font-bold text-red-400">${calculations.platformFees.toFixed(2)}</div>
          <div className="text-xs text-slate-400 mt-2">15% platform commission</div>
        </div>
      </div>

      {/* Platform Breakdown */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-cyan-400" />
          Platform Revenue Breakdown
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(revenueData.platformBreakdown).map(([platform, amount]) => (
            <div key={platform} className="bg-slate-700/50 rounded p-3">
              <label className="text-slate-300 text-xs font-semibold mb-1 block capitalize">{platform}</label>
              <div className="flex items-center gap-1">
                <span className="text-lg text-white font-bold">$</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => handlePlatformChange(platform as keyof typeof revenueData.platformBreakdown, parseFloat(e.target.value) || 0)}
                  className="flex-1 bg-slate-600 border border-slate-500 rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-cyan-500"
                  step="0.01"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Band Member Splits */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-purple-400" />
          Band Member Payouts
        </h3>

        <div className="space-y-3">
          {calculations.memberSplits.map((member, idx) => (
            <div key={member.id} className="bg-slate-700/50 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-white font-semibold">{member.name}</div>
                  <div className="text-slate-400 text-sm">{member.role}</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-400">${member.totalShare.toFixed(2)}</div>
                  <div className="text-xs text-slate-400">{member.percentage.toFixed(1)}% of total</div>
                </div>
              </div>

              {/* Contribution Slider */}
              <div className="mb-3">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-slate-300 text-xs font-semibold">Contribution</label>
                  <span className="text-white font-semibold text-sm">{member.contributionPercentage}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={member.contributionPercentage}
                  onChange={(e) => handleContributionChange(member.id, parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
              </div>

              {/* Breakdown */}
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="bg-slate-600/50 rounded p-2">
                  <div className="text-slate-400">Base Share</div>
                  <div className="text-green-300 font-semibold">${member.baseShare.toFixed(2)}</div>
                </div>
                <div className="bg-slate-600/50 rounded p-2">
                  <div className="text-slate-400">Tier Bonus</div>
                  <div className="text-cyan-300 font-semibold">${member.tierBonus.toFixed(2)}</div>
                </div>
                <div className="bg-slate-600/50 rounded p-2">
                  <div className="text-slate-400">Multiplier</div>
                  <div className="text-purple-300 font-semibold">{member.tierMultiplier.toFixed(1)}x</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-green-900/50 to-green-800/30 border border-green-500/50 rounded-lg p-4">
          <div className="text-green-300 text-sm font-semibold mb-1">Total Payouts</div>
          <div className="text-3xl font-bold text-green-400">${calculations.totalMemberPayouts.toFixed(2)}</div>
          <div className="text-xs text-green-200 mt-1">To all band members</div>
        </div>

        <div className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 border border-purple-500/50 rounded-lg p-4">
          <div className="text-purple-300 text-sm font-semibold mb-1">Average Payout</div>
          <div className="text-3xl font-bold text-purple-400">${(calculations.totalMemberPayouts / calculations.memberSplits.length).toFixed(2)}</div>
          <div className="text-xs text-purple-200 mt-1">Per band member</div>
        </div>

        <div className="bg-gradient-to-br from-cyan-900/50 to-cyan-800/30 border border-cyan-500/50 rounded-lg p-4">
          <div className="text-cyan-300 text-sm font-semibold mb-1">Platform Fees</div>
          <div className="text-3xl font-bold text-cyan-400">${calculations.platformFees.toFixed(2)}</div>
          <div className="text-xs text-cyan-200 mt-1">15% of total revenue</div>
        </div>
      </div>

      {/* Payment Schedule */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <Calculator className="w-5 h-5 text-yellow-400" />
          Payment Schedule
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-slate-300">
            <span>Payouts processed within:</span>
            <span className="text-white font-semibold">24-48 hours</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Payment method:</span>
            <span className="text-white font-semibold">Direct ACH Transfer</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Next payout date:</span>
            <span className="text-white font-semibold">Tomorrow at 2:00 PM</span>
          </div>
        </div>
      </div>
    </div>
  );
};
