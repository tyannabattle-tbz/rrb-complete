import React, { useState } from 'react';
import { useUserCapability, CapabilityLevel } from '@/hooks/useUserCapability';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronRight, CheckCircle } from 'lucide-react';

interface OnboardingWizardProps {
  onComplete?: () => void;
}

/**
 * Onboarding Wizard Component
 * Guides new users through capability assessment and preference setup
 */
export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ onComplete }) => {
  const { profile, setCapabilityLevel, updateAccessibility } = useUserCapability();
  const [step, setStep] = useState(0);
  const [selectedLevel, setSelectedLevel] = useState<CapabilityLevel>(profile.level);
  const [selectedAccessibility, setSelectedAccessibility] = useState<string[]>([]);

  const steps = [
    {
      title: 'Welcome to the Future-Past Bridge',
      description: 'This system adapts to your skill level and needs',
    },
    {
      title: 'What is your technical comfort level?',
      description: 'This helps us show the right features for you',
    },
    {
      title: 'Do you need accessibility features?',
      description: 'We support many accessibility options',
    },
    {
      title: 'You are all set!',
      description: 'Your experience is now personalized',
    },
  ];

  const handleNext = () => {
    if (step === 1) {
      setCapabilityLevel(selectedLevel);
    }
    if (step === 2) {
      if (selectedAccessibility.includes('highContrast')) {
        updateAccessibility({ highContrast: true });
      }
      if (selectedAccessibility.includes('largeText')) {
        updateAccessibility({ largeText: true });
      }
      if (selectedAccessibility.includes('reducedMotion')) {
        updateAccessibility({ reducedMotion: true });
      }
      if (selectedAccessibility.includes('dyslexiaFont')) {
        updateAccessibility({ dyslexiaFont: true });
      }
      if (selectedAccessibility.includes('screenReader')) {
        updateAccessibility({ screenReaderOptimized: true });
      }
      if (selectedAccessibility.includes('voiceControl')) {
        updateAccessibility({ voiceControl: true });
      }
    }

    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete?.();
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
        {/* Progress Bar */}
        <div className="h-1 bg-slate-700">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-300"
            style={{ width: `${((step + 1) / steps.length) * 100}%` }}
          />
        </div>

        <CardHeader>
          <CardTitle className="text-2xl">{steps[step].title}</CardTitle>
          <CardDescription>{steps[step].description}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Step 0: Welcome */}
          {step === 0 && (
            <div className="space-y-4">
              <div className="p-6 rounded-lg bg-gradient-to-br from-purple-900/50 to-blue-900/50 border border-purple-500/20">
                <h3 className="text-lg font-semibold text-white mb-3">🌉 A Bridge Between Past and Future</h3>
                <p className="text-slate-300 mb-3">
                  This system connects the wisdom of the past with the technology of the future. It adapts to you—whether
                  you're just starting out or an advanced operator.
                </p>
                <ul className="space-y-2 text-slate-300 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    Works for everyone, at any skill level
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    Learns from how you use it
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    Fully accessible and customizable
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* Step 1: Capability Level */}
          {step === 1 && (
            <div className="space-y-3">
              {[
                {
                  level: 'beginner' as CapabilityLevel,
                  title: '👶 Beginner',
                  description: 'New to technology or this system. I want guided help.',
                  icon: '🌱',
                },
                {
                  level: 'intermediate' as CapabilityLevel,
                  title: '🚀 Intermediate',
                  description: 'Comfortable with technology. I want standard features.',
                  icon: '📈',
                },
                {
                  level: 'advanced' as CapabilityLevel,
                  title: '⚡ Advanced',
                  description: 'Tech-savvy. I want power user features.',
                  icon: '🔧',
                },
                {
                  level: 'operator' as CapabilityLevel,
                  title: '🎛️ Operator',
                  description: 'Expert user. I need complete control.',
                  icon: '🏆',
                },
              ].map((option) => (
                <button
                  key={option.level}
                  onClick={() => setSelectedLevel(option.level)}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                    selectedLevel === option.level
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-slate-600 bg-slate-800/50 hover:border-slate-500'
                  }`}
                >
                  <p className="font-semibold text-white">{option.title}</p>
                  <p className="text-sm text-slate-400">{option.description}</p>
                </button>
              ))}
            </div>
          )}

          {/* Step 2: Accessibility */}
          {step === 2 && (
            <div className="space-y-3">
              <p className="text-sm text-slate-300 mb-4">Select any that apply to you (you can change these anytime):</p>

              {[
                { id: 'highContrast', label: '🎨 High Contrast Mode', description: 'Better visibility' },
                { id: 'largeText', label: '📝 Large Text', description: 'Easier to read' },
                { id: 'reducedMotion', label: '⏸️ Reduced Motion', description: 'Less animations' },
                { id: 'dyslexiaFont', label: '🔤 Dyslexia-Friendly Font', description: 'OpenDyslexic font' },
                { id: 'screenReader', label: '🔊 Screen Reader Support', description: 'Audio descriptions' },
                { id: 'voiceControl', label: '🎤 Voice Control', description: 'Speak commands' },
              ].map((option) => (
                <label
                  key={option.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 cursor-pointer hover:bg-slate-800 transition-colors border border-slate-700"
                >
                  <input
                    type="checkbox"
                    checked={selectedAccessibility.includes(option.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedAccessibility([...selectedAccessibility, option.id]);
                      } else {
                        setSelectedAccessibility(selectedAccessibility.filter((id) => id !== option.id));
                      }
                    }}
                    className="w-4 h-4"
                  />
                  <div>
                    <p className="font-medium text-white">{option.label}</p>
                    <p className="text-xs text-slate-400">{option.description}</p>
                  </div>
                </label>
              ))}
            </div>
          )}

          {/* Step 3: Complete */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="p-6 rounded-lg bg-gradient-to-br from-green-900/50 to-emerald-900/50 border border-green-500/20 text-center">
                <div className="text-5xl mb-3">✨</div>
                <h3 className="text-lg font-semibold text-white mb-2">You're Ready!</h3>
                <p className="text-slate-300">
                  Your experience is now personalized. The system will learn from how you use it and adapt over time.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                <p className="text-sm text-slate-300">
                  <strong>Pro tip:</strong> You can always change your settings by clicking the settings icon in the
                  bottom right corner.
                </p>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 pt-6">
            <Button
              onClick={handleBack}
              disabled={step === 0}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Back
            </Button>
            <Button
              onClick={handleNext}
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white flex items-center justify-center gap-2"
            >
              {step === steps.length - 1 ? 'Get Started' : 'Next'}
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingWizard;
