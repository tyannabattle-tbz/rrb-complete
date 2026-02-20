import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Mic,
  Package,
  Film,
  Bell,
  BarChart3,
  Zap,
  X,
  ChevronRight,
  CheckCircle,
} from 'lucide-react';
import { toast } from 'sonner';

interface TourStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
  action?: {
    label: string;
    onClick: () => void;
  };
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'voice-commands',
    title: 'Voice Commands',
    description:
      'Control Qumus with your voice. Speak naturally to execute commands, generate content, and manage your workflow.',
    icon: <Mic className="w-8 h-8 text-blue-600" />,
    features: [
      'Hands-free control with natural language',
      'Real-time transcript display',
      'Command history and replay',
      'Multi-language support',
    ],
    action: {
      label: 'Try Voice Commands',
      onClick: () => toast.info('Voice feature available in the top toolbar'),
    },
  },
  {
    id: 'batch-processing',
    title: 'Batch Processing',
    description:
      'Process multiple videos simultaneously with intelligent queue management, priority scheduling, and real-time progress tracking.',
    icon: <Package className="w-8 h-8 text-purple-600" />,
    features: [
      'Process 100+ videos concurrently',
      'Priority-based scheduling',
      'Automatic retry on failure',
      'Resource allocation optimization',
    ],
    action: {
      label: 'Explore Batch Processing',
      onClick: () => toast.info('Batch processing dashboard available in Production menu'),
    },
  },
  {
    id: 'storyboarding',
    title: 'AI Storyboarding',
    description:
      'Automatically generate visual storyboards from scripts with AI-powered scene breakdown, shot composition, and lighting suggestions.',
    icon: <Film className="w-8 h-8 text-green-600" />,
    features: [
      'Script parsing with NLP',
      'Automatic scene breakdown',
      'Shot composition suggestions',
      'Color palette generation',
    ],
    action: {
      label: 'Start Storyboarding',
      onClick: () => toast.info('Storyboarding engine available in Production menu'),
    },
  },
  {
    id: 'notifications',
    title: 'Smart Notifications',
    description:
      'Get real-time alerts for job completions, system issues, and performance metrics. Customize notification preferences.',
    icon: <Bell className="w-8 h-8 text-orange-600" />,
    features: [
      'Real-time job status updates',
      'System health alerts',
      'Performance warnings',
      'Custom notification rules',
    ],
    action: {
      label: 'View Notifications',
      onClick: () => toast.info('Notification center available in the main menu'),
    },
  },
  {
    id: 'analytics',
    title: 'Advanced Analytics',
    description:
      'Track performance metrics, export reports, and gain insights into your production workflow with comprehensive dashboards.',
    icon: <BarChart3 className="w-8 h-8 text-red-600" />,
    features: [
      'Real-time performance metrics',
      'CSV/PDF export capabilities',
      'Historical data analysis',
      'Trend visualization',
    ],
    action: {
      label: 'View Analytics',
      onClick: () => toast.info('Analytics dashboard available in the main menu'),
    },
  },
  {
    id: 'templates',
    title: 'Job Templates',
    description:
      'Save time with pre-built templates for common workflows. Create, clone, and apply templates to accelerate batch processing setup.',
    icon: <Zap className="w-8 h-8 text-yellow-600" />,
    features: [
      '3 pre-built templates included',
      'Clone and customize templates',
      'One-click template application',
      'Template sharing and management',
    ],
    action: {
      label: 'Browse Templates',
      onClick: () => toast.info('Template manager available in the main menu'),
    },
  },
];

export default function FeatureOnboardingTour() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isOpen, setIsOpen] = useState(true);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  // Load tour state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('qumus-tour-state');
    if (savedState) {
      const state = JSON.parse(savedState);
      setCurrentStep(state.currentStep || 0);
      setCompletedSteps(state.completedSteps || []);
      setIsOpen(state.isOpen !== false);
    }
  }, []);

  // Save tour state to localStorage
  useEffect(() => {
    localStorage.setItem(
      'qumus-tour-state',
      JSON.stringify({
        currentStep,
        completedSteps,
        isOpen,
      })
    );
  }, [currentStep, completedSteps, isOpen]);

  const step = TOUR_STEPS[currentStep];
  const progress = ((currentStep + 1) / TOUR_STEPS.length) * 100;

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      markStepComplete();
      setCurrentStep(currentStep + 1);
    } else {
      completeTour();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const markStepComplete = () => {
    if (!completedSteps.includes(step.id)) {
      setCompletedSteps([...completedSteps, step.id]);
    }
  };

  const completeTour = () => {
    markStepComplete();
    setIsOpen(false);
    toast.success('Tour completed! You can restart it anytime from the help menu.');
  };

  const skipTour = () => {
    setIsOpen(false);
    toast.info('Tour skipped. You can restart it anytime from the help menu.');
  };

  const restartTour = () => {
    setCurrentStep(0);
    setCompletedSteps([]);
    setIsOpen(true);
  };

  if (!isOpen) {
    return (
      <Button
        onClick={restartTour}
        variant="outline"
        size="sm"
        className="fixed bottom-4 right-4 z-40"
      >
        📚 Restart Tour
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              {step.icon}
              <h2 className="text-2xl font-bold text-slate-900">{step.title}</h2>
            </div>
            <p className="text-slate-600">{step.description}</p>
          </div>
          <button
            onClick={skipTour}
            className="text-slate-400 hover:text-slate-600 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <CardContent className="p-6 space-y-6">
          {/* Features List */}
          <div className="space-y-3">
            <h3 className="font-semibold text-slate-900">Key Features:</h3>
            <ul className="space-y-2">
              {step.features.map((feature, index) => (
                <li key={`step-${index}`} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">
                Step {currentStep + 1} of {TOUR_STEPS.length}
              </span>
              <span className="text-slate-600">
                {Math.round(progress)}% Complete
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-blue-600 h-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Step Indicators */}
          <div className="flex gap-2 flex-wrap">
            {TOUR_STEPS.map((s, index) => (
              <button
                key={s.id}
                onClick={() => setCurrentStep(index)}
                className={`w-10 h-10 rounded-full font-semibold transition ${
                  index === currentStep
                    ? 'bg-blue-600 text-white'
                    : completedSteps.includes(s.id)
                      ? 'bg-green-600 text-white'
                      : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }`}
              >
                {completedSteps.includes(s.id) ? '✓' : index + 1}
              </button>
            ))}
          </div>
        </CardContent>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-slate-50">
          <div className="flex gap-2">
            <Button
              onClick={skipTour}
              variant="ghost"
              size="sm"
            >
              Skip Tour
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              variant="outline"
              size="sm"
            >
              Previous
            </Button>

            {step.action && (
              <Button
                onClick={step.action.onClick}
                variant="outline"
                size="sm"
              >
                {step.action.label}
              </Button>
            )}

            <Button
              onClick={handleNext}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              {currentStep === TOUR_STEPS.length - 1 ? (
                'Complete Tour'
              ) : (
                <>
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Tip */}
        <div className="px-6 py-3 bg-blue-50 border-t text-sm text-blue-900">
          💡 <strong>Tip:</strong> You can click on any step indicator above to jump to that feature.
        </div>
      </Card>
    </div>
  );
}
