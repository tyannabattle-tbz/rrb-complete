import React, { useState } from 'react';
import { ChevronRight, CheckCircle, Clock, AlertCircle, BookOpen, Users, Zap, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface TrainingModule {
  id: string;
  title: string;
  description: string;
  duration: number; // minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  sections: TrainingSection[];
  completed: boolean;
  progress: number; // 0-100
}

interface TrainingSection {
  id: string;
  title: string;
  content: string;
  videoUrl?: string;
  keyPoints: string[];
  quiz?: QuizQuestion[];
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

const TRAINING_MODULES: TrainingModule[] = [
  {
    id: 'module-1',
    title: 'Platform Basics & Navigation',
    description: 'Learn the RRB platform interface, dashboard layout, and core features',
    duration: 15,
    difficulty: 'beginner',
    completed: false,
    progress: 0,
    sections: [
      {
        id: 'section-1-1',
        title: 'Dashboard Overview',
        content: 'The main dashboard displays real-time call metrics, active listeners, and emergency alerts. The left sidebar provides navigation to all major features.',
        keyPoints: [
          'Dashboard shows live call count and listener metrics',
          'Real-time analytics update every 30 seconds',
          'Emergency alerts appear in red at the top',
          'Sidebar navigation is always accessible',
        ],
        quiz: [
          {
            id: 'q1',
            question: 'How often do dashboard metrics update?',
            options: ['Every 10 seconds', 'Every 30 seconds', 'Every minute', 'Every 5 minutes'],
            correctAnswer: 1,
            explanation: 'Dashboard metrics refresh every 30 seconds to provide near real-time data.',
          },
        ],
      },
      {
        id: 'section-1-2',
        title: 'Call Management Interface',
        content: 'The call management section shows incoming calls, queue position, and caller information. You can accept, screen, or reject calls from here.',
        keyPoints: [
          'Incoming calls appear in the queue list',
          'Caller risk score is displayed (0-100)',
          'Queue position shows estimated wait time',
          'Accept/Reject buttons control call routing',
        ],
      },
      {
        id: 'section-1-3',
        title: 'Emergency Alert System',
        content: 'Emergency alerts (SOS, I\'m OK, Public Safety) appear with color coding and require immediate attention.',
        keyPoints: [
          'Red = Critical emergency (SOS)',
          'Orange = High priority (Public Safety)',
          'Yellow = Medium priority (Weather)',
          'Blue = Low priority (Information)',
        ],
      },
    ],
  },
  {
    id: 'module-2',
    title: 'Call Screening & Risk Assessment',
    description: 'Master caller screening techniques and risk evaluation',
    duration: 20,
    difficulty: 'intermediate',
    completed: false,
    progress: 0,
    sections: [
      {
        id: 'section-2-1',
        title: 'Understanding Caller Risk Scores',
        content: 'Each caller receives a risk score (0-100) based on phone reputation, history, and behavior patterns. Higher scores indicate higher risk.',
        keyPoints: [
          '0-20: Low risk (trusted caller)',
          '21-50: Medium risk (new or neutral)',
          '51-80: High risk (flagged history)',
          '81-100: Critical risk (blocked or dangerous)',
        ],
      },
      {
        id: 'section-2-2',
        title: 'Screening Best Practices',
        content: 'Use the caller information panel to review background before accepting calls. Look for patterns, previous notes, and risk indicators.',
        keyPoints: [
          'Review caller history before accepting',
          'Check for previous SOS or emergency flags',
          'Note any patterns in caller behavior',
          'Consult with coordinator for high-risk callers',
        ],
      },
      {
        id: 'section-2-3',
        title: 'Handling High-Risk Callers',
        content: 'High-risk callers require special handling. Use discretion, involve security if needed, and document all interactions.',
        keyPoints: [
          'Never share personal information',
          'Keep calls brief and professional',
          'Alert security team if threats detected',
          'Document all interactions in notes',
        ],
      },
    ],
  },
  {
    id: 'module-3',
    title: 'Emergency Response Protocols',
    description: 'Critical training for handling SOS and emergency situations',
    duration: 25,
    difficulty: 'advanced',
    completed: false,
    progress: 0,
    sections: [
      {
        id: 'section-3-1',
        title: 'SOS Alert Response',
        content: 'When an SOS alert is triggered, immediate action is required. Follow the escalation chain and notify responders.',
        keyPoints: [
          'Acknowledge SOS within 10 seconds',
          'Confirm caller location and condition',
          'Activate appropriate responder chain',
          'Stay on line with caller until help arrives',
        ],
      },
      {
        id: 'section-3-2',
        title: 'Responder Coordination',
        content: 'Coordinate with medical, security, and volunteer responders. Assign appropriate personnel based on alert type and location.',
        keyPoints: [
          'Medical alerts → Assign medical responders',
          'Security alerts → Assign security team',
          'Mental health → Assign trained counselors',
          'Always assign backup responder',
        ],
      },
      {
        id: 'section-3-3',
        title: 'De-escalation Techniques',
        content: 'Use calm, empathetic communication to de-escalate tense situations. Never argue or dismiss caller concerns.',
        keyPoints: [
          'Speak in calm, steady voice',
          'Validate caller emotions',
          'Offer specific help and resources',
          'Never make promises you can\'t keep',
        ],
      },
      {
        id: 'section-3-4',
        title: 'Post-Emergency Documentation',
        content: 'After emergency resolution, complete detailed documentation for legal and quality assurance purposes.',
        keyPoints: [
          'Record all actions taken',
          'Document responder assignments',
          'Note caller outcome and resolution',
          'Flag for quality review if needed',
        ],
      },
    ],
  },
  {
    id: 'module-4',
    title: 'Analytics & Reporting',
    description: 'Understand metrics, trends, and reporting requirements',
    duration: 15,
    difficulty: 'beginner',
    completed: false,
    progress: 0,
    sections: [
      {
        id: 'section-4-1',
        title: 'Key Performance Indicators',
        content: 'Track important metrics: call completion rate, average handle time, caller satisfaction, and emergency response time.',
        keyPoints: [
          'Completion Rate: % of calls successfully handled',
          'Handle Time: Average call duration',
          'Satisfaction: Caller feedback score',
          'Response Time: Time to acknowledge emergency',
        ],
      },
      {
        id: 'section-4-2',
        title: 'Reading Analytics Dashboards',
        content: 'The analytics dashboard shows trends, patterns, and performance metrics. Use this to improve your performance.',
        keyPoints: [
          'Hourly trends show peak call times',
          'Sentiment analysis shows caller mood',
          'Frequency distribution shows popular channels',
          'Compare your metrics to team averages',
        ],
      },
    ],
  },
  {
    id: 'module-5',
    title: 'Multi-Language Support',
    description: 'Communicate effectively with callers in different languages',
    duration: 10,
    difficulty: 'beginner',
    completed: false,
    progress: 0,
    sections: [
      {
        id: 'section-5-1',
        title: 'Language Detection & Selection',
        content: 'The system auto-detects caller language but allows manual override. Always confirm the preferred language.',
        keyPoints: [
          'System detects browser language automatically',
          'Caller can select preferred language',
          'All UI elements translate in real-time',
          'SMS messages sent in caller\'s language',
        ],
      },
      {
        id: 'section-5-2',
        title: 'Supported Languages',
        content: 'RRB supports 8 languages: English, Spanish, French, German, Portuguese, Japanese, Chinese, and Arabic.',
        keyPoints: [
          'English (🇺🇸) - Default',
          'Spanish (🇪🇸) - Español',
          'French (🇫🇷) - Français',
          'German (🇩🇪) - Deutsch',
          'Portuguese (🇵🇹) - Português',
          'Japanese (🇯🇵) - 日本語',
          'Chinese (🇨🇳) - 中文',
          'Arabic (🇸🇦) - العربية',
        ],
      },
    ],
  },
  {
    id: 'module-6',
    title: 'Wellness & Self-Care',
    description: 'Maintain mental health and prevent burnout',
    duration: 12,
    difficulty: 'beginner',
    completed: false,
    progress: 0,
    sections: [
      {
        id: 'section-6-1',
        title: 'Recognizing Burnout',
        content: 'Operator burnout is common. Recognize the signs and take action to protect your mental health.',
        keyPoints: [
          'Emotional exhaustion from intense calls',
          'Difficulty focusing or concentrating',
          'Increased irritability or frustration',
          'Physical symptoms (headaches, fatigue)',
        ],
      },
      {
        id: 'section-6-2',
        title: 'Self-Care Strategies',
        content: 'Use these strategies to maintain wellbeing and prevent burnout.',
        keyPoints: [
          'Take regular breaks between calls',
          'Use the I\'m OK button to check in with yourself',
          'Practice deep breathing during stressful calls',
          'Debrief with colleagues after difficult calls',
        ],
      },
    ],
  },
];

export function OperatorTrainingProgram() {
  const [selectedModule, setSelectedModule] = useState<TrainingModule | null>(null);
  const [selectedSection, setSelectedSection] = useState<TrainingSection | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [showQuiz, setShowQuiz] = useState(false);

  const completedModules = TRAINING_MODULES.filter(m => m.completed).length;
  const totalModules = TRAINING_MODULES.length;
  const overallProgress = Math.round((completedModules / totalModules) * 100);

  const handleModuleClick = (module: TrainingModule) => {
    setSelectedModule(module);
    setSelectedSection(module.sections[0]);
    setShowQuiz(false);
  };

  const handleSectionClick = (section: TrainingSection) => {
    setSelectedSection(section);
    setShowQuiz(false);
  };

  const handleQuizAnswer = (questionId: string, answerIndex: number) => {
    setQuizAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex,
    }));
  };

  const handleCompleteModule = () => {
    if (selectedModule) {
      const updatedModule = { ...selectedModule, completed: true, progress: 100 };
      setSelectedModule(updatedModule);
      alert(`✅ Module "${selectedModule.title}" completed! Great work!`);
    }
  };

  if (selectedModule && selectedSection) {
    return (
      <div className="w-full bg-gradient-to-br from-slate-900 to-slate-800 text-white min-h-screen">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 border-b border-blue-800">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={() => setSelectedModule(null)}
                className="text-blue-200 hover:text-white mb-2 flex items-center gap-1"
              >
                ← Back to Modules
              </button>
              <h1 className="text-3xl font-bold">{selectedModule.title}</h1>
              <p className="text-blue-200 mt-1">{selectedSection.title}</p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-blue-200">{selectedModule.progress}%</div>
              <p className="text-sm text-blue-300">Progress</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6 p-8">
          {/* Sections Sidebar */}
          <div className="col-span-1 space-y-2">
            {selectedModule.sections.map(section => (
              <button
                key={section.id}
                onClick={() => handleSectionClick(section)}
                className={`w-full text-left p-3 rounded transition-colors ${
                  selectedSection.id === section.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                }`}
              >
                <div className="font-semibold text-sm">{section.title}</div>
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="col-span-2 space-y-6">
            {/* Main Content */}
            <Card className="bg-slate-700 border-slate-600 p-6">
              <h2 className="text-2xl font-bold mb-4 text-white">{selectedSection.title}</h2>
              <p className="text-gray-300 mb-6 leading-relaxed">{selectedSection.content}</p>

              {/* Key Points */}
              <div className="bg-slate-800 p-4 rounded mb-6">
                <h3 className="font-bold text-white mb-3 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  Key Points
                </h3>
                <ul className="space-y-2">
                  {selectedSection.keyPoints.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-gray-300">
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Quiz Section */}
              {selectedSection.quiz && selectedSection.quiz.length > 0 && (
                <div className="bg-blue-900/30 border border-blue-700 p-6 rounded">
                  <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Knowledge Check
                  </h3>

                  {selectedSection.quiz.map(question => (
                    <div key={question.id} className="mb-6 p-4 bg-slate-800 rounded">
                      <p className="text-white font-semibold mb-3">{question.question}</p>
                      <div className="space-y-2">
                        {question.options.map((option, idx) => (
                          <label key={idx} className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="radio"
                              name={question.id}
                              value={idx}
                              checked={quizAnswers[question.id] === idx}
                              onChange={() => handleQuizAnswer(question.id, idx)}
                              className="w-4 h-4"
                            />
                            <span className="text-gray-300">{option}</span>
                          </label>
                        ))}
                      </div>

                      {quizAnswers[question.id] !== undefined && (
                        <div
                          className={`mt-3 p-3 rounded text-sm ${
                            quizAnswers[question.id] === question.correctAnswer
                              ? 'bg-green-900/30 text-green-300 border border-green-700'
                              : 'bg-red-900/30 text-red-300 border border-red-700'
                          }`}
                        >
                          {quizAnswers[question.id] === question.correctAnswer ? '✓ Correct!' : '✗ Incorrect'}
                          <p className="mt-1">{question.explanation}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6">
                <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3" onClick={handleCompleteModule}>
                  ✓ Mark as Complete
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Module List View
  return (
    <div className="w-full bg-gradient-to-br from-slate-900 to-slate-800 text-white min-h-screen p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Operator Training Program</h1>
        <p className="text-gray-400 mb-6">Master RRB operations through interactive training modules</p>

        {/* Overall Progress */}
        <div className="bg-slate-700 p-6 rounded-lg mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Your Progress</h2>
            <span className="text-3xl font-bold text-blue-400">{overallProgress}%</span>
          </div>
          <div className="w-full bg-slate-600 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
          <p className="text-gray-400 mt-3">
            {completedModules} of {totalModules} modules completed
          </p>
        </div>
      </div>

      {/* Training Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {TRAINING_MODULES.map(module => (
          <Card
            key={module.id}
            className="bg-slate-700 border-slate-600 p-6 cursor-pointer hover:bg-slate-600 transition-colors"
            onClick={() => handleModuleClick(module)}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">{module.title}</h3>
                <p className="text-gray-400 text-sm mb-3">{module.description}</p>
              </div>
              {module.completed && <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />}
            </div>

            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-2 text-gray-300">
                <Clock className="w-4 h-4" />
                <span className="text-sm">{module.duration} min</span>
              </div>
              <div
                className={`px-3 py-1 rounded text-xs font-semibold ${
                  module.difficulty === 'beginner'
                    ? 'bg-green-900/30 text-green-300'
                    : module.difficulty === 'intermediate'
                      ? 'bg-yellow-900/30 text-yellow-300'
                      : 'bg-red-900/30 text-red-300'
                }`}
              >
                {module.difficulty.charAt(0).toUpperCase() + module.difficulty.slice(1)}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="bg-slate-800 rounded-full h-2 mb-3">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all"
                style={{ width: `${module.progress}%` }}
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">{module.sections.length} sections</span>
              <ChevronRight className="w-5 h-5 text-blue-400" />
            </div>
          </Card>
        ))}
      </div>

      {/* Certification Info */}
      <Card className="bg-blue-900/30 border border-blue-700 p-6 mt-8">
        <div className="flex items-start gap-4">
          <Shield className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-lg font-bold text-white mb-2">Operator Certification</h3>
            <p className="text-gray-300">
              Complete all 6 training modules to earn your RRB Operator Certification. This certification is required to handle
              emergency calls and access advanced features.
            </p>
            <div className="mt-4 flex items-center gap-2">
              <div className="flex-1 bg-slate-700 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
              <span className="text-sm font-semibold text-gray-300">{overallProgress}%</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
