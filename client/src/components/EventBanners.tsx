import React from 'react';
import { useLocation } from 'wouter';
import { Calendar, MapPin, Earth, ArrowRight, X, Clock } from 'lucide-react';

interface EventBannerProps {
  onClose?: (id: string) => void;
}

function useCountdown(targetDate: Date) {
  const [timeLeft, setTimeLeft] = React.useState(() => calculateTimeLeft(targetDate));

  React.useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDate));
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return timeLeft;
}

function calculateTimeLeft(target: Date) {
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds, expired: false };
}

function CountdownDisplay({ targetDate }: { targetDate: Date }) {
  const { days, hours, minutes, seconds, expired } = useCountdown(targetDate);

  if (expired) {
    return (
      <span className="flex items-center gap-1 text-[#4ADE80] font-bold text-xs animate-pulse">
        <Clock className="w-3 h-3" /> HAPPENING NOW!
      </span>
    );
  }

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  parts.push(`${hours}h`);
  parts.push(`${String(minutes).padStart(2, '0')}m`);
  parts.push(`${String(seconds).padStart(2, '0')}s`);

  return (
    <span className="flex items-center gap-1.5 text-xs font-mono">
      <Clock className="w-3 h-3 text-[#D4A843]" />
      <span className="text-[#FBBF24] font-bold tracking-wider">{parts.join(' : ')}</span>
    </span>
  );
}

export function EventBanners({ onClose }: EventBannerProps) {
  const [, setLocation] = useLocation();
  const [dismissed, setDismissed] = React.useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem('dismissed_banners');
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });

  const handleDismiss = (id: string) => {
    const next = new Set(dismissed);
    next.add(id);
    setDismissed(next);
    localStorage.setItem('dismissed_banners', JSON.stringify([...next]));
    onClose?.(id);
  };

  const now = new Date();
  const selmaDate = new Date('2026-03-07T23:59:59');
  const unDate = new Date('2026-03-17T23:59:59');
  // Event start time: Saturday March 7, 2026 at 10:00 AM CST (UTC-6)
  const selmaStartDate = new Date('2026-03-07T16:00:00Z'); // 10 AM CST = 16:00 UTC

  const events = [
    {
      id: 'selma-jubilee-2026',
      show: now <= selmaDate && !dismissed.has('selma-jubilee-2026'),
      gradient: 'from-[#8B1A1A] via-[#6B0F0F] to-[#4A0A0A]',
      borderColor: 'border-[#D4A843]/30',
      title: 'GRITS & GREENS — SELMA JUBILEE 2026',
      subtitle: 'Turning Individual Grit into Collective Green',
      date: 'Saturday, March 7, 2026 — 10:00 AM CST',
      location: 'Wallace Community College, Room 112',
      seats: '90 Seats',
      description: 'SQUADD workshop — agriculture, law advocacy, elder protection, environmental justice.',
      ctaText: 'View Event Details',
      ctaAction: () => setLocation('/selma'),
      showCountdown: true,
      countdownTarget: selmaStartDate,
    },
    {
      id: 'un-ghana-csw70',
      show: now <= unDate && !dismissed.has('un-ghana-csw70'),
      gradient: 'from-[#1A3A5C] via-[#0F2640] to-[#0A1A2E]',
      borderColor: 'border-[#D4A843]/30',
      title: 'UN NGO CSW70 — IN PARTNERSHIP WITH GHANA',
      subtitle: 'SQUADD Goals: Sisters Questing Unapologetically After Divine Destiny',
      date: 'March 17, 2026',
      location: 'United Nations, New York',
      seats: 'Parallel Event',
      description: 'From Selma to Ghana to the World — presenting the ecosystem that ensures no voice is ever silenced again.',
      ctaText: 'View SQUADD Goals',
      ctaAction: () => setLocation('/squadd'),
      showCountdown: false,
      countdownTarget: new Date('2026-03-17T14:00:00Z'),
    },
  ];

  const visibleEvents = events.filter(e => e.show);
  if (visibleEvents.length === 0) return null;

  return (
    <div className="space-y-0 relative z-[90]">
      {visibleEvents.map((event) => (
        <div
          key={event.id}
          className={`relative bg-gradient-to-r ${event.gradient} ${event.borderColor} border-b overflow-hidden`}
        >
          {/* Decorative diagonal line */}
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-[#D4A843]/5 to-transparent" />

          <div className="relative container mx-auto px-4 py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-6 flex-1 min-w-0">
                {/* Event badge */}
                <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-[#D4A843]/20 border border-[#D4A843]/30 rounded-full flex-shrink-0">
                  {event.id.includes('selma') ? (
                    <MapPin className="w-3.5 h-3.5 text-[#D4A843]" />
                  ) : (
                    <Earth className="w-3.5 h-3.5 text-[#D4A843]" />
                  )}
                  <span className="text-xs font-bold text-[#D4A843] tracking-wider uppercase whitespace-nowrap">
                    {event.id.includes('selma') ? 'LIVE EVENT' : 'UN EVENT'}
                  </span>
                </div>

                {/* Title and details */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm md:text-base font-bold text-[#D4A843] tracking-wide">
                      {event.title}
                    </h3>
                    <span className="text-xs text-[#E8E0D0]/50 hidden lg:inline">—</span>
                    <span className="text-xs text-[#E8E0D0]/70 hidden lg:inline">{event.subtitle}</span>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-xs text-[#E8E0D0]/60 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {event.date}
                    </span>
                    <span className="flex items-center gap-1 hidden md:flex">
                      <MapPin className="w-3 h-3" /> {event.location}
                    </span>
                    {event.showCountdown && event.countdownTarget && (
                      <CountdownDisplay targetDate={event.countdownTarget} />
                    )}
                  </div>
                </div>
              </div>

              {/* CTA + Close */}
              <div className="flex items-center gap-3 flex-shrink-0">
                <button
                  onClick={event.ctaAction}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-[#D4A843] text-[#0A0A0A] text-xs font-bold rounded hover:bg-[#E8C860] transition-colors whitespace-nowrap"
                >
                  {event.ctaText} <ArrowRight className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handleDismiss(event.id)}
                  className="p-1 text-[#E8E0D0]/40 hover:text-[#E8E0D0]/80 transition-colors"
                  aria-label="Dismiss banner"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
