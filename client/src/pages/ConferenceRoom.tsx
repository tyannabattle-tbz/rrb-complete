import { useState, useEffect, useRef, useCallback } from 'react';
import { useRoute, useLocation } from 'wouter';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  ArrowLeft, PhoneOff, Users, Clock, Copy, Mic, MicOff,
  Video as VideoIcon, Globe, Shield, UserCircle, Circle,
  Radio, Tv, ExternalLink, MoreHorizontal, X, Loader2,
  Share2, Link2, QrCode
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

// Declare the JitsiMeetExternalAPI on window
declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

export default function ConferenceRoom() {
  const [, params] = useRoute('/conference/room/:id');
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const conferenceId = params?.id ? parseInt(params.id) : 0;
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [showMoreTools, setShowMoreTools] = useState(false);
  const [jitsiReady, setJitsiReady] = useState(false);
  const [participantCount, setParticipantCount] = useState(0);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const recordingTimer = useRef<NodeJS.Timeout | null>(null);
  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const jitsiApiRef = useRef<any>(null);

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

  // Register join in our backend
  useEffect(() => {
    if (conferenceId > 0 && user) {
      joinMutation.mutate({ conferenceId });
    }
  }, [conferenceId, user?.id]);

  // Recording timer
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

  // ─── Initialize Jitsi Meet External API ───
  const initJitsi = useCallback(() => {
    if (!conference || !jitsiContainerRef.current || jitsiApiRef.current) return;

    const roomName = conference.room_code || `rrb-room-${conferenceId}`;
    const displayName = user?.name || 'Guest';

    // Wait for the external API script to load
    if (!window.JitsiMeetExternalAPI) {
      let attempts = 0;
      const checkInterval = setInterval(() => {
        attempts++;
        if (window.JitsiMeetExternalAPI) {
          clearInterval(checkInterval);
          createJitsiInstance(roomName, displayName);
        } else if (attempts > 50) {
          // 10s timeout — show error and offer fallback
          clearInterval(checkInterval);
          setConnectionError('Jitsi API failed to load. Try opening in a new tab.');
        }
      }, 200);
      return;
    }

    createJitsiInstance(roomName, displayName);
  }, [conference, conferenceId, user?.name]);

  const createJitsiInstance = (roomName: string, displayName: string) => {
    if (jitsiApiRef.current || !jitsiContainerRef.current) return;

    try {
      const api = new window.JitsiMeetExternalAPI('meet.jit.si', {
        roomName,
        parentNode: jitsiContainerRef.current,
        width: '100%',
        height: '100%',
        userInfo: {
          displayName,
          email: user?.email || '',
        },
        configOverwrite: {
          // ── Disable lobby & moderator requirement ──
          prejoinConfig: { enabled: false },
          prejoinPageEnabled: false,
          startWithAudioMuted: true,
          startWithVideoMuted: false,
          enableLobbyChat: false,
          hideLobbyButton: true,
          requireDisplayName: false,
          enableUserRolesBasedOnToken: false,
          // Disable Jitsi recording (we use our own S3 flow)
          enableRecording: false,
          fileRecordingsEnabled: false,
          liveStreamingEnabled: false,
          localRecording: { disable: true },
          // Mobile-friendly settings
          disableDeepLinking: true,
          enableClosePage: false,
          enableWelcomePage: false,
          enableInsecureRoomNameWarning: false,
          // P2P for direct 2-person calls
          p2p: { enabled: true },
          // UI
          hideConferenceSubject: true,
          hideConferenceTimer: false,
          disableModeratorIndicator: true,
          defaultLanguage: 'en',
          // Disable notifications about lone moderator
          notifications: [],
          disableThirdPartyRequests: false,
          // Allow anyone to be moderator
          enableForcedReload: false,
        },
        interfaceConfigOverwrite: {
          DISABLE_JOIN_LEAVE_NOTIFICATIONS: false,
          MOBILE_APP_PROMO: false,
          SHOW_CHROME_EXTENSION_BANNER: false,
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
          SHOW_BRAND_WATERMARK: false,
          TOOLBAR_BUTTONS: [
            'microphone', 'camera', 'closedcaptions', 'desktop',
            'fullscreen', 'fodeviceselection', 'hangup', 'chat',
            'raisehand', 'tileview', 'participants-pane',
            'select-background', 'settings',
          ],
          SETTINGS_SECTIONS: ['devices', 'language'],
          DEFAULT_BACKGROUND: '#000000',
          DISABLE_FOCUS_INDICATOR: true,
          FILM_STRIP_MAX_HEIGHT: 120,
          VERTICAL_FILMSTRIP: true,
        },
      });

      // Auto-hide connecting overlay after 5s even if event doesn't fire
      setTimeout(() => {
        if (!jitsiReady) setJitsiReady(true);
      }, 5000);

      // Event listeners
      api.addEventListener('videoConferenceJoined', () => {
        setJitsiReady(true);
        setConnectionError(null);
        toast.success('Connected to conference room');
      });

      api.addEventListener('participantJoined', () => {
        setParticipantCount(prev => prev + 1);
      });

      api.addEventListener('participantLeft', () => {
        setParticipantCount(prev => Math.max(0, prev - 1));
      });

      api.addEventListener('videoConferenceLeft', () => {
        setJitsiReady(false);
      });

      jitsiApiRef.current = api;
    } catch (err) {
      console.error('[ConferenceRoom] Failed to initialize Jitsi:', err);
      toast.error('Failed to connect to conference. Retrying...');
      // Retry once after 2s
      setTimeout(() => {
        jitsiApiRef.current = null;
        createJitsiInstance(roomName, displayName);
      }, 2000);
    }
  };

  useEffect(() => {
    if (conference) {
      initJitsi();
    }
    return () => {
      if (jitsiApiRef.current) {
        try { jitsiApiRef.current.dispose(); } catch {}
        jitsiApiRef.current = null;
      }
    };
  }, [conference, initJitsi]);

  const [showShareDialog, setShowShareDialog] = useState(false);
  const shareUrl = `${window.location.origin}/conference/room/${conferenceId}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success('Conference link copied!');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: conference?.title || 'Join Conference',
          text: `Join the conference: ${conference?.title}`,
          url: shareUrl,
        });
      } catch (err: any) {
        if (err.name !== 'AbortError') handleCopyLink();
      }
    } else {
      setShowShareDialog(true);
    }
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
    if (jitsiApiRef.current) {
      try { jitsiApiRef.current.executeCommand('hangup'); } catch {}
    }
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

  return (
    <div className="h-screen bg-black flex flex-col overflow-hidden">
      {/* ── Single compact toolbar ── */}
      <div className="bg-gray-900/90 border-b border-gray-800/50 px-2 sm:px-3 py-1.5 shrink-0">
        <div className="flex items-center justify-between gap-1">
          {/* Left: Back + Title */}
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            <button onClick={() => navigate('/conference')} className="text-white/70 hover:text-white p-1 h-7 w-7 shrink-0 rounded hover:bg-white/10 flex items-center justify-center">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h1 className="text-white font-semibold text-xs sm:text-sm truncate">{conference.title}</h1>
            <Badge variant="outline" className="text-[9px] sm:text-[10px] border-green-500/50 text-green-400 px-1 py-0 shrink-0 hidden sm:inline-flex">
              {conference.status === 'live' ? '● LIVE' : conference.status?.toUpperCase()}
            </Badge>
          </div>

          {/* Center: Main controls */}
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

            {/* Quick tool icons — desktop */}
            <button onClick={() => navigate(`/conference/translation/${conferenceId}`)} className="text-cyan-400/70 hover:text-cyan-400 h-7 w-7 items-center justify-center rounded hover:bg-white/5 hidden sm:flex" title="Translation">
              <Globe className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => navigate(`/conference/checkin/${conferenceId}`)} className="text-green-400/70 hover:text-green-400 h-7 w-7 items-center justify-center rounded hover:bg-white/5 hidden sm:flex" title="Check-In">
              <Shield className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Right: Share + End + More */}
          <div className="flex items-center gap-1 shrink-0">
            <button onClick={handleNativeShare} className="text-amber-400/70 hover:text-amber-400 h-7 w-7 items-center justify-center rounded hover:bg-white/5 hidden sm:flex" title="Share room link">
              <Share2 className="w-3.5 h-3.5" />
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
                  <button onClick={() => { handleNativeShare(); setShowMoreTools(false); }} className="flex items-center gap-2.5 w-full px-3 py-2.5 text-sm text-white/70 hover:bg-gray-800">
                    <Share2 className="w-4 h-4" /> Share Room Link
                  </button>
                  <button onClick={() => { navigate(`/conference/translation/${conferenceId}`); setShowMoreTools(false); }} className="flex items-center gap-2.5 w-full px-3 py-2.5 text-sm text-white/70 hover:bg-gray-800">
                    <Globe className="w-4 h-4" /> Translation
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
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recording Status Bar */}
      {recordingStatus?.recordingStatus && recordingStatus.recordingStatus !== 'none' && !isRecording && (
        <div className={`px-3 py-1 text-[11px] sm:text-xs flex items-center gap-2 shrink-0 ${
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

      {/* ── Share Dialog ── */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-white">Share Conference Link</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-white/60 text-sm">Share this link with anyone to join the conference:</p>
            <div className="flex items-center gap-2 bg-gray-800 rounded-lg p-3">
              <Link2 className="w-4 h-4 text-amber-400 shrink-0" />
              <code className="text-xs text-amber-300 break-all flex-1">{shareUrl}</code>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => { handleCopyLink(); setShowShareDialog(false); }}
                className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
              >
                <Copy className="w-4 h-4 mr-2" /> Copy Link
              </Button>
              <Button
                onClick={() => {
                  const roomCode = conference?.room_code || `rrb-room-${conferenceId}`;
                  navigator.clipboard.writeText(roomCode);
                  toast.success('Room code copied!');
                  setShowShareDialog(false);
                }}
                variant="outline"
                className="border-gray-600 text-white/70 hover:text-white"
              >
                <Copy className="w-4 h-4 mr-2" /> Code
              </Button>
            </div>
            <p className="text-white/40 text-[11px] text-center">Room code: {conference?.room_code || `rrb-room-${conferenceId}`}</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Jitsi Meet container (JS API renders here) ── */}
      <div className="flex-1 relative bg-black">
        {!jitsiReady && !connectionError && (
          <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/80">
            <div className="text-center">
              <Loader2 className="w-10 h-10 text-amber-500 animate-spin mx-auto mb-3" />
              <p className="text-white/70 text-sm">Connecting to conference...</p>
              <p className="text-white/40 text-xs mt-1">Camera & mic permissions may be requested</p>
              <button onClick={() => setJitsiReady(true)} className="mt-4 text-amber-400 text-xs underline hover:text-amber-300">
                Dismiss overlay
              </button>
            </div>
          </div>
        )}
        {connectionError && (
          <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/90">
            <div className="text-center max-w-sm px-4">
              <p className="text-red-400 text-sm mb-3">{connectionError}</p>
              <div className="flex gap-2 justify-center">
                <Button onClick={() => { setConnectionError(null); jitsiApiRef.current = null; initJitsi(); }} variant="outline" className="border-amber-500 text-amber-400">
                  Retry
                </Button>
                <Button onClick={() => { const roomName = conference?.room_code || `rrb-room-${conferenceId}`; window.open(`https://meet.jit.si/${roomName}`, '_blank'); }} className="bg-amber-600 hover:bg-amber-700 text-white">
                  Open in Jitsi Tab
                </Button>
              </div>
            </div>
          </div>
        )}
        <div
          ref={jitsiContainerRef}
          className="w-full h-full"
          style={{ minHeight: 0 }}
        />
      </div>
    </div>
  );
}
