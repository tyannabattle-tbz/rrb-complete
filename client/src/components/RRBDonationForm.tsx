import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Heart, CheckCircle, AlertCircle, Loader } from 'lucide-react';

const DONATION_PRESETS = [
  { amount: 25, label: '$25 - Support 1 hour of broadcast' },
  { amount: 50, label: '$50 - Support 2 hours of broadcast' },
  { amount: 100, label: '$100 - Support 4 hours of broadcast' },
  { amount: 250, label: '$250 - Support 10 hours of broadcast' },
];

export function RRBDonationForm() {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const finalAmount = selectedAmount || (customAmount ? parseInt(customAmount) : 0);

  const handleDonate = async () => {
    if (finalAmount < 1) {
      setStatus('error');
      setMessage('Please enter a valid donation amount');
      return;
    }

    if (!donorEmail) {
      setStatus('error');
      setMessage('Please enter your email address');
      return;
    }

    setIsProcessing(true);

    try {
      // Create checkout session for RRB donation
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: finalAmount * 100, // Convert to cents
          productName: 'RRB Donation - Tax Deductible',
          customerEmail: donorEmail,
          metadata: {
            donor_name: donorName,
            donor_email: donorEmail,
            donation_type: 'rrb_501c3',
            broadcast_hours: Math.floor(finalAmount / 25),
          },
        }),
      });

      const data = await response.json();

      if (data.url) {
        // Redirect to Stripe checkout
        window.open(data.url, '_blank');
        setStatus('success');
        setMessage('Redirecting to secure payment page...');
      } else {
        throw new Error('Failed to create checkout session');
      }
    } catch (error) {
      console.error('Donation error:', error);
      setStatus('error');
      setMessage('Failed to process donation. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-red-900/50 to-pink-900/50 border-red-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Heart size={24} className="text-red-400" />
            Support Rockin' Rockin' Boogie
          </CardTitle>
          <CardDescription className="text-red-100">
            RRB is a 501(c)(3) nonprofit organization. Your donation is tax-deductible and directly supports our mission to provide community access to broadcast tools and media production.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Donation Presets */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Select a Donation Amount</CardTitle>
          <CardDescription>Each dollar supports approximately 10 minutes of broadcast time</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {DONATION_PRESETS.map((preset) => (
              <Button
                key={preset.amount}
                onClick={() => {
                  setSelectedAmount(preset.amount);
                  setCustomAmount('');
                }}
                variant={selectedAmount === preset.amount ? 'default' : 'outline'}
                className={`h-auto py-3 text-left ${
                  selectedAmount === preset.amount
                    ? 'bg-red-600 hover:bg-red-700 border-red-600'
                    : 'bg-slate-700 hover:bg-slate-600 border-slate-600'
                }`}
              >
                <div className="flex flex-col">
                  <span className="font-semibold">{preset.label}</span>
                  <span className="text-xs opacity-75">Tax-deductible donation</span>
                </div>
              </Button>
            ))}
          </div>

          {/* Custom Amount */}
          <div className="space-y-2 pt-4 border-t border-slate-700">
            <label className="text-sm font-medium text-slate-300">Custom Amount (USD)</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-2.5 text-slate-400">$</span>
                <Input
                  type="number"
                  placeholder="Enter custom amount"
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value);
                    setSelectedAmount(null);
                  }}
                  className="pl-8 bg-slate-700 border-slate-600 text-white placeholder-slate-500"
                  min="1"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Donor Information */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Donor Information</CardTitle>
          <CardDescription>We'll use this to send your tax receipt</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 block">Full Name (Optional)</label>
            <Input
              type="text"
              placeholder="Your name"
              value={donorName}
              onChange={(e) => setDonorName(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white placeholder-slate-500"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 block">Email Address *</label>
            <Input
              type="email"
              placeholder="your@email.com"
              value={donorEmail}
              onChange={(e) => setDonorEmail(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white placeholder-slate-500"
              required
            />
          </div>
        </CardContent>
      </Card>

      {/* Impact Summary */}
      {finalAmount > 0 && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Your Impact</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-slate-300">
                <span>Donation Amount:</span>
                <span className="font-semibold text-cyan-400">${finalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Broadcast Hours Supported:</span>
                <span className="font-semibold text-green-400">{(finalAmount / 25).toFixed(1)} hours</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Tax Deductible:</span>
                <span className="font-semibold text-yellow-400">Yes ✓</span>
              </div>
              <div className="pt-2 border-t border-slate-700 flex justify-between text-slate-300">
                <span>Total:</span>
                <span className="font-bold text-lg text-red-400">${finalAmount.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status Messages */}
      {status === 'success' && (
        <Card className="bg-green-900/50 border-green-700">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="text-green-400" size={24} />
              <div>
                <p className="font-semibold text-green-400">Thank You!</p>
                <p className="text-sm text-green-300">{message}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {status === 'error' && (
        <Card className="bg-red-900/50 border-red-700">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="text-red-400" size={24} />
              <div>
                <p className="font-semibold text-red-400">Error</p>
                <p className="text-sm text-red-300">{message}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Donate Button */}
      <Button
        onClick={handleDonate}
        disabled={isProcessing || finalAmount < 1}
        className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-semibold text-lg"
      >
        {isProcessing ? (
          <>
            <Loader size={18} className="mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Heart size={18} className="mr-2" />
            Donate ${finalAmount.toFixed(2)} to RRB
          </>
        )}
      </Button>

      {/* Tax Receipt Info */}
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="pt-6">
          <p className="text-sm text-slate-400">
            <strong>Tax Receipt:</strong> A tax receipt will be sent to your email address immediately after your donation is processed. RRB's EIN is available upon request.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
