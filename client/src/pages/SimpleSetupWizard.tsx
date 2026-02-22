import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle2, Circle, ChevronRight } from 'lucide-react';

interface Step {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  action: string;
}

export const SimpleSetupWizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<Step[]>([
    {
      id: 1,
      title: 'Check Internet Connection',
      description: 'Ensure you have a stable internet connection (minimum 10 Mbps)',
      completed: true,
      action: 'Test Connection',
    },
    {
      id: 2,
      title: 'Test Audio & Video',
      description: 'Check your microphone, speakers, and camera are working',
      completed: false,
      action: 'Test Now',
    },
    {
      id: 3,
      title: 'Invite Panelists',
      description: 'Send connection links to Ghana partners and other panelists',
      completed: false,
      action: 'Send Invites',
    },
    {
      id: 4,
      title: 'Configure Stream Output',
      description: 'Set up RTMP endpoint for UN WCS main broadcast',
      completed: false,
      action: 'Configure',
    },
    {
      id: 5,
      title: 'Run Broadcast Test',
      description: 'Do a 5-minute test broadcast to verify everything works',
      completed: false,
      action: 'Start Test',
    },
    {
      id: 6,
      title: 'Ready for Live Event',
      description: 'All systems are ready for the March 17th broadcast',
      completed: false,
      action: 'Go Live',
    },
  ]);

  const completeStep = (index: number) => {
    const newSteps = [...steps];
    newSteps[index].completed = true;
    setSteps(newSteps);
    if (index < steps.length - 1) {
      setCurrentStep(index + 1);
    }
  };

  const progressPercentage = (steps.filter(s => s.completed).length / steps.length) * 100;

  return (
    <div className="w-full max-w-2xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">UN WCS Broadcast Setup</h1>
        <p className="text-gray-600">Get ready for March 17th in 6 simple steps</p>
      </div>

      {/* Progress Bar */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-3">
          <span className="font-semibold">Setup Progress</span>
          <span className="text-2xl font-bold text-blue-600">{Math.round(progressPercentage)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-blue-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </Card>

      {/* Steps */}
      <div className="space-y-3">
        {steps.map((step, index) => (
          <Card
            key={step.id}
            className={`p-4 cursor-pointer transition-all ${
              index === currentStep
                ? 'border-2 border-blue-600 bg-blue-50'
                : step.completed
                ? 'border-2 border-green-200 bg-green-50'
                : 'border-2 border-gray-200'
            }`}
            onClick={() => setCurrentStep(index)}
          >
            <div className="flex items-start gap-4">
              {/* Step Number */}
              <div className="flex-shrink-0 mt-1">
                {step.completed ? (
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                ) : (
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === currentStep
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-300 text-white'
                    }`}
                  >
                    {step.id}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg">{step.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{step.description}</p>
              </div>

              {/* Action Button */}
              <div className="flex-shrink-0">
                {step.completed ? (
                  <span className="text-xs font-semibold text-green-600 bg-green-100 px-3 py-1 rounded-full">
                    ✓ Done
                  </span>
                ) : index === currentStep ? (
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      completeStep(index);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {step.action}
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                ) : (
                  <Circle className="w-5 h-5 text-gray-400" />
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Current Step Details */}
      {!steps[currentStep].completed && (
        <Card className="p-6 bg-blue-50 border-2 border-blue-200">
          <h3 className="font-bold text-lg mb-3">Step {currentStep + 1}: {steps[currentStep].title}</h3>
          <div className="space-y-3">
            <p className="text-gray-700">{steps[currentStep].description}</p>

            {currentStep === 0 && (
              <div className="bg-white p-3 rounded border border-blue-200 text-sm">
                <p>✓ Your connection speed: <strong>50 Mbps</strong> (Excellent)</p>
              </div>
            )}

            {currentStep === 1 && (
              <div className="bg-white p-3 rounded border border-blue-200 text-sm space-y-2">
                <p>🎤 Microphone: <strong className="text-green-600">Connected</strong></p>
                <p>🔊 Speakers: <strong className="text-green-600">Connected</strong></p>
                <p>📹 Camera: <strong className="text-green-600">Connected</strong></p>
              </div>
            )}

            {currentStep === 2 && (
              <div className="bg-white p-3 rounded border border-blue-200 text-sm">
                <p className="mb-2">Send these links to your panelists:</p>
                <code className="block bg-gray-100 p-2 rounded text-xs break-all">
                  https://rockinrockinboogie.manus.space/broadcast-viewer
                </code>
              </div>
            )}

            <Button
              size="lg"
              onClick={() => completeStep(currentStep)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              ✓ Complete Step {currentStep + 1}
            </Button>
          </div>
        </Card>
      )}

      {/* Completion Message */}
      {progressPercentage === 100 && (
        <Card className="p-6 bg-green-50 border-2 border-green-200 text-center">
          <div className="text-4xl mb-3">🎉</div>
          <h3 className="text-xl font-bold text-green-700 mb-2">You're All Set!</h3>
          <p className="text-green-600 mb-4">
            Your broadcast system is ready for the UN WCS event on March 17th.
          </p>
          <Button size="lg" className="w-full bg-green-600 hover:bg-green-700 text-white">
            → Go to Broadcast Control
          </Button>
        </Card>
      )}
    </div>
  );
};

export default SimpleSetupWizard;
