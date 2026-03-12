/**
 * PersistentMeetingContainer — Holds the Jitsi iframe at the App level
 * 
 * When on the meeting page, this container is visible and fills the meeting area.
 * When navigating away, the container is hidden (display:none) but NOT destroyed,
 * so the Jitsi connection stays alive.
 * 
 * Also exposes meeting state via a hidden DOM element so MobileBottomNav can
 * read it without importing MeetingContext (avoids circular dependency).
 */
import React from 'react';
import { useMeeting } from '@/contexts/MeetingContext';

export function PersistentMeetingContainer() {
  const { meeting, jitsiContainerRef, isOnMeetingPage } = useMeeting();

  return (
    <>
      {/* Hidden element that exposes meeting state to MobileBottomNav via DOM attributes */}
      <div
        id="persistent-meeting-state"
        data-in-meeting={meeting.isInMeeting ? 'true' : 'false'}
        data-room-label={meeting.roomLabel || ''}
        data-participants={String(meeting.participants?.length || 0)}
        data-room-id={meeting.roomId || ''}
        style={{ display: 'none' }}
      />

      {meeting.isInMeeting && (
        <div
          id="persistent-jitsi-container"
          ref={jitsiContainerRef}
          style={{
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
      )}
    </>
  );
}
