import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Radio, AlertCircle, Gift, ChevronRight } from 'lucide-react';

interface Step {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: string;
  color: string;
}

const QUICK_START_STEPS: Step[] = [
  {
    id: 'listen',
    title: 'Listen to RRB Radio',
    description: 'Tune into 24/7 broadcasts with 10 Solfeggio frequencies for healing and wellness',
    icon: <Radio className="w-8 h-8" />,
    action: 'Start Listening',
    color: 'from-orange-500/20 to-red-500/20 border-orange-500/30',
  },
  {
    id: 'donate',
    title: 'Support Sweet Miracles',
    description: 'Make a donation to support legacy recovery and community empowerment efforts',
    icon: <Gift className="w-8 h-8" />,
    action: 'Donate Now',
    color: 'from-pink-500/20 to-purple-500/20 border-pink-500/30',
  },
  {
    id: 'emergency',
    title: 'Emergency Response',
    description: 'Access SOS alerts, I\'m OK wellness checks, and emergency responder network',
    icon: <AlertCircle className="w-8 h-8" />,
    action: 'Learn More',
    color: 'from-red-500/20 to-orange-500/20 border-red-500/30',
  },
];

export function QuickStartGuide() {
  const [activeStep, setActiveStep] = useState<string | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  const handleStepClick = (stepId: string) => {
    setActiveStep(activeStep === stepId ? null : stepId);
  };

  const handleComplete = (stepId: string) => {
    const newCompleted = new Set(completedSteps);
    newCompleted.add(stepId);
    setCompletedSteps(newCompleted);
    setActiveStep(null);
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl md:text-4xl font-bold text-white">
          Get Started in 3 Steps
        </h2>
        <p className="text-gray-400 text-lg">
          Access radio, donate, or report emergencies — all in minutes
        </p>
      </div>

      {/* Steps */}
      <div className="space-y-4">
        {QUICK_START_STEPS.map((step, index) => (
          <div key={step.id}>
            {/* Step Header */}
            <button
              onClick={() => handleStepClick(step.id)}
              className="w-full text-left"
            >
              <Card
                className={`bg-gradient-to-br ${step.color} p-6 hover:border-opacity-100 transition-all cursor-pointer group`}
              >
                <div className="flex items-start gap-4">
                  {/* Step Number */}
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 group-hover:bg-white/20 transition-all">
                      {completedSteps.has(step.id) ? (
                        <span className="text-lg font-bold text-green-400">✓</span>
                      ) : (
                        <span className="text-lg font-bold text-white">{index + 1}</span>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-1">
                      {step.title}
                    </h3>
                    <p className="text-gray-300 text-sm">{step.description}</p>
                  </div>

                  {/* Icon and Chevron */}
                  <div className="flex-shrink-0 flex items-center gap-3">
                    <div className="text-gray-400 group-hover:text-white transition-colors">
                      {step.icon}
                    </div>
                    <ChevronRight
                      className={`w-5 h-5 text-gray-400 transition-transform ${
                        activeStep === step.id ? 'rotate-90' : ''
                      }`}
                    />
                  </div>
                </div>
              </Card>
            </button>

            {/* Expanded Content */}
            {activeStep === step.id && (
              <div className="mt-2 p-4 bg-gray-800/50 border border-gray-700/50 rounded-lg space-y-4">
                <div className="space-y-2">
                  <p className="text-gray-300">
                    {step.id === 'listen' &&
                      'Access our 24/7 radio stream with vintage tuner interface. Select from 10 Solfeggio frequencies (default 432Hz) for healing and wellness. Adjust volume, play/pause, and enjoy real-time listener engagement.'}
                    {step.id === 'donate' &&
                      'Support Sweet Miracles Foundation (501c3/508c) with one-time or monthly donations. Your contribution directly funds legacy recovery, community empowerment, and generational wealth creation through Canryn Production.'}
                    {step.id === 'emergency' &&
                      'Activate SOS alerts with location tracking for immediate responder dispatch. Send I\'m OK wellness checks to loved ones. Access 24/7 emergency responder network (medical, security, mental-health specialists).'}
                  </p>
                </div>

                <Button
                  onClick={() => handleComplete(step.id)}
                  className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-semibold"
                >
                  {step.action}
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Progress Indicator */}
      <div className="mt-8 pt-6 border-t border-gray-800">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <p className="text-gray-400 text-sm font-medium">Your Progress</p>
            <p className="text-orange-400 font-semibold">
              {completedSteps.size} of {QUICK_START_STEPS.length} completed
            </p>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-orange-500 to-pink-500 h-full transition-all duration-300"
              style={{
                width: `${(completedSteps.size / QUICK_START_STEPS.length) * 100}%`,
              }}
            />
          </div>
        </div>

        {completedSteps.size === QUICK_START_STEPS.length && (
          <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-center">
            <p className="text-green-400 font-semibold">
              🎉 Welcome to RRB! You're all set to explore the full ecosystem.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
