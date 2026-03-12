import React, { useState, useRef, useCallback } from 'react';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import {
  Video, Upload, FileText, Trash2, Download, ExternalLink,
  Users, Calendar, Lock, Copy, Phone, Shield, Presentation,
  Eye, X, Circle, Square, Clock, Mic
} from 'lucide-react';

// Available rooms for seamless transfer
const ROOMS = [
  { id: 'squadd-main', name: 'SQUADD Main', type: 'zoom' as const, icon: '🏛️', description: 'Daily Coalition Meeting', schedule: '7:00 PM CT' },
  { id: 'hybridcast-ops', name: 'HybridCast Ops', type: 'jitsi' as const, icon: '📡', description: 'Emergency Broadcast Operations', schedule: 'Always Open' },
  { id: 'rrb-studio', name: 'RRB Studio', type: 'jitsi' as const, icon: '🎵', description: 'Music & Production Studio', schedule: 'Always Open' },
  { id: 'sweet-miracles', name: 'Sweet Miracles', type: 'jitsi' as const, icon: '💛', description: 'Advocacy & Planning', schedule: 'Always Open' },
  { id: 'canryn-boardroom', name: 'Canryn Boardroom', type: 'jitsi' as const, icon: '🏢', description: 'Executive Sessions', schedule: 'By Appointment' },
];

