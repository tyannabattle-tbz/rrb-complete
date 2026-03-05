import React from 'react';
import { useLocation } from 'wouter';
import { Calendar, MapPin, Globe, ArrowRight, X } from 'lucide-react';

interface EventBannerProps {
  onClose?: (id: string) => void;
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

  const events = [
    {
      id: 'selma-jubilee-2026',
      show: now <= selmaDate && !dismissed.has('selma-jubilee-2026'),
      gradient: 'from-[#8B1A1A] via-[#6B0F0F] to-[#4A0A0A]',
      borderColor: 'border-[#D4A843]/30',
      title: 'SELMA JUBILEE 2026',
      subtitle: 'A Voice for the Voiceless',
      date: 'March 7, 2026',
      location: 'Wallace Community College, Room 112',
      seats: '90 Seats',
      description: 'Sweet Miracles presents the QUMUS/RRB/HybridCast ecosystem — technology built to honor the legacy of Seabrun Candy Hunter and protect the voiceless.',
      ctaText: 'Learn More',
      ctaAction: () => setLocation('/squadd'),
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
    },
  ];

  const visibleEvents = events.filter(e => e.show);
  if (visibleEvents.length === 0) return null;

  return (
    <div className="space-y-0">
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
                    <Globe className="w-3.5 h-3.5 text-[#D4A843]" />
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
                  <div className="flex items-center gap-4 mt-1 text-xs text-[#E8E0D0]/60">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {event.date}
                    </span>
                    <span className="flex items-center gap-1 hidden md:flex">
                      <MapPin className="w-3 h-3" /> {event.location}
                    </span>
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
