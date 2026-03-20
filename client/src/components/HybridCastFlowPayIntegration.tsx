import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Heart, Share2, Copy, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

interface HybridCastFlowPayIntegrationProps {
  broadcastId: string;
  broadcastTitle: string;
  onDonationReceived?: (amount: number) => void;
}

export function HybridCastFlowPayIntegration({
  broadcastId,
  broadcastTitle,
  onDonationReceived,
}: HybridCastFlowPayIntegrationProps) {
  const [showDonationPanel, setShowDonationPanel] = useState(false);
  const [donationAmount, setDonationAmount] = useState('');
  const [donationMessage, setDonationMessage] = useState('');
  const [paymentLink, setPaymentLink] = useState('');
  const [totalDonations, setTotalDonations] = useState(0);
  const [donationCount, setDonationCount] = useState(0);

  const generatePaymentLink = async () => {
    if (!donationAmount) {
      toast.error('Please enter a donation amount');
      return;
    }

    try {
      // Generate a payment link for this broadcast
      const link = `${window.location.origin}/flowpay/links?broadcast=${broadcastId}&amount=${donationAmount}&title=${encodeURIComponent(broadcastTitle)}`;
      setPaymentLink(link);
      toast.success('Payment link generated!');
    } catch (error) {
      toast.error('Failed to generate payment link');
    }
  };

  const copyPaymentLink = () => {
    if (paymentLink) {
      navigator.clipboard.writeText(paymentLink);
      toast.success('Payment link copied to clipboard!');
    }
  };

  const shareToTwitter = () => {
    if (paymentLink) {
      const text = `Support ${broadcastTitle} on HybridCast! Donate now: ${paymentLink}`;
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
      window.open(twitterUrl, '_blank');
    }
  };

  return (
    <div className="space-y-4">
      {/* Donation Stats */}
      <Card className="bg-gradient-to-r from-purple-600 to-pink-600 border-0 text-white">
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-purple-200 text-sm">Total Donations</p>
              <p className="text-3xl font-bold">${totalDonations.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-purple-200 text-sm">Donors</p>
              <p className="text-3xl font-bold">{donationCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Donation Panel Toggle */}
      <Button
        onClick={() => setShowDonationPanel(!showDonationPanel)}
        className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold"
      >
        <Heart className="w-4 h-4 mr-2" />
        {showDonationPanel ? 'Hide Donation Options' : 'Enable Donations'}
      </Button>

      {/* Donation Setup Panel */}
      {showDonationPanel && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Setup Donations</CardTitle>
            <CardDescription>Create payment links for your broadcast</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Donation Amount */}
            <div className="space-y-2">
              <Label htmlFor="donation-amount" className="text-white">
                Suggested Donation Amount (USD)
              </Label>
              <div className="flex items-center gap-2">
                <span className="text-white">$</span>
                <Input
                  id="donation-amount"
                  type="number"
                  placeholder="5.00"
                  value={donationAmount}
                  onChange={(e) => setDonationAmount(e.target.value)}
                  step="0.01"
                  min="0"
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>

            {/* Donation Message */}
            <div className="space-y-2">
              <Label htmlFor="donation-message" className="text-white">
                Donation Message (Optional)
              </Label>
              <textarea
                id="donation-message"
                placeholder="Thank you message for donors..."
                value={donationMessage}
                onChange={(e) => setDonationMessage(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 text-white rounded-md px-3 py-2 min-h-20"
              />
            </div>

            {/* Generate Button */}
            <Button
              onClick={generatePaymentLink}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            >
              <DollarSign className="w-4 h-4 mr-2" />
              Generate Payment Link
            </Button>

            {/* Payment Link Display */}
            {paymentLink && (
              <div className="space-y-3">
                <div className="bg-slate-700 rounded-lg p-3">
                  <p className="text-gray-400 text-xs mb-2">Payment Link</p>
                  <code className="text-gray-300 text-sm break-all">{paymentLink}</code>
                </div>

                {/* Share Options */}
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={copyPaymentLink}
                    variant="outline"
                    className="text-white border-slate-600 hover:bg-slate-700"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Link
                  </Button>
                  <Button
                    onClick={shareToTwitter}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share on X
                  </Button>
                </div>

                {/* QR Code Placeholder */}
                <div className="bg-slate-700 rounded-lg p-4 text-center">
                  <p className="text-gray-400 text-sm mb-2">QR Code</p>
                  <div className="w-24 h-24 bg-white rounded-lg mx-auto flex items-center justify-center">
                    <span className="text-gray-400 text-xs">QR Code</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Donation Ticker */}
      {donationCount > 0 && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-sm">Recent Donations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[...Array(Math.min(donationCount, 3))].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-slate-700 rounded">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-pink-400" />
                    <span className="text-gray-300 text-sm">Anonymous Donor</span>
                  </div>
                  <span className="text-green-400 font-bold">+${(Math.random() * 50 + 5).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
