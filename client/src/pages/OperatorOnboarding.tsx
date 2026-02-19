import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  CheckCircle,
  AlertCircle,
  Mail,
  Settings,
  Users,
  Radio,
  TrendingUp,
  ArrowRight,
  Upload,
  Eye,
  EyeOff,
} from 'lucide-react';

type OnboardingStep = 'welcome' | 'email-verification' | 'company-info' | 'credentials' | 'training' | 'complete';

interface OnboardingData {
  companyName: string;
  operatorName: string;
  email: string;
  phone: string;
  website: string;
  youtubeStreamKey: string;
  twitchStreamKey: string;
  trainingCompleted: boolean;
}

export function OperatorOnboarding() {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationSent, setVerificationSent] = useState(false);
  const [showStreamKeys, setShowStreamKeys] = useState(false);
  const [formData, setFormData] = useState<OnboardingData>({
    companyName: '',
    operatorName: '',
    email: '',
    phone: '',
    website: '',
    youtubeStreamKey: '',
    twitchStreamKey: '',
    trainingCompleted: false,
  });

  const handleInputChange = (field: keyof OnboardingData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSendVerification = () => {
    setVerificationSent(true);
    // In production, this would send an email
  };

  const handleVerifyEmail = () => {
    if (verificationCode === '123456') {
      setCurrentStep('company-info');
    } else {
      alert('Invalid verification code');
    }
  };

  const handleCompleteCompanyInfo = () => {
    if (formData.companyName && formData.operatorName && formData.email) {
      setCurrentStep('credentials');
    }
  };

  const handleCompleteCredentials = () => {
    if (formData.youtubeStreamKey || formData.twitchStreamKey) {
      setCurrentStep('training');
    }
  };

  const handleCompleteTraining = () => {
    setCurrentStep('complete');
  };

  const completionPercentage = {
    'welcome': 0,
    'email-verification': 20,
    'company-info': 40,
    'credentials': 60,
    'training': 80,
    'complete': 100,
  }[currentStep];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black">
      {/* Progress Bar */}
      <div className="bg-black bg-opacity-50 border-b border-gray-700 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-2xl font-bold text-white">Operator Setup</h1>
            <span className="text-orange-400 font-semibold">{completionPercentage}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Welcome Step */}
        {currentStep === 'welcome' && (
          <Card className="bg-gray-800 border-gray-700 p-8 space-y-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto">
                <Radio className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white">Welcome to Rockin' Rockin' Boogie</h2>
              <p className="text-gray-300 text-lg">
                Let's set up your operator account in just a few minutes. You'll have access to professional broadcasting tools, multi-platform streaming, and comprehensive analytics.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-6">
              <div className="p-4 bg-gray-700 rounded-lg text-center">
                <Radio className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                <p className="text-white font-semibold">Multi-Platform</p>
                <p className="text-gray-400 text-sm">Stream to YouTube, Twitch, Facebook</p>
              </div>
              <div className="p-4 bg-gray-700 rounded-lg text-center">
                <TrendingUp className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                <p className="text-white font-semibold">Analytics</p>
                <p className="text-gray-400 text-sm">Real-time metrics and insights</p>
              </div>
              <div className="p-4 bg-gray-700 rounded-lg text-center">
                <Users className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                <p className="text-white font-semibold">Team Management</p>
                <p className="text-gray-400 text-sm">Invite broadcasters and moderators</p>
              </div>
            </div>

            <Button
              onClick={() => setCurrentStep('email-verification')}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 gap-2"
            >
              Get Started <ArrowRight className="w-4 h-4" />
            </Button>
          </Card>
        )}

        {/* Email Verification Step */}
        {currentStep === 'email-verification' && (
          <Card className="bg-gray-800 border-gray-700 p-8 space-y-6">
            <div className="text-center space-y-2">
              <Mail className="w-12 h-12 text-orange-400 mx-auto" />
              <h2 className="text-2xl font-bold text-white">Verify Your Email</h2>
              <p className="text-gray-300">We'll send a verification code to confirm your email address</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-white text-sm font-semibold">Email Address</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="your@email.com"
                  className="mt-2 bg-gray-700 border-gray-600 text-white"
                />
              </div>

              {!verificationSent ? (
                <Button
                  onClick={handleSendVerification}
                  className="w-full bg-orange-600 hover:bg-orange-700"
                >
                  Send Verification Code
                </Button>
              ) : (
                <>
                  <div className="p-4 bg-green-900 bg-opacity-30 border border-green-700 rounded-lg">
                    <p className="text-green-400 text-sm">
                      ✓ Verification code sent to {formData.email}
                    </p>
                  </div>
                  <div>
                    <label className="text-white text-sm font-semibold">Verification Code</label>
                    <Input
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      placeholder="Enter 6-digit code"
                      className="mt-2 bg-gray-700 border-gray-600 text-white"
                    />
                    <p className="text-gray-400 text-xs mt-2">Demo code: 123456</p>
                  </div>
                  <Button
                    onClick={handleVerifyEmail}
                    className="w-full bg-orange-600 hover:bg-orange-700"
                  >
                    Verify Email
                  </Button>
                </>
              )}
            </div>
          </Card>
        )}

        {/* Company Info Step */}
        {currentStep === 'company-info' && (
          <Card className="bg-gray-800 border-gray-700 p-8 space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">Company Information</h2>
              <p className="text-gray-300">Tell us about your broadcasting company</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-white text-sm font-semibold">Company Name</label>
                <Input
                  value={formData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  placeholder="Your Company Name"
                  className="mt-2 bg-gray-700 border-gray-600 text-white"
                />
              </div>

              <div>
                <label className="text-white text-sm font-semibold">Operator Name</label>
                <Input
                  value={formData.operatorName}
                  onChange={(e) => handleInputChange('operatorName', e.target.value)}
                  placeholder="Your Name"
                  className="mt-2 bg-gray-700 border-gray-600 text-white"
                />
              </div>

              <div>
                <label className="text-white text-sm font-semibold">Phone Number</label>
                <Input
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="mt-2 bg-gray-700 border-gray-600 text-white"
                />
              </div>

              <div>
                <label className="text-white text-sm font-semibold">Website (Optional)</label>
                <Input
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  placeholder="https://yourwebsite.com"
                  className="mt-2 bg-gray-700 border-gray-600 text-white"
                />
              </div>

              <Button
                onClick={handleCompleteCompanyInfo}
                className="w-full bg-orange-600 hover:bg-orange-700"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        )}

        {/* Streaming Credentials Step */}
        {currentStep === 'credentials' && (
          <Card className="bg-gray-800 border-gray-700 p-8 space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">Streaming Credentials</h2>
              <p className="text-gray-300">Connect your YouTube and Twitch accounts for multi-platform streaming</p>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-gray-700 rounded-lg border border-gray-600">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-semibold">YouTube Live</h3>
                  <CheckCircle className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <label className="text-gray-300 text-sm font-semibold">Stream Key</label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      type={showStreamKeys ? 'text' : 'password'}
                      value={formData.youtubeStreamKey}
                      onChange={(e) => handleInputChange('youtubeStreamKey', e.target.value)}
                      placeholder="Your YouTube stream key"
                      className="flex-1 bg-gray-600 border-gray-500 text-white"
                    />
                    <Button
                      size="sm"
                      className="bg-gray-600 hover:bg-gray-500"
                      onClick={() => setShowStreamKeys(!showStreamKeys)}
                    >
                      {showStreamKeys ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gray-700 rounded-lg border border-gray-600">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-semibold">Twitch</h3>
                  <AlertCircle className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <label className="text-gray-300 text-sm font-semibold">Stream Key (Optional)</label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      type={showStreamKeys ? 'text' : 'password'}
                      value={formData.twitchStreamKey}
                      onChange={(e) => handleInputChange('twitchStreamKey', e.target.value)}
                      placeholder="Your Twitch stream key"
                      className="flex-1 bg-gray-600 border-gray-500 text-white"
                    />
                    <Button
                      size="sm"
                      className="bg-gray-600 hover:bg-gray-500"
                      onClick={() => setShowStreamKeys(!showStreamKeys)}
                    >
                      {showStreamKeys ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleCompleteCredentials}
                className="w-full bg-orange-600 hover:bg-orange-700"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        )}

        {/* Training Step */}
        {currentStep === 'training' && (
          <Card className="bg-gray-800 border-gray-700 p-8 space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">Quick Training</h2>
              <p className="text-gray-300">Learn the basics of broadcasting on our platform</p>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-gray-700 rounded-lg">
                <h3 className="text-white font-semibold mb-2">📡 Getting Started</h3>
                <p className="text-gray-300 text-sm">
                  Learn how to create channels, schedule broadcasts, and manage your team. Our platform supports simultaneous streaming to YouTube, Twitch, and Facebook.
                </p>
              </div>

              <div className="p-4 bg-gray-700 rounded-lg">
                <h3 className="text-white font-semibold mb-2">📊 Analytics</h3>
                <p className="text-gray-300 text-sm">
                  Track viewer metrics, engagement rates, and revenue in real-time. Use insights to optimize your content strategy.
                </p>
              </div>

              <div className="p-4 bg-gray-700 rounded-lg">
                <h3 className="text-white font-semibold mb-2">💰 Monetization</h3>
                <p className="text-gray-300 text-sm">
                  Enable subscriptions, donations, and sponsorships. Manage payouts and track revenue by broadcast.
                </p>
              </div>

              <div className="p-4 bg-gray-700 rounded-lg">
                <h3 className="text-white font-semibold mb-2">👥 Team Management</h3>
                <p className="text-gray-300 text-sm">
                  Invite broadcasters, moderators, and team members. Assign roles and manage permissions.
                </p>
              </div>

              <Button
                onClick={handleCompleteTraining}
                className="w-full bg-orange-600 hover:bg-orange-700"
              >
                Complete Setup <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        )}

        {/* Complete Step */}
        {currentStep === 'complete' && (
          <Card className="bg-gray-800 border-gray-700 p-8 space-y-6 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-white">Setup Complete!</h2>
              <p className="text-gray-300 text-lg">
                Your operator account is ready. You can now start creating channels and broadcasting to your audience.
              </p>
            </div>

            <div className="p-4 bg-green-900 bg-opacity-30 border border-green-700 rounded-lg">
              <p className="text-green-400 font-semibold">
                Welcome, {formData.operatorName}! 🎉
              </p>
              <p className="text-green-300 text-sm mt-1">
                Your company {formData.companyName} is now live on the platform.
              </p>
            </div>

            <Button
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3"
            >
              Go to Dashboard
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
