'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Music, Radio, Users, Archive, Zap, Lock, ArrowLeft } from 'lucide-react';
import { useLocation } from 'wouter';
import { BandMemberChat } from '@/components/BandMemberChat';
import { PerformanceRecordingArchive } from '@/components/PerformanceRecordingArchive';
import { SetlistGenerator } from '@/components/SetlistGenerator';

export function StudioFree() {
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
              <Music className="w-10 h-10 text-purple-400" />
              RRB Studio - FREE TIER
            </h1>
            <p className="text-slate-400 mt-2">Legendary Production Ecosystem</p>
          </div>
          <Badge className="bg-green-500/20 text-green-400 border-green-500/50 px-4 py-2 text-sm">
            🀄️ ACTIVE
          </Badge>
        </div>
      </div>

      {/* Tier Features Overview */}
      <Card className="mb-8 bg-slate-800/40 border-slate-700/30">
        <CardHeader>
          <CardTitle className="text-white">Free Tier Features</CardTitle>
          <CardDescription>What you have access to</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <Radio className="w-5 h-5 text-blue-400" />
              <span className="text-sm text-white">54 Radio Channels</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              <span className="text-sm text-white">Frequency Tuner</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-green-400" />
              <span className="text-sm text-white">Band Chat</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-red-400" />
              <span className="text-sm text-slate-400">Recording (Limited)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Studio Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-slate-800/40 border border-slate-700/30">
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Band Chat
          </TabsTrigger>
          <TabsTrigger value="archive" className="flex items-center gap-2">
            <Archive className="w-4 h-4" />
            Recordings
          </TabsTrigger>
          <TabsTrigger value="setlist" className="flex items-center gap-2">
            <Music className="w-4 h-4" />
            Setlist
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
              <BandMemberChat />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recording Archive Tab */}
        <TabsContent value="archive" className="space-y-4">
          <Card className="bg-slate-800/40 border-slate-700/30">
            <CardHeader>
              <CardTitle className="text-white">Performance Archive</CardTitle>
              <CardDescription>Free tier: View and download your recordings</CardDescription>
            </CardHeader>
            <CardContent>
              <PerformanceRecordingArchive />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Setlist Generator Tab */}
        <TabsContent value="setlist" className="space-y-4">
          <Card className="bg-slate-800/40 border-slate-700/30">
            <CardHeader>
              <CardTitle className="text-white">Setlist Generator</CardTitle>
              <CardDescription>Plan your performances with AI assistance</CardDescription>
            </CardHeader>
            <CardContent>
              <SetlistGenerator />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Upgrade Prompt */}
      <Card className="mt-8 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/30">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">Ready for more?</h3>
              <p className="text-slate-400">Unlock Sound DNA Engine, AI Mastering, Video Production, and more with Professional tier.</p>
            </div>
            <Button
              onClick={() => setLocation('/studio/pro')}
              className="bg-amber-600 hover:bg-amber-700 text-white font-semibold"
            >
              Upgrade to Professional
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
