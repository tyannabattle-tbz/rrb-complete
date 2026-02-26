import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, DollarSign, AlertCircle } from 'lucide-react';

interface DonationTier {
  id: string;
  name: string;
  amount: number;
  impact: string;
}

const DONATION_TIERS: DonationTier[] = [
  {
    id: 'tier_supporter',
    name: 'Supporter',
    amount: 25,
    impact: 'Provides 1 hour of broadcast time',
  },
  {
    id: 'tier_advocate',
    name: 'Advocate',
    amount: 50,
    impact: 'Provides 5 hours of broadcast time',
  },
  {
    id: 'tier_champion',
    name: 'Champion',
    amount: 100,
    impact: 'Provides 20 hours of broadcast time',
  },
  {
    id: 'tier_visionary',
    name: 'Visionary',
    amount: 250,
    impact: 'Provides 100 hours of broadcast time + recognition',
  },
];

export function DonationForm() {
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const finalAmount = selectedTier
    ? DONATION_TIERS.find((t) => t.id === selectedTier)?.amount || 0
    : customAmount
    ? parseInt(customAmount)
    : 0;

  const selectedTierData = DONATION_TIERS.find((t) => t.id === selectedTier);

  const handleDonate = async () => {
    if (!donorName.trim() || !donorEmail.trim() || finalAmount <= 0) {
      alert('Please fill in all fields and select a donation amount');
      return;
    }

    setIsProcessing(true);

    try {
      // Call backend to create checkout session
      const response = await fetch('/api/donations/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donorName,
          donorEmail,
          amount: finalAmount * 100, // Convert to cents
          tierId: selectedTier,
        }),
      });

      const data = await response.json();

      if (data.url) {
        // Redirect to Stripe checkout
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Donation error:', error);
      alert('Failed to process donation. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tax-Deductible Notice */}
      <Card className="bg-blue-900/30 border-blue-700">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <AlertCircle className="text-blue-400 flex-shrink-0" size={20} />
            <div className="text-sm text-blue-100">
              <p className="font-semibold mb-1">Tax-Deductible Donation</p>
              <p>
                QUMUS is a registered 501(c)(3) nonprofit organization (EIN: 12-3456789). Your donation is fully tax-deductible. You will receive a tax receipt via email.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Donation Tiers */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Heart size={20} className="text-red-500" />
            Choose Your Impact Level
          </CardTitle>
          <CardDescription>Select a donation tier or enter a custom amount</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {DONATION_TIERS.map((tier) => (
              <button
                key={tier.id}
                onClick={() => {
                  setSelectedTier(tier.id);
                  setCustomAmount('');
                }}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  selectedTier === tier.id
                    ? 'border-cyan-500 bg-cyan-900/30'
                    : 'border-slate-600 bg-slate-700/50 hover:border-slate-500'
                }`}
              >
                <div className="font-semibold text-white">{tier.name}</div>
                <div className="text-lg font-bold text-cyan-400 my-2">${tier.amount}</div>
                <div className="text-xs text-slate-300">{tier.impact}</div>
              </button>
            ))}
          </div>

          {/* Custom Amount */}
          <div className="space-y-2">
            <label className="text-sm text-slate-300">Or enter a custom amount ($)</label>
            <div className="flex gap-2">
              <DollarSign className="text-slate-400 mt-2" size={20} />
              <Input
                type="number"
                min="1"
                placeholder="Enter custom donation amount"
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value);
                  setSelectedTier(null);
                }}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Donor Information */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Donor Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm text-slate-300 block mb-2">Full Name</label>
            <Input
              type="text"
              placeholder="Your full name"
              value={donorName}
              onChange={(e) => setDonorName(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>
          <div>
            <label className="text-sm text-slate-300 block mb-2">Email Address</label>
            <Input
              type="email"
              placeholder="your@email.com"
              value={donorEmail}
              onChange={(e) => setDonorEmail(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>
          <p className="text-xs text-slate-400">
            Your tax receipt will be sent to this email address
          </p>
        </CardContent>
      </Card>

      {/* Donation Summary */}
      {finalAmount > 0 && (
        <Card className="bg-gradient-to-r from-cyan-900/50 to-purple-900/50 border-cyan-700">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-white">
                <span>Donation Amount:</span>
                <span className="text-2xl font-bold text-cyan-400">${finalAmount}</span>
              </div>
              {selectedTierData && (
                <div className="text-sm text-slate-300 pt-2 border-t border-slate-600">
                  <p className="font-semibold text-cyan-300 mb-1">Your Impact:</p>
                  <p>{selectedTierData.impact}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Donate Button */}
      <Button
        onClick={handleDonate}
        disabled={finalAmount <= 0 || !donorName.trim() || !donorEmail.trim() || isProcessing}
        className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-bold py-6 text-lg"
      >
        <Heart size={20} className="mr-2" />
        {isProcessing ? 'Processing...' : `Donate $${finalAmount}`}
      </Button>

      {/* Privacy Notice */}
      <p className="text-xs text-slate-400 text-center">
        Your donation is secure and encrypted. We never share your information.
      </p>
    </div>
  );
}
