import React, { useState, useEffect } from 'react';
import { Phone, PhoneOff, Music, Loader, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface CallerAppState {
  isConnected: boolean;
  queuePosition: number;
  estimatedWaitTime: number;
  selectedFrequency: number;
  volume: number;
  callStatus: 'idle' | 'dialing' | 'ringing' | 'connected' | 'ended';
  callDuration: number;
}

interface MobileCallerAppProps {
  phoneNumber?: string;
  onCallInitiated?: (frequency: number) => void;
  onCallEnded?: () => void;
}

export function MobileCallerApp({
  phoneNumber = '+1-800-RRB-LIVE',
  onCallInitiated,
  onCallEnded,
}: MobileCallerAppProps) {
  const [state, setState] = useState<CallerAppState>({
    isConnected: false,
    queuePosition: 0,
    estimatedWaitTime: 0,
    selectedFrequency: 432,
    volume: 70,
    callStatus: 'idle',
    callDuration: 0,
  });

  const [callerName, setCallerName] = useState('');
  const [showNameInput, setShowNameInput] = useState(true);
  const [callTimer, setCallTimer] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Update call duration timer
    if (state.callStatus === 'connected' && callTimer === null) {
      const timer = setInterval(() => {
        setState(prev => ({
          ...prev,
          callDuration: prev.callDuration + 1,
        }));
      }, 1000);
      setCallTimer(timer);
    } else if (state.callStatus !== 'connected' && callTimer) {
      clearInterval(callTimer);
      setCallTimer(null);
    }

    return () => {
      if (callTimer) clearInterval(callTimer);
    };
  }, [state.callStatus, callTimer]);

  const handleInitiateCall = async () => {
    if (!callerName.trim()) {
      alert('Please enter your name');
      return;
    }

    setState(prev => ({ ...prev, callStatus: 'dialing' }));
    setShowNameInput(false);

    // Simulate dialing
    setTimeout(() => {
      setState(prev => ({ ...prev, callStatus: 'ringing', queuePosition: 5, estimatedWaitTime: 12 }));
    }, 1000);

    // Simulate connection
    setTimeout(() => {
      setState(prev => ({ ...prev, callStatus: 'connected', isConnected: true }));
      onCallInitiated?.(state.selectedFrequency);
    }, 3000);
  };

  const handleEndCall = () => {
    setState(prev => ({
      ...prev,
      callStatus: 'ended',
      isConnected: false,
      callDuration: 0,
    }));
    setShowNameInput(true);
    setCallerName('');
    onCallEnded?.();
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const SOLFEGGIO_FREQUENCIES = [
    { hz: 174, name: 'Root Support', color: 'from-red-600 to-red-400' },
    { hz: 285, name: 'Tissue Repair', color: 'from-orange-600 to-orange-400' },
    { hz: 396, name: 'Liberation', color: 'from-yellow-600 to-yellow-400' },
    { hz: 417, name: 'Undoing Situations', color: 'from-green-600 to-green-400' },
    { hz: 432, name: 'Universal Harmony', color: 'from-blue-600 to-blue-400' },
    { hz: 528, name: 'Transformation', color: 'from-purple-600 to-purple-400' },
    { hz: 639, name: 'Connection', color: 'from-pink-600 to-pink-400' },
    { hz: 741, name: 'Intuition', color: 'from-indigo-600 to-indigo-400' },
    { hz: 852, name: 'Spiritual Awakening', color: 'from-violet-600 to-violet-400' },
    { hz: 963, name: 'Divine Connection', color: 'from-slate-600 to-slate-400' },
  ];

  return (
    <div className="w-full max-w-md mx-auto bg-gradient-to-b from-slate-900 to-slate-800 rounded-2xl shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 text-white text-center">
        <h1 className="text-3xl font-bold mb-2">RRB Live</h1>
        <p className="text-red-100">Call-In Companion</p>
      </div>

      {/* Phone Number Display */}
      <div className="p-4 bg-slate-800 text-center border-b border-slate-700">
        <p className="text-xs text-gray-400 mb-1">Dial:</p>
        <p className="text-2xl font-bold text-red-400 font-mono">{phoneNumber}</p>
      </div>

      {/* Main Content */}
      <div className="p-6 space-y-6">
        {/* Name Input */}
        {showNameInput && state.callStatus === 'idle' && (
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-white">Your Name</label>
            <input
              type="text"
              placeholder="Enter your name"
              value={callerName}
              onChange={(e) => setCallerName(e.target.value)}
              className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-red-500 focus:ring-2 focus:ring-red-500/50 placeholder-gray-400"
              maxLength={50}
            />
          </div>
        )}

        {/* Frequency Selection */}
        {state.callStatus === 'idle' && (
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-white flex items-center gap-2">
              <Music className="w-4 h-4" />
              Healing Frequency
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
              {SOLFEGGIO_FREQUENCIES.map((freq) => (
                <button
                  key={freq.hz}
                  onClick={() => setState(prev => ({ ...prev, selectedFrequency: freq.hz }))}
                  className={`p-2 rounded-lg text-xs font-semibold transition-all ${
                    state.selectedFrequency === freq.hz
                      ? `bg-gradient-to-r ${freq.color} text-white shadow-lg`
                      : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                  }`}
                >
                  <div>{freq.hz} Hz</div>
                  <div className="text-xs opacity-75">{freq.name}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Call Status Display */}
        {state.callStatus !== 'idle' && (
          <div className="space-y-4">
            {/* Status Indicator */}
            <div className="p-4 bg-slate-700 rounded-lg text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                {state.callStatus === 'dialing' && (
                  <>
                    <Loader className="w-5 h-5 text-yellow-400 animate-spin" />
                    <span className="text-white font-semibold">Dialing...</span>
                  </>
                )}
                {state.callStatus === 'ringing' && (
                  <>
                    <AlertCircle className="w-5 h-5 text-yellow-400 animate-pulse" />
                    <span className="text-white font-semibold">Ringing...</span>
                  </>
                )}
                {state.callStatus === 'connected' && (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-white font-semibold">Connected</span>
                  </>
                )}
              </div>

              {/* Queue Position */}
              {state.callStatus === 'ringing' && (
                <div className="text-sm text-gray-300">
                  <p>Queue Position: #{state.queuePosition}</p>
                  <p>Est. Wait: {state.estimatedWaitTime} min</p>
                </div>
              )}

              {/* Call Duration */}
              {state.callStatus === 'connected' && (
                <div className="text-2xl font-bold text-green-400 font-mono">
                  {formatDuration(state.callDuration)}
                </div>
              )}

              {/* Caller Info */}
              {state.callStatus !== 'idle' && (
                <div className="mt-3 pt-3 border-t border-slate-600">
                  <p className="text-xs text-gray-400">Caller</p>
                  <p className="text-white font-semibold">{callerName}</p>
                  <p className="text-xs text-gray-400 mt-1">Frequency</p>
                  <p className="text-purple-300 font-semibold">{state.selectedFrequency} Hz</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Volume Control */}
        {state.callStatus === 'connected' && (
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-gray-400">Volume</label>
            <input
              type="range"
              min="0"
              max="100"
              value={state.volume}
              onChange={(e) => setState(prev => ({ ...prev, volume: parseInt(e.target.value) }))}
              className="w-full"
            />
            <p className="text-xs text-gray-400 text-right">{state.volume}%</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          {state.callStatus === 'idle' && (
            <Button
              onClick={handleInitiateCall}
              disabled={!callerName.trim()}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2"
            >
              <Phone className="w-5 h-5" />
              Call Now
            </Button>
          )}

          {(state.callStatus === 'dialing' || state.callStatus === 'ringing' || state.callStatus === 'connected') && (
            <Button
              onClick={handleEndCall}
              className="w-full bg-red-700 hover:bg-red-800 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2"
            >
              <PhoneOff className="w-5 h-5" />
              End Call
            </Button>
          )}

          {state.callStatus === 'ended' && (
            <Button
              onClick={() => {
                setState(prev => ({ ...prev, callStatus: 'idle' }));
                setShowNameInput(true);
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg"
            >
              New Call
            </Button>
          )}
        </div>

        {/* Info Footer */}
        <div className="p-3 bg-slate-700 rounded-lg text-xs text-gray-300 text-center">
          <p>Thank you for calling RRB Live!</p>
          <p className="mt-1">Your call helps support our mission.</p>
        </div>
      </div>
    </div>
  );
}
