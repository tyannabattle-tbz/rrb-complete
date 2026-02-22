import { useState } from 'react';
import { ChevronRight, ChevronLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/_core/hooks/useAuth';
import { useLocation } from 'wouter';

interface OnboardingStep {
  id: number;
  title: string;
  description: string;
}

interface BroadcasterData {
  platformName: string;
  email: string;
  platform: 'squadd' | 'solbones' | 'other';
  rtmpUrl: string;
  streamKey: string;
  moderators: string[];
  logoUrl: string;
  description: string;
  primaryColor: string;
}

const steps: OnboardingStep[] = [
  { id: 1, title: 'Basic Information', description: 'Tell us about your platform' },
  { id: 2, title: 'Streaming Setup', description: 'Configure RTMP and stream keys' },
  { id: 3, title: 'Team & Moderators', description: 'Add your broadcast team' },
  { id: 4, title: 'Branding', description: 'Customize your platform appearance' },
  { id: 5, title: 'Review & Confirm', description: 'Finalize your setup' },
];

export default function BroadcasterOnboarding() {
  const { user } = useAuth({ redirectOnUnauthenticated: true });
  const [, navigate] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<BroadcasterData>({
    platformName: '',
    email: user?.email || '',
    platform: 'other',
    rtmpUrl: '',
    streamKey: '',
    moderators: [],
    logoUrl: '',
    description: '',
    primaryColor: '#EF4444',
  });

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    try {
      const response = await fetch('/api/trpc/broadcaster.onboarding.completeOnboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (response.ok) {
        navigate(`/broadcaster/${data.platform}/dashboard`);
      }
    } catch (error) {
      console.error('Onboarding error:', error);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Platform Name</label>
              <Input
                placeholder="e.g., SQUADD Broadcast"
                value={data.platformName}
                onChange={(e) => setData({ ...data, platformName: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <Input
                type="email"
                placeholder="your@email.com"
                value={data.email}
                onChange={(e) => setData({ ...data, email: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Platform Type</label>
              <select
                className="w-full px-3 py-2 border border-border rounded-md"
                value={data.platform}
                onChange={(e) => setData({ ...data, platform: e.target.value as any })}
              >
                <option value="squadd">SQUADD</option>
                <option value="solbones">Solbones Podcast</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">RTMP Server URL</label>
              <Input
                placeholder="rtmp://your-server.com/live"
                value={data.rtmpUrl}
                onChange={(e) => setData({ ...data, rtmpUrl: e.target.value })}
              />
              <p className="text-xs text-muted-foreground mt-1">Your streaming server address</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Stream Key</label>
              <Input
                placeholder="your-stream-key-here"
                type="password"
                value={data.streamKey}
                onChange={(e) => setData({ ...data, streamKey: e.target.value })}
              />
              <p className="text-xs text-muted-foreground mt-1">Keep this secret - never share publicly</p>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Add Moderators</label>
              <div className="space-y-2">
                {data.moderators.map((mod, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Input
                      placeholder="moderator@email.com"
                      value={mod}
                      onChange={(e) => {
                        const newMods = [...data.moderators];
                        newMods[idx] = e.target.value;
                        setData({ ...data, moderators: newMods });
                      }}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newMods = data.moderators.filter((_, i) => i !== idx);
                        setData({ ...data, moderators: newMods });
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                variant="outline"
                className="mt-2"
                onClick={() => setData({ ...data, moderators: [...data.moderators, ''] })}
              >
                + Add Moderator
              </Button>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Platform Description</label>
              <textarea
                className="w-full px-3 py-2 border border-border rounded-md"
                placeholder="Describe your platform..."
                rows={3}
                value={data.description}
                onChange={(e) => setData({ ...data, description: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Primary Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={data.primaryColor}
                  onChange={(e) => setData({ ...data, primaryColor: e.target.value })}
                  className="h-10 w-20 rounded cursor-pointer"
                />
                <span className="text-sm">{data.primaryColor}</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Logo URL (Optional)</label>
              <Input
                placeholder="https://example.com/logo.png"
                value={data.logoUrl}
                onChange={(e) => setData({ ...data, logoUrl: e.target.value })}
              />
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-900">Ready to Launch</h3>
                  <p className="text-sm text-blue-800 mt-1">
                    Your broadcaster platform is configured and ready to go live. Review the details below and click "Complete Setup" to finish.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3 bg-muted p-4 rounded-lg">
              <div>
                <span className="font-medium">Platform:</span> {data.platformName}
              </div>
              <div>
                <span className="font-medium">Type:</span> {data.platform.toUpperCase()}
              </div>
              <div>
                <span className="font-medium">Email:</span> {data.email}
              </div>
              <div>
                <span className="font-medium">Moderators:</span> {data.moderators.filter(m => m).length} added
              </div>
              <div>
                <span className="font-medium">Status:</span> <span className="text-green-600">✓ Ready</span>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Broadcaster Onboarding</h1>
          <p className="text-muted-foreground">Set up your broadcast platform in 5 easy steps</p>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, idx) => (
              <div key={step.id} className="flex items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    currentStep >= step.id
                      ? 'bg-accent text-accent-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {currentStep > step.id ? <CheckCircle2 className="w-5 h-5" /> : step.id}
                </div>
                {idx < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      currentStep > step.id ? 'bg-accent' : 'bg-muted'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="text-center">
            <h2 className="text-xl font-semibold">{steps[currentStep - 1].title}</h2>
            <p className="text-sm text-muted-foreground">{steps[currentStep - 1].description}</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          {renderStepContent()}
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={currentStep === 1}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>

          {currentStep < steps.length ? (
            <Button
              onClick={handleNext}
              className="flex-1 flex items-center justify-center gap-2"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={handleComplete}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              Complete Setup
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
