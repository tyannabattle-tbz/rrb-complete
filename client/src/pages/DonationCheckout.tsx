import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Heart, Shield, Users, Globe, Repeat } from 'lucide-react';

interface DonationTier {
  id: string;
  name: string;
  amount: number;
  description: string;
  benefits: string[];
  popular?: boolean;
}

const DONATION_TIERS: DonationTier[] = [
  {
    id: 'voice',
    name: 'A Voice',
    amount: 5,
    description: 'Be a voice for the voiceless',
    benefits: [
      'Support elderly abuse awareness',
      'Monthly impact newsletter',
      'Community recognition',
    ],
  },
  {
    id: 'guardian',
    name: 'Guardian',
    amount: 25,
    description: 'Protect and preserve legacies',
    benefits: [
      'Everything in A Voice',
      'Exclusive legacy restoration updates',
      'Direct impact reports',
      'Sweet Miracles community badge',
      'Priority event invitations',
    ],
    popular: true,
  },
  {
    id: 'champion',
    name: 'Legacy Champion',
    amount: 100,
    description: 'Transform lives and restore legacies',
    benefits: [
      'Everything in Guardian',
      'Named recognition on legacy wall',
      'Quarterly strategy calls',
      'Custom advocacy support',
      'VIP event access',
      'Lifetime Sweet Miracles membership',
    ],
  },
];

export function DonationCheckout() {
  const [selectedTier, setSelectedTier] = useState<string>('guardian');
  const [isLoading, setIsLoading] = useState(false);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isRecurring, setIsRecurring] = useState(false);

  const handleCheckout = async (tier: DonationTier) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tierName: tier.name,
          amount: tier.amount * 100,
          tierId: tier.id,
          recurring: isRecurring,
        }),
      });
      const data = await response.json();
      if (data.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Checkout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomDonation = async () => {
    const amount = parseFloat(customAmount);
    if (amount < 1) return;
    setIsLoading(true);
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tierName: 'Custom Donation',
          amount: amount * 100,
          tierId: 'custom',
          recurring: isRecurring,
        }),
      });
      const data = await response.json();
      if (data.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Custom donation error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-950 p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Sweet Miracles Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-600/20 border border-purple-500/30 mb-4">
            <Heart className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-purple-300 font-medium">Sweet Miracles Foundation</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-purple-400 via-amber-400 to-purple-400 bg-clip-text text-transparent">
              A Voice for the Voiceless
            </span>
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Sweet Miracles is founded to bring awareness to elderly abuse, neglect, and exploitation.
            Your donation helps protect legacies and empower communities.
          </p>
        </div>

        {/* Recurring Toggle */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-gray-900/60 border border-purple-500/20">
            <button
              onClick={() => setIsRecurring(false)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                !isRecurring ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              One-Time
            </button>
            <button
              onClick={() => setIsRecurring(true)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${
                isRecurring ? 'bg-amber-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Repeat className="w-3.5 h-3.5" />
              Monthly
            </button>
          </div>
        </div>

        {/* Donation Tiers */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {DONATION_TIERS.map((tier) => (
            <Card
              key={tier.id}
              className={`relative p-6 transition-all cursor-pointer bg-gray-900/60 border ${
                selectedTier === tier.id
                  ? 'border-purple-500/50 shadow-[0_0_20px_rgba(139,92,246,0.2)]'
                  : 'border-gray-700/30 hover:border-purple-500/30'
              }`}
              onClick={() => setSelectedTier(tier.id)}
            >
              {tier.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-amber-600 text-white border-0">
                  Most Popular
                </Badge>
              )}

              <div className="mb-5">
                <h3 className="text-xl font-bold text-white mb-1">{tier.name}</h3>
                <p className="text-gray-400 text-sm">{tier.description}</p>
              </div>

              <div className="mb-5">
                <span className="text-4xl font-bold text-white">${tier.amount}</span>
                <span className="text-gray-400 ml-2">{isRecurring ? '/month' : ' once'}</span>
              </div>

              <ul className="space-y-2.5 mb-6">
                {tier.benefits.map((benefit, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-300">{benefit}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={(e) => { e.stopPropagation(); handleCheckout(tier); }}
                disabled={isLoading}
                className={`w-full ${
                  tier.popular
                    ? 'bg-gradient-to-r from-purple-600 to-amber-600 hover:from-purple-500 hover:to-amber-500 text-white'
                    : 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-600'
                }`}
              >
                {isLoading ? 'Processing...' : `Donate $${tier.amount}`}
              </Button>
            </Card>
          ))}
        </div>

        {/* Custom Donation */}
        <Card className="bg-gray-900/60 border-purple-500/20 p-6 mb-10">
          <h3 className="text-xl font-bold text-white mb-2">Custom Donation</h3>
          <p className="text-gray-400 text-sm mb-4">Choose your own amount to support our mission</p>
          <div className="flex gap-4">
            <div className="flex-1">
              <input
                type="number"
                min="1"
                step="0.01"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder="Enter amount ($)"
                className="w-full px-4 py-2.5 bg-gray-800/60 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />
            </div>
            <Button
              onClick={handleCustomDonation}
              disabled={isLoading || !customAmount}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-6"
            >
              {isLoading ? 'Processing...' : 'Donate'}
            </Button>
          </div>
        </Card>

        {/* Impact Dashboard */}
        <Card className="bg-gray-900/60 border-amber-500/20 p-6 mb-10">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5 text-amber-400" />
            Community Impact
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg bg-gray-800/40">
              <p className="text-2xl font-bold text-purple-400">1,247</p>
              <p className="text-xs text-gray-400 mt-1">Lives Touched</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-gray-800/40">
              <p className="text-2xl font-bold text-amber-400">89</p>
              <p className="text-xs text-gray-400 mt-1">Legacies Protected</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-gray-800/40">
              <p className="text-2xl font-bold text-emerald-400">342</p>
              <p className="text-xs text-gray-400 mt-1">Community Members</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-gray-800/40">
              <p className="text-2xl font-bold text-purple-400">24</p>
              <p className="text-xs text-gray-400 mt-1">Active Campaigns</p>
            </div>
          </div>
        </Card>

        {/* Mission Section */}
        <Card className="bg-gray-900/60 border-purple-500/20 p-6 mb-8">
          <h3 className="text-xl font-bold text-white mb-4">Our Mission</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <Shield className="w-8 h-8 text-purple-400 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-semibold text-amber-400 mb-1">Protect Elders</h4>
                <p className="text-xs text-gray-400">
                  Fight against elderly abuse, neglect, and exploitation through awareness and advocacy
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Heart className="w-8 h-8 text-purple-400 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-semibold text-amber-400 mb-1">Restore Legacies</h4>
                <p className="text-xs text-gray-400">
                  Recover and preserve stolen legacies, ensuring creators receive proper recognition
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Users className="w-8 h-8 text-purple-400 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-semibold text-amber-400 mb-1">Empower Communities</h4>
                <p className="text-xs text-gray-400">
                  Provide tools for media production, broadcasting, and communication to those in need
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Disclaimer */}
        <div className="text-center space-y-2">
          <p className="text-xs text-gray-500">
            Sweet Miracles is a 501(c) and 508 organization. All donations are tax-deductible to the extent allowed by law.
          </p>
          <p className="text-xs text-gray-600">
            All donations are processed securely through Stripe. A Canryn Production subsidiary.
          </p>
        </div>
      </div>
    </div>
  );
}
