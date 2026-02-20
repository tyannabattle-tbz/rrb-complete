/**
 * Donation Checkout — In Support of Legacy Recovery Efforts
 * Sweet Miracles Foundation 501(c)(3) / 508(c)
 * 
 * All proceeds support the preservation and continuation of the
 * Rockin' Rockin' Boogie legacy and community empowerment programs.
 */
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Heart, Radio, BookOpen, Star, Music, Shield, Users } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import { getLoginUrl } from '@/const';
import { toast } from 'sonner';
import { Link } from 'wouter';

const DONATION_TIERS = [
  {
    id: 'friend' as const,
    name: 'Friend of the Legacy',
    amount: 5,
    description: 'Every dollar counts toward legacy recovery',
    benefits: [
      'Monthly supporter recognition',
      'Access to legacy recovery updates',
      'Digital thank you from the family',
    ],
  },
  {
    id: 'supporter' as const,
    name: 'Legacy Supporter',
    amount: 10,
    description: 'Sustaining the voice for the voiceless',
    benefits: [
      'All Friend benefits',
      'Monthly impact report',
      'Name listed on supporters wall',
      'Early access to new archival content',
    ],
  },
  {
    id: 'champion' as const,
    name: 'Legacy Champion',
    amount: 25,
    description: 'Championing legacy recovery efforts',
    benefits: [
      'All Supporter benefits',
      'Quarterly video updates from the family',
      'VIP access to legacy events',
      'Recognition in annual report',
    ],
    popular: true,
  },
  {
    id: 'guardian' as const,
    name: 'Legacy Guardian',
    amount: 50,
    description: 'Guarding the legacy for future generations',
    benefits: [
      'All Champion benefits',
      'Direct updates from the family',
      'Custom content requests',
      'Lifetime recognition',
      'Advisory board consideration',
    ],
  },
  {
    id: 'benefactor' as const,
    name: 'Legacy Benefactor',
    amount: 100,
    description: 'Transforming legacy recovery into generational wealth',
    benefits: [
      'All Guardian benefits',
      'Monthly one-on-one calls',
      'Named recognition on all platforms',
      'Exclusive behind-the-scenes access',
      'Board member consideration',
      'Lifetime premium access to all content',
    ],
  },
];

const QUICK_AMOUNTS = [5, 10, 25, 50, 100, 250, 500, 1000];

const DONATION_PURPOSES = [
  { id: 'legacy-recovery', name: 'Legacy Recovery Efforts', icon: Music, description: 'Recovering and preserving the musical legacy of Seabrun "Candy" Hunter' },
  { id: 'community-support', name: 'Community Empowerment', icon: Users, description: 'Providing communities with tools for media production and broadcasting' },
  { id: 'emergency-broadcast', name: 'Emergency Broadcast', icon: Radio, description: 'Funding HybridCast emergency broadcast infrastructure' },
  { id: 'education-wellness', name: 'Education & Wellness', icon: BookOpen, description: 'Supporting healing frequency research and educational initiatives' },
  { id: 'general-fund', name: 'Where Needed Most', icon: Star, description: 'Your donation goes where it\'s needed most across all programs' },
];

