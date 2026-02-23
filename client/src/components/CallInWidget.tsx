import React, { useState, useEffect } from 'react';
import { Phone, PhoneOff, Users, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { webrtcCallInService, CallQueue, CallSession } from '@/services/webrtcCallInService';

export function CallInWidget() {
  const [queue, setQueue] = useState<CallQueue>(webrtcCallInService.getQueueStatus());
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const unsubscribe = webrtcCallInService.onQueueChange((newQueue) => {
      setQueue(newQueue);
    });

    return unsubscribe;
  }, []);

  const handleAcceptCall = async () => {
    await webrtcCallInService.acceptNextCall();
  };

  const handleRejectCall = (callId: string) => {
    webrtcCallInService.rejectCall(callId);
  };

  const handleEndCall = async (callId: string) => {
    await webrtcCallInService.endCall(callId);
  };

  const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Minimized View */}
      {!isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 font-bold transition-all"
        >
          <Phone className="w-5 h-5" />
          <span>Call-In</span>
          {queue.waiting.length > 0 && (
            <span className="bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              {queue.waiting.length}
            </span>
          )}
        </button>
      )}

      {/* Expanded View */}
      {isExpanded && (
        <div className="bg-white rounded-lg shadow-2xl border-2 border-red-600 w-96 max-h-96 flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-4 flex items-center justify-between rounded-t-lg">
            <div className="flex items-center gap-2">
              <Phone className="w-5 h-5" />
              <h3 className="font-bold text-lg">RRB Live Call-In</h3>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-white hover:bg-red-800 p-1 rounded transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Phone Number */}
          <div className="bg-red-50 border-b border-red-200 p-4">
            <p className="text-sm text-gray-600 mb-1">Call us at:</p>
            <p className="text-2xl font-bold text-red-600 font-mono">
              {webrtcCallInService.getPhoneNumber()}
            </p>
          </div>

          {/* Call Queue */}
          <div className="flex-1 overflow-y-auto p-4">
            {/* Active Call */}
            {queue.active && (
              <div className="mb-4 p-3 bg-green-50 border-2 border-green-500 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-green-700 flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    Connected
                  </h4>
                  <span className="text-xs text-green-600 font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDuration(Date.now() - (queue.active.startTime || 0))}
                  </span>
                </div>
                <p className="text-sm font-semibold text-gray-800 mb-2">
                  {queue.active.callerName}
                </p>
                <Button
                  onClick={() => handleEndCall(queue.active!.id)}
                  className="w-full bg-red-600 hover:bg-red-700 text-white"
                >
                  <PhoneOff className="w-4 h-4 mr-2" />
                  End Call
                </Button>
              </div>
            )}

            {/* Waiting Calls */}
            {queue.waiting.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-gray-600" />
                  <h4 className="font-bold text-gray-700 text-sm">
                    Waiting ({queue.waiting.length})
                  </h4>
                </div>
                <div className="space-y-2">
                  {queue.waiting.map((call, index) => (
                    <div key={call.id} className="p-2 bg-yellow-50 border border-yellow-200 rounded">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold text-gray-800">
                          #{index + 1} {call.callerName}
                        </span>
                        <span className="text-xs text-yellow-600 font-mono">
                          {call.callerId}
                        </span>
                      </div>
                      {index === 0 && (
                        <div className="flex gap-2">
                          <Button
                            onClick={handleAcceptCall}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs py-1"
                          >
                            <Phone className="w-3 h-3 mr-1" />
                            Accept
                          </Button>
                          <Button
                            onClick={() => handleRejectCall(call.id)}
                            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white text-xs py-1"
                          >
                            <PhoneOff className="w-3 h-3 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {!queue.active && queue.waiting.length === 0 && (
              <div className="text-center py-8">
                <Phone className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No calls waiting</p>
                <p className="text-gray-400 text-xs mt-1">
                  Listeners can call {webrtcCallInService.getPhoneNumber()}
                </p>
              </div>
            )}
          </div>

          {/* Footer Stats */}
          <div className="bg-gray-50 border-t border-gray-200 p-3 text-xs text-gray-600 flex justify-between rounded-b-lg">
            <span>Total calls today: {queue.history.length}</span>
            <span>Queue: {queue.waiting.length}</span>
          </div>
        </div>
      )}
    </div>
  );
}
