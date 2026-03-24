'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Music, Users, Archive, Sparkles, Volume2, Play, Pause } from 'lucide-react';
import { BandMemberChatFunctional } from '@/components/BandMemberChatFunctional';
import { PerformanceRecordingArchiveFunctional } from '@/components/PerformanceRecordingArchiveFunctional';
import { SetlistGeneratorFunctional } from '@/components/SetlistGeneratorFunctional';

export function StudioPublic() {
  const [activeTab, setActiveTab] = useState('chat');
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold text-white flex items-center gap-3">
              <Music className="w-10 h-10 text-purple-400" />
              RRB LEGENDARY STUDIO
            </h1>
            <p className="text-slate-400 mt-2">Public Access - No Login Required</p>
          </div>
          <Badge className="bg-green-500/20 text-green-400 border-green-500/50 px-4 py-2 text-sm">
            🎵 LIVE & OPERATIONAL
          </Badge>
        </div>

        {/* Quick Audio Player */}
        <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30 mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">🎵 Now Playing</h3>
                <p className="text-slate-400">Healing Frequencies - RRB Signature Sound</p>
              </div>
              <Button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`${
                  isPlaying
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-green-600 hover:bg-green-700'
                } text-white font-semibold px-6`}
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-4 h-4 mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Play
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Features Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="bg-slate-800/40 border-slate-700/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" />
              Band Chat
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-400">Real-time messaging with band members</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/40 border-slate-700/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center gap-2">
              <Archive className="w-5 h-5 text-green-400" />
              Recording Archive
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-400">Play and download all performances</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/40 border-slate-700/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              Setlist Generator
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-400">AI-powered setlist creation</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Studio Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-slate-800/40 border border-slate-700/30">
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Band Chat
          </TabsTrigger>
          <TabsTrigger value="archive" className="flex items-center gap-2">
            <Archive className="w-4 h-4" />
            Archive
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
              <BandMemberChatFunctional />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recording Archive Tab */}
        <TabsContent value="archive" className="space-y-4">
          <Card className="bg-slate-800/40 border-slate-700/30">
            <CardHeader>
              <CardTitle className="text-white">Performance Archive</CardTitle>
              <CardDescription>Listen to and download all RRB performances</CardDescription>
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
              <CardDescription>Create optimal setlists with AI assistance</CardDescription>
            </CardHeader>
            <CardContent>
              <SetlistGeneratorFunctional />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Info Banner */}
      <Card className="mt-8 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-500/30">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <Volume2 className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">🎵 Welcome to RRB Legendary Studio</h3>
              <p className="text-slate-400 mb-2">
                This is a fully operational production studio with real-time audio playback, band collaboration, and AI-powered tools. All features are accessible without authentication.
              </p>
              <p className="text-sm text-slate-500">
                💡 Tip: Click the play button above to hear live audio, send messages in the band chat, or browse the recording archive.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
