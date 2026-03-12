/**
 * FloatingMeetingPiP — Picture-in-Picture Meeting Overlay
 * 
 * When the user is in a meeting but navigates away from /meeting,
 * this shows a draggable floating mini-view of the meeting with
 * quick controls (mute, video, leave, return to meeting).
 */
import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useMeeting } from '@/contexts/MeetingContext';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Maximize2, GripHorizontal, Users } from 'lucide-react';

export function FloatingMeetingPiP() {
  const { meeting, leaveMeeting, toggleMute, toggleVideo, jitsiContainerRef, isOnMeetingPage } = useMeeting();
  const [, setLocation] = useLocation();
  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPosition] = useState({ x: 16, y: 16 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);
  const pipRef = useRef<HTMLDivElement>(null);

  // Don't show if not in a meeting or if on the meeting page
  if (!meeting.isInMeeting || isOnMeetingPage) return null;

  const elapsed = meeting.joinedAt ? Math.floor((Date.now() - meeting.joinedAt) / 1000) : 0;
  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX: position.x,
      origY: position.y,
    };
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    setPosition({
      x: Math.max(0, dragRef.current.origX + dx),
      y: Math.max(0, dragRef.current.origY + dy),
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    dragRef.current = null;
  };

  // Attach global mouse events for dragging
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  // Touch support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setIsDragging(true);
    dragRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      origX: position.x,
      origY: position.y,
    };
  };

  useEffect(() => {
    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging || !dragRef.current) return;
      const touch = e.touches[0];
      const dx = touch.clientX - dragRef.current.startX;
      const dy = touch.clientY - dragRef.current.startY;
      setPosition({
        x: Math.max(0, dragRef.current.origX + dx),
        y: Math.max(0, dragRef.current.origY + dy),
      });
    };
    const handleTouchEnd = () => {
      setIsDragging(false);
      dragRef.current = null;
    };
    if (isDragging) {
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleTouchEnd);
      return () => {
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isDragging]);

  if (isMinimized) {
    return (
      <div
        ref={pipRef}
        style={{ left: position.x, bottom: position.y, zIndex: 9999 }}
        className="fixed"
      >
        <button
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-2 bg-green-600 text-white px-3 py-2 rounded-full shadow-lg hover:bg-green-700 transition-colors"
        >
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          <span className="text-sm font-medium">{meeting.roomLabel}</span>
          <Users className="w-3.5 h-3.5" />
          <span className="text-xs">{meeting.participants.length + 1}</span>
          <span className="text-xs opacity-75">{minutes}:{seconds.toString().padStart(2, '0')}</span>
        </button>
      </div>
    );
  }

  return (
    <div
      ref={pipRef}
      style={{ left: position.x, bottom: position.y, zIndex: 9999 }}
      className="fixed w-72 sm:w-80 rounded-xl overflow-hidden shadow-2xl border border-gray-700 bg-gray-900"
    >
      {/* Drag Handle */}
      <div
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        className="flex items-center justify-between px-3 py-2 bg-gray-800 cursor-grab active:cursor-grabbing select-none"
      >
        <div className="flex items-center gap-2">
          <GripHorizontal className="w-4 h-4 text-gray-400" />
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs font-medium text-white truncate max-w-[120px]">{meeting.roomLabel}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-400">{minutes}:{seconds.toString().padStart(2, '0')}</span>
          <button
            onClick={() => setIsMinimized(true)}
            className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white"
            title="Minimize"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeWidth={2} d="M20 12H4" /></svg>
          </button>
        </div>
      </div>

      {/* Meeting Info Bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-gray-800/50 border-t border-gray-700/50">
        <div className="flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-xs text-gray-300">{meeting.participants.length + 1} in room</span>
        </div>
        <button
          onClick={() => setLocation('/meeting')}
          className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 font-medium"
        >
          <Maximize2 className="w-3 h-3" />
          Return to Meeting
        </button>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-900">
        <button
          onClick={toggleMute}
          className={`p-2 rounded-full transition-colors ${
            meeting.isMuted 
              ? 'bg-red-600 hover:bg-red-700 text-white' 
              : 'bg-gray-700 hover:bg-gray-600 text-white'
          }`}
          title={meeting.isMuted ? 'Unmute' : 'Mute'}
        >
          {meeting.isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>
        <button
          onClick={toggleVideo}
          className={`p-2 rounded-full transition-colors ${
            !meeting.isVideoOn 
              ? 'bg-red-600 hover:bg-red-700 text-white' 
              : 'bg-gray-700 hover:bg-gray-600 text-white'
          }`}
          title={meeting.isVideoOn ? 'Turn off camera' : 'Turn on camera'}
        >
          {meeting.isVideoOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
        </button>
        <button
          onClick={() => setLocation('/meeting')}
          className="px-3 py-2 rounded-full bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium transition-colors"
        >
          Full View
        </button>
        <button
          onClick={leaveMeeting}
          className="p-2 rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors"
          title="Leave meeting"
        >
          <PhoneOff className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
