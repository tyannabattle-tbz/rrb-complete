import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, DollarSign, Mail, User, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

interface DonationOption {
  amount: number;
  label: string;
  description: string;
}

const DONATION_OPTIONS: DonationOption[] = [
  { amount: 5, label: '$5', description: 'Support a song' },
  { amount: 10, label: '$10', description: 'Keep the music playing' },
  { amount: 25, label: '$25', description: 'Fund an episode' },
  { amount: 50, label: '$50', description: 'Sponsor a broadcast' },
  { amount: 100, label: '$100', description: 'Support the legacy' },
  { amount: 250, label: '$250', description: 'Premium supporter' },
];

const DONATION_PURPOSES = [
  { id: 'legacy_recovery', label: 'Legacy Recovery', description: 'Preserve family history and archives' },
  { id: 'operations', label: 'Operations', description: 'Keep broadcasts running 24/7' },
  { id: 'education', label: 'Education', description: 'Fund healing frequency research' },
  { id: 'general', label: 'General Support', description: 'Support all initiatives' },
];

export default function DonationCheckout() {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [selectedPurpose, setSelectedPurpose] = useState('general');
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const finalAmount = customAmount ? parseFloat(customAmount) : selectedAmount;

  const handleDonate = async () => {
    if (!finalAmount || finalAmount < 0.50) {
      toast.error('Minimum donation is $0.50');
      return;
    }

    if (!isAnonymous && (!donorName || !donorEmail)) {
      toast.error('Please enter your name and email');
      return;
    }

    setIsProcessing(true);

    try {
      // Create checkout session
      const response = await fetch('/api/donations/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Math.round(finalAmount * 100), // Convert to cents
          currency: 'USD',
          donorName: isAnonymous ? 'Anonymous' : donorName,
          donorEmail: isAnonymous ? 'anonymous@example.com' : donorEmail,
          message,
          purpose: selectedPurpose,
          isAnonymous,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { checkoutUrl } = await response.json();
      
      // Redirect to Stripe checkout
      window.open(checkoutUrl, '_blank');
      toast.success('Redirecting to secure checkout...');
    } catch (error) {
      console.error('Donation error:', error);
      toast.error('Failed to process donation');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center justify-center gap-3">
            <Heart className="w-10 h-10 text-red-400" />
            Support the Legacy
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Your donation helps preserve Seabrun Candy Hunter's legacy, fund healing frequency research, and keep broadcasts running 24/7.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Donation Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Select Amount */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-400" />
                  Select Donation Amount
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {DONATION_OPTIONS.map(option => (
                    <button
                      key={option.amount}
                      onClick={() => {
                        setSelectedAmount(option.amount);
                        setCustomAmount('');
                      }}
                      className={`p-4 rounded-lg border-2 transition ${
                        selectedAmount === option.amount && !customAmount
                          ? 'border-blue-500 bg-blue-500/10'
                          : 'border-slate-600 hover:border-slate-500'
                      }`}
                    >
                      <div className="font-bold text-white">{option.label}</div>
                      <div className="text-xs text-slate-400">{option.description}</div>
                    </button>
                  ))}
                </div>

                {/* Custom Amount */}
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Custom Amount</label>
                  <div className="flex gap-2">
                    <span className="px-3 py-2 bg-slate-700 rounded-lg text-white">$</span>
                    <input
                      type="number"
                      value={customAmount}
                      onChange={(e) => {
                        setCustomAmount(e.target.value);
                        setSelectedAmount(null);
                      }}
                      placeholder="Enter amount"
                      className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Select Purpose */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Donation Purpose</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {DONATION_PURPOSES.map(purpose => (
                    <label
                      key={purpose.id}
                      className="flex items-center p-3 border-2 border-slate-600 rounded-lg cursor-pointer hover:border-slate-500 transition"
                    >
                      <input
                        type="radio"
                        name="purpose"
                        value={purpose.id}
                        checked={selectedPurpose === purpose.id}
                        onChange={(e) => setSelectedPurpose(e.target.value)}
                        className="w-4 h-4"
                      />
                      <div className="ml-3">
                        <p className="font-semibold text-white">{purpose.label}</p>
                        <p className="text-sm text-slate-400">{purpose.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Donor Information */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Your Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg border border-slate-600">
                  <input
                    type="checkbox"
                    id="anonymous"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <label htmlFor="anonymous" className="text-white cursor-pointer">
                    Make this donation anonymous
                  </label>
                </div>

                {!isAnonymous && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={donorName}
                        onChange={(e) => setDonorName(e.target.value)}
                        placeholder="Your name"
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={donorEmail}
                        onChange={(e) => setDonorEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Message (Optional)
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Share your thoughts or why you're supporting..."
                    rows={3}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Summary */}
          <div>
            <Card className="bg-gradient-to-br from-blue-900/50 to-purple-900/50 border-blue-700 sticky top-6">
              <CardHeader>
                <CardTitle className="text-white">Donation Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-slate-300">
                    <span>Amount:</span>
                    <span className="font-semibold">${finalAmount?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Purpose:</span>
                    <span className="font-semibold text-right">
                      {DONATION_PURPOSES.find(p => p.id === selectedPurpose)?.label}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Donor:</span>
                    <span className="font-semibold">{isAnonymous ? 'Anonymous' : donorName || 'Not provided'}</span>
                  </div>
                </div>

                <div className="border-t border-slate-600 pt-4">
                  <p className="text-xs text-slate-400 mb-3">
                    ✓ 501(c)(3) nonprofit organization<br />
                    ✓ Tax-deductible donation<br />
                    ✓ Secure Stripe payment
                  </p>
                </div>

                <Button
                  onClick={handleDonate}
                  disabled={!finalAmount || isProcessing}
                  className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 disabled:opacity-50"
                >
                  <Heart className="w-4 h-4 mr-2" />
                  {isProcessing ? 'Processing...' : `Donate $${finalAmount?.toFixed(2) || '0.00'}`}
                </Button>

                <p className="text-xs text-slate-400 text-center">
                  You will be redirected to secure Stripe checkout
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
