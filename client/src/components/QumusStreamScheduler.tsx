/**
 * QUMUS Stream Scheduler UI
 * 
 * Visual schedule display + auto-play toggle.
 * Shows the 24/7 rotation schedule and lets QUMUS autonomously manage streams.
 * 
 * A Canryn Production — All Rights Reserved
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { useAudio } from '@/contexts/AudioContext';
import {
  DEFAULT_SCHEDULE,
  getCurrentScheduleBlock,
  getScheduledChannel,
  getMinutesRemaining,
  getNextScheduleBlock,
  getDaySchedule,
  formatHour,
  QumusAutoPlayer,
} from '@/lib/qumusStreamScheduler';
import { CHANNEL_PRESETS } from '@/lib/streamLibrary';
import {
  Radio, Clock, Zap, Play, Pause, SkipForward,
  Calendar, ChevronRight, Power, PowerOff
} from 'lucide-react';
import { toast } from 'sonner';

export function QumusStreamScheduler() {
  const audio = useAudio();
  const autoPlayerRef = useRef<QumusAutoPlayer | null>(null);
  const [isAutoMode, setIsAutoMode] = useState(false);
  const [minutesLeft, setMinutesLeft] = useState(getMinutesRemaining());
  const [currentBlock, setCurrentBlock] = useState(getCurrentScheduleBlock());

  // Update timer every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setMinutesLeft(getMinutesRemaining());
      setCurrentBlock(getCurrentScheduleBlock());
    }, 60_000);
    return () => clearInterval(timer);
  }, []);

  const startAutoMode = useCallback(() => {
    if (autoPlayerRef.current) {
      autoPlayerRef.current.stop();
    }

    const player = new QumusAutoPlayer();
    player.onSwitch((channel, block) => {
      // QUMUS autonomously switches the channel
      if (channel.streams.length > 0) {
        audio.playQueue(channel.streams, 0);
        toast.info(`QUMUS Auto-Switch: ${block.label}`, {
          description: `Now playing ${channel.name}`,
        });
      }
      setCurrentBlock(block);
      setMinutesLeft(getMinutesRemaining());
    });

    const { channel, block } = player.start();
    autoPlayerRef.current = player;
    setIsAutoMode(true);

    // Start playing the current scheduled channel
    if (channel && channel.streams.length > 0) {
      audio.playQueue(channel.streams, 0);
      toast.success('QUMUS Autonomous Mode Activated', {
        description: `Playing ${channel.name} — ${block.label}`,
      });
    }
  }, [audio]);

  const stopAutoMode = useCallback(() => {
    if (autoPlayerRef.current) {
      autoPlayerRef.current.stop();
      autoPlayerRef.current = null;
    }
    setIsAutoMode(false);
    toast.info('QUMUS Manual Mode', {
      description: 'Autonomous stream scheduling paused',
    });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoPlayerRef.current) {
        autoPlayerRef.current.stop();
      }
    };
  }, []);

  const daySchedule = getDaySchedule();
  const nextBlock = getNextScheduleBlock();
  const scheduledChannel = getScheduledChannel();

  return (
    <div className="space-y-4">
      {/* Auto-Mode Toggle Card */}
      <div className={`rounded-xl border p-4 transition-all ${
        isAutoMode
          ? 'border-green-500/50 bg-green-500/5'
          : 'border-border/50 bg-card/50'
      }`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Zap className={`h-5 w-5 ${isAutoMode ? 'text-green-500' : 'text-muted-foreground'}`} />
            <div>
              <h3 className="text-sm font-semibold">QUMUS Autonomous Mode</h3>
              <p className="text-xs text-muted-foreground">
                {isAutoMode ? '90% autonomous — QUMUS controls the airwaves' : 'Manual control — you pick what plays'}
              </p>
            </div>
          </div>
          <button
            onClick={isAutoMode ? stopAutoMode : startAutoMode}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              isAutoMode
                ? 'bg-green-500 text-white hover:bg-green-600'
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
            }`}
          >
            {isAutoMode ? (
              <>
                <Power className="h-3.5 w-3.5" />
                Active
              </>
            ) : (
              <>
                <PowerOff className="h-3.5 w-3.5" />
                Activate
              </>
            )}
          </button>
        </div>

        {/* Current Block Info */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            <div>
              <p className="text-xs font-semibold">{currentBlock.label}</p>
              <p className="text-[10px] text-muted-foreground">{currentBlock.description}</p>
            </div>
          </div>
          <div className="ml-auto text-right">
            <p className="text-xs font-mono font-bold text-primary">{minutesLeft}m</p>
            <p className="text-[10px] text-muted-foreground">remaining</p>
          </div>
        </div>

        {/* Next Up */}
        {nextBlock && (
          <div className="flex items-center gap-2 mt-2 px-3 py-1.5 text-xs text-muted-foreground">
            <ChevronRight className="h-3 w-3" />
            <span>Up next: <strong className="text-foreground">{nextBlock.label}</strong> at {formatHour(nextBlock.startHour)}</span>
          </div>
        )}
      </div>

      {/* 24-Hour Schedule Timeline */}
      <div className="rounded-xl border border-border/50 bg-card/50 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">24-Hour Schedule</h3>
        </div>

        <div className="space-y-1">
          {daySchedule.map(({ block, channel, isCurrent }) => (
            <button
              key={block.id}
              onClick={() => {
                if (channel && channel.streams.length > 0) {
                  audio.playQueue(channel.streams, 0);
                  toast.success(`Now playing: ${channel.name}`);
                }
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all ${
                isCurrent
                  ? 'bg-primary/10 border border-primary/30'
                  : 'hover:bg-accent/30'
              }`}
            >
              {/* Time */}
              <span className="text-[10px] font-mono text-muted-foreground w-20 shrink-0">
                {formatHour(block.startHour)} – {formatHour(block.endHour)}
              </span>

              {/* Channel dot */}
              {channel && (
                <div
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: channel.color }}
                />
              )}

              {/* Label */}
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-medium truncate ${isCurrent ? 'text-primary' : ''}`}>
                  {block.label}
                </p>
                <p className="text-[10px] text-muted-foreground truncate">
                  {channel?.name || 'No channel assigned'}
                </p>
              </div>

              {/* Current indicator */}
              {isCurrent && (
                <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-primary/20 text-primary shrink-0">
                  NOW
                </span>
              )}

              {/* Play icon */}
              <Play className="h-3 w-3 text-muted-foreground shrink-0" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default QumusStreamScheduler;
