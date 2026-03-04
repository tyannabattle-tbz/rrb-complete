import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, Globe, Users, TrendingUp } from 'lucide-react';
import { trpc } from '@/lib/trpc';

export default function SweetMiraclesDonation() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    donateInNameOf: '',
    amount: '30',
  });

  const [donationStatus, setDonationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDonate = async () => {
    setDonationStatus('loading');
    try {
      // Create checkout session
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(formData.amount) * 100,
          email: formData.email,
          metadata: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            donateInNameOf: formData.donateInNameOf,
            organization: 'Sweet Miracles',
          },
        }),
      });

      const { sessionId } = await response.json();
      
      // Redirect to Stripe checkout
      window.location.href = `https://checkout.stripe.com/pay/${sessionId}`;
      setDonationStatus('success');
    } catch (error) {
      console.error('Donation error:', error);
      setDonationStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-slate-900 to-orange-900">
      {/* Header */}
      <header className="border-b border-green-500/20 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Heart className="w-8 h-8 text-red-400 animate-pulse" />
              <div>
                <h1 className="text-3xl font-bold text-white">Sweet Miracles</h1>
                <p className="text-sm text-green-300">"A Voice for the Voiceless" • 501(c)(3) & 508 Organization</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
                ✓ Verified 501(c)(3)
              </Badge>
              <a
                href="https://sweetmiraclesattt.wixsite.com/sweet-miracles"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-400 hover:text-green-300 text-sm underline"
              >
                Visit Main Site →
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-white mb-4">
            Support Our Mission
          </h2>
          <p className="text-xl text-green-300 mb-8 max-w-3xl mx-auto">
            Sweet Miracles is dedicated to advocating for change and justice for seniors and the elderly. 
            Your donation helps us provide support, awareness, and care to vulnerable populations.
          </p>
        </div>

        {/* Mission Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <Card className="bg-slate-800/50 border-green-500/20 hover:border-green-500/50 transition-all">
            <CardContent className="pt-6">
              <Users className="w-12 h-12 text-green-400 mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Community Outreach</h3>
              <p className="text-sm text-gray-300">
                Reaching seniors and elderly populations with support and advocacy
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-green-500/20 hover:border-green-500/50 transition-all">
            <CardContent className="pt-6">
              <Globe className="w-12 h-12 text-orange-400 mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Policy Change</h3>
              <p className="text-sm text-gray-300">
                Advocating for policies that improve quality of life for vulnerable populations
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-green-500/20 hover:border-green-500/50 transition-all">
            <CardContent className="pt-6">
              <TrendingUp className="w-12 h-12 text-yellow-400 mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Lasting Impact</h3>
              <p className="text-sm text-gray-300">
                Creating sustainable change through partnerships and community collaboration
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Donation Form */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Form */}
          <Card className="bg-gradient-to-br from-green-600/20 to-orange-600/20 border-green-500/50">
            <CardHeader>
              <CardTitle className="text-2xl">Donate Now</CardTitle>
              <CardDescription className="text-green-300">
                Help us make a difference in the lives of seniors and elderly
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-slate-800 border border-green-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-slate-800 border border-green-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-slate-800 border border-green-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Donate in the name of
                </label>
                <input
                  type="text"
                  name="donateInNameOf"
                  value={formData.donateInNameOf}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-slate-800 border border-green-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
                  placeholder="(Optional) Someone special"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Donation Amount
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-green-400">$</span>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    className="flex-1 px-4 py-2 bg-slate-800 border border-green-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500 text-2xl font-bold"
                    placeholder="30"
                    min="1"
                  />
                </div>
              </div>

              {/* Quick Amount Buttons */}
              <div className="grid grid-cols-4 gap-2 pt-2">
                {[10, 25, 50, 100].map(amount => (
                  <button
                    key={amount}
                    onClick={() => setFormData(prev => ({ ...prev, amount: amount.toString() }))}
                    className={`px-3 py-2 rounded-lg font-semibold transition-all ${
                      formData.amount === amount.toString()
                        ? 'bg-green-600 text-white'
                        : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                    }`}
                  >
                    ${amount}
                  </button>
                ))}
              </div>

              <Button
                onClick={handleDonate}
                disabled={donationStatus === 'loading' || !formData.email || !formData.firstName}
                className="w-full bg-gradient-to-r from-green-600 to-orange-600 hover:from-green-700 hover:to-orange-700 text-white font-bold py-3"
                size="lg"
              >
                {donationStatus === 'loading' ? 'Processing...' : `Donate $${formData.amount}`}
              </Button>

              {donationStatus === 'error' && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-300 text-sm">
                  An error occurred. Please try again.
                </div>
              )}

              <p className="text-xs text-gray-400 text-center">
                Your donation is secure and processed through Stripe. 
                You will receive a receipt via email.
              </p>
            </CardContent>
          </Card>

          {/* Impact Info */}
          <div className="space-y-6">
            <Card className="bg-slate-800/50 border-green-500/20">
              <CardHeader>
                <CardTitle className="text-2xl">Your Impact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-400 mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="font-semibold text-white">$10</p>
                      <p className="text-sm text-gray-300">Supports awareness campaign materials</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-400 mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="font-semibold text-white">$25</p>
                      <p className="text-sm text-gray-300">Provides support services for one senior</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-400 mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="font-semibold text-white">$50</p>
                      <p className="text-sm text-gray-300">Funds community outreach program</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-400 mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="font-semibold text-white">$100+</p>
                      <p className="text-sm text-gray-300">Supports policy advocacy and change</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-green-500/20">
              <CardHeader>
                <CardTitle className="text-lg">Our Mission</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 mb-4">
                  "Love Thyself First, Only Then Can You Love Others" - Ty Battle
                </p>
                <p className="text-sm text-gray-400">
                  Sweet Miracles is committed to being "A Voice for the Voiceless" and creating lasting change 
                  for seniors and elderly populations through advocacy, awareness, and community support.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-green-500/20">
              <CardHeader>
                <CardTitle className="text-lg">Tax Information</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-300">
                  Sweet Miracles is a registered 501(c)(3) and 508 organization. 
                  Your donation is tax-deductible. A receipt will be sent to your email.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-green-500/20 bg-slate-900/50 mt-16 py-8">
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p className="mb-2">
            Sweet Miracles • "A Voice for the Voiceless"
          </p>
          <p className="text-sm">
            501(c)(3) & 508 Organization • Supporting Senior and Elderly Advocacy
          </p>
        </div>
      </footer>
    </div>
  );
}
