import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Music, Mic, Volume2, Settings, Play, Pause, Download } from 'lucide-react';
import { toast } from 'sonner';

export default function AudioEditor() {
  const [activeTab, setActiveTab] = useState<'tts' | 'music' | 'effects'>('tts');
  const [isRecording, setIsRecording] = useState(false);

  const voices = [
    { id: 'en-US-neural', name: 'US English (Neural)', language: 'en-US' },
    { id: 'en-GB-neural', name: 'UK English (Neural)', language: 'en-GB' },
    { id: 'es-ES-neural', name: 'Spanish (Neural)', language: 'es-ES' },
    { id: 'fr-FR-neural', name: 'French (Neural)', language: 'fr-FR' },
  ];

  const effects = [
    { id: 'reverb', name: 'Reverb', category: 'Space' },
    { id: 'echo', name: 'Echo', category: 'Delay' },
    { id: 'compression', name: 'Compression', category: 'Dynamics' },
    { id: 'eq', name: 'Equalizer', category: 'Tone' },
    { id: 'distortion', name: 'Distortion', category: 'Tone' },
    { id: 'chorus', name: 'Chorus', category: 'Modulation' },
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Audio Editor</h1>
          <p className="text-slate-600 mt-2">Create, edit, and enhance audio content</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-slate-200">
        {[
          { id: 'tts', label: 'Text-to-Speech', icon: '🎤' },
          { id: 'music', label: 'Music Library', icon: '🎵' },
          { id: 'effects', label: 'Audio Effects', icon: '🎚️' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Text-to-Speech */}
      {activeTab === 'tts' && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Text-to-Speech</CardTitle>
            <CardDescription>Convert text to natural-sounding speech</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Text Input
              </label>
              <textarea
                placeholder="Enter the text you want to convert to speech..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={5}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Voice
                </label>
                <select className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {voices.map((voice) => (
                    <option key={voice.id} value={voice.id}>
                      {voice.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Speed
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  defaultValue="1"
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Pitch
                </label>
                <input
                  type="range"
                  min="-20"
                  max="20"
                  step="1"
                  defaultValue="0"
                  className="w-full"
                />
              </div>
            </div>
            <Button className="w-full bg-blue-600 hover:bg-blue-700 gap-2">
              <Volume2 className="w-4 h-4" />
              Generate Speech
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Music Library */}
      {activeTab === 'music' && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Music Library</CardTitle>
            <CardDescription>Browse and select background music</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Search music..."
                className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">All Genres</option>
                <option value="cinematic">Cinematic</option>
                <option value="ambient">Ambient</option>
                <option value="electronic">Electronic</option>
                <option value="orchestral">Orchestral</option>
              </select>
            </div>
            <div className="space-y-2">
              {[
                { title: 'Epic Adventure', artist: 'Composer Studio', duration: '3:00' },
                { title: 'Ambient Relaxation', artist: 'Sound Design', duration: '4:00' },
                { title: 'Cinematic Strings', artist: 'Orchestra', duration: '2:30' },
              ].map((track) => (
                <div key={track.title} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-slate-900">{track.title}</p>
                    <p className="text-sm text-slate-600">{track.artist}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-600">{track.duration}</span>
                    <Button size="sm" variant="outline" className="gap-1">
                      <Play className="w-3 h-3" />
                      Preview
                    </Button>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      Select
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Audio Effects */}
      {activeTab === 'effects' && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Audio Effects</CardTitle>
            <CardDescription>Apply effects to enhance your audio</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {effects.map((effect) => (
                <div key={effect.id} className="p-3 border border-slate-300 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
                  <p className="font-semibold text-slate-900">{effect.name}</p>
                  <p className="text-xs text-slate-600">{effect.category}</p>
                  <div className="mt-2">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      defaultValue="50"
                      className="w-full"
                    />
                  </div>
                </div>
              ))}
            </div>
            <Button className="w-full bg-blue-600 hover:bg-blue-700">
              Apply Effects
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Voice Recording */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Voice Recording</CardTitle>
          <CardDescription>Record your own voice-over</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center p-8 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
            <div className="text-center">
              <Mic className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-600 mb-4">Click to start recording</p>
              <Button
                onClick={() => {
                  setIsRecording(!isRecording);
                  toast.success(isRecording ? 'Recording stopped' : 'Recording started');
                }}
                className={`gap-2 ${
                  isRecording
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isRecording ? (
                  <>
                    <Pause className="w-4 h-4" />
                    Stop Recording
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4" />
                    Start Recording
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export Audio */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Export Audio</CardTitle>
          <CardDescription>Save your edited audio file</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Format
              </label>
              <select className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="mp3">MP3</option>
                <option value="wav">WAV</option>
                <option value="m4a">M4A</option>
                <option value="flac">FLAC</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Bitrate
              </label>
              <select className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="128k">128 kbps</option>
                <option value="192k">192 kbps</option>
                <option value="256k">256 kbps</option>
                <option value="320k">320 kbps</option>
              </select>
            </div>
          </div>
          <Button className="w-full bg-blue-600 hover:bg-blue-700 gap-2">
            <Download className="w-4 h-4" />
            Export Audio
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
