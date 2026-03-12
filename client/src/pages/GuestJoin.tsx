import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Video, Users, ArrowLeft, Loader2, Share2, Mic, MicOff,
  VideoOff, Earth, Copy, Link2
} from 'lucide-react';

// Declare Jitsi API
declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

export default function GuestJoin() {
  const params = useParams<{ roomCode?: string }>();
  const [, navigate] = useLocation();
  const [roomCode, setRoomCode] = useState(params.roomCode || '');
  const [guestName, setGuestName] = useState('');
  const [joined, setJoined] = useState(false);
  const [jitsiReady, setJitsiReady] = useState(false);
  const [conferenceTitle, setConferenceTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const jitsiApiRef = useRef<any>(null);

  // Look up conference by room code
  const lookupConference = async (code: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/trpc/conference.getByRoomCode?input=${encodeURIComponent(JSON.stringify({ json: { roomCode: code } }))}`);
      const data = await res.json();
      if (data?.result?.data) {
        setConferenceTitle(data.result.data.title || 'Conference Room');
        return data.result.data;
      }
      return null;
    } catch {
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Auto-lookup if roomCode is in URL
  useEffect(() => {
    if (params.roomCode) {
      lookupConference(params.roomCode).then(conf => {
        if (conf) setConferenceTitle(conf.title);
      });
    }
  }, [params.roomCode]);

  const handleJoin = useCallback(async () => {
    if (!roomCode.trim()) {
      toast.error('Please enter a room code');
      return;
    }
    if (!guestName.trim()) {
      toast.error('Please enter your name');
      return;
    }

    setLoading(true);
    const conf = await lookupConference(roomCode.trim());
    if (!conf) {
      toast.error('Room not found. Check the code and try again.');
      setLoading(false);
      return;
    }

    setConferenceTitle(conf.title);
    setJoined(true);
    setLoading(false);

    // Initialize Jitsi
    setTimeout(() => {
      if (!jitsiContainerRef.current || !window.JitsiMeetExternalAPI) {
        toast.error('Video system not loaded. Please refresh.');
        return;
      }

      try {
        const jitsiRoomName = `vpaas-magic-cookie-${roomCode.trim().replace(/[^a-zA-Z0-9-]/g, '')}`;
        const api = new window.JitsiMeetExternalAPI('meet.jit.si', {
          roomName: jitsiRoomName,
          parentNode: jitsiContainerRef.current,
          width: '100%',
          height: '100%',
          userInfo: {
            displayName: guestName.trim(),
            email: '',
          },
          configOverwrite: {
            startWithAudioMuted: true,
            startWithVideoMuted: true,
            prejoinPageEnabled: false,
            disableModeratorIndicator: true,
            enableLobbyChat: false,
            hideLobbyButton: true,
            requireDisplayName: false,
            enableWelcomePage: false,
            enableClosePage: false,
            disableDeepLinking: true,
            p2p: { enabled: true },
            toolbarButtons: [
              'microphone', 'camera', 'chat', 'participants-pane',
              'tileview', 'fullscreen', 'hangup', 'raisehand',
              'settings', 'select-background',
            ],
          },
          interfaceConfigOverwrite: {
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            SHOW_BRAND_WATERMARK: false,
            SHOW_CHROME_EXTENSION_BANNER: false,
            MOBILE_APP_PROMO: false,
            DISABLE_JOIN_LEAVE_NOTIFICATIONS: false,
            FILM_STRIP_MAX_HEIGHT: 120,
            TOOLBAR_ALWAYS_VISIBLE: true,
            DEFAULT_BACKGROUND: '#000000',
          },
        });

        api.addEventListener('videoConferenceJoined', () => {
          setJitsiReady(true);
          toast.success('Connected to conference!');
        });

        api.addEventListener('videoConferenceLeft', () => {
          setJitsiReady(false);
          setJoined(false);
        });

        jitsiApiRef.current = api;
      } catch (err) {
        console.error('[GuestJoin] Jitsi init failed:', err);
        toast.error('Failed to connect. Please try again.');
        setJoined(false);
      }
    }, 300);
  }, [roomCode, guestName]);

  const handleLeave = () => {
    if (jitsiApiRef.current) {
      try { jitsiApiRef.current.executeCommand('hangup'); } catch {}
      try { jitsiApiRef.current.dispose(); } catch {}
      jitsiApiRef.current = null;
    }
    setJoined(false);
    setJitsiReady(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (jitsiApiRef.current) {
        try { jitsiApiRef.current.dispose(); } catch {}
        jitsiApiRef.current = null;
      }
    };
  }, []);

  // Pre-join screen
  if (!joined) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 flex items-center justify-center mx-auto mb-4">
              <Video className="w-8 h-8 text-amber-400" />
            </div>
            <h1 className="text-2xl font-bold text-white">Join Conference</h1>
            <p className="text-white/50 text-sm">Enter your name and room code to join as a guest</p>
            {conferenceTitle && (
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30 mt-2">
                {conferenceTitle}
              </Badge>
            )}
          </div>

          {/* Join Form */}
          <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 space-y-4">
            <div>
              <label className="text-white/70 text-sm mb-1.5 block">Your Name</label>
              <Input
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Enter your display name"
                className="bg-gray-800 border-gray-700 text-white placeholder:text-white/30 h-12 text-base"
                onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                autoFocus
              />
            </div>
            <div>
              <label className="text-white/70 text-sm mb-1.5 block">Room Code</label>
              <Input
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                placeholder="e.g. rrb-TESTROOM001"
                className="bg-gray-800 border-gray-700 text-white placeholder:text-white/30 h-12 text-base font-mono"
                onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
              />
            </div>
            <Button
              onClick={handleJoin}
              disabled={loading || !guestName.trim() || !roomCode.trim()}
              className="w-full bg-amber-500 hover:bg-amber-600 text-black font-bold h-12 text-base"
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Looking up room...</>
              ) : (
                <><Video className="w-5 h-5 mr-2" /> Join Conference</>
              )}
            </Button>
          </div>

          {/* Accessibility note */}
          <p className="text-white/30 text-xs text-center">
            No account required. Camera and microphone permissions will be requested.
            <br />Powered by QUMUS Conference System
          </p>

          {/* Back to main site */}
          <div className="text-center">
            <button onClick={() => navigate('/')} className="text-amber-400/60 hover:text-amber-400 text-sm">
              <ArrowLeft className="w-3 h-3 inline mr-1" /> Back to main site
            </button>
          </div>
        </div>
      </div>
    );
  }

  // In-conference view
  return (
    <div className="h-screen bg-black flex flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="bg-gray-900/90 border-b border-gray-800/50 px-3 py-1.5 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <h1 className="text-white font-semibold text-sm truncate">{conferenceTitle}</h1>
            <Badge variant="outline" className="text-[10px] border-green-500/50 text-green-400 px-1 py-0 shrink-0">
              GUEST
            </Badge>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                const url = `${window.location.origin}/join/${roomCode}`;
                if (navigator.share) {
                  navigator.share({ title: conferenceTitle, text: `Join: ${conferenceTitle}`, url }).catch(() => {
                    navigator.clipboard.writeText(url);
                    toast.success('Link copied!');
                  });
                } else {
                  navigator.clipboard.writeText(url);
                  toast.success('Link copied!');
                }
              }}
              className="text-amber-400/70 hover:text-amber-400 h-7 w-7 flex items-center justify-center rounded hover:bg-white/5"
              title="Share link"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleLeave}
              className="flex items-center gap-1 px-3 py-1 rounded bg-red-600 hover:bg-red-700 text-white text-xs h-7"
            >
              Leave
            </button>
          </div>
        </div>
      </div>

      {/* Jitsi container */}
      <div className="flex-1 relative bg-black">
        {!jitsiReady && (
          <div className="absolute inset-0 flex items-center justify-center z-10 bg-black">
            <div className="text-center">
              <Loader2 className="w-10 h-10 text-amber-500 animate-spin mx-auto mb-3" />
              <p className="text-white/70 text-sm">Connecting as {guestName}...</p>
              <p className="text-white/40 text-xs mt-1">Camera & mic permissions may be requested</p>
            </div>
          </div>
        )}
        <div ref={jitsiContainerRef} className="w-full h-full" style={{ minHeight: 0 }} />
      </div>
    </div>
  );
}
