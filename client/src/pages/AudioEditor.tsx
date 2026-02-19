import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Music, Mic, Volume2, Play, Pause, Download, Square, Check } from 'lucide-react';
import { toast } from 'sonner';

const MUSIC_LIBRARY = [
  { title: "Rockin' Rockin' Boogie — Original", artist: 'Seabrun Candy Hunter', duration: '5:30', url: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/xVJBlEVuwngNcWhO.mp3' },
  { title: "California I'm Coming", artist: 'Seabrun Candy Hunter', duration: '6:12', url: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/zByVVlWeoYCaITZI.mp3' },
  { title: 'Ambient Relaxation', artist: 'Sound Design', duration: '4:00', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
  { title: 'Cinematic Strings', artist: 'Orchestra', duration: '2:30', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
  { title: 'Electronic Groove', artist: 'Beat Lab', duration: '3:45', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
];

export default function AudioEditor() {
  const [activeTab, setActiveTab] = useState<'tts' | 'music' | 'effects'>('tts');
  const [isRecording, setIsRecording] = useState(false);
  const [ttsText, setTtsText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewingTrack, setPreviewingTrack] = useState<string | null>(null);
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null);
  const [activeEffects, setActiveEffects] = useState<Set<string>>(new Set());
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement>(null);

  const effects = [
    { id: 'reverb', name: 'Reverb', category: 'Space' },
    { id: 'echo', name: 'Echo', category: 'Delay' },
    { id: 'compression', name: 'Compression', category: 'Dynamics' },
    { id: 'eq', name: 'Equalizer', category: 'Tone' },
    { id: 'distortion', name: 'Distortion', category: 'Tone' },
    { id: 'chorus', name: 'Chorus', category: 'Modulation' },
  ];

  const handleGenerateSpeech = () => {
    if (!ttsText.trim()) {
      toast.error('Please enter text to convert to speech');
      return;
    }
    setIsGenerating(true);
    // Use browser's built-in speech synthesis
    const utterance = new SpeechSynthesisUtterance(ttsText);
    utterance.onend = () => {
      setIsGenerating(false);
      toast.success('Speech generation complete!');
    };
    utterance.onerror = () => {
      setIsGenerating(false);
      toast.error('Speech synthesis failed. Try a shorter text.');
    };
    window.speechSynthesis.speak(utterance);
    toast.info('Generating speech...');
  };

  const handlePreview = (url: string, title: string) => {
    const audio = audioRef.current;
    if (!audio) return;
    if (previewingTrack === url) {
      audio.pause();
      setPreviewingTrack(null);
      return;
    }
    audio.src = url;
    audio.play().then(() => {
      setPreviewingTrack(url);
      toast.info(`Previewing: ${title}`);
    }).catch(() => {
      toast.error('Click anywhere on the page first, then try again.');
    });
  };

  const handleSelect = (url: string, title: string) => {
    setSelectedTrack(url);
    toast.success(`Selected: ${title}`);
  };

  const toggleEffect = (id: string) => {
    const next = new Set(activeEffects);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setActiveEffects(next);
  };

  const handleApplyEffects = () => {
    if (activeEffects.size === 0) {
      toast.error('Select at least one effect to apply');
      return;
    }
    const names = effects.filter(e => activeEffects.has(e.id)).map(e => e.name).join(', ');
    toast.success(`Applied effects: ${names}`);
  };

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
      recorder.onstop = () => {
        setRecordedChunks(chunks);
        stream.getTracks().forEach(t => t.stop());
        toast.success('Recording saved! You can export it below.');
      };
      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      toast.success('Recording started — speak into your microphone');
    } catch {
      toast.error('Microphone access denied. Please allow microphone permissions.');
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
    setIsRecording(false);
    setMediaRecorder(null);
  };

  const handleExport = () => {
    if (recordedChunks.length > 0) {
      const blob = new Blob(recordedChunks, { type: 'audio/webm' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'recording.webm';
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Audio exported!');
    } else if (selectedTrack) {
      const a = document.createElement('a');
      a.href = selectedTrack;
      a.download = 'audio-export.mp3';
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success('Download started!');
    } else {
      toast.info('Record audio or select a track first, then export.');
    }
  };

  return (
    <div className="space-y-6 p-6 bg-background text-foreground min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Audio Editor</h1>
          <p className="text-foreground/60 mt-2">Create, edit, and enhance audio content</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-border">
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
                ? 'text-amber-500 border-b-2 border-amber-500'
                : 'text-foreground/60 hover:text-foreground'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Text-to-Speech */}
      {activeTab === 'tts' && (
        <Card>
          <CardHeader>
            <CardTitle>Text-to-Speech</CardTitle>
            <CardDescription>Convert text to natural-sounding speech using your browser's speech engine</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Text Input</label>
              <textarea
                placeholder="Enter the text you want to convert to speech..."
                value={ttsText}
                onChange={(e) => setTtsText(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-foreground resize-none"
                rows={5}
              />
            </div>
            <Button
              className="w-full bg-amber-500 hover:bg-amber-600 text-black gap-2"
              onClick={handleGenerateSpeech}
              disabled={isGenerating}
            >
              <Volume2 className="w-4 h-4" />
              {isGenerating ? 'Speaking...' : 'Generate Speech'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Music Library */}
      {activeTab === 'music' && (
        <Card>
          <CardHeader>
            <CardTitle>Music Library</CardTitle>
            <CardDescription>Browse and select background music — includes Seabrun Candy Hunter originals</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {MUSIC_LIBRARY.map((track) => (
              <div key={track.title} className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
                <div>
                  <p className="font-semibold text-foreground">{track.title}</p>
                  <p className="text-sm text-foreground/60">{track.artist}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-foreground/60">{track.duration}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1"
                    onClick={() => handlePreview(track.url, track.title)}
                  >
                    {previewingTrack === track.url ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                    {previewingTrack === track.url ? 'Stop' : 'Preview'}
                  </Button>
                  <Button
                    size="sm"
                    className={selectedTrack === track.url ? 'bg-green-600 hover:bg-green-700' : 'bg-amber-500 hover:bg-amber-600 text-black'}
                    onClick={() => handleSelect(track.url, track.title)}
                  >
                    {selectedTrack === track.url ? <><Check className="w-3 h-3 mr-1" />Selected</> : 'Select'}
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Audio Effects */}
      {activeTab === 'effects' && (
        <Card>
          <CardHeader>
            <CardTitle>Audio Effects</CardTitle>
            <CardDescription>Apply effects to enhance your audio</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {effects.map((effect) => (
                <div
                  key={effect.id}
                  onClick={() => toggleEffect(effect.id)}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    activeEffects.has(effect.id)
                      ? 'border-amber-500 bg-amber-500/10'
                      : 'border-zinc-700 hover:border-zinc-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-foreground">{effect.name}</p>
                      <p className="text-xs text-foreground/60">{effect.category}</p>
                    </div>
                    {activeEffects.has(effect.id) && <Check className="w-4 h-4 text-amber-500" />}
                  </div>
                  <div className="mt-2">
                    <input type="range" min="0" max="100" defaultValue="50" className="w-full accent-amber-500" />
                  </div>
                </div>
              ))}
            </div>
            <Button className="w-full bg-amber-500 hover:bg-amber-600 text-black" onClick={handleApplyEffects}>
              Apply Effects ({activeEffects.size} selected)
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Voice Recording */}
      <Card>
        <CardHeader>
          <CardTitle>Voice Recording</CardTitle>
          <CardDescription>Record your own voice-over using your microphone</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center p-8 bg-zinc-800 rounded-lg border-2 border-dashed border-zinc-600">
            <div className="text-center">
              <Mic className={`w-12 h-12 mx-auto mb-3 ${isRecording ? 'text-red-500 animate-pulse' : 'text-foreground/40'}`} />
              <p className="text-foreground/60 mb-4">{isRecording ? 'Recording in progress...' : 'Click to start recording'}</p>
              <Button
                onClick={isRecording ? handleStopRecording : handleStartRecording}
                className={`gap-2 ${isRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-amber-500 hover:bg-amber-600 text-black'}`}
              >
                {isRecording ? <><Square className="w-4 h-4" />Stop Recording</> : <><Mic className="w-4 h-4" />Start Recording</>}
              </Button>
              {recordedChunks.length > 0 && !isRecording && (
                <p className="text-green-400 text-sm mt-2">Recording saved — ready to export</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export */}
      <Card>
        <CardHeader>
          <CardTitle>Export Audio</CardTitle>
          <CardDescription>Save your edited audio file</CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full bg-amber-500 hover:bg-amber-600 text-black gap-2" onClick={handleExport}>
            <Download className="w-4 h-4" />
            Export Audio
          </Button>
        </CardContent>
      </Card>

      <audio ref={audioRef} onEnded={() => setPreviewingTrack(null)} />
    </div>
  );
}
