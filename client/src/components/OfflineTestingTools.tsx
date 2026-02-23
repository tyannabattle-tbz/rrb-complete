import React, { useState } from 'react';
import { AlertCircle, Wifi, WifiOff, Radio, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export const OfflineTestingTools: React.FC = () => {
  const [isSimulatingOffline, setIsSimulatingOffline] = useState(false);
  const [meshDevicesConnected, setMeshDevicesConnected] = useState(0);
  const [messageQueue, setMessageQueue] = useState<string[]>([]);

  const simulateOffline = () => {
    setIsSimulatingOffline(!isSimulatingOffline);
    if (!isSimulatingOffline) {
      // Simulate offline - queue some messages
      setMessageQueue([
        'SOS Alert queued - Emergency responder notified',
        'Wellness check queued - I\'m OK status pending',
        'Emergency broadcast queued - Severe weather warning',
      ]);
    } else {
      // Simulate coming back online - flush queue
      setMessageQueue([]);
    }
  };

  const connectMeshtastic = () => {
    if ('bluetooth' in navigator) {
      setMeshDevicesConnected(Math.min(meshDevicesConnected + 1, 5));
    }
  };

  const testSOSOffline = () => {
    if (isSimulatingOffline) {
      setMessageQueue(prev => [...prev, 'SOS Alert queued - Location: ' + generateMockLocation()]);
    }
  };

  const testWellnessOffline = () => {
    if (isSimulatingOffline) {
      setMessageQueue(prev => [...prev, 'Wellness Check queued - I\'m OK status']);
    }
  };

  const generateMockLocation = () => {
    const lat = (Math.random() * 180 - 90).toFixed(4);
    const lng = (Math.random() * 360 - 180).toFixed(4);
    return `${lat}, ${lng}`;
  };

  return (
    <div className="space-y-4 p-4 bg-gray-900 rounded-lg border border-gray-700">
      <div className="flex items-center gap-2 mb-4">
        <AlertCircle className="w-5 h-5 text-orange-500" />
        <h3 className="text-lg font-semibold text-white">Offline Testing Tools</h3>
      </div>

      {/* Offline Simulation */}
      <Card className="bg-gray-800 border-gray-700 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {isSimulatingOffline ? (
              <WifiOff className="w-5 h-5 text-red-500" />
            ) : (
              <Wifi className="w-5 h-5 text-green-500" />
            )}
            <span className="text-white font-medium">
              {isSimulatingOffline ? 'Offline Mode Active' : 'Online Mode'}
            </span>
          </div>
          <Button
            onClick={simulateOffline}
            variant={isSimulatingOffline ? 'destructive' : 'default'}
            size="sm"
          >
            {isSimulatingOffline ? 'Go Online' : 'Simulate Offline'}
          </Button>
        </div>
        <p className="text-sm text-gray-400">
          {isSimulatingOffline
            ? 'Testing offline mode - messages are queued for mesh transmission'
            : 'Click to simulate internet outage and test offline functionality'}
        </p>
      </Card>

      {/* Meshtastic Devices */}
      <Card className="bg-gray-800 border-gray-700 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-blue-500" />
            <span className="text-white font-medium">Meshtastic Devices</span>
          </div>
          <Button
            onClick={connectMeshtastic}
            variant="outline"
            size="sm"
            disabled={meshDevicesConnected >= 5}
          >
            Connect Device ({meshDevicesConnected}/5)
          </Button>
        </div>
        <p className="text-sm text-gray-400">
          {meshDevicesConnected > 0
            ? `${meshDevicesConnected} device(s) connected via WebBluetooth`
            : 'No Meshtastic devices connected. Click to pair via WebBluetooth'}
        </p>
      </Card>

      {/* Test SOS/Wellness Offline */}
      {isSimulatingOffline && (
        <Card className="bg-gray-800 border-gray-700 p-4">
          <div className="flex gap-2 mb-3">
            <Button
              onClick={testSOSOffline}
              variant="destructive"
              size="sm"
              className="flex-1"
            >
              Test SOS (Offline)
            </Button>
            <Button
              onClick={testWellnessOffline}
              variant="default"
              size="sm"
              className="flex-1"
            >
              Test Wellness (Offline)
            </Button>
          </div>
          <p className="text-sm text-gray-400">
            Queue emergency messages for mesh transmission when offline
          </p>
        </Card>
      )}

      {/* Message Queue */}
      {messageQueue.length > 0 && (
        <Card className="bg-gray-800 border-gray-700 p-4">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare className="w-5 h-5 text-yellow-500" />
            <span className="text-white font-medium">Message Queue ({messageQueue.length})</span>
          </div>
          <div className="space-y-2">
            {messageQueue.map((msg, idx) => (
              <div key={idx} className="text-sm text-gray-300 bg-gray-900 p-2 rounded border border-gray-700">
                {msg}
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Messages will sync to mesh network or cloud when connection restored
          </p>
        </Card>
      )}
    </div>
  );
};
