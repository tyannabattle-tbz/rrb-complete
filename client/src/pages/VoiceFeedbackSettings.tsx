import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Volume2, Vibrate, Settings } from 'lucide-react';
import { toast } from 'sonner';

export default function VoiceFeedbackSettings() {
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [hapticEnabled, setHapticEnabled] = useState(true);
  const [audioVolume, setAudioVolume] = useState(70);
  const [hapticIntensity, setHapticIntensity] = useState(50);
  const [feedbackDelay, setFeedbackDelay] = useState(100);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success('Voice feedback settings saved');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const playTestSound = () => {
    if (audioEnabled) {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      gainNode.gain.setValueAtTime(audioVolume / 100, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);

      toast.success('Test sound played');
    }
  };

  const triggerTestHaptic = () => {
    if (hapticEnabled && navigator.vibrate) {
      navigator.vibrate(hapticIntensity);
      toast.success('Haptic feedback triggered');
    } else if (!hapticEnabled) {
      toast.info('Haptic feedback is disabled');
    } else {
      toast.info('Haptic feedback not supported on this device');
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Voice Feedback Settings</h1>
        <p className="text-slate-600 mt-2">
          Customize audio cues and haptic feedback for voice command recognition and execution.
        </p>
      </div>

      {/* Audio Settings */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="w-5 h-5" />
            Audio Feedback
          </CardTitle>
          <CardDescription>Configure audio cues and volume levels</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Audio Enable/Disable */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div>
              <p className="font-medium text-slate-900">Enable Audio Cues</p>
              <p className="text-sm text-slate-600">Play sounds for voice command feedback</p>
            </div>
            <Switch checked={audioEnabled} onCheckedChange={setAudioEnabled} />
          </div>

          {/* Volume Control */}
          {audioEnabled && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700">Volume Level</label>
                <span className="text-sm font-semibold text-blue-600">{audioVolume}%</span>
              </div>
              <Slider
                value={[audioVolume]}
                onValueChange={(value) => setAudioVolume(value[0])}
                min={0}
                max={100}
                step={5}
                className="w-full"
              />
              <div className="flex gap-2 text-xs text-slate-600">
                <span>Mute</span>
                <span className="flex-1"></span>
                <span>Max</span>
              </div>
            </div>
          )}

          {/* Test Button */}
          <Button
            onClick={playTestSound}
            disabled={!audioEnabled}
            variant="outline"
            className="w-full"
          >
            <Volume2 className="w-4 h-4 mr-2" />
            Test Audio Feedback
          </Button>

          {/* Sound Types */}
          <div className="grid grid-cols-2 gap-3 p-4 bg-blue-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-blue-900">Recognition</p>
              <p className="text-xs text-blue-700">800 Hz tone</p>
            </div>
            <div>
              <p className="text-sm font-medium text-blue-900">Success</p>
              <p className="text-xs text-blue-700">1200 Hz tone</p>
            </div>
            <div>
              <p className="text-sm font-medium text-blue-900">Error</p>
              <p className="text-xs text-blue-700">400 Hz tone</p>
            </div>
            <div>
              <p className="text-sm font-medium text-blue-900">Processing</p>
              <p className="text-xs text-blue-700">600 Hz tone</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Haptic Settings */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Vibrate className="w-5 h-5" />
            Haptic Feedback
          </CardTitle>
          <CardDescription>Configure vibration patterns and intensity</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Haptic Enable/Disable */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div>
              <p className="font-medium text-slate-900">Enable Haptic Feedback</p>
              <p className="text-sm text-slate-600">Vibration patterns for command feedback</p>
            </div>
            <Switch checked={hapticEnabled} onCheckedChange={setHapticEnabled} />
          </div>

          {/* Intensity Control */}
          {hapticEnabled && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700">Intensity Level</label>
                <span className="text-sm font-semibold text-blue-600">{hapticIntensity}%</span>
              </div>
              <Slider
                value={[hapticIntensity]}
                onValueChange={(value) => setHapticIntensity(value[0])}
                min={0}
                max={100}
                step={5}
                className="w-full"
              />
              <div className="flex gap-2 text-xs text-slate-600">
                <span>Light</span>
                <span className="flex-1"></span>
                <span>Strong</span>
              </div>
            </div>
          )}

          {/* Test Button */}
          <Button
            onClick={triggerTestHaptic}
            disabled={!hapticEnabled}
            variant="outline"
            className="w-full"
          >
            <Vibrate className="w-4 h-4 mr-2" />
            Test Haptic Feedback
          </Button>

          {/* Haptic Patterns */}
          <div className="grid grid-cols-2 gap-3 p-4 bg-blue-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-blue-900">Tap</p>
              <p className="text-xs text-blue-700">Single pulse</p>
            </div>
            <div>
              <p className="text-sm font-medium text-blue-900">Double Tap</p>
              <p className="text-xs text-blue-700">Two pulses</p>
            </div>
            <div>
              <p className="text-sm font-medium text-blue-900">Success</p>
              <p className="text-xs text-blue-700">Triple pulse</p>
            </div>
            <div>
              <p className="text-sm font-medium text-blue-900">Error</p>
              <p className="text-xs text-blue-700">Long pulse</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Settings */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Advanced Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-700">Feedback Delay (ms)</label>
              <span className="text-sm font-semibold text-blue-600">{feedbackDelay}ms</span>
            </div>
            <Slider
              value={[feedbackDelay]}
              onValueChange={(value) => setFeedbackDelay(value[0])}
              min={0}
              max={500}
              step={50}
              className="w-full"
            />
            <p className="text-xs text-slate-600">
              Delay before feedback triggers after voice command recognition
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex gap-3">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="flex-1 bg-blue-600 hover:bg-blue-700"
        >
          {isSaving ? 'Saving...' : 'Save Settings'}
        </Button>
        <Button variant="outline" className="flex-1">
          Reset to Defaults
        </Button>
      </div>

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <p className="text-sm text-blue-900">
            💡 <strong>Tip:</strong> Haptic feedback may not be available on all devices. Audio
            feedback works on all platforms with speaker support.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
