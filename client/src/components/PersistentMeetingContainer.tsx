/**
 * PersistentMeetingContainer — Holds the Jitsi iframe at the App level
 * 
 * When on the meeting page, this container is visible and fills the meeting area.
 * When navigating away, the container is hidden (display:none) but NOT destroyed,
 * so the Jitsi connection stays alive.
 */
import React from 'react';
import { useMeeting } from '@/contexts/MeetingContext';

export function PersistentMeetingContainer() {
  const { meeting, jitsiContainerRef, isOnMeetingPage } = useMeeting();

  if (!meeting.isInMeeting) return null;

  return (
    <div
      id="persistent-jitsi-container"
      ref={jitsiContainerRef}
      style={{
        // When on meeting page, this will be positioned by the meeting page layout
        // When away, hide it but keep it in DOM
        position: isOnMeetingPage ? 'fixed' : 'fixed',
        top: isOnMeetingPage ? '0' : '-9999px',
        left: isOnMeetingPage ? '0' : '-9999px',
        width: isOnMeetingPage ? '100vw' : '1px',
        height: isOnMeetingPage ? '100vh' : '1px',
        zIndex: isOnMeetingPage ? 40 : -1,
        opacity: isOnMeetingPage ? 1 : 0,
        pointerEvents: isOnMeetingPage ? 'auto' : 'none',
        overflow: 'hidden',
      }}
    />
  );
}
