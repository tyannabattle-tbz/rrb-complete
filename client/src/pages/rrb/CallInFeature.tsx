import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Phone, PhoneOff, Mic, MicOff, Volume2, Users } from 'lucide-react';
import { toast } from 'sonner';

interface Caller {
  id: string;
  name: string;
  topic: string;
  duration: number;
  status: 'waiting' | 'connected' | 'ended';
  timestamp: Date;
}

export default function CallInFeature() {
  const [isCallActive, setIsCallActive] = useState(false);
  const [callerName, setCallerName] = useState('');
  const [callerTopic, setCallerTopic] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [callers, setCallers] = useState<Caller[]>([]);
  const [activeCallerId, setActiveCallerId] = useState<string | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);

  const startCall = async () => {
    if (!callerName.trim()) {
      toast.error('Please enter your name');
      return;
    }
    if (!callerTopic.trim()) {
      toast.error('Please enter your topic');
      return;
    }

    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      
      const callerId = `caller-${Date.now()}`;
      const newCaller: Caller = {
        id: callerId,
        name: callerName,
        topic: callerTopic,
        duration: 0,
        status: 'connected',
        timestamp: new Date(),
      };

      setCallers(prev => [...prev, newCaller]);
      setActiveCallerId(callerId);
      setIsCallActive(true);
      setCallDuration(0);

      // Start call timer
      callTimerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);

      toast.success(`Connected! You're on air, ${callerName}`);
    } catch (error) {
      console.error('Failed to access microphone:', error);
      toast.error('Unable to access microphone. Please check permissions.');
    }
  };

  const endCall = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }

    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
      callTimerRef.current = null;
    }

    if (activeCallerId) {
      setCallers(prev =>
        prev.map(caller =>
          caller.id === activeCallerId
            ? { ...caller, status: 'ended', duration: callDuration }
            : caller
        )
      );
    }

    setIsCallActive(false);
    setActiveCallerId(null);
    setCallerName('');
    setCallerTopic('');
    setCallDuration(0);
    setIsMuted(false);

    toast.success('Call ended. Thank you for calling in!');
  };

  const toggleMute = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
      toast.info(isMuted ? 'Microphone on' : 'Microphone muted');
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Call-In Form */}
      {!isCallActive ? (
        <Card className="p-6 bg-gradient-to-br from-green-500/5 to-emerald-500/5 border-green-500/20">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Phone className="w-5 h-5 text-green-500" />
            Call In to the Show
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Your Name</label>
              <input
                type="text"
                value={callerName}
                onChange={(e) => setCallerName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:border-green-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Topic/Question</label>
              <textarea
                value={callerTopic}
                onChange={(e) => setCallerTopic(e.target.value)}
                placeholder="What would you like to discuss?"
                rows={3}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:border-green-500 outline-none resize-none"
              />
            </div>

            <Button
              onClick={startCall}
              className="w-full bg-green-600 hover:bg-green-700 gap-2"
            >
              <Phone className="w-4 h-4" />
              Call In Now
            </Button>
          </div>
        </Card>
      ) : (
        /* Active Call Display */
        <Card className="p-6 bg-gradient-to-br from-red-500/5 to-orange-500/5 border-red-500/20">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold">{callerName}</h3>
                <p className="text-sm text-foreground/60">{callerTopic}</p>
              </div>
              <Badge className="bg-red-600 text-white animate-pulse">
                LIVE
              </Badge>
            </div>

            <div className="text-center py-4">
              <div className="text-4xl font-bold text-red-600">
                {formatDuration(callDuration)}
              </div>
              <p className="text-sm text-foreground/60">Call Duration</p>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={toggleMute}
                variant={isMuted ? 'destructive' : 'outline'}
                className="flex-1 gap-2"
              >
                {isMuted ? (
                  <>
                    <MicOff className="w-4 h-4" />
                    Muted
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4" />
                    Mute
                  </>
                )}
              </Button>

              <Button
                onClick={endCall}
                className="flex-1 bg-red-600 hover:bg-red-700 gap-2"
              >
                <PhoneOff className="w-4 h-4" />
                End Call
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Call Queue */}
      {callers.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Recent Callers ({callers.length})
          </h3>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {callers.map(caller => (
              <div
                key={caller.id}
                className="p-3 bg-background rounded-lg border border-border flex items-center justify-between"
              >
                <div className="flex-1">
                  <p className="font-semibold text-sm">{caller.name}</p>
                  <p className="text-xs text-foreground/60 line-clamp-1">{caller.topic}</p>
                </div>
                <div className="text-right ml-4">
                  <Badge
                    variant={caller.status === 'connected' ? 'default' : 'secondary'}
                    className="mb-1"
                  >
                    {caller.status === 'connected' ? 'ON AIR' : 'ENDED'}
                  </Badge>
                  <p className="text-xs text-foreground/60">
                    {formatDuration(caller.duration)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Call-In Tips */}
      <Card className="p-4 bg-blue-500/5 border-blue-500/20">
        <h4 className="font-semibold text-sm mb-2">Call-In Tips</h4>
        <ul className="text-xs text-foreground/70 space-y-1">
          <li>• Find a quiet location for best audio quality</li>
          <li>• Keep your topic concise and relevant</li>
          <li>• Be respectful and follow community guidelines</li>
          <li>• Test your microphone before calling</li>
          <li>• Calls may be recorded for archival purposes</li>
        </ul>
      </Card>
    </div>
  );
}
