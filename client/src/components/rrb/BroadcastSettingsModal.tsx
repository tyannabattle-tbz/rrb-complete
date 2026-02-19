import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mic, Video, Settings, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

interface BroadcastSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BroadcastSettingsModal({ open, onOpenChange }: BroadcastSettingsModalProps) {
  const [audioInput, setAudioInput] = useState('default');
  const [videoInput, setVideoInput] = useState('default');
  const [audioLevel, setAudioLevel] = useState(80);
  const [videoBitrate, setVideoBitrate] = useState(5000);
  const [streamKey, setStreamKey] = useState('sk_live_abc123def456ghi789jkl');
  const [copied, setCopied] = useState(false);

  const copyStreamKey = () => {
    navigator.clipboard.writeText(streamKey);
    setCopied(true);
    toast.success('Stream key copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const regenerateStreamKey = () => {
    const newKey = `sk_live_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    setStreamKey(newKey);
    toast.success('Stream key regenerated');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Broadcast Settings
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="audio" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-800">
            <TabsTrigger value="audio" className="data-[state=active]:bg-purple-600">
              <Mic className="w-4 h-4 mr-2" />
              Audio
            </TabsTrigger>
            <TabsTrigger value="video" className="data-[state=active]:bg-purple-600">
              <Video className="w-4 h-4 mr-2" />
              Video
            </TabsTrigger>
            <TabsTrigger value="stream" className="data-[state=active]:bg-purple-600">
              Stream Key
            </TabsTrigger>
          </TabsList>

          {/* Audio Settings */}
          <TabsContent value="audio" className="space-y-6">
            <Card className="bg-gray-800 border-gray-700 p-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-200 block mb-2">
                    Audio Input Device
                  </label>
                  <select
                    value={audioInput}
                    onChange={(e) => setAudioInput(e.target.value)}
                    className="w-full bg-gray-700 text-white rounded px-3 py-2 border border-gray-600 focus:border-purple-500 outline-none"
                  >
                    <option value="default">Default Device</option>
                    <option value="headset">Headset Microphone</option>
                    <option value="usb">USB Microphone</option>
                    <option value="virtual">Virtual Audio</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-200 block mb-2">
                    Audio Level: {audioLevel}%
                  </label>
                  <Slider
                    value={[audioLevel]}
                    onValueChange={(value) => setAudioLevel(value[0])}
                    min={0}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div className="pt-4 border-t border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-300">Audio Test</span>
                    <Button
                      onClick={() => toast.info('🔊 Playing test tone...')}
                      className="bg-purple-600 hover:bg-purple-700 text-white text-sm"
                    >
                      Play Test Tone
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Video Settings */}
          <TabsContent value="video" className="space-y-6">
            <Card className="bg-gray-800 border-gray-700 p-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-200 block mb-2">
                    Video Input Device
                  </label>
                  <select
                    value={videoInput}
                    onChange={(e) => setVideoInput(e.target.value)}
                    className="w-full bg-gray-700 text-white rounded px-3 py-2 border border-gray-600 focus:border-purple-500 outline-none"
                  >
                    <option value="default">Default Camera</option>
                    <option value="external">External USB Camera</option>
                    <option value="screen">Screen Share</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-200 block mb-2">
                    Video Bitrate: {videoBitrate} kbps
                  </label>
                  <Slider
                    value={[videoBitrate]}
                    onValueChange={(value) => setVideoBitrate(value[0])}
                    min={1000}
                    max={25000}
                    step={500}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-400 mt-2">
                    Recommended: 2500-5000 kbps for 720p, 5000-10000 kbps for 1080p
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-700">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Resolution</p>
                    <p className="text-sm font-semibold text-white">1080p</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Frame Rate</p>
                    <p className="text-sm font-semibold text-white">30 FPS</p>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Stream Key */}
          <TabsContent value="stream" className="space-y-6">
            <Card className="bg-gray-800 border-gray-700 p-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-200 block mb-2">
                    Stream Key
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      value={streamKey}
                      readOnly
                      className="flex-1 bg-gray-700 text-white rounded px-3 py-2 border border-gray-600 font-mono text-sm"
                    />
                    <Button
                      onClick={copyStreamKey}
                      className="bg-purple-600 hover:bg-purple-700 text-white gap-2"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copied ? 'Copied' : 'Copy'}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    Use this key to stream to YouTube Live, Twitch, or other platforms
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-700">
                  <Button
                    onClick={regenerateStreamKey}
                    className="w-full bg-red-600 hover:bg-red-700 text-white"
                  >
                    Regenerate Stream Key
                  </Button>
                  <p className="text-xs text-gray-400 mt-2">
                    ⚠️ Regenerating will invalidate the current key. Any active streams will be disconnected.
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-700 space-y-2">
                  <h3 className="text-sm font-semibold text-white">Platform URLs</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between bg-gray-700 rounded p-2">
                      <span className="text-sm text-gray-300">YouTube Live</span>
                      <Button
                        onClick={() => {
                          navigator.clipboard.writeText('rtmps://a.rtmp.youtube.com/live2');
                          toast.success('YouTube URL copied');
                        }}
                        className="bg-gray-600 hover:bg-gray-500 text-white text-xs"
                      >
                        Copy
                      </Button>
                    </div>
                    <div className="flex items-center justify-between bg-gray-700 rounded p-2">
                      <span className="text-sm text-gray-300">Twitch</span>
                      <Button
                        onClick={() => {
                          navigator.clipboard.writeText('rtmps://live-sjc.twitch.tv/app');
                          toast.success('Twitch URL copied');
                        }}
                        className="bg-gray-600 hover:bg-gray-500 text-white text-xs"
                      >
                        Copy
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex gap-2 justify-end pt-4">
          <Button
            onClick={() => onOpenChange(false)}
            className="bg-gray-700 hover:bg-gray-600 text-white"
          >
            Close
          </Button>
          <Button
            onClick={() => {
              onOpenChange(false);
              toast.success('✅ Settings saved successfully');
            }}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            Save Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
