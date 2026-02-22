/**
 * Panelist Pre-Event Checklist Component
 * Interactive guide with tech requirements and completion tracking
 */

import React, { useState, useEffect } from 'react';
import { CheckCircle2, Circle, AlertCircle, Wifi, Mic, Video, Monitor, Zap, Download } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  category: 'tech' | 'setup' | 'preparation' | 'etiquette';
  completed: boolean;
  icon: React.ReactNode;
  details?: string;
}

interface PanelistPreEventChecklistProps {
  eventName: string;
  eventDate: string;
  eventTime: string;
  hoursUntilEvent: number;
  onComplete?: (completedItems: number) => void;
}

export const PanelistPreEventChecklist: React.FC<PanelistPreEventChecklistProps> = ({
  eventName,
  eventDate,
  eventTime,
  hoursUntilEvent,
  onComplete,
}) => {
  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    {
      id: 'internet',
      title: 'Test Internet Connection',
      description: 'Ensure stable internet with at least 2.5 Mbps upload speed',
      category: 'tech',
      completed: false,
      icon: <Wifi className="w-5 h-5" />,
      details: 'Run a speed test at speedtest.net. Wired connection is recommended over WiFi.',
    },
    {
      id: 'microphone',
      title: 'Test Microphone',
      description: 'Check audio input levels and clarity',
      category: 'tech',
      completed: false,
      icon: <Mic className="w-5 h-5" />,
      details: 'Record a test message and play it back. Ensure no background noise.',
    },
    {
      id: 'camera',
      title: 'Test Camera',
      description: 'Verify video quality and lighting',
      category: 'tech',
      completed: false,
      icon: <Video className="w-5 h-5" />,
      details: 'Position camera at eye level. Ensure good lighting from the front.',
    },
    {
      id: 'zoom-download',
      title: 'Download Zoom (if needed)',
      description: 'Install latest Zoom client or use web version',
      category: 'setup',
      completed: false,
      icon: <Download className="w-5 h-5" />,
      details: 'Download from zoom.us. Update to latest version if already installed.',
    },
    {
      id: 'zoom-test',
      title: 'Test Zoom Audio/Video',
      description: 'Run Zoom audio and video test',
      category: 'setup',
      completed: false,
      icon: <Zap className="w-5 h-5" />,
      details: 'Use Zoom settings to test speaker, microphone, and camera.',
    },
    {
      id: 'background',
      title: 'Prepare Background',
      description: 'Choose professional background or blur',
      category: 'preparation',
      completed: false,
      icon: <Monitor className="w-5 h-5" />,
      details: 'Virtual background or physical space. Ensure no distracting items visible.',
    },
    {
      id: 'appearance',
      title: 'Prepare Professional Appearance',
      description: 'Dress appropriately for the broadcast',
      category: 'preparation',
      completed: false,
      icon: <AlertCircle className="w-5 h-5" />,
      details: 'Wear business casual or formal attire. Avoid busy patterns.',
    },
    {
      id: 'notes',
      title: 'Prepare Notes/Talking Points',
      description: 'Have key points ready but avoid reading',
      category: 'preparation',
      completed: false,
      icon: <AlertCircle className="w-5 h-5" />,
      details: 'Bullet points only. Practice speaking naturally.',
    },
    {
      id: 'notifications',
      title: 'Silence Notifications',
      description: 'Disable all alerts and notifications',
      category: 'etiquette',
      completed: false,
      icon: <AlertCircle className="w-5 h-5" />,
      details: 'Close email, Slack, messaging apps. Set phone to silent.',
    },
    {
      id: 'early-join',
      title: 'Join 5-10 Minutes Early',
      description: 'Arrive early for audio/video check',
      category: 'etiquette',
      completed: false,
      icon: <AlertCircle className="w-5 h-5" />,
      details: 'Test connection and settings before event starts.',
    },
  ]);

  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const toggleItem = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  };

  const toggleExpand = (id: string) => {
    setExpandedItem(expandedItem === id ? null : id);
  };

  useEffect(() => {
    const completedCount = checklist.filter((item) => item.completed).length;
    onComplete?.(completedCount);
  }, [checklist, onComplete]);

  const completedCount = checklist.filter((item) => item.completed).length;
  const completionPercentage = (completedCount / checklist.length) * 100;

  const categories = {
    tech: 'Technical Requirements',
    setup: 'Zoom Setup',
    preparation: 'Event Preparation',
    etiquette: 'Professional Etiquette',
  };

  const categoryGroups = Object.entries(categories).map(([key, label]) => ({
    key,
    label,
    items: checklist.filter((item) => item.category === key),
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Pre-Event Checklist</h2>
        <p className="text-gray-400">{eventName}</p>
        <p className="text-sm text-gray-500 mt-1">
          {eventDate} at {eventTime} UTC ({hoursUntilEvent} hours away)
        </p>
      </div>

      {/* Progress Bar */}
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="pt-6">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-white font-medium">Overall Completion</span>
              <span className="text-blue-400 font-bold">{completedCount}/{checklist.length}</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-full transition-all duration-300"
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-400">{completionPercentage.toFixed(0)}% complete</p>
          </div>
        </CardContent>
      </Card>

      {/* Checklist Items by Category */}
      {categoryGroups.map(({ key, label, items }) => (
        <div key={key}>
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <div className="w-1 h-6 bg-blue-500 rounded"></div>
            {label}
          </h3>

          <div className="space-y-2">
            {items.map((item) => (
              <Card key={item.id} className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {/* Main Item */}
                    <div className="flex items-start gap-3 cursor-pointer" onClick={() => toggleItem(item.id)}>
                      <button
                        className="mt-1 flex-shrink-0 focus:outline-none"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleItem(item.id);
                        }}
                      >
                        {item.completed ? (
                          <CheckCircle2 className="w-6 h-6 text-green-400" />
                        ) : (
                          <Circle className="w-6 h-6 text-gray-500 hover:text-gray-400" />
                        )}
                      </button>

                      <div className="flex-1">
                        <p className={`font-medium ${item.completed ? 'text-gray-400 line-through' : 'text-white'}`}>
                          {item.title}
                        </p>
                        <p className="text-sm text-gray-400 mt-1">{item.description}</p>
                      </div>

                      <div className="flex-shrink-0 text-gray-500">
                        {item.icon}
                      </div>
                    </div>

                    {/* Expandable Details */}
                    {item.details && (
                      <>
                        <button
                          onClick={() => toggleExpand(item.id)}
                          className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          {expandedItem === item.id ? '▼ Hide details' : '▶ Show details'}
                        </button>

                        {expandedItem === item.id && (
                          <div className="pl-9 py-2 bg-slate-700 rounded p-3 text-sm text-gray-300 border-l-2 border-blue-500">
                            {item.details}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}

      {/* Tips Section */}
      <Card className="bg-blue-900/20 border-blue-500">
        <CardHeader>
          <CardTitle className="text-blue-200 flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Pro Tips
          </CardTitle>
        </CardHeader>
        <CardContent className="text-blue-100 space-y-2">
          <p>• Join the Zoom room 5-10 minutes early to troubleshoot any issues</p>
          <p>• Use a wired internet connection for best stability</p>
          <p>• Close unnecessary applications to free up system resources</p>
          <p>• Have water nearby but avoid eating on camera</p>
          <p>• Maintain eye contact with the camera, not the screen</p>
          <p>• Speak clearly and at a moderate pace</p>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          onClick={() => {
            setChecklist((prev) => prev.map((item) => ({ ...item, completed: true })));
          }}
          className="flex-1 bg-green-600 hover:bg-green-700"
        >
          Mark All Complete
        </Button>
        <Button
          onClick={() => {
            setChecklist((prev) => prev.map((item) => ({ ...item, completed: false })));
          }}
          variant="outline"
          className="flex-1 border-slate-600 text-gray-300 hover:bg-slate-700"
        >
          Reset
        </Button>
      </div>

      {/* Completion Message */}
      {completedCount === checklist.length && (
        <Card className="bg-green-900/20 border-green-500">
          <CardContent className="pt-6">
            <p className="text-green-200 text-center font-medium">
              ✓ You're all set! Ready for the broadcast.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