const ZOOM_MEETING = {
  topic: 'SQUADD',
  url: 'https://us06web.zoom.us/j/82026499318?pwd=QlaG26b1nnkvuHTX2dgTDaY583luUm.1',
  meetingId: '820 2649 9318',
  passcode: '597456',
  schedule: 'Daily at 7:00 PM Central Time',
  hostName: 'Karen Jones',
  hostOrg: 'WHOM IT CONCERNS, INC.',
  oneTabMobile: [
    { number: '+13092053325,,82026499318#,,,,*597456#', label: 'US' },
    { number: '+13126266799,,82026499318#,,,,*597456#', label: 'US (Chicago)' },
  ],
  icsUrl: 'https://us06web.zoom.us/meeting/tZYtde-spzIpG9zh345F_7iCcqHPACwGcSUt/ics?icsToken=DJgXkoF5xsHRLLDnxQAALAAAAGapvnFGQIcvksQhba_OWhF1Mpv2lCCh1VQtc8K7V8IXbQRl5eJshy-KoVHrJAtgJr4xree9ysbjHVMxIjAwMDAwMQ&meetingMasterEventId=cZCQXToxTn2n0CUPFWsckw',
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

export default function SquaddMeetingRoom() {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState('');
  const [activeRoom, setActiveRoom] = useState('squadd-main');
  const [showRoomPanel, setShowRoomPanel] = useState(false);
  const [jitsiRoom, setJitsiRoom] = useState<string | null>(null);
  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const jitsiApiRef = useRef<any>(null);

  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingId, setRecordingId] = useState<number | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordingStartTime, setRecordingStartTime] = useState<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval>>();

  // Participant tracking per room
  const [roomParticipants, setRoomParticipants] = useState<Record<string, { count: number; members: string[] }>>({
    'squadd-main': { count: 0, members: [] },
    'hybridcast-ops': { count: 0, members: [] },
    'rrb-studio': { count: 0, members: [] },
    'sweet-miracles': { count: 0, members: [] },
    'canryn-boardroom': { count: 0, members: [] },
  });

  // Seamless room transfer — switch Jitsi room without full page reload
  const transferToRoom = useCallback((roomId: string) => {
    const room = ROOMS.find(r => r.id === roomId);
    if (!room) return;
    
    if (room.type === 'zoom') {
      // For Zoom, just switch the active room context — Zoom opens in new tab
      setActiveRoom(roomId);
      setJitsiRoom(null);
      // Dispose Jitsi if active
      if (jitsiApiRef.current) {
        try { jitsiApiRef.current.dispose(); } catch {} 
        jitsiApiRef.current = null;
      }
      toast({ title: `Switched to ${room.name}`, description: 'Click Join to enter the Zoom meeting.' });
    } else {
      // For Jitsi rooms — seamless transfer
      if (jitsiApiRef.current) {
        try { jitsiApiRef.current.dispose(); } catch {}
        jitsiApiRef.current = null;
      }
      setActiveRoom(roomId);
      setJitsiRoom(roomId);
      toast({ title: `Transferring to ${room.name}...`, description: 'Connecting seamlessly.' });
      // Initialize Jitsi in the next tick after state update
      setTimeout(() => initJitsiRoom(roomId, user?.name || 'Guest'), 300);
    }
    setShowRoomPanel(false);
  }, [user?.name, toast]);

  const initJitsiRoom = useCallback((roomId: string, displayName: string) => {
    if (!jitsiContainerRef.current) return;
    const loadAndCreate = () => {
      if (jitsiApiRef.current) return;
      try {
        const api = new (window as any).JitsiMeetExternalAPI('meet.jit.si', {
          roomName: `rrb-${roomId}`,
          parentNode: jitsiContainerRef.current!,
          width: '100%',
          height: '100%',
          userInfo: { displayName },
          configOverwrite: {
            prejoinConfig: { enabled: false },
            prejoinPageEnabled: false,
            startWithAudioMuted: false,
            startWithVideoMuted: false,
            disableDeepLinking: true,
            enableClosePage: false,
            enableWelcomePage: false,
            hideConferenceSubject: true,
            p2p: { enabled: true },
          },
          interfaceConfigOverwrite: {
            MOBILE_APP_PROMO: false,
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            SHOW_BRAND_WATERMARK: false,
            TOOLBAR_BUTTONS: ['microphone', 'camera', 'desktop', 'fullscreen', 'hangup', 'chat', 'raisehand', 'tileview', 'participants-pane', 'settings'],
            DEFAULT_BACKGROUND: '#000000',
          },
        });
        api.addEventListener('videoConferenceJoined', () => {
          toast({ title: 'Connected', description: `You are now in ${ROOMS.find(r => r.id === roomId)?.name}` });
        });
        api.addEventListener('videoConferenceLeft', () => {
          setJitsiRoom(null);
          setRoomParticipants(prev => ({ ...prev, [roomId]: { count: 0, members: [] } }));
        });
        // Track participant count
        api.addEventListener('participantJoined', (p: any) => {
          setRoomParticipants(prev => {
            const current = prev[roomId] || { count: 0, members: [] };
            const name = p?.displayName || 'Guest';
            return { ...prev, [roomId]: { count: current.count + 1, members: [...current.members, name] } };
          });
        });
        api.addEventListener('participantLeft', () => {
          setRoomParticipants(prev => {
            const current = prev[roomId] || { count: 0, members: [] };
            return { ...prev, [roomId]: { count: Math.max(0, current.count - 1), members: current.members.slice(0, -1) } };
          });
        });
        // Get initial participant count
        setTimeout(() => {
          try {
            const count = api.getNumberOfParticipants?.() || 0;
            setRoomParticipants(prev => ({ ...prev, [roomId]: { ...prev[roomId], count } }));
          } catch {}
        }, 2000);
        jitsiApiRef.current = api;
      } catch (err) {
        console.error('Failed to init Jitsi:', err);
        toast({ title: 'Connection failed', description: 'Retrying...', variant: 'destructive' });
        setTimeout(() => { jitsiApiRef.current = null; loadAndCreate(); }, 2000);
      }
    };
    if (!(window as any).JitsiMeetExternalAPI) {
      const script = document.createElement('script');
      script.src = 'https://meet.jit.si/external_api.js';
      script.onload = loadAndCreate;
      document.head.appendChild(script);
    } else {
      loadAndCreate();
    }
  }, [toast]);

  // Cleanup Jitsi on unmount
  React.useEffect(() => {
    return () => {
      if (jitsiApiRef.current) {
        try { jitsiApiRef.current.dispose(); } catch {}
        jitsiApiRef.current = null;
      }
    };
  }, []);

  // Recording mutations
  const startRecordingMutation = trpc.videoManagement.startRecording.useMutation();
  const stopRecordingMutation = trpc.videoManagement.stopRecording.useMutation();
  const { data: recordings, refetch: refetchRecordings } = trpc.videoManagement.listRecordings.useQuery({ roomId: activeRoom, limit: 5 });

  const startRecording = useCallback(async () => {
    try {
      // Request screen/tab capture for recording
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9' });
      recordedChunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunksRef.current.push(e.data);
      };
      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        // Upload the recording
        if (recordingId && recordedChunksRef.current.length > 0) {
          const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
          const reader = new FileReader();
          reader.onload = async () => {
            const base64 = (reader.result as string).split(',')[1];
            try {
              await stopRecordingMutation.mutateAsync({
                recordingId: recordingId!,
                fileBase64: base64,
                fileName: `meeting-${activeRoom}-${Date.now()}.webm`,
                duration: Math.floor((Date.now() - (recordingStartTime || Date.now())) / 1000),
                fileSizeMb: parseFloat((blob.size / (1024 * 1024)).toFixed(2)),
              });
              toast({ title: 'Recording saved', description: 'Meeting recording uploaded to cloud storage.' });
              refetchRecordings();
            } catch {
              toast({ title: 'Upload failed', description: 'Could not save recording.', variant: 'destructive' });
            }
          };
          reader.readAsDataURL(blob);
        }
        setIsRecording(false);
        setRecordingId(null);
        setRecordingDuration(0);
        setRecordingStartTime(null);
        if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      };
      // Start recording
      mediaRecorder.start(1000);
      mediaRecorderRef.current = mediaRecorder;
      const room = ROOMS.find(r => r.id === activeRoom);
      const result = await startRecordingMutation.mutateAsync({
        roomId: activeRoom,
        roomName: room?.name || activeRoom,
        participants: roomParticipants[activeRoom]?.members || [],
      });
      setRecordingId(result.recordingId);
      setIsRecording(true);
      setRecordingStartTime(Date.now());
      setRecordingDuration(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
      toast({ title: 'Recording started', description: `Recording ${room?.name || 'meeting'}...` });
    } catch (err: any) {
      if (err?.name !== 'NotAllowedError') {
        toast({ title: 'Recording failed', description: 'Could not start screen capture.', variant: 'destructive' });
      }
    }
  }, [activeRoom, roomParticipants, startRecordingMutation, stopRecordingMutation, toast, recordingId, recordingStartTime, refetchRecordings]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  // Cleanup recording on unmount
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const formatRecordingTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const { data: presentations, refetch } = trpc.conference.listPresentations.useQuery({ roomCode: 'squadd-main' });
  const uploadMutation = trpc.conference.uploadPresentation.useMutation({
    onSuccess: () => {
      toast({ title: 'Presentation uploaded', description: 'File is now available to all SQUADD members.' });
      setUploadTitle('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      refetch();
    },
    onError: (err) => {
      toast({ title: 'Upload failed', description: err.message, variant: 'destructive' });
    },
  });
  const deleteMutation = trpc.conference.deletePresentation.useMutation({
    onSuccess: () => {
      toast({ title: 'Presentation removed' });
      refetch();
    },
  });

  const handleFileUpload = useCallback(async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      toast({ title: 'No file selected', variant: 'destructive' });
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Maximum file size is 25MB.', variant: 'destructive' });
      return;
    }
    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];
        await uploadMutation.mutateAsync({
          roomCode: 'squadd-main',
          title: uploadTitle || file.name,
          filename: file.name,
          fileBase64: base64,
          mimeType: file.type,
        });
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch {
      setIsUploading(false);
    }
  }, [uploadTitle, uploadMutation, toast]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: `${label} copied to clipboard` });
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#E8E0D0]">
      {/* Floating Room Transfer Panel */}
      {showRoomPanel && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={() => setShowRoomPanel(false)}>
          <div className="bg-[#111111] border border-[#D4A843]/30 rounded-2xl p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-[#D4A843] mb-2">Transfer to Room</h3>
            <p className="text-[#E8E0D0]/50 text-sm mb-4">Switch rooms seamlessly without disconnecting your session.</p>
            <div className="space-y-2">
              {ROOMS.map(room => (
                <button
                  key={room.id}
                  onClick={() => transferToRoom(room.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                    activeRoom === room.id
                      ? 'bg-[#D4A843]/20 border border-[#D4A843]/50'
                      : 'bg-[#0D0D0D] border border-[#D4A843]/10 hover:border-[#D4A843]/30'
                  }`}
                >
                  <span className="text-2xl">{room.icon}</span>
                  <div className="text-left flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-[#E8E0D0]">{room.name}</span>
                      {activeRoom === room.id && (
                        <Badge className="bg-green-900/40 text-green-400 border-green-700/30 text-[10px]">Current</Badge>
                      )}
                    </div>
                    <p className="text-xs text-[#E8E0D0]/40">{room.description} · {room.schedule}</p>
                  </div>
                  <Badge className={`text-[10px] ${room.type === 'zoom' ? 'bg-blue-900/30 text-blue-400 border-blue-700/30' : 'bg-purple-900/30 text-purple-400 border-purple-700/30'}`}>
                    {room.type === 'zoom' ? 'Zoom' : 'Jitsi'}
                  </Badge>
                </button>
              ))}
            </div>
            <button onClick={() => setShowRoomPanel(false)} className="mt-4 w-full text-center text-sm text-[#E8E0D0]/40 hover:text-[#E8E0D0]/60">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Jitsi Room Container (shown when in a Jitsi room) */}
      {jitsiRoom && (
        <div className="fixed inset-0 z-40 bg-black flex flex-col">
          <div className="bg-gray-900/90 border-b border-[#D4A843]/20 px-4 py-2 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <span className="text-lg">{ROOMS.find(r => r.id === jitsiRoom)?.icon}</span>
              <h2 className="text-white font-semibold text-sm">{ROOMS.find(r => r.id === jitsiRoom)?.name}</h2>
              <Badge className="bg-green-900/40 text-green-400 border-green-700/30 text-[10px]">Connected</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className="border-[#D4A843]/30 text-[#D4A843] hover:bg-[#D4A843]/10 text-xs h-7"
                onClick={() => setShowRoomPanel(true)}
              >
                <Users className="w-3 h-3 mr-1" /> Transfer Room
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-red-500/30 text-red-400 hover:bg-red-900/20 text-xs h-7"
                onClick={() => {
                  if (jitsiApiRef.current) {
                    try { jitsiApiRef.current.dispose(); } catch {}
                    jitsiApiRef.current = null;
                  }
                  setJitsiRoom(null);
                  setActiveRoom('squadd-main');
                }}
              >
                <X className="w-3 h-3 mr-1" /> Leave Room
              </Button>
            </div>
          </div>
          <div ref={jitsiContainerRef} className="flex-1" />
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-[#1a1206] via-[#0D0D0D] to-[#061220] border-b border-[#D4A843]/20">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#D4A843] to-[#8B6914] flex items-center justify-center">
              <Users className="w-6 h-6 text-black" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#D4A843]">SQUADD Meeting Room</h1>
              <p className="text-[#E8E0D0]/60 text-sm">Permanent Coalition Meeting Space</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 mt-4">
            <Badge className="bg-green-900/40 text-green-400 border-green-700/30">
              <span className="w-2 h-2 rounded-full bg-green-400 mr-2 animate-pulse" /> Daily Meeting
            </Badge>
            <Badge className="bg-[#D4A843]/10 text-[#D4A843] border-[#D4A843]/30">
              <Calendar className="w-3 h-3 mr-1" /> 7:00 PM CT Daily
            </Badge>
            <Badge className="bg-blue-900/30 text-blue-400 border-blue-700/30">
              <Video className="w-3 h-3 mr-1" /> Zoom
            </Badge>
          </div>
        </div>
      </div>

      {/* Room Transfer Bar — Always Visible */}
      <div className="bg-[#0D0D0D] border-b border-[#D4A843]/10">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-[#D4A843]" />
            <span className="text-sm font-semibold text-[#D4A843]">Quick Room Transfer</span>
            <span className="text-xs text-[#E8E0D0]/40 ml-1">— Switch rooms seamlessly</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {ROOMS.map(room => {
              const rp = roomParticipants[room.id] || { count: 0, members: [] };
              return (
                <button
                  key={room.id}
                  onClick={() => transferToRoom(room.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all border ${
                    activeRoom === room.id
                      ? 'bg-[#D4A843]/20 border-[#D4A843]/50 text-[#D4A843]'
                      : 'bg-[#111111] border-[#D4A843]/10 text-[#E8E0D0]/70 hover:border-[#D4A843]/30 hover:text-[#E8E0D0]'
                  }`}
                  title={rp.members.length > 0 ? `In room: ${rp.members.join(', ')}` : room.description}
                >
                  <span className="text-lg">{room.icon}</span>
                  <div className="text-left">
                    <div className="font-medium text-xs leading-tight flex items-center gap-1">
                      {room.name}
                      {rp.count > 0 && (
                        <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-green-500 text-white text-[10px] font-bold">
                          {rp.count}
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] opacity-50">
                      {rp.count > 0 ? (
                        <span className="text-green-400">
                          {rp.members.slice(0, 2).join(', ')}{rp.members.length > 2 ? ` +${rp.members.length - 2}` : ''}
                        </span>
                      ) : room.schedule}
                    </div>
                  </div>
                  {activeRoom === room.id && (
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse ml-1" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Join Meeting Card */}
            <Card className="bg-[#111111] border-[#D4A843]/20">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-[#D4A843] mb-4 flex items-center gap-2">
                  <Video className="w-5 h-5" /> Join SQUADD Meeting
                </h2>
                <p className="text-[#E8E0D0]/70 mb-4">
                  Hosted by <span className="text-[#D4A843] font-semibold">{ZOOM_MEETING.hostName}</span> — {ZOOM_MEETING.hostOrg}
                </p>

                <div className="flex flex-wrap gap-3 mb-6">
                  <Button
                    className="bg-[#2D8CFF] hover:bg-[#2681F0] text-white font-bold px-6"
                    onClick={() => window.open(ZOOM_MEETING.url, '_blank')}
                  >
                    <Video className="w-4 h-4 mr-2" /> Join Zoom Meeting
                  </Button>
                  <Button
                    variant="outline"
                    className="border-purple-500/30 text-purple-400 hover:bg-purple-900/20"
                    onClick={() => setShowRoomPanel(true)}
                  >
                    <Users className="w-4 h-4 mr-2" /> Transfer to Room
                  </Button>
                  <Button
                    variant="outline"
                    className="border-[#D4A843]/30 text-[#D4A843] hover:bg-[#D4A843]/10"
                    onClick={() => window.open(ZOOM_MEETING.icsUrl, '_blank')}
                  >
                    <Calendar className="w-4 h-4 mr-2" /> Add to Calendar
                  </Button>
                  {/* Record Meeting Button */}
                  {user && (
                    isRecording ? (
                      <Button
                        variant="outline"
                        className="border-red-500/50 text-red-400 hover:bg-red-900/20 animate-pulse"
                        onClick={stopRecording}
                      >
                        <Square className="w-4 h-4 mr-2 fill-red-400" /> Stop Recording ({formatRecordingTime(recordingDuration)})
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        className="border-red-500/30 text-red-400 hover:bg-red-900/20"
                        onClick={startRecording}
                      >
                        <Circle className="w-4 h-4 mr-2 fill-red-400" /> Record Meeting
                      </Button>
                    )
                  )}
                </div>

                {/* Meeting Details - only visible to authenticated users */}
                {user ? (
                  <div className="bg-[#0D0D0D] rounded-lg p-4 space-y-3 border border-[#D4A843]/10">
                    <div className="flex items-center justify-between">
                      <span className="text-[#E8E0D0]/60 text-sm">Meeting ID</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[#E8E0D0] font-mono">{ZOOM_MEETING.meetingId}</span>
                        <button onClick={() => copyToClipboard(ZOOM_MEETING.meetingId, 'Meeting ID')} className="text-[#D4A843] hover:text-[#D4A843]/80">
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#E8E0D0]/60 text-sm flex items-center gap-1"><Lock className="w-3 h-3" /> Passcode</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[#E8E0D0] font-mono">{ZOOM_MEETING.passcode}</span>
                        <button onClick={() => copyToClipboard(ZOOM_MEETING.passcode, 'Passcode')} className="text-[#D4A843] hover:text-[#D4A843]/80">
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="border-t border-[#D4A843]/10 pt-3">
                      <p className="text-xs text-[#E8E0D0]/40 mb-2">One Tap Mobile</p>
                      {ZOOM_MEETING.oneTabMobile.map((m, i) => (
                        <a key={i} href={`tel:${m.number}`} className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 mb-1">
                          <Phone className="w-3 h-3" /> {m.number} ({m.label})
                        </a>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#0D0D0D] rounded-lg p-4 border border-[#D4A843]/10 flex items-center gap-3">
                    <Shield className="w-5 h-5 text-[#D4A843]" />
                    <p className="text-[#E8E0D0]/60 text-sm">Sign in to view meeting ID, passcode, and dial-in numbers.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Presentation Upload */}
            {user && (
              <Card className="bg-[#111111] border-[#D4A843]/20">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold text-[#D4A843] mb-4 flex items-center gap-2">
                    <Upload className="w-5 h-5" /> Upload Presentation
                  </h2>
                  <p className="text-[#E8E0D0]/60 text-sm mb-4">Share slides, documents, and files with SQUADD members. Max 25MB per file.</p>
                  <div className="space-y-3">
                    <Input
                      placeholder="Presentation title (optional)"
                      value={uploadTitle}
                      onChange={(e) => setUploadTitle(e.target.value)}
                      className="bg-[#0D0D0D] border-[#D4A843]/20 text-[#E8E0D0] placeholder:text-[#E8E0D0]/30"
                    />
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.pptx,.ppt,.doc,.docx,.xlsx,.xls,.png,.jpg,.jpeg,.gif,.mp4,.mp3,.wav"
                      className="block w-full text-sm text-[#E8E0D0]/60 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#D4A843]/10 file:text-[#D4A843] hover:file:bg-[#D4A843]/20"
                    />
                    <Button
                      onClick={handleFileUpload}
                      disabled={isUploading}
                      className="bg-[#D4A843] hover:bg-[#B8922E] text-black font-bold"
                    >
                      {isUploading ? 'Uploading...' : 'Upload to Meeting Room'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Presentations Gallery */}
            <Card className="bg-[#111111] border-[#D4A843]/20">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-[#D4A843] mb-4 flex items-center gap-2">
                  <Presentation className="w-5 h-5" /> Meeting Presentations
                </h2>
                {(!presentations || presentations.length === 0) ? (
                  <div className="text-center py-12 text-[#E8E0D0]/40">
                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No presentations uploaded yet.</p>
                    <p className="text-sm mt-1">Sign in and upload files to share with SQUADD members.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {presentations.map((p) => (
                      <div key={p.id} className="flex items-center gap-4 p-4 bg-[#0D0D0D] rounded-lg border border-[#D4A843]/10 hover:border-[#D4A843]/30 transition-colors">
                        <div className="w-10 h-10 rounded-lg bg-[#D4A843]/10 flex items-center justify-center flex-shrink-0">
                          <FileText className="w-5 h-5 text-[#D4A843]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-[#E8E0D0] truncate">{p.title}</h3>
                          <p className="text-xs text-[#E8E0D0]/40">
                            {p.uploadedBy} · {p.fileSize ? formatFileSize(p.fileSize) : ''} · {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : ''}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {p.mimeType?.includes('pdf') || p.mimeType?.includes('image') ? (
                            <button
                              onClick={() => { setPreviewUrl(p.fileUrl); setPreviewTitle(p.title); }}
                              className="p-2 text-[#D4A843] hover:bg-[#D4A843]/10 rounded-lg"
                              title="Preview"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          ) : null}
                          <a
                            href={p.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-[#D4A843] hover:bg-[#D4A843]/10 rounded-lg"
                            title="Download"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                          {user && (
                            <button
                              onClick={() => deleteMutation.mutate({ id: p.id })}
                              className="p-2 text-red-400 hover:bg-red-900/20 rounded-lg"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Links */}
            <Card className="bg-[#111111] border-[#D4A843]/20">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-[#D4A843] mb-4">Quick Links</h3>
                <div className="space-y-2">
                  <a href="/squadd" className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#D4A843]/5 transition-colors group">
                    <Shield className="w-5 h-5 text-[#D4A843]" />
                    <span className="text-sm text-[#E8E0D0]/80 group-hover:text-[#D4A843]">SQUADD Coalition</span>
                  </a>
                  <a href="/ecosystem" className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#D4A843]/5 transition-colors group">
                    <ExternalLink className="w-5 h-5 text-[#D4A843]" />
                    <span className="text-sm text-[#E8E0D0]/80 group-hover:text-[#D4A843]">Ecosystem Presentation</span>
                  </a>
                  <a href="/radio" className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#D4A843]/5 transition-colors group">
                    <ExternalLink className="w-5 h-5 text-[#D4A843]" />
                    <span className="text-sm text-[#E8E0D0]/80 group-hover:text-[#D4A843]">RRB Radio (54 Channels)</span>
                  </a>
                  <a href="/hybridcast" className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#D4A843]/5 transition-colors group">
                    <ExternalLink className="w-5 h-5 text-[#D4A843]" />
                    <span className="text-sm text-[#E8E0D0]/80 group-hover:text-[#D4A843]">HybridCast Emergency</span>
                  </a>
                  <a href="/conference" className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#D4A843]/5 transition-colors group">
                    <Video className="w-5 h-5 text-[#D4A843]" />
                    <span className="text-sm text-[#E8E0D0]/80 group-hover:text-[#D4A843]">Conference Hub</span>
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* Meeting Info */}
            <Card className="bg-[#111111] border-[#D4A843]/20">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-[#D4A843] mb-4">Meeting Info</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-[#E8E0D0]/40">Topic</span>
                    <p className="text-[#E8E0D0] font-semibold">{ZOOM_MEETING.topic}</p>
                  </div>
                  <div>
                    <span className="text-[#E8E0D0]/40">Schedule</span>
                    <p className="text-[#E8E0D0]">{ZOOM_MEETING.schedule}</p>
                  </div>
                  <div>
                    <span className="text-[#E8E0D0]/40">Recurrence</span>
                    <p className="text-[#E8E0D0]">Every day, 365 occurrences</p>
                  </div>
                  <div>
                    <span className="text-[#E8E0D0]/40">Host</span>
                    <p className="text-[#E8E0D0]">{ZOOM_MEETING.hostName}</p>
                    <p className="text-[#D4A843] text-xs">{ZOOM_MEETING.hostOrg}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Recordings */}
            <Card className="bg-[#111111] border-[#D4A843]/20">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-[#D4A843] mb-4 flex items-center gap-2">
                  <Mic className="w-4 h-4" /> Recent Recordings
                </h3>
                {(!recordings || recordings.length === 0) ? (
                  <div className="text-center py-6 text-[#E8E0D0]/40">
                    <Mic className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No recordings yet.</p>
                    <p className="text-xs mt-1">Use the Record button to capture meetings.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {recordings.map((rec) => (
                      <div key={rec.id} className="p-3 bg-[#0D0D0D] rounded-lg border border-[#D4A843]/10">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold text-[#E8E0D0] truncate">{rec.roomName}</span>
                          <Badge className="bg-green-900/30 text-green-400 border-green-700/20 text-[10px]">
                            {rec.status}
                          </Badge>
                        </div>
                        <div className="text-[10px] text-[#E8E0D0]/40">
                          {rec.recordedByName} · {rec.duration ? `${Math.floor(rec.duration / 60)}m ${rec.duration % 60}s` : 'In progress'}
                          {rec.fileSizeMb ? ` · ${rec.fileSizeMb}MB` : ''}
                        </div>
                        {rec.fileUrl && (
                          <a href={rec.fileUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-[#D4A843] hover:underline mt-1 inline-flex items-center gap-1">
                            <Download className="w-3 h-3" /> Download
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Supported File Types */}
            <Card className="bg-[#111111] border-[#D4A843]/20">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-[#D4A843] mb-3">Supported Files</h3>
                <div className="flex flex-wrap gap-2">
                  {['PDF', 'PPTX', 'PPT', 'DOC', 'DOCX', 'XLSX', 'PNG', 'JPG', 'MP4', 'MP3'].map(ext => (
                    <Badge key={ext} className="bg-[#D4A843]/10 text-[#D4A843] border-[#D4A843]/20 text-xs">
                      .{ext.toLowerCase()}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-[#E8E0D0]/40 mt-3">Maximum file size: 25MB</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {previewUrl && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <div className="relative w-full max-w-5xl max-h-[90vh]">
            <button
              onClick={() => { setPreviewUrl(null); setPreviewTitle(''); }}
              className="absolute -top-10 right-0 text-white hover:text-[#D4A843] z-10"
            >
              <X className="w-6 h-6" />
            </button>
            <h3 className="text-[#D4A843] font-bold mb-3">{previewTitle}</h3>
            {previewUrl.match(/\.(png|jpg|jpeg|gif|webp)/i) ? (
              <img src={previewUrl} alt={previewTitle} className="max-w-full max-h-[80vh] object-contain mx-auto rounded-lg" />
            ) : (
              <iframe src={previewUrl} className="w-full h-[80vh] rounded-lg bg-white" title={previewTitle} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
