import { useState, useEffect, useRef, useCallback } from 'react';
import { useRoute, useLocation } from 'wouter';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  ArrowLeft, PhoneOff, Users, Clock, Copy, Mic, MicOff,
  Video as VideoIcon, VideoOff, Globe, Shield, UserCircle, Circle,
  Radio, Tv, ExternalLink, MoreHorizontal, X, Loader2,
  Share2, Link2, QrCode, Camera, Settings, Volume2
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import LanguageInterpreter from '@/components/LanguageInterpreter';

const QUICK_LANGS = [
  { code: 'en', flag: '\u{1F1FA}\u{1F1F8}', name: 'EN' },
  { code: 'es', flag: '\u{1F1EA}\u{1F1F8}', name: 'ES' },
  { code: 'fr', flag: '\u{1F1EB}\u{1F1F7}', name: 'FR' },
  { code: 'zh', flag: '\u{1F1E8}\u{1F1F3}', name: 'ZH' },
  { code: 'ar', flag: '\u{1F1F8}\u{1F1E6}', name: 'AR' },
  { code: 'sw', flag: '\u{1F1F0}\u{1F1EA}', name: 'SW' },
  { code: 'pt', flag: '\u{1F1E7}\u{1F1F7}', name: 'PT' },
  { code: 'de', flag: '\u{1F1E9}\u{1F1EA}', name: 'DE' },
];

declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

// ─── Pre-Join Lobby Component ───
function PreJoinLobby({
  conference,
  defaultName,
  onJoin,
  onBack,
}: {
  conference: any;
  defaultName: string;
  onJoin: (displayName: string, audioEnabled: boolean, videoEnabled: boolean) => void;
  onBack: () => void;
}) {
  const [displayName, setDisplayName] = useState(defaultName);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);

  // Get camera preview
  useEffect(() => {
    let stream: MediaStream | null = null;

    const startPreview = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: videoEnabled,
          audio: audioEnabled,
        });
        setCameraStream(stream);
        setCameraError(null);
        if (videoPreviewRef.current) {
          videoPreviewRef.current.srcObject = stream;
        }

        // Enumerate devices after permission granted
        const devices = await navigator.mediaDevices.enumerateDevices();
        setAudioDevices(devices.filter(d => d.kind === 'audioinput'));
        setVideoDevices(devices.filter(d => d.kind === 'videoinput'));
      } catch (err: any) {
        setCameraError(
          err.name === 'NotAllowedError'
            ? 'Camera/mic access denied. Check browser permissions.'
            : 'Could not access camera/mic. You can still join.'
        );
      }
    };

    startPreview();

    return () => {
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
      }
    };
  }, [videoEnabled, audioEnabled]);

  // Cleanup stream on unmount
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(t => t.stop());
      }
    };
  }, [cameraStream]);

  const handleJoin = () => {
    // Stop preview stream before joining Jitsi
    if (cameraStream) {
      cameraStream.getTracks().forEach(t => t.stop());
      setCameraStream(null);
    }
    onJoin(displayName || 'Guest', audioEnabled, videoEnabled);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-black flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-6">
        {/* Header */}
        <div className="text-center">
          <button onClick={onBack} className="absolute top-4 left-4 text-white/60 hover:text-white p-2 rounded-lg hover:bg-white/10">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl sm:text-2xl font-bold text-white mb-1">{conference?.title || 'Conference Room'}</h1>
          <p className="text-white/50 text-sm">
            {conference?.status === 'live' && (
              <span className="text-green-400 font-medium">● Live Now</span>
            )}
            {conference?.room_code && (
              <span className="ml-2 text-white/40">Room: {conference.room_code}</span>
            )}
          </p>
        </div>

        {/* Camera Preview */}
        <div className="relative rounded-xl overflow-hidden bg-gray-900 border border-gray-800 aspect-video">
          {videoEnabled && !cameraError ? (
            <video
              ref={videoPreviewRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover mirror"
              style={{ transform: 'scaleX(-1)' }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-amber-600/20 flex items-center justify-center mx-auto mb-3">
                  <UserCircle className="w-12 h-12 text-amber-400" />
                </div>
                <p className="text-white/60 text-sm">
                  {cameraError || (videoEnabled ? 'Loading camera...' : 'Camera off')}
                </p>
              </div>
            </div>
          )}

          {/* Audio/Video toggle overlay */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2">
            <button
              onClick={() => setAudioEnabled(!audioEnabled)}
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                audioEnabled ? 'bg-gray-700/80 text-white hover:bg-gray-600/80' : 'bg-red-600 text-white hover:bg-red-700'
              }`}
              title={audioEnabled ? 'Mute microphone' : 'Unmute microphone'}
            >
              {audioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setVideoEnabled(!videoEnabled)}
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                videoEnabled ? 'bg-gray-700/80 text-white hover:bg-gray-600/80' : 'bg-red-600 text-white hover:bg-red-700'
              }`}
              title={videoEnabled ? 'Turn off camera' : 'Turn on camera'}
            >
              {videoEnabled ? <VideoIcon className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Display Name */}
        <div className="space-y-2">
          <label className="text-white/70 text-sm font-medium">Your display name</label>
          <Input
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            placeholder="Enter your name"
            className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 h-11"
          />
        </div>

        {/* Device info */}
        {(audioDevices.length > 0 || videoDevices.length > 0) && (
          <div className="text-xs text-white/40 flex items-center gap-4">
            {videoDevices.length > 0 && (
              <span className="flex items-center gap-1">
                <Camera className="w-3 h-3" /> {videoDevices[0]?.label?.split('(')[0]?.trim() || 'Camera'}
              </span>
            )}
            {audioDevices.length > 0 && (
              <span className="flex items-center gap-1">
                <Volume2 className="w-3 h-3" /> {audioDevices[0]?.label?.split('(')[0]?.trim() || 'Microphone'}
              </span>
            )}
          </div>
        )}

        {/* Join Button */}
        <Button
          onClick={handleJoin}
          className="w-full h-12 bg-amber-600 hover:bg-amber-700 text-white text-base font-semibold"
        >
          Join Conference
        </Button>

        {/* Accessibility note */}
        <p className="text-white/30 text-xs text-center">
          You can change your camera and microphone settings after joining.
          {cameraError && ' Camera/mic access is optional — you can still participate.'}
        </p>
      </div>
    </div>
  );
}

