/**
 * MeetingContext — Persistent Meeting State Manager
 * 
 * Keeps the Jitsi meeting alive at the App level so navigating
 * to other pages doesn't disconnect the call. Shows a floating
 * Picture-in-Picture mini-view when the user is away from /meeting.
 */
import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { useLocation } from 'wouter';

interface MeetingParticipant {
  id: string;
  displayName: string;
}

interface MeetingState {
  isInMeeting: boolean;
  roomName: string;
  roomLabel: string;
  participants: MeetingParticipant[];
  isMuted: boolean;
  isVideoOn: boolean;
  joinedAt: number | null;
}

interface MeetingContextType {
  meeting: MeetingState;
  joinMeeting: (roomName: string, roomLabel: string) => void;
  leaveMeeting: () => void;
  switchRoom: (roomName: string, roomLabel: string) => void;
  toggleMute: () => void;
  toggleVideo: () => void;
  jitsiContainerRef: React.RefObject<HTMLDivElement | null>;
  isOnMeetingPage: boolean;
}

const defaultState: MeetingState = {
  isInMeeting: false,
  roomName: '',
  roomLabel: '',
  participants: [],
  isMuted: false,
  isVideoOn: true,
  joinedAt: null,
};

const MeetingContext = createContext<MeetingContextType>({
  meeting: defaultState,
  joinMeeting: () => {},
  leaveMeeting: () => {},
  switchRoom: () => {},
  toggleMute: () => {},
  toggleVideo: () => {},
  jitsiContainerRef: { current: null },
  isOnMeetingPage: false,
});

export function useMeeting() {
  return useContext(MeetingContext);
}

export function MeetingProvider({ children }: { children: React.ReactNode }) {
  const [meeting, setMeeting] = useState<MeetingState>(defaultState);
  const jitsiContainerRef = useRef<HTMLDivElement | null>(null);
  const jitsiApiRef = useRef<any>(null);
  const [location] = useLocation();
  
  const isOnMeetingPage = location === '/meeting' || location === '/squadd/meeting';

  const destroyJitsi = useCallback(() => {
    if (jitsiApiRef.current) {
      try {
        jitsiApiRef.current.dispose();
      } catch (e) {
        // ignore
      }
      jitsiApiRef.current = null;
    }
  }, []);

  const initJitsi = useCallback((roomName: string) => {
    destroyJitsi();
    
    if (!jitsiContainerRef.current) return;
    
    // Clear the container
    jitsiContainerRef.current.innerHTML = '';
    
    const domain = 'meet.jit.si';
    const options = {
      roomName: roomName,
      parentNode: jitsiContainerRef.current,
      width: '100%',
      height: '100%',
      configOverwrite: {
        startWithAudioMuted: false,
        startWithVideoMuted: false,
        prejoinPageEnabled: false,
        disableDeepLinking: true,
        toolbarButtons: [
          'microphone', 'camera', 'desktop', 'chat',
          'raisehand', 'participants-pane', 'tileview',
          'select-background', 'settings', 'hangup',
          'closedcaptions', 'recording',
        ],
        enableClosePage: false,
        disableInviteFunctions: false,
      },
      interfaceConfigOverwrite: {
        SHOW_JITSI_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
        DEFAULT_BACKGROUND: '#111827',
        TOOLBAR_ALWAYS_VISIBLE: true,
        MOBILE_APP_PROMO: false,
        HIDE_INVITE_MORE_HEADER: false,
      },
    };

    try {
      // @ts-ignore - JitsiMeetExternalAPI is loaded from script
      const api = new (window as any).JitsiMeetExternalAPI(domain, options);
      jitsiApiRef.current = api;

      api.addEventListener('participantJoined', (p: any) => {
        setMeeting(prev => ({
          ...prev,
          participants: [...prev.participants, { id: p.id, displayName: p.displayName || 'Guest' }],
        }));
      });

      api.addEventListener('participantLeft', (p: any) => {
        setMeeting(prev => ({
          ...prev,
          participants: prev.participants.filter(pp => pp.id !== p.id),
        }));
      });

      api.addEventListener('readyToClose', () => {
        setMeeting(defaultState);
        destroyJitsi();
      });
    } catch (e) {
      console.error('[MeetingContext] Failed to init Jitsi:', e);
    }
  }, [destroyJitsi]);

  const joinMeeting = useCallback((roomName: string, roomLabel: string) => {
    setMeeting({
      isInMeeting: true,
      roomName,
      roomLabel,
      participants: [],
      isMuted: false,
      isVideoOn: true,
      joinedAt: Date.now(),
    });
    // Small delay to let the container mount
    setTimeout(() => initJitsi(roomName), 100);
  }, [initJitsi]);

  const leaveMeeting = useCallback(() => {
    destroyJitsi();
    setMeeting(defaultState);
  }, [destroyJitsi]);

  const switchRoom = useCallback((roomName: string, roomLabel: string) => {
    destroyJitsi();
    setMeeting(prev => ({
      ...prev,
      roomName,
      roomLabel,
      participants: [],
    }));
    setTimeout(() => initJitsi(roomName), 200);
  }, [destroyJitsi, initJitsi]);

  const toggleMute = useCallback(() => {
    if (jitsiApiRef.current) {
      jitsiApiRef.current.executeCommand('toggleAudio');
      setMeeting(prev => ({ ...prev, isMuted: !prev.isMuted }));
    }
  }, []);

  const toggleVideo = useCallback(() => {
    if (jitsiApiRef.current) {
      jitsiApiRef.current.executeCommand('toggleVideo');
      setMeeting(prev => ({ ...prev, isVideoOn: !prev.isVideoOn }));
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      destroyJitsi();
    };
  }, [destroyJitsi]);

  return (
    <MeetingContext.Provider value={{
      meeting,
      joinMeeting,
      leaveMeeting,
      switchRoom,
      toggleMute,
      toggleVideo,
      jitsiContainerRef,
      isOnMeetingPage,
    }}>
      {children}
    </MeetingContext.Provider>
  );
}
