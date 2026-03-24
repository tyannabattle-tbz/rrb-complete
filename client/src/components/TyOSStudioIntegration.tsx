'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Music, Radio, Users, Zap, Play, Settings, Share2, Download } from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';

/**
 * Ty OS Professional Studio Suite Integration
 * Provides unified interface for launching and managing studio from Ty OS
 */
export function TyOSStudioIntegration() {
  const [studioStatus, setStudioStatus] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [familyPermissions, setFamilyPermissions] = useState<any[]>([]);
  const [selectedStudio, setSelectedStudio] = useState<string | null>(null);

  // Get studio status
  const { data: statusData } = trpc.tyOSStudio?.getStudioStatus?.useQuery();

  // Get notifications
  const { data: notificationsData } = trpc.tyOSStudio?.getStudioNotifications?.useQuery();

  // Get family permissions
  const { data: permissionsData } = trpc.tyOSStudio?.getFamilyPermissions?.useQuery();

  // Launch studio mutation
  const launchStudioMutation = trpc.tyOSStudio?.launchStudio?.useMutation({
    onSuccess: (data) => {
      toast.success(`${data.message}`);
      window.location.href = data.launchUrl;
    },
    onError: (error) => {
      toast.error('Failed to launch studio');
    },
  });

  // AI generation mutation
  const generateAIMutation = trpc.tyOSStudio?.generateAIContent?.useMutation({
    onSuccess: (data) => {
      toast.success('AI content generation started');
    },
    onError: (error) => {
      toast.error('Failed to generate AI content');
    },
  });

  // Live performance mutation
  const startPerformanceMutation = trpc.tyOSStudio?.startLivePerformance?.useMutation({
    onSuccess: (data) => {
      toast.success('Live performance session started');
    },
    onError: (error) => {
      toast.error('Failed to start performance');
    },
  });

  // Global broadcast mutation
  const startBroadcastMutation = trpc.tyOSStudio?.startGlobalBroadcast?.useMutation({
    onSuccess: (data) => {
      toast.success('Global broadcast started');
    },
    onError: (error) => {
      toast.error('Failed to start broadcast');
    },
  });

  useEffect(() => {
    if (statusData) setStudioStatus(statusData);
    if (notificationsData) setNotifications(notificationsData.notifications);
    if (permissionsData) setFamilyPermissions(permissionsData.familyMembers);
  }, [statusData, notificationsData, permissionsData]);

  const handleLaunchStudio = (type: string) => {
    launchStudioMutation.mutate({
      studioType: type as any,
    });
  };

  const handleGenerateAI = () => {
    generateAIMutation.mutate({
      prompt: 'Create ambient background music',
      genre: 'ambient',
      style: 'ambient',
    });
  };

  const handleStartPerformance = () => {
    startPerformanceMutation.mutate({
      performanceName: 'Family Studio Session',
      performers: ['Chris Battle Sr', 'C.J. Battle', 'Kairen Battle'],
    });
  };

  const handleStartBroadcast = () => {
    startBroadcastMutation.mutate({
      broadcastName: 'Live Studio Broadcast',
      platforms: ['youtube', 'twitch', 'facebook'],
      audioSource: 'professional-studio-suite',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-purple-400 to-pink-400 mb-2">
            Ty OS Professional Studio Suite
          </h1>
          <p className="text-slate-300">Integrated audio production and broadcasting platform</p>
        </div>

        {/* Status Overview */}
        {studioStatus && (
          <Card className="bg-slate-800/50 border-slate-700 mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-slate-400 text-sm">Audio Engine</p>
                  <Badge className="bg-green-900/30 text-green-300 mt-1">{studioStatus.audioEngine}</Badge>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Recording</p>
                  <Badge className="bg-green-900/30 text-green-300 mt-1">
                    {studioStatus.recordingEnabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Streaming</p>
                  <Badge className="bg-green-900/30 text-green-300 mt-1">
                    {studioStatus.streamingEnabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">AI Generation</p>
                  <Badge className="bg-green-900/30 text-green-300 mt-1">
                    {studioStatus.aiGenerationEnabled ? 'Ready' : 'Offline'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Studio Launchers */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <Card className="bg-slate-800/50 border-slate-700 hover:border-purple-500 cursor-pointer transition">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Music className="w-5 h-5 text-purple-400" />
                Audio Mixer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300 text-sm mb-4">Multi-track mixing and effects</p>
              <Button
                onClick={() => handleLaunchStudio('mixer')}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                <Play className="w-4 h-4 mr-2" />
                Launch Mixer
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 hover:border-blue-500 cursor-pointer transition">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-blue-400" />
                Live Broadcast
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300 text-sm mb-4">Stream to multiple platforms</p>
              <Button
                onClick={handleStartBroadcast}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Start Broadcast
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 hover:border-green-500 cursor-pointer transition">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-green-400" />
                Live Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300 text-sm mb-4">Band collaboration mode</p>
              <Button
                onClick={handleStartPerformance}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <Play className="w-4 h-4 mr-2" />
                Start Performance
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* AI Content Generation */}
        <Card className="bg-slate-800/50 border-slate-700 mb-8">
          <CardHeader>
            <CardTitle>AI Content Generation</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-300 text-sm mb-4">
              Generate original audio content using AI. Create ambient backgrounds, beats, melodies, and more.
            </p>
            <Button
              onClick={handleGenerateAI}
              className="bg-gradient-to-r from-yellow-500 to-purple-500 hover:from-yellow-600 hover:to-purple-600"
            >
              <Zap className="w-4 h-4 mr-2" />
              Generate AI Content
            </Button>
          </CardContent>
        </Card>

        {/* Family Members */}
        {familyPermissions.length > 0 && (
          <Card className="bg-slate-800/50 border-slate-700 mb-8">
            <CardHeader>
              <CardTitle>Authorized Family Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {familyPermissions.map((member: any) => (
                  <div key={member.name} className="bg-slate-700/50 p-4 rounded-lg">
                    <p className="font-semibold text-white">{member.name}</p>
                    <p className="text-slate-300 text-sm">{member.role}</p>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {member.permissions.map((perm: string) => (
                        <Badge key={perm} className="bg-slate-600 text-slate-200 text-xs">
                          {perm}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Notifications */}
        {notifications.length > 0 && (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle>System Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {notifications.map((notif: any) => (
                  <div
                    key={notif.id}
                    className="bg-slate-700/50 p-3 rounded-lg border-l-4 border-green-500"
                  >
                    <p className="font-semibold text-white">{notif.title}</p>
                    <p className="text-slate-300 text-sm">{notif.message}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default TyOSStudioIntegration;
