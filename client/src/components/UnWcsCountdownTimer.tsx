/**
 * UN WCS Countdown Timer Component
 * Displays live countdown to March 17th UN WCS Parallel Event
 */

import { useState, useEffect } from 'react';
import { Clock, Globe } from 'lucide-react';

interface CountdownState {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isLive: boolean;
  isPassed: boolean;
}

interface UnWcsCountdownTimerProps {
  showLabel?: boolean;
  compact?: boolean;
  onLiveStatusChange?: (isLive: boolean) => void;
}

export function UnWcsCountdownTimer({
  showLabel = true,
  compact = false,
  onLiveStatusChange,
}: UnWcsCountdownTimerProps) {
  const [countdown, setCountdown] = useState<CountdownState>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isLive: false,
    isPassed: false,
  });

  // UN WCS Parallel Event: March 17, 2026 at 9:00 AM UTC
  const eventDate = new Date('2026-03-17T09:00:00Z');

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const diff = eventDate.getTime() - now.getTime();

      // Event is live if within 24 hours before or after start time
      const isLive = diff <= 0 && diff > -86400000; // 24 hours in milliseconds
      const isPassed = diff < -86400000;

      if (isPassed) {
        setCountdown({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isLive: false,
          isPassed: true,
        });
        onLiveStatusChange?.(false);
        return;
      }

      if (isLive) {
        setCountdown({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isLive: true,
          isPassed: false,
        });
        onLiveStatusChange?.(true);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setCountdown({
        days,
        hours,
        minutes,
        seconds,
        isLive: false,
        isPassed: false,
      });
      onLiveStatusChange?.(false);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [eventDate, onLiveStatusChange]);

  if (compact) {
    return (
      <div className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-full text-sm font-semibold">
        <Clock className="w-4 h-4" />
        {countdown.isLive ? (
          <span className="animate-pulse">🔴 LIVE NOW</span>
        ) : countdown.isPassed ? (
          <span>Event Concluded</span>
        ) : (
          <span>
            {countdown.days}d {countdown.hours}h {countdown.minutes}m
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="bg-gradient-to-r from-red-600 via-red-700 to-red-800 text-white rounded-lg p-6 shadow-lg border border-red-500">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold mb-2 flex items-center gap-2">
              <Globe className="w-8 h-8" />
              🔴 UN WCS Parallel Event
            </h2>
            <p className="text-red-100">
              From Civil Rights on Selma Soil to Crossing Bridges Across Waters
            </p>
          </div>
          {countdown.isLive && (
            <div className="bg-yellow-400 text-red-700 px-4 py-2 rounded-full font-bold animate-pulse">
              LIVE NOW
            </div>
          )}
        </div>

        {/* Event Details */}
        <div className="bg-red-800 bg-opacity-50 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-red-200 text-xs">Date</p>
              <p className="text-white font-semibold">March 17, 2026</p>
            </div>
            <div>
              <p className="text-red-200 text-xs">Time</p>
              <p className="text-white font-semibold">9:00 AM UTC</p>
            </div>
            <div>
              <p className="text-red-200 text-xs">Location</p>
              <p className="text-white font-semibold">Global Virtual</p>
            </div>
            <div>
              <p className="text-red-200 text-xs">Theme</p>
              <p className="text-white font-semibold">UN CSW70</p>
            </div>
          </div>
        </div>

        {/* Countdown */}
        {!countdown.isPassed && (
          <div className="bg-red-800 bg-opacity-50 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5" />
              <span className="font-semibold">Time Until Broadcast</span>
            </div>
            {countdown.isLive ? (
              <div className="text-center py-4">
                <p className="text-2xl font-bold text-yellow-300 animate-pulse">
                  🔴 EVENT IS LIVE NOW 🔴
                </p>
                <p className="text-red-100 mt-2">Join us for this historic moment</p>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-3">
                <div className="bg-red-900 rounded p-4 text-center">
                  <div className="text-3xl font-bold text-white">{countdown.days}</div>
                  <div className="text-xs text-red-200 mt-1">Days</div>
                </div>
                <div className="bg-red-900 rounded p-4 text-center">
                  <div className="text-3xl font-bold text-white">{countdown.hours}</div>
                  <div className="text-xs text-red-200 mt-1">Hours</div>
                </div>
                <div className="bg-red-900 rounded p-4 text-center">
                  <div className="text-3xl font-bold text-white">{countdown.minutes}</div>
                  <div className="text-xs text-red-200 mt-1">Minutes</div>
                </div>
                <div className="bg-red-900 rounded p-4 text-center">
                  <div className="text-3xl font-bold text-white">{countdown.seconds}</div>
                  <div className="text-xs text-red-200 mt-1">Seconds</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Event Passed Message */}
        {countdown.isPassed && (
          <div className="bg-red-800 bg-opacity-50 rounded-lg p-6 text-center">
            <p className="text-xl font-semibold text-yellow-300 mb-2">Event Concluded</p>
            <p className="text-red-100">
              Thank you for participating in the UN WCS Parallel Event on March 17th.
            </p>
            <p className="text-red-200 text-sm mt-2">
              Watch the recording or explore upcoming events.
            </p>
          </div>
        )}

        {/* Mission Statement */}
        <div className="bg-red-800 bg-opacity-50 rounded-lg p-4 mt-6">
          <p className="text-sm leading-relaxed">
            <span className="font-bold">SQUADD Mission:</span> Sisters Questing Unapologetically After Divine Destiny. 
            From the soil of Selma to the global stage of the United Nations, we transition seamlessly to ensure our 
            UN NGO CSW70 Parallel Event succeeds on March 17th.
          </p>
        </div>
      </div>
    </div>
  );
}
