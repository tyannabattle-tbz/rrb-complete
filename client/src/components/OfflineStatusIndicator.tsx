import React, { useState, useEffect } from 'react';
import { AlertCircle, Wifi, WifiOff } from 'lucide-react';
import { hybridcastMesh } from '@/services/hybridcastMeshService';

export function OfflineStatusIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [meshActive, setMeshActive] = useState(false);
  const [meshDevices, setMeshDevices] = useState(0);
  const [queuedMessages, setQueuedMessages] = useState(0);

  useEffect(() => {
    const handleOnline = () => {
      console.log('[UI] Internet connection restored');
      setIsOnline(true);
      setMeshActive(false);
    };

    const handleOffline = () => {
      console.log('[UI] Internet connection lost - Emergency mode active');
      setIsOnline(false);
      const status = hybridcastMesh.getStatus();
      setMeshActive(status.meshActive);
      setMeshDevices(status.meshDevices.length);
    };

    const handleMeshActive = (event: any) => {
      console.log('[UI] HybridCast mesh activated');
      setMeshActive(true);
      setMeshDevices(event.detail.devices.length);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('hybridcast-mesh-active', handleMeshActive);

    // Monitor queued messages
    const interval = setInterval(() => {
      const queued = hybridcastMesh.getQueuedMessages().length;
      setQueuedMessages(queued);
    }, 1000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('hybridcast-mesh-active', handleMeshActive);
      clearInterval(interval);
    };
  }, []);

  if (isOnline && !meshActive) {
    return null; // Don't show indicator when online and mesh not active
  }

  return (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
      meshActive ? 'bg-orange-900 border-2 border-orange-500' : 'bg-red-900 border-2 border-red-500'
    }`}>
      <div className="flex items-center gap-3">
        {isOnline ? (
          <Wifi className="w-5 h-5 text-green-400" />
        ) : (
          <WifiOff className="w-5 h-5 text-red-400" />
        )}
        
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-yellow-400" />
            <span className="font-bold text-white">
              {isOnline ? 'Online' : 'EMERGENCY MODE'}
            </span>
          </div>

          {!isOnline && (
            <div className="text-sm text-gray-200">
              {meshActive ? (
                <>
                  <p>🛰️ HybridCast Mesh Active</p>
                  <p>{meshDevices} device{meshDevices !== 1 ? 's' : ''} connected</p>
                  {queuedMessages > 0 && (
                    <p className="text-yellow-300">
                      {queuedMessages} message{queuedMessages !== 1 ? 's' : ''} queued
                    </p>
                  )}
                </>
              ) : (
                <>
                  <p>⚠️ No internet connection</p>
                  <p>Mesh networking unavailable</p>
                  <p className="text-yellow-300">SOS and emergency features still available</p>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {!isOnline && (
        <div className="mt-3 pt-3 border-t border-gray-600">
          <button
            onClick={() => {
              const status = hybridcastMesh.getStatus();
              console.log('[UI] HybridCast Status:', status);
              alert(`Mesh Status:\n- Online: ${status.online}\n- Devices: ${status.meshDevices.length}\n- Queued: ${status.queuedMessages}`);
            }}
            className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-3 rounded text-sm"
          >
            Check Mesh Status
          </button>
        </div>
      )}
    </div>
  );
}
