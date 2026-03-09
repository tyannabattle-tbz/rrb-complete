import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, TrendingUp, Users, Clock } from 'lucide-react';

interface DonationStats {
  totalDonations: number;
  donationCount: number;
  averageDonation: number;
  broadcastHoursFunded: number;
  topDonor?: string;
  topDonorAmount?: number;
  period: string;
}

interface DonorTier {
  name: string;
  threshold: number;
  count: number;
  color: string;
}

export function RRBDonationDashboard() {
  // Mock data - in production, this would come from API
  const stats: DonationStats = {
    totalDonations: 0,
    donationCount: 156,
    averageDonation: 79.81,
    broadcastHoursFunded: 498,
    topDonor: 'Community Member',
    topDonorAmount: 500,
    period: 'February 2026',
  };

  const donorTiers: DonorTier[] = [
    { name: 'Platinum ($1000+)', threshold: 1000, count: 3, color: 'from-yellow-600 to-yellow-400' },
    { name: 'Gold ($500-$999)', threshold: 500, count: 8, color: 'from-yellow-500 to-yellow-300' },
    { name: 'Silver ($100-$499)', threshold: 100, count: 42, color: 'from-slate-400 to-slate-300' },
    { name: 'Bronze ($25-$99)', threshold: 25, count: 103, color: 'from-orange-700 to-orange-500' },
  ];

  const recentDonations = [
    { name: 'Anonymous', amount: 250, date: '2 hours ago', hours: 10 },
    { name: 'Community Member', amount: 100, date: '5 hours ago', hours: 4 },
    { name: 'Supporter', amount: 50, date: '1 day ago', hours: 2 },
    { name: 'Anonymous', amount: 75, date: '2 days ago', hours: 3 },
    { name: 'Friend of RRB', amount: 150, date: '3 days ago', hours: 6 },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-white flex items-center gap-2">
          <Heart size={32} className="text-red-400" />
          RRB Donation Analytics
        </h2>
        <p className="text-slate-400 mt-2">Tracking community support for Rockin' Rockin' Boogie</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Total Donations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">${(stats.totalDonations / 100).toFixed(0)}</div>
            <p className="text-xs text-slate-500 mt-1">{stats.period}</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
              <Users size={16} />
              Donors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-cyan-400">{stats.donationCount}</div>
            <p className="text-xs text-slate-500 mt-1">Community members</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Average Donation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-400">${stats.averageDonation.toFixed(2)}</div>
            <p className="text-xs text-slate-500 mt-1">Per donation</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
              <Clock size={16} />
              Broadcast Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-400">{Math.floor(stats.broadcastHoursFunded)}</div>
            <p className="text-xs text-slate-500 mt-1">Hours funded</p>
          </CardContent>
        </Card>
      </div>

      {/* Donor Tiers */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Donor Recognition Tiers</CardTitle>
          <CardDescription>Community members by donation level</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {donorTiers.map((tier) => (
              <div key={tier.name} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300 font-medium">{tier.name}</span>
                  <span className="text-cyan-400 font-bold">{tier.count} donors</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className={`bg-gradient-to-r ${tier.color} h-2 rounded-full`}
                    style={{ width: `${(tier.count / 103) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Impact Visualization */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Community Impact</CardTitle>
          <CardDescription>How donations support our mission</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-700/50 rounded-lg">
              <div className="text-2xl font-bold text-cyan-400">{Math.floor(stats.broadcastHoursFunded)}</div>
              <p className="text-slate-400 text-sm mt-1">Hours of broadcast time funded</p>
            </div>
            <div className="p-4 bg-slate-700/50 rounded-lg">
              <div className="text-2xl font-bold text-green-400">{Math.floor(stats.broadcastHoursFunded * 60)}</div>
              <p className="text-slate-400 text-sm mt-1">Minutes of community voice</p>
            </div>
            <div className="p-4 bg-slate-700/50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-400">{stats.donationCount}</div>
              <p className="text-slate-400 text-sm mt-1">Voices in our community</p>
            </div>
          </div>

          <div className="p-4 bg-red-900/20 border border-red-700/50 rounded-lg">
            <p className="text-red-200 text-sm">
              <strong>Mission Impact:</strong> Every dollar donated to RRB supports approximately 10 minutes of broadcast time, enabling our community to produce and share their own media, broadcast as they choose, and access information and communication - embodying our motto "A Voice for the Voiceless."
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Recent Donations */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Recent Donations</CardTitle>
          <CardDescription>Latest community support</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentDonations.map((donation, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Heart size={18} className="text-red-400" />
                  <div>
                    <p className="text-white font-medium">{donation.name}</p>
                    <p className="text-xs text-slate-400">{donation.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-cyan-400 font-bold">${donation.amount}</p>
                  <p className="text-xs text-slate-400">{donation.hours}h broadcast</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Call to Action */}
      <Card className="bg-gradient-to-r from-red-900/50 to-pink-900/50 border-red-700">
        <CardHeader>
          <CardTitle className="text-white">Support RRB's Mission</CardTitle>
          <CardDescription className="text-red-100">
            Help us continue providing community access to broadcast tools and media production
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-red-100 mb-4">
            Your donation directly supports hours of broadcast time for our community. Join {stats.donationCount} other supporters in making a difference.
          </p>
          <button className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors">
            Make a Donation
          </button>
        </CardContent>
      </Card>

      {/* Transparency & Legal */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-sm">Transparency & Legal Information</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-slate-400 space-y-2">
          <p>
            <strong>501(c)(3) Status:</strong> Rockin' Rockin' Boogie is a registered 501(c)(3) nonprofit organization. All donations are tax-deductible.
          </p>
          <p>
            <strong>EIN:</strong> Available upon request. Please contact us for tax documentation.
          </p>
          <p>
            <strong>Financial Accountability:</strong> We are committed to transparent financial reporting and responsible use of all donations.
          </p>
          <p>
            <strong>Mission:</strong> To provide the community with access to essential broadcast and media production tools, embodying our motto "A Voice for the Voiceless."
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
