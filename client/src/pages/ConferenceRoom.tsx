import { useState, useEffect } from 'react';
import { useRoute, useLocation } from 'wouter';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ArrowLeft, PhoneOff, Users, Clock, Copy } from 'lucide-react';

export default function ConferenceRoom() {
  const [, params] = useRoute('/conference/room/:id');
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const conferenceId = params?.id ? parseInt(params.id) : 0;

  const { data: conference, isLoading } = trpc.conference.getConference.useQuery(
    { id: conferenceId },
    { enabled: conferenceId > 0 }
  );

  const endMutation = trpc.conference.endConference.useMutation({
    onSuccess: () => {
      toast.success('Conference ended');
      navigate('/conference');
    },
  });

  const joinMutation = trpc.conference.joinConference.useMutation();

  useEffect(() => {
    if (conferenceId > 0 && user) {
      joinMutation.mutate({ conferenceId });
    }
  }, [conferenceId, user?.id]);

  const handleCopyLink = () => {
    const url = `${window.location.origin}/conference/room/${conferenceId}`;
    navigator.clipboard.writeText(url);
    toast.success('Conference link copied!');
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
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleCopyLink} className="text-white/70 hover:text-white">
            <Copy className="w-4 h-4 mr-1" /> Share
          </Button>
          <Button variant="destructive" size="sm" onClick={() => endMutation.mutate({ id: conferenceId })} disabled={endMutation.isPending}>
            <PhoneOff className="w-4 h-4 mr-1" /> End
          </Button>
        </div>
      </div>
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
