import { useEffect, useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function AffiliateProgramDashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [referralLinks, setReferralLinks] = useState<any[]>([]);
  const [commissions, setCommissions] = useState<any[]>([]);

  const profileQuery = trpc.finalFeatures.affiliate.getProfile.useQuery();
  const referralLinksQuery = trpc.finalFeatures.affiliate.getReferralLinks.useQuery();
  const commissionsQuery = trpc.finalFeatures.affiliate.getCommissions.useQuery();
  const analyticsQuery = trpc.finalFeatures.affiliate.getAnalytics.useQuery();
  const generateLinkMutation = trpc.finalFeatures.affiliate.generateReferralLink.useMutation();

  useEffect(() => {
    if (profileQuery.data) setProfile(profileQuery.data);
    if (referralLinksQuery.data) setReferralLinks(referralLinksQuery.data);
    if (commissionsQuery.data) setCommissions(commissionsQuery.data);
  }, [profileQuery.data, referralLinksQuery.data, commissionsQuery.data]);

  const handleGenerateLink = async () => {
    try {
      await generateLinkMutation.mutateAsync();
      referralLinksQuery.refetch();
    } catch (error) {
      console.error('Failed to generate referral link:', error);
    }
  };

  return (
    <div className="space-y-6 p-8">
      <div>
        <h1 className="text-3xl font-bold">Affiliate Program</h1>
        <p className="text-gray-600 mt-2">Earn commissions by referring listeners to Rockin Rockin Boogie</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${profile?.totalEarnings || 0}</div>
            <p className="text-xs text-gray-600 mt-1">All-time earnings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Commissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${profile?.pendingCommissions || 0}</div>
            <p className="text-xs text-gray-600 mt-1">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsQuery.data?.totalReferrals || 0}</div>
            <p className="text-xs text-gray-600 mt-1">Successful conversions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsQuery.data?.conversionRate || 0}%</div>
            <p className="text-xs text-gray-600 mt-1">Click to conversion</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Referral Links */}
        <Card>
          <CardHeader>
            <CardTitle>Your Referral Links</CardTitle>
            <CardDescription>Share these links to earn commissions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleGenerateLink} className="w-full">
              Generate New Link
            </Button>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {referralLinks.map((link) => (
                <div key={link.id} className="p-3 bg-gray-50 rounded border">
                  <div className="text-sm font-mono break-all text-blue-600">{link.url}</div>
                  <div className="text-xs text-gray-600 mt-1">
                    Clicks: {link.clicks} | Conversions: {link.conversions}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Commission History */}
        <Card>
          <CardHeader>
            <CardTitle>Commission History</CardTitle>
            <CardDescription>Your recent commissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-h-64 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Amount</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {commissions.slice(0, 5).map((commission) => (
                    <TableRow key={commission.id}>
                      <TableCell className="text-sm font-medium">${commission.amount}</TableCell>
                      <TableCell className="text-xs">
                        <span
                          className={`px-2 py-1 rounded ${
                            commission.status === 'approved'
                              ? 'bg-green-100 text-green-800'
                              : commission.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {commission.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs">{new Date(commission.createdAt).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payout Section */}
      <Card>
        <CardHeader>
          <CardTitle>Payout Management</CardTitle>
          <CardDescription>Manage your commission payouts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="w-full">
              Request Bank Transfer
            </Button>
            <Button variant="outline" className="w-full">
              Request PayPal Payout
            </Button>
            <Button variant="outline" className="w-full">
              Request Check
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
