/**
 * PersistentRadioPlayer — Floating mini-player bar
 * 
 * Shows at the bottom of the screen (above the bottom nav) when
 * radio is playing and the user navigates away from the radio page.
 * Provides play/pause, channel name, and volume controls.
 */
import React from 'react';
import { useRadio } from '@/contexts/RadioContext';
import { useLocation } from 'wouter';
import { Play, Pause, X, Volume2, VolumeX, Radio, Loader2 } from 'lucide-react';

export function PersistentRadioPlayer() {
  const { radio, pause, resume, stop, toggleMute, isOnRadioPage } = useRadio();
  const [, navigate] = useLocation();

  // Only show when playing/loading AND not on a radio page
  if (isOnRadioPage) return null;
  if (!radio.channel) return null;
  if (radio.status === 'idle') return null;

  const isLoading = radio.status === 'loading' || radio.status === 'reconnecting';

  return (
    <div className="fixed bottom-16 md:bottom-0 left-0 right-0 z-[60] px-2 pb-1">
      <div 
        className="mx-auto max-w-lg rounded-xl overflow-hidden shadow-2xl border border-[#D4A843]/30"
        style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}
      >
        <div className="flex items-center gap-3 px-3 py-2.5">
          {/* Radio icon / channel indicator */}
          <button
            onClick={() => navigate('/rrb-radio')}
            className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#D4A843]/20 flex items-center justify-center hover:bg-[#D4A843]/30 transition-colors"
            title="Go to Radio"
          >
            <span className="text-lg">{radio.channel.icon || '📻'}</span>
          </button>

          {/* Channel info — tap to go to radio */}
          <button
            onClick={() => navigate('/rrb-radio')}
            className="flex-1 min-w-0 text-left"
          >
            <p className="text-sm font-semibold text-[#E8E0D0] truncate">
              {radio.channel.name}
            </p>
            <p className="text-xs text-[#E8E0D0]/60 truncate">
              {radio.channel.nowPlaying || radio.channel.genre || 'RRB Radio'}
              {radio.channel.frequency ? ` • ${radio.channel.frequency}` : ''}
            </p>
          </button>

          {/* Status indicator */}
          {isLoading && (
            <Loader2 className="w-4 h-4 text-[#D4A843] animate-spin flex-shrink-0" />
          )}
          {radio.status === 'error' && (
            <span className="text-xs text-red-400 flex-shrink-0">Error</span>
          )}

          {/* Mute toggle */}
          <button
            onClick={toggleMute}
            className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-[#E8E0D0]/70 hover:text-[#E8E0D0] transition-colors"
          >
            {radio.isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Play/Pause */}
          <button
            onClick={() => radio.isPlaying ? pause() : resume()}
            className="flex-shrink-0 w-10 h-10 rounded-full bg-[#D4A843] flex items-center justify-center hover:bg-[#D4A843]/80 transition-colors"
          >
            {radio.isPlaying ? (
              <Pause className="w-5 h-5 text-[#1a1a2e]" />
            ) : (
              <Play className="w-5 h-5 text-[#1a1a2e] ml-0.5" />
            )}
          </button>

          {/* Close / Stop */}
          <button
            onClick={stop}
            className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-[#E8E0D0]/50 hover:text-red-400 transition-colors"
            title="Stop radio"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Thin progress/live indicator bar */}
        {radio.isPlaying && (
          <div className="h-0.5 bg-[#D4A843]/20">
            <div className="h-full bg-[#D4A843] animate-pulse" style={{ width: '100%' }} />
          </div>
        )}
      </div>
    </div>
  );
}
