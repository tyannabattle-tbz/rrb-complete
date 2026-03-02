import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Volume2, Play, Download, Settings } from "lucide-react";
import { Slider } from "@/components/ui/slider";

interface NotificationSound {
  id: string;
  name: string;
  type: "critical" | "high" | "medium" | "low";
  duration: number;
  url: string;
}

const NOTIFICATION_SOUNDS: NotificationSound[] = [
  {
    id: "bell-1",
    name: "Classic Bell",
    type: "medium",
    duration: 0.8,
    url: "data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA==",
  },
  {
    id: "chime-1",
    name: "Soft Chime",
    type: "low",
    duration: 1.2,
    url: "data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA==",
  },
  {
    id: "alert-1",
    name: "Alert Tone",
    type: "high",
    duration: 0.6,
    url: "data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA==",
  },
  {
    id: "critical-1",
    name: "Critical Alert",
    type: "critical",
    duration: 1.5,
    url: "data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA==",
  },
  {
    id: "notification-1",
    name: "Notification Pop",
    type: "low",
    duration: 0.4,
    url: "data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA==",
  },
];

const SEVERITY_MAPPING: Record<string, string> = {
  critical: "critical-1",
  high: "alert-1",
  medium: "bell-1",
  low: "notification-1",
};

interface NotificationSoundLibraryProps {
  onSoundSelect?: (soundId: string) => void;
}

export function NotificationSoundLibrary({ onSoundSelect }: NotificationSoundLibraryProps) {
  const [volume, setVolume] = useState<number>(70);
  const [selectedSound, setSelectedSound] = useState<string>("bell-1");
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [soundMappings, setSoundMappings] = useState<Record<string, string>>(SEVERITY_MAPPING);
  const [silentMode, setSilentMode] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);

  useEffect(() => {
    // Request notification permission
    if ("Notification" in window && Notification.permission === "granted") {
      setPermissionGranted(true);
    }
  }, []);

  const requestNotificationPermission = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      setPermissionGranted(permission === "granted");
    }
  };

  const playSound = async (soundId: string) => {
    if (silentMode || volume === 0) {
      return;
    }

    try {
      const sound = NOTIFICATION_SOUNDS.find((s) => s.id === soundId);
      if (!sound) return;

      // Create audio context for playing sound
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

      // Create oscillator for tone generation
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Set volume
      gainNode.gain.setValueAtTime(volume / 100, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + sound.duration);

      // Set frequency based on sound type
      const frequencies: Record<string, number> = {
        "bell-1": 800,
        "chime-1": 600,
        "alert-1": 1000,
        "critical-1": 1200,
        "notification-1": 700,
      };

      oscillator.frequency.setValueAtTime(frequencies[soundId] || 800, audioContext.currentTime);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + sound.duration);

      setPlayingId(soundId);
      setTimeout(() => setPlayingId(null), sound.duration * 1000);
    } catch (error) {
      console.error("Failed to play sound:", error);
    }
  };

  const handleSoundSelect = (soundId: string) => {
    setSelectedSound(soundId);
    playSound(soundId);
    onSoundSelect?.(soundId);
  };

  const getSeverityColor = (type: string) => {
    switch (type) {
      case "critical":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Volume2 className="w-5 h-5" />
            <div>
              <CardTitle>Notification Sounds</CardTitle>
              <CardDescription>Manage alert sounds and preferences</CardDescription>
            </div>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Sound Settings</DialogTitle>
                <DialogDescription>Configure notification sound preferences</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {/* Volume Control */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Master Volume: {volume}%</label>
                  <Slider
                    value={[volume]}
                    onValueChange={(value) => setVolume(value[0])}
                    min={0}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                </div>

                {/* Silent Mode */}
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Silent Mode</label>
                  <input
                    type="checkbox"
                    checked={silentMode}
                    onChange={(e) => setSilentMode(e.target.checked)}
                    className="w-4 h-4"
                  />
                </div>

                {/* Severity Mapping */}
                <div className="space-y-3 pt-4 border-t">
                  <h4 className="font-medium text-sm">Severity Sound Mapping</h4>
                  {Object.entries(SEVERITY_MAPPING).map(([severity, defaultSoundId]) => (
                    <div key={severity} className="space-y-1">
                      <label className="text-sm capitalize">{severity} Alerts</label>
                      <Select value={soundMappings[severity]} onValueChange={(v) => setSoundMappings({ ...soundMappings, [severity]: v })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {NOTIFICATION_SOUNDS.map((sound) => (
                            <SelectItem key={sound.id} value={sound.id}>
                              {sound.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>

                {/* Notification Permission */}
                {!permissionGranted && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800 mb-2">Enable browser notifications for sound alerts</p>
                    <Button size="sm" onClick={requestNotificationPermission} className="w-full">
                      Grant Permission
                    </Button>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Sound Library */}
        <div className="space-y-2">
          <h3 className="font-semibold text-sm">Available Sounds</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {NOTIFICATION_SOUNDS.map((sound) => (
              <div
                key={sound.id}
                className={`p-3 border rounded-lg cursor-pointer transition ${
                  selectedSound === sound.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                }`}
                onClick={() => handleSoundSelect(sound.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-medium text-sm">{sound.name}</p>
                    <p className="text-xs text-muted-foreground">{sound.duration.toFixed(1)}s</p>
                  </div>
                  <Badge className={getSeverityColor(sound.type)}>{sound.type}</Badge>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      playSound(sound.id);
                    }}
                    disabled={playingId === sound.id}
                    className="flex-1"
                  >
                    <Play className="w-3 h-3 mr-1" />
                    {playingId === sound.id ? "Playing..." : "Play"}
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Download className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Current Selection */}
        <div className="p-3 bg-muted rounded-lg">
          <p className="text-sm font-medium mb-2">Current Selection</p>
          <p className="text-sm text-muted-foreground">
            {NOTIFICATION_SOUNDS.find((s) => s.id === selectedSound)?.name} • Volume: {volume}%
            {silentMode && " • Silent Mode Enabled"}
          </p>
        </div>

        {/* Test Notification */}
        <Button
          onClick={() => {
            playSound(selectedSound);
            if (permissionGranted) {
              new Notification("Test Notification", {
                body: "This is a test notification sound",
                icon: "/notification-icon.png",
              });
            }
          }}
          className="w-full"
        >
          Test Notification
        </Button>
      </CardContent>
    </Card>
  );
}
