import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  CheckCircle2,
  Circle,
  Play,
  Pause,
  SkipForward,
  BookOpen,
  AlertCircle,
  Lightbulb,
  Clock,
} from 'lucide-react';

interface TrainingModule {
  id: string;
  title: string;
  description: string;
  duration: number; // minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  completed: boolean;
  sections: TrainingSection[];
}

interface TrainingSection {
  id: string;
  title: string;
  content: string;
  tips: string[];
  videoUrl?: string;
}

interface ModeratorTrainingProps {
  onComplete?: (moduleId: string) => void;
}

export const ModeratorTraining: React.FC<ModeratorTrainingProps> = ({ onComplete }) => {
  const [modules, setModules] = useState<TrainingModule[]>([
    {
      id: 'basics',
      title: 'Broadcast Basics',
      description: 'Learn the fundamentals of operating the broadcast system',
      duration: 15,
      difficulty: 'beginner',
      completed: false,
      sections: [
        {
          id: 'basics-1',
          title: 'System Overview',
          content:
            'The broadcast system consists of three main components: the moderator dashboard, OBS Studio for video management, and the audience broadcast viewer. Each component plays a critical role in delivering a professional broadcast experience.',
          tips: [
            'Always verify all systems are running before going live',
            'Keep the moderator dashboard open at all times',
            'Monitor the health indicators in real-time',
          ],
        },
        {
          id: 'basics-2',
          title: 'Dashboard Navigation',
          content:
            'The moderator dashboard is your command center. It shows real-time metrics, panelist status, stream health, and engagement analytics. Familiarize yourself with each section before the broadcast.',
          tips: [
            'Check stream health every 10 minutes',
            'Monitor viewer count for engagement trends',
            'Keep chat moderation tools visible',
          ],
        },
      ],
    },
    {
      id: 'panelist-management',
      title: 'Panelist Management',
      description: 'Master controlling panelists, audio, and video during the broadcast',
      duration: 20,
      difficulty: 'intermediate',
      completed: false,
      sections: [
        {
          id: 'panel-1',
          title: 'Connecting Panelists',
          content:
            'Each panelist must connect to the broadcast viewer URL 30 minutes before the event. Verify their audio and video are working, and test chat functionality. Have backup panelists ready in case of technical issues.',
          tips: [
            'Send connection link 1 hour before event',
            'Do audio/video test 30 minutes before',
            'Have backup panelist contact info ready',
          ],
        },
        {
          id: 'panel-2',
          title: 'Audio Management',
          content:
            'Monitor audio levels for all panelists. Use the mute button to control who is speaking. Adjust microphone gain to prevent feedback or distortion. Always test audio before going live.',
          tips: [
            'Audio levels should peak around -6dB',
            'Mute panelists when not speaking',
            'Use headphones to monitor audio quality',
          ],
        },
        {
          id: 'panel-3',
          title: 'Video Management',
          content:
            'Ensure all panelists have good lighting and professional backgrounds. Switch between scenes to show different panelists or content. Monitor video quality and be ready to reduce resolution if bandwidth is limited.',
          tips: [
            'Good lighting prevents video artifacts',
            'Professional background builds credibility',
            'Test video quality before broadcast',
          ],
        },
      ],
    },
    {
      id: 'scene-management',
      title: 'Scene & Stream Management',
      description: 'Learn to switch scenes and manage the broadcast stream',
      duration: 18,
      difficulty: 'intermediate',
      completed: false,
      sections: [
        {
          id: 'scene-1',
          title: 'Scene Switching',
          content:
            'OBS Studio has multiple scenes for different broadcast situations. Main Panel shows all panelists, Speaker Focus shows the active speaker, Slides shows presentations, and Break Screen is used during technical breaks. Switch scenes based on the broadcast flow.',
          tips: [
            'Switch scenes smoothly with 2-second transitions',
            'Announce scene changes to audience',
            'Keep graphics/lower thirds updated',
          ],
        },
        {
          id: 'scene-2',
          title: 'Stream Health Monitoring',
          content:
            'Monitor bitrate (target 5000 kbps), FPS (30 fps), and latency (<50ms). If stream quality drops, reduce resolution or bitrate. Be ready to failover to secondary RTMP endpoint if primary connection fails.',
          tips: [
            'Check metrics every 10 minutes',
            'Bitrate below 3000 kbps is warning level',
            'Have failover procedure ready',
          ],
        },
      ],
    },
    {
      id: 'audience-engagement',
      title: 'Audience Engagement',
      description: 'Manage chat, Q&A, and polls to keep audience engaged',
      duration: 22,
      difficulty: 'intermediate',
      completed: false,
      sections: [
        {
          id: 'engage-1',
          title: 'Chat Moderation',
          content:
            'Monitor chat messages in real-time. Remove inappropriate content, answer technical questions, and encourage participation. Pin important messages and highlight key discussion points.',
          tips: [
            'Respond to technical questions quickly',
            'Remove spam and inappropriate content',
            'Pin important announcements',
            'Encourage audience participation',
          ],
        },
        {
          id: 'engage-2',
          title: 'Q&A Management',
          content:
            'The Q&A system allows audience members to submit questions that other viewers can upvote. Sort by votes to show most popular questions. Read selected questions to panelists for live responses.',
          tips: [
            'Sort questions by votes',
            'Select diverse questions',
            'Announce Q&A segments',
            'Thank audience for questions',
          ],
        },
        {
          id: 'engage-3',
          title: 'Poll Management',
          content:
            'Create polls to engage the audience and gather feedback. Set 2-3 minute duration for each poll. Display results and discuss with panelists. Use polls to break up long speeches and maintain engagement.',
          tips: [
            'Create 2-3 polls during broadcast',
            'Keep poll questions simple',
            'Display results prominently',
            'Discuss results with panelists',
          ],
        },
      ],
    },
    {
      id: 'emergency-procedures',
      title: 'Emergency Procedures',
      description: 'Handle technical issues and emergency situations',
      duration: 25,
      difficulty: 'advanced',
      completed: false,
      sections: [
        {
          id: 'emerg-1',
          title: 'Stream Failure Recovery',
          content:
            'If the RTMP connection drops, the system automatically failovers to the secondary endpoint. If that fails, manually switch to tertiary endpoint. Always have a backup plan and communicate with the audience during technical issues.',
          tips: [
            'Automatic failover takes 5 seconds',
            'Manual failover takes 30 seconds',
            'Always announce technical pauses',
            'Have backup panelists ready',
          ],
        },
        {
          id: 'emerg-2',
          title: 'Audio/Video Troubleshooting',
          content:
            'Common issues include no audio, video freezing, or echo. Ask panelists to check their microphone/camera, close other applications, and restart their browser if needed. Have backup panelists ready if issues persist.',
          tips: [
            'Ask panelist to check microphone first',
            'Have them close other applications',
            'Restart browser if issues persist',
            'Switch to backup panelist if needed',
          ],
        },
        {
          id: 'emerg-3',
          title: 'Communication During Issues',
          content:
            'Always communicate with the audience during technical issues. Announce what is happening, provide estimated time to resolution, and thank them for their patience. Keep the broadcast professional and reassuring.',
          tips: [
            'Be transparent about issues',
            'Provide updates every 2 minutes',
            'Thank audience for patience',
            'Resume smoothly when fixed',
          ],
        },
      ],
    },
  ]);

  const [selectedModule, setSelectedModule] = useState<TrainingModule | null>(modules[0]);
  const [selectedSection, setSelectedSection] = useState<TrainingSection | null>(
    modules[0]?.sections[0] || null
  );
  const [isPlaying, setIsPlaying] = useState(false);

  const handleModuleSelect = (module: TrainingModule) => {
    setSelectedModule(module);
    setSelectedSection(module.sections[0]);
  };

  const handleCompleteModule = (moduleId: string) => {
    setModules(modules.map(m => (m.id === moduleId ? { ...m, completed: true } : m)));
    onComplete?.(moduleId);
  };

  const completedCount = modules.filter(m => m.completed).length;
  const progressPercent = (completedCount / modules.length) * 100;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Moderator Training</h1>
          <p className="text-slate-600 mb-6">
            Complete all training modules to become a certified broadcast moderator
          </p>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-slate-700">
                Progress: {completedCount} of {modules.length} modules
              </span>
              <span className="text-sm font-semibold text-orange-600">{Math.round(progressPercent)}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-orange-500 to-orange-600 h-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Module List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-4 space-y-2 sticky top-6">
              {modules.map(module => (
                <button
                  key={module.id}
                  onClick={() => handleModuleSelect(module)}
                  className={`w-full text-left p-3 rounded-lg transition-all ${
                    selectedModule?.id === module.id
                      ? 'bg-orange-500 text-white shadow-md'
                      : 'bg-slate-50 text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {module.completed ? (
                      <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    ) : (
                      <Circle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm">{module.title}</div>
                      <div className="text-xs opacity-75">{module.duration} min</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Module Content */}
          <div className="lg:col-span-3">
            {selectedModule && (
              <Card className="bg-white shadow-lg">
                {/* Module Header */}
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-t-lg">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">{selectedModule.title}</h2>
                      <p className="opacity-90">{selectedModule.description}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getDifficultyColor(selectedModule.difficulty)}`}
                    >
                      {selectedModule.difficulty.charAt(0).toUpperCase() + selectedModule.difficulty.slice(1)}
                    </span>
                  </div>
                </div>

                {/* Module Content */}
                <div className="p-6 space-y-6">
                  {/* Tabs for Sections */}
                  <Tabs defaultValue={selectedModule.sections[0]?.id} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 lg:grid-cols-3">
                      {selectedModule.sections.map(section => (
                        <TabsTrigger
                          key={section.id}
                          value={section.id}
                          onClick={() => setSelectedSection(section)}
                          className="text-xs"
                        >
                          {section.title}
                        </TabsTrigger>
                      ))}
                    </TabsList>

                    {selectedModule.sections.map(section => (
                      <TabsContent key={section.id} value={section.id} className="space-y-4 mt-6">
                        {/* Section Title */}
                        <h3 className="text-xl font-bold text-slate-900">{section.title}</h3>

                        {/* Video (if available) */}
                        {section.videoUrl && (
                          <div className="bg-slate-900 rounded-lg overflow-hidden aspect-video flex items-center justify-center">
                            <button
                              onClick={() => setIsPlaying(!isPlaying)}
                              className="flex items-center gap-2 text-white hover:text-orange-500 transition-colors"
                            >
                              {isPlaying ? (
                                <Pause className="w-12 h-12" />
                              ) : (
                                <Play className="w-12 h-12" />
                              )}
                            </button>
                          </div>
                        )}

                        {/* Content */}
                        <div className="bg-slate-50 rounded-lg p-4">
                          <p className="text-slate-700 leading-relaxed">{section.content}</p>
                        </div>

                        {/* Tips */}
                        <div className="space-y-2">
                          <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                            <Lightbulb className="w-5 h-5 text-yellow-500" />
                            Pro Tips
                          </h4>
                          <div className="space-y-2">
                            {section.tips.map((tip, idx) => (
                              <div key={idx} className="flex gap-3 bg-yellow-50 p-3 rounded-lg">
                                <Lightbulb className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-slate-700">{tip}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>

                  {/* Module Controls */}
                  <div className="flex items-center justify-between pt-6 border-t border-slate-200">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Clock className="w-4 h-4" />
                      <span>Estimated time: {selectedModule.duration} minutes</span>
                    </div>

                    {selectedModule.completed ? (
                      <div className="flex items-center gap-2 text-green-600 font-semibold">
                        <CheckCircle2 className="w-5 h-5" />
                        Completed
                      </div>
                    ) : (
                      <Button
                        onClick={() => handleCompleteModule(selectedModule.id)}
                        className="bg-orange-500 hover:bg-orange-600 text-white gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Mark as Complete
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Quick Reference */}
        <Card className="bg-blue-50 border-blue-200 p-6">
          <div className="flex gap-4">
            <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-blue-900 mb-2">Quick Reference</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Keep the moderator dashboard open at all times</li>
                <li>• Monitor stream health every 10 minutes</li>
                <li>• Have backup panelists and contact info ready</li>
                <li>• Test all systems 30 minutes before broadcast</li>
                <li>• Communicate clearly with audience during issues</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ModeratorTraining;
