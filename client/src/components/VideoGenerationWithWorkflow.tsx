import React, { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Loader2, Film, Image, Mic, FileText, Play, Download, ChevronRight, Sparkles, Volume2 } from 'lucide-react';

type WorkflowStep = 'prompt' | 'script' | 'storyboard' | 'narration' | 'complete';

export function VideoGenerationWithWorkflow() {
  const [step, setStep] = useState<WorkflowStep>('prompt');
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('cinematic');
  const [duration, setDuration] = useState(30);
  const [voice, setVoice] = useState('valanna');

  const [script, setScript] = useState<{ title: string; scenes: Array<{ sceneNumber: number; description: string; narration: string; duration: number }> } | null>(null);
  const [storyboardFrames, setStoryboardFrames] = useState<Array<{ sceneNumber: number; imageUrl: string; description: string }>>([]);
  const [narrationUrl, setNarrationUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateScript = trpc.motionGeneration.generateScript.useMutation();
  const generateStoryboard = trpc.motionGeneration.generateStoryboard.useMutation();
  const generateNarration = trpc.motionGeneration.generateNarration.useMutation();

  const handleGenerateScript = async () => {
    if (!prompt.trim()) { toast.error('Enter a video concept first'); return; }
    setIsGenerating(true);
    try {
      const result = await generateScript.mutateAsync({ prompt, style, durationSeconds: duration });
      setScript(result);
      setStep('script');
      toast.success('Script generated!');
    } catch (e: any) {
      toast.error(e.message || 'Failed to generate script');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateStoryboard = async () => {
    if (!script) return;
    setIsGenerating(true);
    try {
      const frames: typeof storyboardFrames = [];
      for (const scene of script.scenes.slice(0, 4)) {
        try {
          const result = await generateStoryboard.mutateAsync({
            sceneDescription: scene.description,
            style,
            sceneNumber: scene.sceneNumber,
          });
          frames.push(result);
        } catch {
          frames.push({ sceneNumber: scene.sceneNumber, imageUrl: '', description: scene.description });
        }
      }
      setStoryboardFrames(frames);
      setStep('storyboard');
      toast.success(`${frames.filter(f => f.imageUrl).length} storyboard frames generated!`);
    } catch (e: any) {
      toast.error(e.message || 'Failed to generate storyboard');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateNarration = async () => {
    if (!script) return;
    setIsGenerating(true);
    try {
      const narrationText = script.scenes.map(s => s.narration).join(' ');
      const result = await generateNarration.mutateAsync({ text: narrationText, voice });
      setNarrationUrl(result.audioUrl);
      setStep('narration');
      toast.success('Narration generated!');
    } catch (e: any) {
      toast.error(e.message || 'Failed to generate narration');
    } finally {
      setIsGenerating(false);
    }
  };

  const styles = [
    { value: 'cinematic', label: 'Cinematic' },
    { value: 'documentary', label: 'Documentary' },
    { value: 'promotional', label: 'Promotional' },
    { value: 'educational', label: 'Educational' },
    { value: 'artistic', label: 'Artistic' },
  ];

  const voices = [
    { value: 'valanna', label: 'Valanna (Warm DJ)' },
    { value: 'seraph', label: 'Seraph (Ethereal)' },
    { value: 'candy', label: 'Candy (Energetic)' },
    { value: 'qumus', label: 'QUMUS (Authoritative)' },
    { value: 'alloy', label: 'Alloy (Neutral)' },
    { value: 'nova', label: 'Nova (Friendly)' },
    { value: 'shimmer', label: 'Shimmer (Gentle)' },
  ];

  const stepIndicators = [
    { key: 'prompt', label: 'Concept', icon: FileText },
    { key: 'script', label: 'Script', icon: Sparkles },
    { key: 'storyboard', label: 'Storyboard', icon: Image },
    { key: 'narration', label: 'Narration', icon: Volume2 },
    { key: 'complete', label: 'Complete', icon: Film },
  ];

  const currentStepIndex = stepIndicators.findIndex(s => s.key === step);

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8 overflow-x-auto scrollbar-hide">
        {stepIndicators.map((s, i) => {
          const Icon = s.icon;
          const isActive = i === currentStepIndex;
          const isCompleted = i < currentStepIndex;
          return (
            <React.Fragment key={s.key}>
              <div className="flex flex-col items-center gap-1 min-w-[60px]">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  isActive ? 'bg-amber-500 text-white scale-110' : isCompleted ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-400'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`text-xs ${isActive ? 'text-amber-400 font-semibold' : isCompleted ? 'text-green-400' : 'text-gray-500'}`}>
                  {s.label}
                </span>
              </div>
              {i < stepIndicators.length - 1 && (
                <ChevronRight className={`w-4 h-4 flex-shrink-0 ${i < currentStepIndex ? 'text-green-500' : 'text-gray-600'}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Step 1: Concept Input */}
      {step === 'prompt' && (
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-400" /> Video Concept
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Describe your video concept... e.g., 'A 30-second promotional video for the UN CSW70 conference highlighting women empowerment and global solidarity'"
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              className="min-h-[120px] bg-gray-800 border-gray-600 text-white placeholder:text-gray-500"
            />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Style</label>
                <select value={style} onChange={e => setStyle(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-600 text-white rounded-md px-3 py-2 text-sm">
                  {styles.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Duration (seconds)</label>
                <Input type="number" value={duration} onChange={e => setDuration(Number(e.target.value))}
                  min={10} max={180} className="bg-gray-800 border-gray-600 text-white" />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Narration Voice</label>
                <select value={voice} onChange={e => setVoice(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-600 text-white rounded-md px-3 py-2 text-sm">
                  {voices.map(v => <option key={v.value} value={v.value}>{v.label}</option>)}
                </select>
              </div>
            </div>
            <Button onClick={handleGenerateScript} disabled={isGenerating || !prompt.trim()}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white">
              {isGenerating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating Script...</> : <><Sparkles className="w-4 h-4 mr-2" /> Generate Script</>}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Script Review */}
      {step === 'script' && script && (
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" /> Script: {script.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {script.scenes.map(scene => (
              <div key={scene.sceneNumber} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-amber-600 text-white text-xs font-bold px-2 py-0.5 rounded">Scene {scene.sceneNumber}</span>
                  <span className="text-gray-400 text-xs">{scene.duration}s</span>
                </div>
                <p className="text-gray-300 text-sm mb-2"><strong className="text-gray-200">Visual:</strong> {scene.description}</p>
                <p className="text-gray-400 text-sm italic">"{scene.narration}"</p>
              </div>
            ))}
            <div className="flex gap-3">
              <Button onClick={() => setStep('prompt')} variant="outline" className="border-gray-600 text-gray-300">Back</Button>
              <Button onClick={handleGenerateStoryboard} disabled={isGenerating}
                className="flex-1 bg-amber-600 hover:bg-amber-700 text-white">
                {isGenerating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating Frames...</> : <><Image className="w-4 h-4 mr-2" /> Generate Storyboard</>}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Storyboard Review */}
      {step === 'storyboard' && (
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Image className="w-5 h-5 text-amber-400" /> Storyboard Frames
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {storyboardFrames.map(frame => (
                <div key={frame.sceneNumber} className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
                  {frame.imageUrl ? (
                    <img src={frame.imageUrl} alt={`Scene ${frame.sceneNumber}`} className="w-full h-48 object-cover" />
                  ) : (
                    <div className="w-full h-48 bg-gray-700 flex items-center justify-center text-gray-500">
                      <span>Frame not generated</span>
                    </div>
                  )}
                  <div className="p-3">
                    <span className="bg-amber-600 text-white text-xs font-bold px-2 py-0.5 rounded">Scene {frame.sceneNumber}</span>
                    <p className="text-gray-400 text-xs mt-2 line-clamp-2">{frame.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <Button onClick={() => setStep('script')} variant="outline" className="border-gray-600 text-gray-300">Back</Button>
              <Button onClick={handleGenerateNarration} disabled={isGenerating}
                className="flex-1 bg-amber-600 hover:bg-amber-700 text-white">
                {isGenerating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating Narration...</> : <><Mic className="w-4 h-4 mr-2" /> Generate Narration</>}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Narration + Final */}
      {step === 'narration' && (
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-amber-400" /> Narration Preview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {narrationUrl ? (
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <p className="text-gray-300 text-sm mb-3">Voice: <strong className="text-amber-400">{voices.find(v => v.value === voice)?.label}</strong></p>
                <audio controls className="w-full" src={narrationUrl}>Your browser does not support audio.</audio>
              </div>
            ) : (
              <p className="text-gray-400">No narration generated yet.</p>
            )}
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <h3 className="text-white font-semibold mb-2">Production Summary</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-gray-400">Title:</div><div className="text-gray-200">{script?.title}</div>
                <div className="text-gray-400">Scenes:</div><div className="text-gray-200">{script?.scenes.length}</div>
                <div className="text-gray-400">Frames:</div><div className="text-gray-200">{storyboardFrames.filter(f => f.imageUrl).length} generated</div>
                <div className="text-gray-400">Style:</div><div className="text-gray-200 capitalize">{style}</div>
                <div className="text-gray-400">Duration:</div><div className="text-gray-200">{duration}s</div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => setStep('storyboard')} variant="outline" className="border-gray-600 text-gray-300">Back</Button>
              <Button onClick={() => { setStep('complete'); toast.success('Video production package complete!'); }}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white">
                <Film className="w-4 h-4 mr-2" /> Finalize Production
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 5: Complete */}
      {step === 'complete' && (
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Film className="w-5 h-5 text-green-400" /> Production Complete
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Film className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{script?.title}</h3>
              <p className="text-gray-400">Your production package is ready with {script?.scenes.length} scenes, {storyboardFrames.filter(f => f.imageUrl).length} storyboard frames, and narration.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {storyboardFrames.filter(f => f.imageUrl).map(frame => (
                <a key={frame.sceneNumber} href={frame.imageUrl} target="_blank" rel="noopener noreferrer"
                  className="bg-gray-800 rounded-lg p-3 border border-gray-700 hover:border-amber-500 transition-colors flex items-center gap-2">
                  <Download className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span className="text-gray-300 text-sm">Frame {frame.sceneNumber}</span>
                </a>
              ))}
              {narrationUrl && (
                <a href={narrationUrl} target="_blank" rel="noopener noreferrer"
                  className="bg-gray-800 rounded-lg p-3 border border-gray-700 hover:border-amber-500 transition-colors flex items-center gap-2">
                  <Download className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span className="text-gray-300 text-sm">Narration Audio</span>
                </a>
              )}
            </div>
            <Button onClick={() => { setStep('prompt'); setScript(null); setStoryboardFrames([]); setNarrationUrl(null); setPrompt(''); }}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white">
              <Play className="w-4 h-4 mr-2" /> Start New Production
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default VideoGenerationWithWorkflow;
