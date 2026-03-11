import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';
import {
  Monitor, MessageSquare, Radio, Headphones, Calendar, Globe, Heart, Gamepad2,
  ChevronRight, ChevronLeft, X, Sparkles, Zap, Play, CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TourStep {
  id: string;
  title: string;
  description: string;
  icon: any;
  iconColor: string;
  iconBg: string;
  path: string;
  features: string[];
}

const tourSteps: TourStep[] = [
  {
    id: 'qumus',
    title: 'QUMUS Control Center',
    description: 'The autonomous brain of the entire ecosystem. QUMUS orchestrates 14 active policies, manages 18 subsystems, and maintains 90% autonomous control with human override capabilities.',
    icon: Monitor,
    iconColor: 'text-violet-400',
    iconBg: 'bg-violet-500/20',
    path: '/qumus',
    features: ['14 Active Policies', '18 Subsystems', '90% Autonomous', 'Real-time Health Monitoring'],
  },
  {
    id: 'ai-chat',
    title: 'AI Trinity Chat',
    description: 'Chat with three distinct AI personas: Valanna (Operations Director), Candy (Legacy Guardian), and Seraph (Autonomous Agent Orchestrator). Use Conference Mode for all three to discuss together.',
    icon: MessageSquare,
    iconColor: 'text-amber-400',
    iconBg: 'bg-amber-500/20',
    path: '/qumus-chat',
    features: ['Valanna - Operations', 'Candy - Legacy', 'Seraph - Orchestrator', 'Conference Mode'],
  },
  {
    id: 'radio',
    title: 'RRB Radio Network',
    description: '41+ channels of curated radio streaming powered by reliable SomaFM streams. Genres span from jazz and soul to ambient, electronic, and world music — broadcasting 24/7.',
    icon: Radio,
    iconColor: 'text-emerald-400',
    iconBg: 'bg-emerald-500/20',
    path: '/rrb-radio',
    features: ['41+ Channels', '24/7 Streaming', 'AI DJ Booth', 'Song Requests'],
  },
  {
    id: 'studio',
    title: 'Production Studio',
    description: 'Full video/podcast production studio with a 6-slot live panel, multi-platform guest support (YouTube, Twitch, Discord, Zoom, Twitter Spaces), waiting room, and recording pipeline.',
    icon: Headphones,
    iconColor: 'text-blue-400',
    iconBg: 'bg-blue-500/20',
    path: '/studio',
    features: ['6-Slot Live Panel', 'Multi-Platform Guests', 'Recording Pipeline', 'Go-Live Controls'],
  },
  {
    id: 'conventions',
    title: 'Convention Hub',
    description: 'Host global virtual conventions with multi-track sessions, breakout rooms, attendee registration, speaker management, and real-time analytics. Built for scale.',
    icon: Calendar,
    iconColor: 'text-pink-400',
    iconBg: 'bg-pink-500/20',
    path: '/convention-hub',
    features: ['Multi-Track Sessions', 'Breakout Rooms', 'Attendee Registration', 'Live Analytics'],
  },
  {
    id: 'ecosystem',
    title: 'Ecosystem Dashboard',
    description: 'Bird\'s-eye view of the entire RRB ecosystem: broadcasting status, listener metrics, donation tracking, content scheduling, and subsystem health — all in one place.',
    icon: Globe,
    iconColor: 'text-cyan-400',
    iconBg: 'bg-cyan-500/20',
    path: '/ecosystem-dashboard',
    features: ['System Overview', 'Live Metrics', 'Health Status', 'Event Log'],
  },
  {
    id: 'sweet-miracles',
    title: 'Sweet Miracles',
    description: 'The nonprofit arm of the ecosystem. Track donations, manage donor campaigns, view impact dashboards, and support community initiatives through the Sweet Miracles foundation.',
    icon: Heart,
    iconColor: 'text-rose-400',
    iconBg: 'bg-rose-500/20',
    path: '/donate',
    features: ['Donation Tracking', 'Impact Dashboard', 'Donor Campaigns', 'Community Support'],
  },
  {
    id: 'games',
    title: 'Games & Exploration',
    description: 'Play Solbones sacred math dice games, explore frequency-based word games, navigate the GPS radar map, and discover healing frequencies in the Meditation Hub.',
    icon: Gamepad2,
    iconColor: 'text-orange-400',
    iconBg: 'bg-orange-500/20',
    path: '/games',
    features: ['Solbones Dice', 'Word Frequency', 'GPS Radar', 'Meditation Hub'],
  },
];

const TOUR_COMPLETED_KEY = 'qumus-onboarding-completed';
const TOUR_DISMISSED_KEY = 'qumus-onboarding-dismissed';

export function OnboardingTour() {
  const [, navigate] = useLocation();
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    // Don't show tour on conference room, guest join, or playback pages
    const path = window.location.pathname;
    if (path.startsWith('/conference/room/') || path.startsWith('/join/') || path.startsWith('/conference/playback/')) {
      return;
    }
    const completed = localStorage.getItem(TOUR_COMPLETED_KEY);
    const dismissed = localStorage.getItem(TOUR_DISMISSED_KEY);
    if (!completed && !dismissed) {
      // Show tour after a brief delay for first-time users
      const timer = setTimeout(() => setIsVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleNext = useCallback(() => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep]);

  const handlePrev = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const handleVisit = useCallback(() => {
    const step = tourSteps[currentStep];
    setCompletedSteps(prev => new Set([...prev, step.id]));
    navigate(step.path);
  }, [currentStep, navigate]);

  const handleComplete = useCallback(() => {
    localStorage.setItem(TOUR_COMPLETED_KEY, 'true');
    setIsVisible(false);
  }, []);

  const handleDismiss = useCallback(() => {
    localStorage.setItem(TOUR_DISMISSED_KEY, 'true');
    setIsVisible(false);
  }, []);

  const handleRestart = useCallback(() => {
    setCurrentStep(0);
    setCompletedSteps(new Set());
    setIsMinimized(false);
    setIsVisible(true);
    localStorage.removeItem(TOUR_COMPLETED_KEY);
    localStorage.removeItem(TOUR_DISMISSED_KEY);
  }, []);

  if (!isVisible) return null;

  const step = tourSteps[currentStep];
  const progress = ((currentStep + 1) / tourSteps.length) * 100;
  const isStepCompleted = completedSteps.has(step.id);

  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-20 right-4 z-[60] flex items-center gap-2 px-4 py-2.5 rounded-full bg-violet-600 text-white shadow-lg shadow-violet-500/30 hover:bg-violet-500 transition-all"
      >
        <Sparkles className="h-4 w-4" />
        <span className="text-sm font-medium">Tour ({currentStep + 1}/{tourSteps.length})</span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setIsMinimized(true)}
      />

      {/* Tour Card */}
      <div className="relative w-full max-w-lg bg-gray-900 border border-gray-700/50 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden">
        {/* Progress Bar */}
        <div className="h-1 bg-gray-800">
          <div
            className="h-full bg-gradient-to-r from-violet-500 to-amber-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-violet-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-violet-400">
              Getting Started
            </span>
            <span className="text-xs text-gray-500">
              {currentStep + 1} of {tourSteps.length}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsMinimized(true)}
              className="h-7 w-7 flex items-center justify-center rounded-md text-gray-500 hover:text-gray-300 hover:bg-gray-800 transition-colors"
              title="Minimize"
            >
              <span className="text-lg leading-none">−</span>
            </button>
            <button
              onClick={handleDismiss}
              className="h-7 w-7 flex items-center justify-center rounded-md text-gray-500 hover:text-gray-300 hover:bg-gray-800 transition-colors"
              title="Close tour"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Step Content */}
        <div className="px-5 pb-4">
          <div className="flex items-start gap-4 mb-4">
            <div className={`shrink-0 h-14 w-14 rounded-xl ${step.iconBg} flex items-center justify-center`}>
              <step.icon className={`h-7 w-7 ${step.iconColor}`} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">{step.title}</h3>
                {isStepCompleted && (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                )}
              </div>
              <p className="text-sm text-gray-400 mt-1 leading-relaxed">
                {step.description}
              </p>
            </div>
          </div>

          {/* Feature Tags */}
          <div className="flex flex-wrap gap-2 mb-5">
            {step.features.map((feature) => (
              <span
                key={feature}
                className="px-2.5 py-1 text-xs rounded-full bg-gray-800 text-gray-300 border border-gray-700/50"
              >
                {feature}
              </span>
            ))}
          </div>

          {/* Step Dots */}
          <div className="flex items-center justify-center gap-1.5 mb-4">
            {tourSteps.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setCurrentStep(i)}
                className={`h-2 rounded-full transition-all ${
                  i === currentStep
                    ? 'w-6 bg-violet-500'
                    : completedSteps.has(s.id)
                    ? 'w-2 bg-emerald-500'
                    : 'w-2 bg-gray-700 hover:bg-gray-600'
                }`}
              />
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="h-9 border-gray-700 text-gray-300 hover:bg-gray-800 disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>

            <Button
              size="sm"
              onClick={handleVisit}
              className="h-9 flex-1 bg-violet-600 hover:bg-violet-500 text-white"
            >
              <Play className="h-3.5 w-3.5 mr-1.5" />
              Visit {step.title}
            </Button>

            {currentStep < tourSteps.length - 1 ? (
              <Button
                size="sm"
                onClick={handleNext}
                className="h-9 bg-gray-800 hover:bg-gray-700 text-gray-200"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={handleComplete}
                className="h-9 bg-emerald-600 hover:bg-emerald-500 text-white"
              >
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Done
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Export a button that can restart the tour from anywhere
export function StartTourButton() {
  const [, setVisible] = useState(false);

  const handleClick = () => {
    localStorage.removeItem(TOUR_COMPLETED_KEY);
    localStorage.removeItem(TOUR_DISMISSED_KEY);
    // Force re-render by toggling state, then reload to show tour
    setVisible(true);
    window.location.reload();
  };

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-2 px-3 py-1.5 text-xs rounded-md bg-violet-600/20 text-violet-400 hover:bg-violet-600/30 transition-colors"
    >
      <Sparkles className="h-3.5 w-3.5" />
      Getting Started Tour
    </button>
  );
}
