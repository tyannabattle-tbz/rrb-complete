'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Music, Radio, Users, Archive, Zap, Sparkles, Video, Wand2, ArrowLeft, Crown } from 'lucide-react';
import { useLocation } from 'wouter';
import { BandMemberChatFunctional } from '@/components/BandMemberChatFunctional';
import { PerformanceRecordingArchiveFunctional } from '@/components/PerformanceRecordingArchiveFunctional';
import { SetlistGeneratorFunctional } from '@/components/SetlistGeneratorFunctional';
import { LegendaryAudioFeatures } from '@/components/LegendaryAudioFeatures';
import { LegendaryVideoFeatures } from '@/components/LegendaryVideoFeatures';

export function StudioPro() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState('chat');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      {/* Header */}
      <div className="mb-8">
        <Button
          onClick={() => setLocation('/')}
          variant="ghost"
          className="mb-4 text-slate-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white flex items-center gap-3">
              <Crown className="w-10 h-10 text-amber-400" />
              RRB Studio - PROFESSIONAL TIER
            </h1>
            <p className="text-slate-400 mt-2">Advanced Production + AI Mastering + Video Creation</p>
          </div>
          <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/50 px-4 py-2 text-sm">
            ⭐ PROFESSIONAL
          </Badge>
        </div>
      </div>

      {/* Tier Features Overview */}
      <Card className="mb-8 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/30">
        <CardHeader>
          <CardTitle className="text-white">Professional Tier Features</CardTitle>
          <CardDescription>Everything from Free + Advanced Production Tools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="flex items-center gap-2">
              <Radio className="w-5 h-5 text-blue-400" />
              <span className="text-sm text-white">54 Channels</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <span className="text-sm text-white">Sound DNA</span>
            </div>
            <div className="flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-pink-400" />
              <span className="text-sm text-white">AI Mastering</span>
            </div>
            <div className="flex items-center gap-2">
              <Video className="w-5 h-5 text-cyan-400" />
              <span className="text-sm text-white">Video Studio</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-green-400" />
              <span className="text-sm text-white">Unlimited Collab</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Studio Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 bg-slate-800/40 border border-slate-700/30">
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Chat
          </TabsTrigger>
          <TabsTrigger value="archive" className="flex items-center gap-2">
            <Archive className="w-4 h-4" />
            Archive
          </TabsTrigger>
          <TabsTrigger value="setlist" className="flex items-center gap-2">
            <Music className="w-4 h-4" />
            Setlist
          </TabsTrigger>
          <TabsTrigger value="audio" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Audio Pro
          </TabsTrigger>
          <TabsTrigger value="video" className="flex items-center gap-2">
            <Video className="w-4 h-4" />
            Video Pro
          </TabsTrigger>
        </TabsList>

        {/* Band Member Chat Tab */}
        <TabsContent value="chat" className="space-y-4">
          <Card className="bg-slate-800/40 border-slate-700/30">
            <CardHeader>
              <CardTitle className="text-white">Real-time Band Communication</CardTitle>
              <CardDescription>Connect with band members during performances</CardDescription>
            </CardHeader>
            <CardContent>
              <BandMemberChatFunctional />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recording Archive Tab */}
        <TabsContent value="archive" className="space-y-4">
          <Card className="bg-slate-800/40 border-slate-700/30">
            <CardHeader>
              <CardTitle className="text-white">Performance Archive</CardTitle>
              <CardDescription>Professional tier: Unlimited storage, analytics, and export</CardDescription>
            </CardHeader>
            <CardContent>
              <PerformanceRecordingArchiveFunctional />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Setlist Generator Tab */}
        <TabsContent value="setlist" className="space-y-4">
          <Card className="bg-slate-800/40 border-slate-700/30">
            <CardHeader>
              <CardTitle className="text-white">AI Setlist Generator</CardTitle>
              <CardDescription>Optimize performances with ML-powered recommendations</CardDescription>
            </CardHeader>
            <CardContent>
              <SetlistGeneratorFunctional />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Legendary Audio Features Tab */}
        <TabsContent value="audio" className="space-y-4">
          <Card className="bg-slate-800/40 border-slate-700/30">
            <CardHeader>
              <CardTitle className="text-white">Professional Audio Tools</CardTitle>
              <CardDescription>Sound DNA Engine, AI Mastering, Frequency Optimization</CardDescription>
            </CardHeader>
            <CardContent>
              <LegendaryAudioFeatures />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Legendary Video Features Tab */}
        <TabsContent value="video" className="space-y-4">
          <Card className="bg-slate-800/40 border-slate-700/30">
            <CardHeader>
              <CardTitle className="text-white">Professional Video Tools</CardTitle>
              <CardDescription>AI Director, VFX Engine, Auto-Editing, Live Streaming</CardDescription>
            </CardHeader>
            <CardContent>
              <LegendaryVideoFeatures />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Upgrade Prompt */}
      <Card className="mt-8 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">Ready for the ultimate experience?</h3>
              <p className="text-slate-400">Unlock Holographic Capture, Wellness Integration, and 100% autonomous QUMUS control with Advanced tier.</p>
            </div>
            <Button
              onClick={() => setLocation('/studio/advanced')}
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold"
            >
              Upgrade to Advanced
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
