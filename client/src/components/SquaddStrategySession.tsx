import { useState, useEffect } from 'react';
import { Clock, MapPin, Users, CheckCircle2, AlertCircle, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { PlatformRole } from './RoleBasedAccess';

interface CountdownState {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isLive: boolean;
}

interface SquaddStrategySessionProps {
  userRole?: PlatformRole | null;
}

export function SquaddStrategySession({ userRole = 'viewer' }: SquaddStrategySessionProps) {
  const [countdown, setCountdown] = useState<CountdownState>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isLive: false,
  });

  const sessionDate = new Date('2026-02-21T14:00:00-06:00');
  const zoomLink = 'https://zoom.us/meeting';
  const meetingId = '879 2681 6025';
  const passcode = '908875';
  const agendaLink = 'https://example.com/agenda';

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const diff = sessionDate.getTime() - now.getTime();

      if (diff <= 0) {
        setCountdown({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isLive: true,
        });
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
      });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const preparationChecklist = [
    { item: '100-word Bio & Headshot', completed: false },
    { item: 'QR Code to Website/Book', completed: false },
    { item: 'Dress Code: Red, Black, Green, Gold or White Shirts', completed: false },
    { item: '3-Minute Power Pitch for "Pillars Relay"', completed: false },
  ];

  // Check if user has access to see sensitive Zoom details
  const hasAccess = userRole && (userRole === 'broadcaster' || userRole === 'moderator' || userRole === 'admin');

  if (!hasAccess) {
    return (
      <div className="w-full">
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">🔴 SQUADD Strategy Session</h2>
              <p className="text-red-100">From Civil Rights on Selma Soil to Crossing Bridges Across Waters</p>
            </div>
            <Lock className="w-8 h-8 text-yellow-300" />
          </div>
          <div className="mt-6 p-4 bg-red-800 bg-opacity-50 rounded-lg text-center">
            <p className="text-red-100 mb-2">This content is restricted to panelists and broadcasters.</p>
            <p className="text-sm text-red-200">Meeting details and Zoom credentials are only visible to authorized participants.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg p-6 shadow-lg">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">🔴 SQUADD Strategy Session</h2>
            <p className="text-red-100">From Civil Rights on Selma Soil to Crossing Bridges Across Waters</p>
          </div>
          {countdown.isLive && (
            <div className="bg-yellow-400 text-red-700 px-4 py-2 rounded-full font-bold animate-pulse">
              LIVE NOW
            </div>
          )}
        </div>

        <div className="bg-red-800 bg-opacity-50 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-5 h-5" />
            <span className="font-semibold">Time Until Strategy Session</span>
          </div>
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-red-900 rounded p-3 text-center">
              <div className="text-2xl font-bold">{countdown.days}</div>
              <div className="text-xs text-red-200">Days</div>
            </div>
            <div className="bg-red-900 rounded p-3 text-center">
              <div className="text-2xl font-bold">{countdown.hours}</div>
              <div className="text-xs text-red-200">Hours</div>
            </div>
            <div className="bg-red-900 rounded p-3 text-center">
              <div className="text-2xl font-bold">{countdown.minutes}</div>
              <div className="text-xs text-red-200">Minutes</div>
            </div>
            <div className="bg-red-900 rounded p-3 text-center">
              <div className="text-2xl font-bold">{countdown.seconds}</div>
              <div className="text-xs text-red-200">Seconds</div>
            </div>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div className="bg-red-800 bg-opacity-50 rounded p-4">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-5 h-5" />
              <span className="font-semibold">Meeting Details</span>
            </div>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-red-200">Date:</span> Saturday, February 21, 2026
              </div>
              <div>
                <span className="text-red-200">Time:</span> 2:00 PM Central Time
              </div>
              <div>
                <span className="text-red-200">Zoom Link:</span>{' '}
                <a href={zoomLink} target="_blank" rel="noopener noreferrer" className="text-yellow-300 hover:text-yellow-200 underline">
                  Join Meeting Here
                </a>
              </div>
              <div>
                <span className="text-red-200">Meeting ID:</span> <code className="bg-red-900 px-2 py-1 rounded">{meetingId}</code>
              </div>
              <div>
                <span className="text-red-200">Passcode:</span> <code className="bg-red-900 px-2 py-1 rounded">{passcode}</code>
              </div>
              <div>
                <span className="text-red-200">Agenda:</span>{' '}
                <a href={agendaLink} target="_blank" rel="noopener noreferrer" className="text-yellow-300 hover:text-yellow-200 underline">
                  Review Meeting Agenda Here
                </a>
              </div>
            </div>
          </div>

          <div className="bg-red-800 bg-opacity-50 rounded p-4">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-5 h-5" />
              <span className="font-semibold">What to Have Ready</span>
            </div>
            <div className="space-y-2">
              {preparationChecklist.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0 text-yellow-300" />
                  <span className="text-sm">{item.item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-red-800 bg-opacity-50 rounded p-4">
            <div className="flex items-start gap-2 mb-2">
              <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold mb-2">Our Mission</p>
                <p className="text-sm leading-relaxed">
                  We are <span className="font-bold">Sisters Questing Unapologetically After Divine Destiny</span>. 
                  Let's show up tomorrow ready to manifest that vision. From the soil of Selma to the global stage of the United Nations, 
                  we transition seamlessly to ensure our UN NGO CSW70 Parallel Event succeeds on March 17th.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={() => window.open(zoomLink, '_blank')}
            className="flex-1 bg-yellow-400 text-red-700 hover:bg-yellow-300 font-bold"
          >
            Join Strategy Session Now
          </Button>
          <Button
            onClick={() => window.open(agendaLink, '_blank')}
            variant="outline"
            className="flex-1 border-yellow-300 text-yellow-300 hover:bg-red-700"
          >
            Review Agenda
          </Button>
        </div>
      </div>
    </div>
  );
}
