import React, { useState, useEffect } from 'react';
import { Phone, AlertTriangle, Users, Clock, CheckCircle, XCircle, Settings, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface Call {
  id: string;
  callerId: string;
  callerName: string;
  queuePosition: number;
  estimatedWaitTime: number;
  status: 'queued' | 'ringing' | 'connected' | 'ended';
  duration?: number;
  riskLevel?: 'low' | 'medium' | 'high';
}

interface AdminDashboardProps {
  onAcceptCall?: (callId: string) => void;
  onRejectCall?: (callId: string) => void;
  onEndCall?: (callId: string) => void;
}

export function AdminDashboard({
  onAcceptCall,
  onRejectCall,
  onEndCall,
}: AdminDashboardProps) {
  const [calls, setCalls] = useState<Call[]>([
    {
      id: 'call-1',
      callerId: 'caller-1',
      callerName: 'John Smith',
      queuePosition: 1,
      estimatedWaitTime: 2,
      status: 'ringing',
      riskLevel: 'low',
    },
    {
      id: 'call-2',
      callerId: 'caller-2',
      callerName: 'Sarah Johnson',
      queuePosition: 2,
      estimatedWaitTime: 5,
      status: 'queued',
      riskLevel: 'low',
    },
    {
      id: 'call-3',
      callerId: 'caller-3',
      callerName: 'Mike Davis',
      queuePosition: 3,
      estimatedWaitTime: 8,
      status: 'queued',
      riskLevel: 'medium',
    },
  ]);

  const [activeCall, setActiveCall] = useState<Call | null>(null);
  const [selectedTab, setSelectedTab] = useState<'queue' | 'active' | 'alerts'>('queue');
  const [metrics, setMetrics] = useState({
    totalCalls: 156,
    completedCalls: 142,
    averageDuration: 12,
    callsWaiting: 3,
    activeListeners: 2847,
  });

  const handleAcceptCall = (call: Call) => {
    setActiveCall(call);
    setCalls(prev => prev.map(c => (c.id === call.id ? { ...c, status: 'connected' } : c)));
    onAcceptCall?.(call.id);
  };

  const handleRejectCall = (callId: string) => {
    setCalls(prev => prev.filter(c => c.id !== callId));
    onRejectCall?.(callId);
  };

  const handleEndCall = (callId: string) => {
    setActiveCall(null);
    setCalls(prev => prev.filter(c => c.id !== callId));
    onEndCall?.(callId);
  };

  const queuedCalls = calls.filter(c => c.status === 'queued');
  const ringingCalls = calls.filter(c => c.status === 'ringing');
  const connectedCalls = calls.filter(c => c.status === 'connected');

  return (
    <div className="w-full bg-slate-900 text-white rounded-lg shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Phone className="w-8 h-8" />
            <h1 className="text-2xl font-bold">Operator Dashboard</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></span>
            <span className="text-sm font-semibold">LIVE</span>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 p-6 bg-slate-800">
        <div className="text-center">
          <p className="text-xs text-gray-400">Calls Today</p>
          <p className="text-2xl font-bold text-blue-400">{metrics.totalCalls}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-400">Completed</p>
          <p className="text-2xl font-bold text-green-400">{metrics.completedCalls}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-400">Avg Duration</p>
          <p className="text-2xl font-bold text-purple-400">{metrics.averageDuration}m</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-400">Waiting</p>
          <p className="text-2xl font-bold text-yellow-400">{metrics.callsWaiting}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-400">Listeners</p>
          <p className="text-2xl font-bold text-pink-400">{metrics.activeListeners.toLocaleString()}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-slate-700">
        {(['queue', 'active', 'alerts'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setSelectedTab(tab)}
            className={`flex-1 px-4 py-3 font-semibold transition-colors ${
              selectedTab === tab
                ? 'bg-red-600 text-white border-b-2 border-red-400'
                : 'bg-slate-800 text-gray-400 hover:text-white'
            }`}
          >
            {tab === 'queue' && `📞 Queue (${queuedCalls.length})`}
            {tab === 'active' && `🔴 Active (${connectedCalls.length})`}
            {tab === 'alerts' && '⚠️ Alerts'}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-6">
        {selectedTab === 'queue' && (
          <div className="space-y-3">
            {ringingCalls.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-bold text-yellow-400 mb-3">🔔 INCOMING CALLS</h3>
                {ringingCalls.map(call => (
                  <div
                    key={call.id}
                    className="p-4 bg-yellow-900/30 border-2 border-yellow-500 rounded-lg mb-3 animate-pulse"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-bold text-lg">{call.callerName}</p>
                        <p className="text-xs text-gray-400">ID: {call.callerId}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-yellow-300">Risk: {call.riskLevel?.toUpperCase()}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleAcceptCall(call)}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Accept
                      </Button>
                      <Button
                        onClick={() => handleRejectCall(call.id)}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <h3 className="text-sm font-bold text-blue-400 mb-3">📋 CALL QUEUE</h3>
            {queuedCalls.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No calls in queue</p>
            ) : (
              queuedCalls.map(call => (
                <div key={call.id} className="p-4 bg-slate-700 rounded-lg mb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-semibold">#{call.queuePosition} - {call.callerName}</p>
                      <p className="text-xs text-gray-400">Est. wait: {call.estimatedWaitTime} min</p>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        call.riskLevel === 'high'
                          ? 'bg-red-600 text-white'
                          : call.riskLevel === 'medium'
                          ? 'bg-yellow-600 text-white'
                          : 'bg-green-600 text-white'
                      }`}>
                        {call.riskLevel?.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {selectedTab === 'active' && (
          <div className="space-y-3">
            {activeCall ? (
              <div className="p-6 bg-green-900/30 border-2 border-green-500 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-2xl font-bold">{activeCall.callerName}</p>
                    <p className="text-sm text-gray-400">Call ID: {activeCall.id}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-green-400">{activeCall.duration || 0}s</p>
                    <p className="text-xs text-gray-400">Duration</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="p-3 bg-slate-700 rounded">
                    <p className="text-xs text-gray-400">Status</p>
                    <p className="font-bold text-green-400">CONNECTED</p>
                  </div>
                  <div className="p-3 bg-slate-700 rounded">
                    <p className="text-xs text-gray-400">Risk Level</p>
                    <p className="font-bold text-yellow-400">{activeCall.riskLevel?.toUpperCase()}</p>
                  </div>
                </div>

                <Button
                  onClick={() => handleEndCall(activeCall.id)}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3"
                >
                  <Phone className="w-5 h-5 mr-2" />
                  End Call
                </Button>
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">No active calls</p>
            )}
          </div>
        )}

        {selectedTab === 'alerts' && (
          <div className="space-y-3">
            <div className="p-4 bg-red-900/30 border-l-4 border-red-500 rounded">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-bold text-red-400">High-Risk Caller in Queue</p>
                  <p className="text-sm text-gray-400">Mike Davis - History of abusive calls</p>
                  <p className="text-xs text-gray-500 mt-1">Recommend: Screen or Decline</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-yellow-900/30 border-l-4 border-yellow-500 rounded">
              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-yellow-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-bold text-yellow-400">Queue Backup Alert</p>
                  <p className="text-sm text-gray-400">3 calls waiting, avg wait time: 8 minutes</p>
                  <p className="text-xs text-gray-500 mt-1">Consider opening additional line</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-blue-900/30 border-l-4 border-blue-500 rounded">
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-bold text-blue-400">Listener Milestone</p>
                  <p className="text-sm text-gray-400">Reached 2,847 concurrent listeners</p>
                  <p className="text-xs text-gray-500 mt-1">Celebrate with listeners!</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
