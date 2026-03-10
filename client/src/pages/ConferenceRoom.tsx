import { useState, useEffect, useRef } from 'react';
import { useRoute, useLocation } from 'wouter';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  ArrowLeft, PhoneOff, Users, Clock, Copy, Mic, MicOff,
  Video as VideoIcon, Globe, Shield, UserCircle, Circle,
  Radio, Tv, ExternalLink, MoreHorizontal, X
} from 'lucide-react';

export default function ConferenceRoom() {
  const [, params] = useRoute('/conference/room/:id');
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const conferenceId = params?.id ? parseInt(params.id) : 0;
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [showMoreTools, setShowMoreTools] = useState(false);
  const recordingTimer = useRef<NodeJS.Timeout | null>(null);

  const { data: conference, isLoading } = trpc.conference.getConference.useQuery(
    { id: conferenceId },
    { enabled: conferenceId > 0 }
  );

  const { data: recordingStatus } = trpc.conference.getRecordingStatus.useQuery(
    { conferenceId },
    { enabled: conferenceId > 0, refetchInterval: 10000 }
  );

  const { data: restreamStatus } = trpc.conference.getRestreamStatus.useQuery(
    { conferenceId },
    { enabled: conferenceId > 0, refetchInterval: 10000 }
  );
  const startRestreamMutation = trpc.conference.startRestream.useMutation({
    onSuccess: (data) => {
      toast.success('Multi-stream activated! Open Restream Studio to go live.');
      if (data.studioUrl) window.open(data.studioUrl, '_blank');
    },
    onError: () => toast.error('Failed to start multi-stream'),
  });
  const stopRestreamMutation = trpc.conference.stopRestream.useMutation({
    onSuccess: () => toast.success('Multi-stream stopped'),
    onError: () => toast.error('Failed to stop multi-stream'),
  });

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

  const handleEndConference = () => {
    if (isRecording) handleStopRecording();
    endMutation.mutate({ id: conferenceId });
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
  
  // Jitsi URL — NO moderator requirement, NO lobby, instant join
  const jitsiConfig = [
    `userInfo.displayName="${encodeURIComponent(displayName)}"`,
    // Disable lobby and moderator requirement — anyone can join immediately
    'config.prejoinConfig.enabled=false',
    'config.prejoinPageEnabled=false',
    'config.startWithAudioMuted=false',
    'config.startWithVideoMuted=false',
    'config.enableLobbyChat=false',
    'config.hideLobbyButton=true',
    // Disable ALL moderator-related features
    'config.lobby.autoKnock=true',
    'config.lobby.enabled=false',
    'config.requireDisplayName=false',
    'config.enableUserRolesBasedOnToken=false',
    // Disable Jitsi's built-in recording (we use our own S3 recording)
    'config.enableRecording=false',
    'config.fileRecordingsEnabled=false',
    'config.liveStreamingEnabled=false',
    'config.localRecording.disable=true',
    // Better mobile experience
    'config.disableDeepLinking=true',
    'config.enableClosePage=false',
    'config.disableInviteFunctions=false',
    'config.enableWelcomePage=false',
    'config.enableInsecureRoomNameWarning=false',
    // P2P for 2-person calls (better quality, no server needed)
    'config.p2p.enabled=true',
    // UI customization
    'config.hideConferenceSubject=false',
    'config.hideConferenceTimer=false',
    'config.disableModeratorIndicator=true',
    'config.defaultLanguage=en',
    // Interface config
    'interfaceConfig.DISABLE_JOIN_LEAVE_NOTIFICATIONS=false',
    'interfaceConfig.MOBILE_APP_PROMO=false',
    'interfaceConfig.SHOW_CHROME_EXTENSION_BANNER=false',
  ].join('&');
  
  const jitsiUrl = `https://${jitsiDomain}/${roomName}#${jitsiConfig}`;

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* ── Single compact toolbar ── */}
      <div className="bg-gray-900/90 border-b border-gray-800/50 px-2 sm:px-3 py-1.5">
        <div className="flex items-center justify-between gap-1">
          {/* Left: Back + Title */}
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            <Button variant="ghost" size="sm" onClick={() => navigate('/conference')} className="text-white/70 hover:text-white p-1 h-7 w-7 shrink-0">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-white font-semibold text-xs sm:text-sm truncate">{conference.title}</h1>
            <Badge variant="outline" className="text-[9px] sm:text-[10px] border-green-500/50 text-green-400 px-1 py-0 shrink-0 hidden xs:inline-flex">
              {conference.status === 'live' ? '● LIVE' : conference.status?.toUpperCase()}
            </Badge>
          </div>

          {/* Center: Main controls — scrollable on mobile */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Recording */}
            {isRecording ? (
              <button
                onClick={handleStopRecording}
                disabled={stopRecordingMutation.isPending}
                className="flex items-center gap-1 px-2 py-1 rounded bg-red-600 text-white text-[11px] sm:text-xs font-medium h-7 whitespace-nowrap"
              >
                <Circle className="w-2 h-2 fill-white animate-pulse" />
                <span>{formatDuration(recordingDuration)}</span>
              </button>
            ) : (
              <button
                onClick={handleStartRecording}
                disabled={startRecordingMutation.isPending}
                className="flex items-center gap-1 px-2 py-1 rounded border border-red-500/50 text-red-400 hover:bg-red-500/20 text-[11px] sm:text-xs h-7 whitespace-nowrap"
              >
                <Mic className="w-3 h-3" />
                <span className="hidden sm:inline">Rec</span>
              </button>
            )}

            {/* Restream */}
            {restreamStatus?.active ? (
              <button
                onClick={() => stopRestreamMutation.mutate({ conferenceId })}
                disabled={stopRestreamMutation.isPending}
                className="flex items-center gap-1 px-2 py-1 rounded bg-purple-600/30 text-purple-400 text-[11px] sm:text-xs h-7 whitespace-nowrap"
              >
                <Tv className="w-3 h-3 animate-pulse" />
                <span className="hidden sm:inline">Live</span>
              </button>
            ) : (
              <button
                onClick={() => startRestreamMutation.mutate({
                  conferenceId,
                  title: conference?.title,
                  platforms: ['youtube', 'facebook', 'linkedin', 'twitter'],
                })}
                disabled={startRestreamMutation.isPending}
                className="flex items-center gap-1 px-2 py-1 rounded border border-purple-500/50 text-purple-400 hover:bg-purple-500/20 text-[11px] sm:text-xs h-7 whitespace-nowrap"
              >
                <Tv className="w-3 h-3" />
                <span className="hidden sm:inline">Stream</span>
              </button>
            )}

            {/* Quick tool icons */}
            <button onClick={() => navigate(`/conference/translation/${conferenceId}`)} className="text-cyan-400/70 hover:text-cyan-400 h-7 w-7 flex items-center justify-center rounded hover:bg-white/5" title="Translation">
              <Globe className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => navigate(`/conference/checkin/${conferenceId}`)} className="text-green-400/70 hover:text-green-400 h-7 w-7 flex items-center justify-center rounded hover:bg-white/5 hidden sm:flex" title="Check-In">
              <Shield className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => navigate(`/conference/speaker/0`)} className="text-purple-400/70 hover:text-purple-400 h-7 w-7 flex items-center justify-center rounded hover:bg-white/5 hidden sm:flex" title="Speakers">
              <UserCircle className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Right: Share + End + More */}
          <div className="flex items-center gap-1 shrink-0">
            <button onClick={handleCopyLink} className="text-white/50 hover:text-white h-7 w-7 flex items-center justify-center rounded hover:bg-white/5 hidden sm:flex" title="Copy link">
              <Copy className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleEndConference}
              disabled={endMutation.isPending}
              className="flex items-center gap-1 px-2 py-1 rounded bg-red-600 hover:bg-red-700 text-white text-[11px] sm:text-xs h-7 whitespace-nowrap"
            >
              <PhoneOff className="w-3 h-3" />
              <span className="hidden sm:inline">End</span>
            </button>

            {/* Mobile overflow menu */}
            <div className="relative sm:hidden">
              <button onClick={() => setShowMoreTools(!showMoreTools)} className="text-white/50 hover:text-white h-7 w-7 flex items-center justify-center rounded hover:bg-white/5" title="More">
                {showMoreTools ? <X className="w-4 h-4" /> : <MoreHorizontal className="w-4 h-4" />}
              </button>
              {showMoreTools && (
                <div className="absolute right-0 top-9 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50 py-1 min-w-[180px]">
                  <button onClick={() => { handleCopyLink(); setShowMoreTools(false); }} className="flex items-center gap-2.5 w-full px-3 py-2.5 text-sm text-white/70 hover:bg-gray-800">
                    <Copy className="w-4 h-4" /> Share Link
                  </button>
                  <button onClick={() => { navigate(`/conference/checkin/${conferenceId}`); setShowMoreTools(false); }} className="flex items-center gap-2.5 w-full px-3 py-2.5 text-sm text-white/70 hover:bg-gray-800">
                    <Shield className="w-4 h-4" /> Check-In
                  </button>
                  <button onClick={() => { navigate(`/conference/speaker/0`); setShowMoreTools(false); }} className="flex items-center gap-2.5 w-full px-3 py-2.5 text-sm text-white/70 hover:bg-gray-800">
                    <UserCircle className="w-4 h-4" /> Speakers
                  </button>
                  <button onClick={() => { window.open('https://studio.restream.io/enk-osex-pju', '_blank'); setShowMoreTools(false); }} className="flex items-center gap-2.5 w-full px-3 py-2.5 text-sm text-white/70 hover:bg-gray-800">
                    <ExternalLink className="w-4 h-4" /> Restream Studio
                  </button>
                  <div className="border-t border-gray-700 my-1" />
                  <button onClick={() => { handleEndConference(); setShowMoreTools(false); }} className="flex items-center gap-2.5 w-full px-3 py-2.5 text-sm text-red-400 hover:bg-gray-800">
                    <PhoneOff className="w-4 h-4" /> End Conference
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recording Status Bar (when not actively recording but has past recordings) */}
      {recordingStatus?.recordingStatus && recordingStatus.recordingStatus !== 'none' && !isRecording && (
        <div className={`px-3 py-1 text-[11px] sm:text-xs flex items-center gap-2 ${
          recordingStatus.recordingStatus === 'available' ? 'bg-green-500/10 text-green-400' :
          recordingStatus.recordingStatus === 'processing' ? 'bg-amber-500/10 text-amber-400' :
          'bg-gray-500/10 text-gray-400'
        }`}>
          <VideoIcon className="w-3 h-3" />
          Recording: {recordingStatus.recordingStatus}
          {recordingStatus.transcriptStatus && recordingStatus.transcriptStatus !== 'none' && (
            <span className="ml-2">| Transcript: {recordingStatus.transcriptStatus}</span>
          )}
        </div>
      )}

      {/* Jitsi iframe — fills remaining viewport */}
      <div className="flex-1 relative">
        <iframe
          src={jitsiUrl}
          allow="camera; microphone; fullscreen; display-capture; autoplay; clipboard-write"
          className="w-full h-full absolute inset-0"
          style={{ border: 'none' }}
          title="RRB Conference Room"
        />
      </div>
    </div>
  );
}
