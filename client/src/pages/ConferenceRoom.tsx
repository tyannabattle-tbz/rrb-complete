import { useState, useEffect, useRef } from 'react';
import { useRoute, useLocation } from 'wouter';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  ArrowLeft, PhoneOff, Users, Clock, Copy, Mic, MicOff,
  Video as VideoIcon, Globe, Shield, UserCircle, Circle
} from 'lucide-react';

export default function ConferenceRoom() {
  const [, params] = useRoute('/conference/room/:id');
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const conferenceId = params?.id ? parseInt(params.id) : 0;
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const recordingTimer = useRef<NodeJS.Timeout | null>(null);

  const { data: conference, isLoading } = trpc.conference.getConference.useQuery(
    { id: conferenceId },
    { enabled: conferenceId > 0 }
  );

  const { data: recordingStatus } = trpc.conference.getRecordingStatus.useQuery(
    { conferenceId },
    { enabled: conferenceId > 0, refetchInterval: 10000 }
  );

  const endMutation = trpc.conference.endConference.useMutation({
    onSuccess: () => {
      toast.success('Conference ended');
      navigate('/conference');
    },
  });

  const joinMutation = trpc.conference.joinConference.useMutation();
  const startRecordingMutation = trpc.conference.startRecording.useMutation({
    onSuccess: () => {
      setIsRecording(true);
      toast.success('Recording started — audio/video will be saved to S3');
    },
    onError: () => toast.error('Failed to start recording'),
  });
  const stopRecordingMutation = trpc.conference.stopRecording.useMutation({
    onSuccess: (data) => {
      setIsRecording(false);
      setRecordingDuration(0);
      if (recordingTimer.current) clearInterval(recordingTimer.current);
      toast.success(`Recording saved${data.transcriptionTriggered ? ' — auto-transcription triggered' : ''}`);
    },
    onError: () => toast.error('Failed to stop recording'),
  });

  useEffect(() => {
    if (conferenceId > 0 && user) {
      joinMutation.mutate({ conferenceId });
    }
  }, [conferenceId, user?.id]);

  useEffect(() => {
    if (isRecording) {
      recordingTimer.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (recordingTimer.current) clearInterval(recordingTimer.current);
    };
  }, [isRecording]);

  // Check if recording was already in progress
  useEffect(() => {
    if (recordingStatus?.recordingStatus === 'recording') {
      setIsRecording(true);
    }
  }, [recordingStatus?.recordingStatus]);

  const handleCopyLink = () => {
    const url = `${window.location.origin}/conference/room/${conferenceId}`;
    navigator.clipboard.writeText(url);
    toast.success('Conference link copied!');
  };

  const handleStartRecording = () => {
    startRecordingMutation.mutate({ conferenceId });
  };

  const handleStopRecording = () => {
    stopRecordingMutation.mutate({
      conferenceId,
      duration: recordingDuration,
    });
  };

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-white/60">Loading conference room...</p>
        </div>
      </div>
    );
  }

  if (!conference) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-center">
          <p className="text-white text-xl mb-4">Conference not found</p>
          <Button onClick={() => navigate('/conference')} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Conference Hub
          </Button>
        </div>
      </div>
    );
  }

  const jitsiDomain = 'meet.jit.si';
  const roomName = conference.room_code || `rrb-room-${conferenceId}`;
  const displayName = user?.name || 'Guest';
  const jitsiUrl = `https://${jitsiDomain}/${roomName}#userInfo.displayName="${encodeURIComponent(displayName)}"&config.prejoinConfig.enabled=true&config.startWithAudioMuted=true&config.startWithVideoMuted=true`;

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-900/80 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/conference')} className="text-white/70 hover:text-white">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <div>
            <h1 className="text-white font-semibold text-sm truncate max-w-[300px]">{conference.title}</h1>
            <div className="flex items-center gap-2 text-xs text-white/50">
              <Badge variant="outline" className="text-[10px] border-green-500/50 text-green-400">
                {conference.status === 'live' ? '● LIVE' : conference.status.toUpperCase()}
              </Badge>
              <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {conference.attendee_count}</span>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {conference.duration_minutes}min</span>
            </div>
          </div>
        </div>

        {/* Recording Controls */}
        <div className="flex items-center gap-2">
          {isRecording ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-red-500/20 border border-red-500/40">
                <Circle className="w-3 h-3 text-red-500 fill-red-500 animate-pulse" />
                <span className="text-red-400 text-xs font-mono">{formatDuration(recordingDuration)}</span>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleStopRecording}
                disabled={stopRecordingMutation.isPending}
                className="text-xs"
              >
                <MicOff className="w-3 h-3 mr-1" /> Stop Recording
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={handleStartRecording}
              disabled={startRecordingMutation.isPending}
              className="border-red-500/50 text-red-400 hover:bg-red-500/20 text-xs"
            >
              <Mic className="w-3 h-3 mr-1" /> Record
            </Button>
          )}

          {/* Quick Links */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/conference/translation/${conferenceId}`)}
            className="text-cyan-400/70 hover:text-cyan-400 text-xs"
            title="Live Translation"
          >
            <Globe className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/conference/checkin/${conferenceId}`)}
            className="text-green-400/70 hover:text-green-400 text-xs"
            title="Check-In Dashboard"
          >
            <Shield className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/conference/speaker/0`)}
            className="text-purple-400/70 hover:text-purple-400 text-xs"
            title="Speaker Profiles"
          >
            <UserCircle className="w-3.5 h-3.5" />
          </Button>

          <Button variant="ghost" size="sm" onClick={handleCopyLink} className="text-white/70 hover:text-white">
            <Copy className="w-4 h-4 mr-1" /> Share
          </Button>
          <Button variant="destructive" size="sm" onClick={() => {
            if (isRecording) handleStopRecording();
            endMutation.mutate({ id: conferenceId });
          }} disabled={endMutation.isPending}>
            <PhoneOff className="w-4 h-4 mr-1" /> End
          </Button>
        </div>
      </div>

      {/* Recording Status Bar */}
      {recordingStatus?.recordingStatus && recordingStatus.recordingStatus !== 'none' && !isRecording && (
        <div className={`px-4 py-1 text-xs flex items-center gap-2 ${
          recordingStatus.recordingStatus === 'available' ? 'bg-green-500/10 text-green-400' :
          recordingStatus.recordingStatus === 'processing' ? 'bg-amber-500/10 text-amber-400' :
          'bg-gray-500/10 text-gray-400'
        }`}>
          <VideoIcon className="w-3 h-3" />
          Recording: {recordingStatus.recordingStatus}
          {recordingStatus.transcriptStatus && recordingStatus.transcriptStatus !== 'none' && (
            <span className="ml-2">| Transcript: {recordingStatus.transcriptStatus}</span>
          )}
          {recordingStatus.hasTranscript && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/conference/recordings')}
              className="text-green-400 text-xs ml-2 h-5"
            >
              View Transcript →
            </Button>
          )}
        </div>
      )}

      {/* Jitsi iframe */}
      <div className="flex-1">
        <iframe
          src={jitsiUrl}
          allow="camera; microphone; fullscreen; display-capture; autoplay; clipboard-write"
          style={{ width: '100%', height: 'calc(100vh - 56px)', border: 'none' }}
          title="RRB Conference Room"
        />
      </div>
    </div>
  );
}