// ─── Main Conference Room ───
export default function ConferenceRoom() {
  const [, params] = useRoute('/conference/room/:id');
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const conferenceId = params?.id ? parseInt(params.id) : 0;
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [showMoreTools, setShowMoreTools] = useState(false);
  const [showInterpreter, setShowInterpreter] = useState(false);
  const [showCaptions, setShowCaptions] = useState(false);
  const [captionTargetLang, setCaptionTargetLang] = useState('es');
  const [showLangQuickSwitch, setShowLangQuickSwitch] = useState(false);
  const [voiceCommandActive, setVoiceCommandActive] = useState(false);
  const voiceCmdRecognitionRef = useRef<any>(null);
  const interpreterRef = useRef<{ setTargetLang?: (lang: string) => void }>({});
  const [captionText, setCaptionText] = useState<{ original: string; translated: string; sourceLang: string; targetLang: string; speaker?: string; speakerColor?: string } | null>(null);
  const [captionVisible, setCaptionVisible] = useState(true);
  const [captionSize, setCaptionSize] = useState<'sm' | 'md' | 'lg'>('md');
  const captionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [speakerColors] = useState<Record<string, string>>({});
  const speakerColorPalette = ['#60a5fa', '#f472b6', '#34d399', '#fbbf24', '#a78bfa', '#fb923c', '#22d3ee', '#e879f9'];
  let speakerColorIdx = useRef(0);
  const [jitsiReady, setJitsiReady] = useState(false);
  const [participantCount, setParticipantCount] = useState(0);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [inLobby, setInLobby] = useState(true);
  const [joinSettings, setJoinSettings] = useState({ audioEnabled: true, videoEnabled: true });
  const recordingTimer = useRef<NodeJS.Timeout | null>(null);

  // Assign a consistent color to each speaker
  const getSpeakerColor = useCallback((speaker: string) => {
    if (!speakerColors[speaker]) {
      speakerColors[speaker] = speakerColorPalette[speakerColorIdx.current % speakerColorPalette.length];
      speakerColorIdx.current++;
    }
    return speakerColors[speaker];
  }, [speakerColors]);

  // Voice command handler
  const startVoiceCommands = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) { toast.error('Voice commands not supported'); return; }
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    recognition.onresult = (event: any) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          const cmd = event.results[i][0].transcript.toLowerCase().trim();
          if (cmd.includes('start captions') || cmd.includes('turn on captions')) {
            setShowCaptions(true); if (!showInterpreter) setShowInterpreter(true);
            toast.success('Voice: Captions enabled');
          } else if (cmd.includes('stop captions') || cmd.includes('turn off captions')) {
            setShowCaptions(false); toast.success('Voice: Captions disabled');
          } else if (cmd.includes('increase font') || cmd.includes('bigger text') || cmd.includes('larger')) {
            setCaptionSize(prev => prev === 'sm' ? 'md' : 'lg'); toast.success('Voice: Font size increased');
          } else if (cmd.includes('decrease font') || cmd.includes('smaller text') || cmd.includes('smaller')) {
            setCaptionSize(prev => prev === 'lg' ? 'md' : 'sm'); toast.success('Voice: Font size decreased');
          } else if (cmd.includes('switch to spanish') || cmd.includes('español')) {
            setCaptionTargetLang('es'); toast.success('Voice: Switched to Spanish');
          } else if (cmd.includes('switch to french') || cmd.includes('français')) {
            setCaptionTargetLang('fr'); toast.success('Voice: Switched to French');
          } else if (cmd.includes('switch to chinese') || cmd.includes('mandarin')) {
            setCaptionTargetLang('zh'); toast.success('Voice: Switched to Chinese');
          } else if (cmd.includes('switch to arabic')) {
            setCaptionTargetLang('ar'); toast.success('Voice: Switched to Arabic');
          } else if (cmd.includes('switch to swahili')) {
            setCaptionTargetLang('sw'); toast.success('Voice: Switched to Swahili');
          } else if (cmd.includes('switch to portuguese')) {
            setCaptionTargetLang('pt'); toast.success('Voice: Switched to Portuguese');
          } else if (cmd.includes('switch to german') || cmd.includes('deutsch')) {
            setCaptionTargetLang('de'); toast.success('Voice: Switched to German');
          } else if (cmd.includes('switch to english')) {
            setCaptionTargetLang('en'); toast.success('Voice: Switched to English');
          } else if (cmd.includes('start interpreter') || cmd.includes('open interpreter')) {
            setShowInterpreter(true); toast.success('Voice: Interpreter opened');
          } else if (cmd.includes('close interpreter') || cmd.includes('stop interpreter')) {
            setShowInterpreter(false); toast.success('Voice: Interpreter closed');
          }
        }
      }
    };
    recognition.onerror = (e: any) => { if (e.error !== 'no-speech' && e.error !== 'aborted') toast.error(`Voice cmd error: ${e.error}`); };
    recognition.onend = () => { if (voiceCmdRecognitionRef.current && voiceCommandActive) { try { recognition.start(); } catch {} } };
    voiceCmdRecognitionRef.current = recognition;
    try { recognition.start(); setVoiceCommandActive(true); toast.success('Voice commands active. Say "start captions", "switch to Spanish", etc.'); } catch { toast.error('Failed to start voice commands'); }
  }, [showInterpreter, voiceCommandActive]);

  const stopVoiceCommands = useCallback(() => {
    if (voiceCmdRecognitionRef.current) {
      voiceCmdRecognitionRef.current.onend = null;
      try { voiceCmdRecognitionRef.current.stop(); } catch {}
      voiceCmdRecognitionRef.current = null;
    }
    setVoiceCommandActive(false);
    toast.info('Voice commands stopped');
  }, []);

  // Handle caption updates from interpreter
  const handleCaptionUpdate = useCallback((caption: { original: string; translated: string; sourceLang: string; targetLang: string }) => {
    const speaker = user?.name || 'Speaker';
    const color = getSpeakerColor(speaker);
    setCaptionText({ ...caption, speaker, speakerColor: color });
    setCaptionVisible(true);
    // Auto-hide captions after 8 seconds
    if (captionTimeoutRef.current) clearTimeout(captionTimeoutRef.current);
    captionTimeoutRef.current = setTimeout(() => {
      setCaptionVisible(false);
    }, 8000);
  }, [user, getSpeakerColor]);
  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const jitsiApiRef = useRef<any>(null);

  const { data: conference, isLoading } = trpc.conference.getConference.useQuery(
    { id: conferenceId },
    { enabled: conferenceId > 0 }
  );

  const { data: recordingStatus } = trpc.conference.getRecordingStatus.useQuery(
    { conferenceId },
    { enabled: conferenceId > 0 && !inLobby, refetchInterval: 10000 }
  );

  const { data: restreamStatus } = trpc.conference.getRestreamStatus.useQuery(
    { conferenceId },
    { enabled: conferenceId > 0 && !inLobby, refetchInterval: 10000 }
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
    const displayName = joinSettings.audioEnabled ? user?.name || 'Guest' : user?.name || 'Guest';

    if (!window.JitsiMeetExternalAPI) {
      let attempts = 0;
      const checkInterval = setInterval(() => {
        attempts++;
        if (window.JitsiMeetExternalAPI) {
          clearInterval(checkInterval);
          createJitsiInstance(roomName, user?.name || 'Guest');
        } else if (attempts > 50) {
          clearInterval(checkInterval);
          setConnectionError('Jitsi API failed to load. Try opening in a new tab.');
        }
      }, 200);
      return;
    }

    createJitsiInstance(roomName, user?.name || 'Guest');
  }, [conference, conferenceId, user?.name, joinSettings]);

  const createJitsiInstance = (roomName: string, displayName: string) => {
    if (jitsiApiRef.current || !jitsiContainerRef.current) return;

    try {
      const api = new window.JitsiMeetExternalAPI('meet.ffmuc.net', {
        roomName,
        parentNode: jitsiContainerRef.current,
        width: '100%',
        height: '100%',
        userInfo: {
          displayName,
          email: user?.email || '',
        },
        configOverwrite: {
          prejoinConfig: { enabled: false },
          prejoinPageEnabled: false,
          startWithAudioMuted: !joinSettings.audioEnabled,
          startWithVideoMuted: !joinSettings.videoEnabled,
          enableLobbyChat: false,
          hideLobbyButton: true,
          requireDisplayName: false,
          enableUserRolesBasedOnToken: false,
          enableRecording: false,
          fileRecordingsEnabled: false,
          liveStreamingEnabled: false,
          localRecording: { disable: true },
          disableDeepLinking: true,
          enableClosePage: false,
          enableWelcomePage: false,
          enableInsecureRoomNameWarning: false,
          p2p: { enabled: true },
          hideConferenceSubject: true,
          hideConferenceTimer: false,
          disableModeratorIndicator: true,
          defaultLanguage: 'en',
          notifications: [],
          disableThirdPartyRequests: false,
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

      // Use a flag to auto-dismiss overlay after 3 seconds
      // (stale closure means jitsiReady is always false here)
      const readyTimer = setTimeout(() => {
        setJitsiReady(true);
      }, 3000);

      // Also check if iframe loaded by looking for it
      const iframeCheck = setInterval(() => {
        const iframe = jitsiContainerRef.current?.querySelector('iframe');
        if (iframe) {
          clearInterval(iframeCheck);
          clearTimeout(readyTimer);
          // Give iframe a moment to render content
          setTimeout(() => setJitsiReady(true), 500);
        }
      }, 300);

      api.addEventListener('videoConferenceJoined', () => {
        clearTimeout(readyTimer);
        clearInterval(iframeCheck);
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

      // Cleanup timers on dispose
      const origDispose = api.dispose.bind(api);
      api.dispose = () => {
        clearTimeout(readyTimer);
        clearInterval(iframeCheck);
        origDispose();
      };
    } catch (err) {
      console.error('[ConferenceRoom] Failed to initialize Jitsi:', err);
      toast.error('Failed to connect to conference. Retrying...');
      setTimeout(() => {
        jitsiApiRef.current = null;
        createJitsiInstance(roomName, displayName);
      }, 2000);
    }
  };

  // Only init Jitsi after leaving lobby
  useEffect(() => {
    if (conference && !inLobby) {
      // Register join in backend
      if (user) {
        joinMutation.mutate({ conferenceId });
      }
      initJitsi();
    }
    return () => {
      if (jitsiApiRef.current) {
        try { jitsiApiRef.current.dispose(); } catch {}
        jitsiApiRef.current = null;
      }
    };
  }, [conference, inLobby]);

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

  // ─── Pre-Join Lobby ───
  if (inLobby) {
    return (
      <PreJoinLobby
        conference={conference}
        defaultName={user?.name || 'Guest'}
        onJoin={(name, audio, video) => {
          setJoinSettings({ audioEnabled: audio, videoEnabled: video });
          setInLobby(false);
        }}
        onBack={() => navigate('/conference')}
      />
    );
  }

  // ─── Active Conference Room ───
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

            <button onClick={() => setShowInterpreter(!showInterpreter)} className={`h-7 w-7 items-center justify-center rounded hover:bg-white/5 hidden sm:flex ${showInterpreter ? 'text-cyan-400 bg-cyan-500/20' : 'text-cyan-400/70 hover:text-cyan-400'}`} title="Live Interpreter">
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

            <div className="relative sm:hidden">
              <button onClick={() => setShowMoreTools(!showMoreTools)} className="text-white/50 hover:text-white h-7 w-7 flex items-center justify-center rounded hover:bg-white/5" title="More">
                {showMoreTools ? <X className="w-4 h-4" /> : <MoreHorizontal className="w-4 h-4" />}
              </button>
              {showMoreTools && (
                <div className="absolute right-0 top-9 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50 py-1 min-w-[180px]">
                  <button onClick={() => { handleNativeShare(); setShowMoreTools(false); }} className="flex items-center gap-2.5 w-full px-3 py-2.5 text-sm text-white/70 hover:bg-gray-800">
                    <Share2 className="w-4 h-4" /> Share Room Link
                  </button>
                  <button onClick={() => { setShowInterpreter(true); setShowMoreTools(false); }} className="flex items-center gap-2.5 w-full px-3 py-2.5 text-sm text-white/70 hover:bg-gray-800">
                    <Globe className="w-4 h-4" /> Live Interpreter
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

      {/* Share Dialog */}
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

      {/* Language Interpreter Overlay */}
      {showInterpreter && (
        <LanguageInterpreter
          mode="overlay"
          contextLabel={conference?.title || 'Conference Room'}
          onClose={() => setShowInterpreter(false)}
          enableSignLanguage={true}
          defaultTargetLang={captionTargetLang}
          onCaptionUpdate={showCaptions ? handleCaptionUpdate : undefined}
        />
      )}

      {/* ── ARIA Live Region for Screen Readers ── */}
      <div
        role="log"
        aria-live="polite"
        aria-atomic="true"
        aria-label="Live captions and translations"
        className="sr-only"
      >
        {captionText && (
          <p>
            {captionText.speaker && `${captionText.speaker}: `}
            {captionText.translated || captionText.original}
          </p>
        )}
      </div>

      {/* ── Closed Captions Subtitle Bar ── */}
      {showCaptions && captionText && captionVisible && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-40 max-w-[85%] sm:max-w-[65%] pointer-events-none">
          <div className="bg-black/90 backdrop-blur-sm rounded-lg px-4 py-3 border border-white/10 shadow-2xl">
            {/* Speaker name tag */}
            {captionText.speaker && (
              <div className="flex items-center gap-1.5 mb-1">
                <span
                  className="w-2 h-2 rounded-full inline-block"
                  style={{ backgroundColor: captionText.speakerColor || '#60a5fa' }}
                />
                <span
                  className="text-[10px] font-semibold"
                  style={{ color: captionText.speakerColor || '#60a5fa' }}
                >
                  {captionText.speaker}
                </span>
              </div>
            )}
            {/* Original text */}
            <p className={`text-white/50 text-center mb-0.5 ${
              captionSize === 'sm' ? 'text-[9px]' : captionSize === 'lg' ? 'text-xs' : 'text-[10px] sm:text-xs'
            }`}>
              {captionText.original}
            </p>
            {/* Translated text - larger */}
            <p className={`text-white font-medium text-center leading-snug ${
              captionSize === 'sm' ? 'text-xs' : captionSize === 'lg' ? 'text-lg sm:text-xl' : 'text-sm sm:text-base'
            }`}>
              {captionText.translated}
            </p>
          </div>
        </div>
      )}

      {/* ── Caption Toggle + Font Size Controls (bottom-center, above Jitsi controls) ── */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
        <button
          onClick={() => {
            setShowCaptions(!showCaptions);
            if (!showCaptions && !showInterpreter) {
              setShowInterpreter(true);
              toast.info('Interpreter started for closed captions');
            }
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all shadow-lg ${
            showCaptions
              ? 'bg-white text-black hover:bg-gray-200'
              : 'bg-gray-800/80 text-white/70 hover:bg-gray-700/80 hover:text-white border border-white/10'
          }`}
          title={showCaptions ? 'Turn off captions' : 'Turn on captions'}
          aria-label={showCaptions ? 'Disable closed captions' : 'Enable closed captions'}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
            <text x="12" y="15" textAnchor="middle" fontSize="8" fill="currentColor" stroke="none" fontWeight="bold">CC</text>
          </svg>
          <span>{showCaptions ? 'CC On' : 'CC'}</span>
        </button>

        {/* Font size controls - only show when CC is on */}
        {showCaptions && (
          <div className="flex items-center gap-0.5 bg-gray-800/80 rounded-full px-1.5 py-0.5 border border-white/10 shadow-lg">
            {(['sm', 'md', 'lg'] as const).map((size) => (
              <button
                key={size}
                onClick={() => setCaptionSize(size)}
                className={`px-1.5 py-0.5 rounded-full transition-all ${
                  captionSize === size
                    ? 'bg-white text-black'
                    : 'text-white/50 hover:text-white'
                }`}
                aria-label={`Caption size ${size === 'sm' ? 'small' : size === 'md' ? 'medium' : 'large'}`}
                title={size === 'sm' ? 'Small captions' : size === 'md' ? 'Medium captions' : 'Large captions'}
              >
                <span className={size === 'sm' ? 'text-[9px]' : size === 'md' ? 'text-[11px]' : 'text-sm'}>
                  A
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Language quick-switch - only show when CC is on */}
        {showCaptions && (
          <div className="relative">
            <button
              onClick={() => setShowLangQuickSwitch(!showLangQuickSwitch)}
              className="flex items-center gap-1 px-2 py-1 rounded-full bg-gray-800/80 border border-white/10 shadow-lg text-white/70 hover:text-white text-xs transition-all"
              aria-label="Quick switch caption language"
              title="Change caption language"
            >
              <span>{QUICK_LANGS.find(l => l.code === captionTargetLang)?.flag || '\u{1F310}'}</span>
              <span className="text-[10px]">{QUICK_LANGS.find(l => l.code === captionTargetLang)?.name || 'Lang'}</span>
            </button>
            {showLangQuickSwitch && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-xl shadow-2xl p-1.5 z-50">
                <div className="grid grid-cols-4 gap-1">
                  {QUICK_LANGS.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setCaptionTargetLang(lang.code);
                        setShowLangQuickSwitch(false);
                        // Re-open interpreter with new language
                        setShowInterpreter(false);
                        setTimeout(() => setShowInterpreter(true), 100);
                        toast.success(`Captions: ${lang.name}`);
                      }}
                      className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg transition-all ${
                        captionTargetLang === lang.code
                          ? 'bg-cyan-500/30 border border-cyan-500/50 text-white'
                          : 'text-white/60 hover:bg-white/10 hover:text-white'
                      }`}
                      aria-label={`Switch captions to ${lang.name}`}
                    >
                      <span className="text-base">{lang.flag}</span>
                      <span className="text-[9px] font-medium">{lang.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Voice command toggle */}
        <button
          onClick={voiceCommandActive ? stopVoiceCommands : startVoiceCommands}
          className={`flex items-center gap-1 px-2 py-1 rounded-full shadow-lg text-xs transition-all ${
            voiceCommandActive
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-gray-800/80 text-white/50 hover:text-white border border-white/10'
          }`}
          title={voiceCommandActive ? 'Voice commands active' : 'Enable voice commands'}
          aria-label={voiceCommandActive ? 'Disable voice commands' : 'Enable voice commands'}
        >
          {voiceCommandActive ? <Mic className="w-3 h-3 animate-pulse" /> : <Mic className="w-3 h-3" />}
          <span className="text-[10px]">{voiceCommandActive ? 'Voice' : 'Cmd'}</span>
        </button>
      </div>

      {/* Jitsi Meet container */}
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
                <Button onClick={() => { const roomName = conference?.room_code || `rrb-room-${conferenceId}`; window.open(`https://meet.ffmuc.net/${roomName}`, '_blank'); }} className="bg-amber-600 hover:bg-amber-700 text-white">
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
