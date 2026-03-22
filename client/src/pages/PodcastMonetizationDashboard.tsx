import { useEffect, useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function PodcastMonetizationDashboard() {
  const [donationAmount, setDonationAmount] = useState<number>(10);
  const [donationMessage, setDonationMessage] = useState<string>('');

  // Fetch monetization dashboard
  const { data: dashboard, isLoading } = trpc.advancedMonetization.monetization.getMonetizationDashboard.useQuery();

  // Fetch revenue report
  const { data: revenueReport } = trpc.advancedMonetization.monetization.getRevenueReport.useQuery({
    period: 'monthly'
  });

  // Record donation mutation
  const recordDonation = trpc.advancedMonetization.monetization.recordDonation.useMutation({
    onSuccess: () => {
      setDonationAmount(10);
      setDonationMessage('');
      alert('Thank you for your donation!');
    }
  });

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Loading monetization data...</div>;
  }

  const handleDonate = () => {
    recordDonation.mutate({
      listenerId: 'listener-' + Math.random().toString(36).substr(2, 9),
      amount: donationAmount,
      currency: 'USD',
      message: donationMessage || undefined
    });
  };

  return (
    <div className="space-y-6 p-6">
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Premium Episodes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard?.premiumEpisodes || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Sponsors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard?.activeSponsors || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Donations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${dashboard?.totalDonations || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${dashboard?.totalRevenue || 0}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Donation Form */}
        <Card>
          <CardHeader>
            <CardTitle>Make a Donation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Donation Amount (USD)</label>
              <Input
                type="number"
                min="1"
                value={donationAmount}
                onChange={(e) => setDonationAmount(parseFloat(e.target.value))}
                placeholder="Enter amount"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Message (Optional)</label>
              <textarea
                value={donationMessage}
                onChange={(e) => setDonationMessage(e.target.value)}
                placeholder="Leave a message"
                className="w-full p-2 border rounded"
                rows={3}
              />
            </div>
            <p className="text-xs text-gray-600">
              All donations support legacy recovery efforts. Contact Canryn for pricing packages.
            </p>
            <Button
              onClick={handleDonate}
              disabled={recordDonation.isPending}
              className="w-full"
            >
              {recordDonation.isPending ? 'Processing...' : `Donate $${donationAmount}`}
            </Button>
          </CardContent>
        </Card>

        {/* Revenue Report */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Report</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Premium Episodes</p>
              <p className="text-2xl font-bold">${revenueReport?.premiumEpisodeRevenue || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Sponsorships</p>
              <p className="text-2xl font-bold">${revenueReport?.sponsorshipRevenue || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Donations</p>
              <p className="text-2xl font-bold">${revenueReport?.donationRevenue || 0}</p>
            </div>
            <div className="border-t pt-3">
              <p className="text-sm font-medium">Total Revenue</p>
              <p className="text-3xl font-bold text-green-600">${revenueReport?.totalRevenue || 0}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Episodes */}
      <Card>
        <CardHeader>
          <CardTitle>Top Premium Episodes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {dashboard?.topEpisodes?.map((episode) => (
              <div key={episode.episodeId} className="flex items-center justify-between p-2 rounded hover:bg-gray-100">
                <span className="font-medium">{episode.title}</span>
                <span className="text-sm text-gray-600">${episode.price}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Donations */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Donations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {dashboard?.recentDonations?.map((donation) => (
              <div key={donation.donationId} className="flex items-center justify-between p-2 rounded hover:bg-gray-100">
                <div>
                  <p className="font-medium">${donation.amount}</p>
                  {donation.message && <p className="text-sm text-gray-600">{donation.message}</p>}
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(donation.timestamp).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