export function DonationCheckout() {
  const { user } = useAuth();
  const [selectedTier, setSelectedTier] = useState<string>('champion');
  const [activeTab, setActiveTab] = useState<'monthly' | 'one-time'>('monthly');
  const [customAmount, setCustomAmount] = useState<string>('');
  const [selectedPurpose, setSelectedPurpose] = useState('general-fund');
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [donorMessage, setDonorMessage] = useState('');

  const monthlyMutation = trpc.stripePayments.createMonthlyDonationSession.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        toast.success('Redirecting to secure donation page...');
        window.open(data.url, '_blank');
      }
    },
    onError: (err) => toast.error(err.message),
  });

  const oneTimeMutation = trpc.stripePayments.createOneTimeDonationSession.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        toast.success('Redirecting to secure donation page...');
        window.open(data.url, '_blank');
      }
    },
    onError: (err) => toast.error(err.message),
  });

  const handleMonthlyDonation = (tierId: string) => {
    if (!user) {
      toast.info('Please sign in to set up a recurring donation.');
      window.location.href = getLoginUrl();
      return;
    }
    monthlyMutation.mutate({ tierId: tierId as any, purpose: selectedPurpose });
  };

  const handleOneTimeDonation = (amountDollars: number) => {
    const name = user?.name || donorName;
    const email = user?.email || donorEmail;
    if (!name || !email) {
      toast.error('Please provide your name and email to continue.');
      return;
    }
    if (amountDollars < 0.50) {
      toast.error('Minimum donation is $0.50');
      return;
    }
    oneTimeMutation.mutate({
      amount: Math.round(amountDollars * 100),
      email,
      name,
      purpose: selectedPurpose,
      message: donorMessage || undefined,
    });
  };

  const isLoading = monthlyMutation.isPending || oneTimeMutation.isPending;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-full px-4 py-2 mb-4">
            <Heart className="w-4 h-4 text-amber-500" />
            <span className="text-amber-400 text-sm font-medium">Sweet Miracles Foundation 501(c)(3) / 508(c)</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            In Support of Legacy Recovery Efforts
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            Your donation supports the recovery, preservation, and continuation of the 
            Rockin' Rockin' Boogie legacy — A Voice for the Voiceless
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex justify-center mb-8">
          <div className="bg-slate-800 rounded-lg p-1 flex gap-1">
            <button
              onClick={() => setActiveTab('monthly')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'monthly' ? 'bg-amber-500 text-black' : 'text-slate-300 hover:text-white'
              }`}
            >
              Monthly Giving
            </button>
            <button
              onClick={() => setActiveTab('one-time')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'one-time' ? 'bg-amber-500 text-black' : 'text-slate-300 hover:text-white'
              }`}
            >
              One-Time Donation
            </button>
          </div>
        </div>

        {/* Donation Purpose Selector */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-white mb-4 text-center">Where should your donation go?</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {DONATION_PURPOSES.map((purpose) => {
              const Icon = purpose.icon;
              return (
                <button
                  key={purpose.id}
                  onClick={() => setSelectedPurpose(purpose.id)}
                  className={`p-3 rounded-lg border text-center transition-all ${
                    selectedPurpose === purpose.id
                      ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                      : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  <Icon className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-xs font-medium">{purpose.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {activeTab === 'monthly' ? (
          /* Monthly Donation Tiers */
          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
            {DONATION_TIERS.map((tier) => (
              <Card
                key={tier.id}
                className={`relative p-5 transition-all cursor-pointer ${
                  selectedTier === tier.id
                    ? 'ring-2 ring-amber-500 bg-slate-800'
                    : 'bg-slate-800/70 hover:bg-slate-800'
                }`}
                onClick={() => setSelectedTier(tier.id)}
              >
                {tier.popular && (
                  <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-amber-500 text-black text-xs">
                    Most Popular
                  </Badge>
                )}
                <div className="mb-3">
                  <h3 className="text-sm font-bold text-white mb-1">{tier.name}</h3>
                  <p className="text-xs text-slate-400">{tier.description}</p>
                </div>
                <div className="mb-3">
                  <span className="text-2xl font-bold text-white">${tier.amount}</span>
                  <span className="text-slate-400 text-xs ml-1">/month</span>
                </div>
                <ul className="space-y-1.5 mb-4">
                  {tier.benefits.slice(0, 3).map((benefit, idx) => (
                    <li key={`item-${idx}`} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                      <span className="text-xs text-slate-300">{benefit}</span>
                    </li>
                  ))}
                  {tier.benefits.length > 3 && (
                    <li className="text-xs text-amber-400">+{tier.benefits.length - 3} more benefits</li>
                  )}
                </ul>
                <Button
                  onClick={(e) => { e.stopPropagation(); handleMonthlyDonation(tier.id); }}
                  disabled={isLoading}
                  size="sm"
                  className={`w-full ${
                    tier.popular
                      ? 'bg-amber-500 hover:bg-amber-600 text-black'
                      : 'bg-slate-700 hover:bg-slate-600 text-white'
                  }`}
                >
                  {isLoading ? 'Processing...' : `Donate $${tier.amount}/mo`}
                </Button>
              </Card>
            ))}
          </div>
        ) : (
          /* One-Time Donation */
          <div className="max-w-2xl mx-auto mb-8">
            <Card className="bg-slate-800 p-6">
              <h3 className="text-xl font-bold text-white mb-2">One-Time Donation</h3>
              <p className="text-slate-400 text-sm mb-6">
                Every contribution, no matter the size, supports legacy recovery efforts.
              </p>

              {/* Quick Amount Buttons */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                {QUICK_AMOUNTS.map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setCustomAmount(amt.toString())}
                    className={`py-2 rounded-lg text-sm font-medium transition-colors ${
                      customAmount === amt.toString()
                        ? 'bg-amber-500 text-black'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    ${amt >= 1000 ? `${amt / 1000}k` : amt}
                  </button>
                ))}
              </div>

              {/* Custom Amount Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-300 mb-1">Custom Amount ($)</label>
                <input
                  type="number"
                  min="0.50"
                  step="0.01"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  placeholder="Enter any amount (min $0.50)"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Donor Info (for non-authenticated users) */}
              {!user && (
                <div className="grid md:grid-cols-2 gap-3 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Your Name</label>
                    <input
                      type="text"
                      value={donorName}
                      onChange={(e) => setDonorName(e.target.value)}
                      placeholder="Full name"
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
                    <input
                      type="email"
                      value={donorEmail}
                      onChange={(e) => setDonorEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
              )}

              {/* Optional Message */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-300 mb-1">Message (optional)</label>
                <textarea
                  value={donorMessage}
                  onChange={(e) => setDonorMessage(e.target.value)}
                  placeholder="Leave a message of support..."
                  rows={2}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                />
              </div>

              <Button
                onClick={() => handleOneTimeDonation(parseFloat(customAmount) || 0)}
                disabled={isLoading || !customAmount}
                className="w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold"
              >
                {isLoading ? 'Processing...' : `Donate $${customAmount || '0'}`}
              </Button>
            </Card>
          </div>
        )}

        {/* Why Donate Section */}
        <Card className="bg-slate-800/50 p-6 mb-8">
          <h3 className="text-xl font-bold text-white mb-4 text-center">Why Your Donation Matters</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <Music className="w-8 h-8 text-amber-500 mx-auto mb-2" />
              <h4 className="text-sm font-semibold text-amber-400 mb-1">Recover the Legacy</h4>
              <p className="text-xs text-slate-400">
                Help restore the musical legacy of Seabrun "Candy" Hunter and ensure proper credit for the Rockin' Rockin' Boogie heritage.
              </p>
            </div>
            <div className="text-center">
              <Radio className="w-8 h-8 text-amber-500 mx-auto mb-2" />
              <h4 className="text-sm font-semibold text-amber-400 mb-1">A Voice for the Voiceless</h4>
              <p className="text-xs text-slate-400">
                Fund community broadcasting, emergency communication, and media production tools for communities in crisis.
              </p>
            </div>
            <div className="text-center">
              <Shield className="w-8 h-8 text-amber-500 mx-auto mb-2" />
              <h4 className="text-sm font-semibold text-amber-400 mb-1">Generational Wealth</h4>
              <p className="text-xs text-slate-400">
                Build perpetual infrastructure through Canryn Production and Sweet Miracles — structured for legacy restored and continued.
              </p>
            </div>
          </div>
        </Card>

        {/* Studio Services Notice */}
        <Card className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/30 p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="bg-amber-500/20 rounded-lg p-3">
              <Music className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-amber-400 mb-1">Looking for Studio Services?</h4>
              <p className="text-slate-300 text-sm mb-3">
                For production packages, studio time, recording services, and commercial pricing, 
                please contact Canryn Production directly for custom quotes and availability.
              </p>
              <Link href="/rrb/contact">
                <Button variant="outline" size="sm" className="border-amber-500/50 text-amber-400 hover:bg-amber-500/10">
                  Contact Canryn Production
                </Button>
              </Link>
            </div>
          </div>
        </Card>

        {/* Disclaimer */}
        <div className="text-center space-y-2">
          <p className="text-slate-500 text-xs">
            Sweet Miracles Foundation is a registered 501(c)(3) / 508(c) nonprofit organization. 
            Your donation may be tax-deductible to the extent allowed by law.
          </p>
          <p className="text-slate-500 text-xs">
            All donations are processed securely through Stripe. Your payment information is never stored on our servers.
          </p>
          <p className="text-slate-500 text-xs">
            Test donations: Use card number 4242 4242 4242 4242 with any future date and CVC.
          </p>
        </div>
      </div>
    </div>
  );
}
