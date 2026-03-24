import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Smartphone, Download, Wifi, Zap, Settings, Share2 } from 'lucide-react';
import { toast } from 'sonner';

interface MobileDevice {
  id: string;
  name: string;
  platform: 'iOS' | 'Android';
  version: string;
  connected: boolean;
  lastSync: Date;
  features: string[];
}

export function MobileAppCompanion() {
  const [devices, setDevices] = useState<MobileDevice[]>([
    {
      id: '1',
      name: 'iPhone 15 Pro',
      platform: 'iOS',
      version: '17.3',
      connected: true,
      lastSync: new Date(),
      features: ['Touch Faders', 'Wireless Streaming', 'Session Control', 'Voice Commands'],
    },
    {
      id: '2',
      name: 'Samsung Galaxy S24',
      platform: 'Android',
      version: '14',
      connected: false,
      lastSync: new Date(Date.now() - 3600000),
      features: ['Touch Faders', 'Wireless Streaming', 'Session Control', 'Voice Commands'],
    },
  ]);

  const [showInstallGuide, setShowInstallGuide] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);

  const downloadApp = (platform: 'iOS' | 'Android') => {
    if (platform === 'iOS') {
      window.open('https://apps.apple.com/app/qumus-studio', '_blank');
      toast.success('Opening App Store...');
    } else {
      window.open('https://play.google.com/store/apps/details?id=com.qumus.studio', '_blank');
      toast.success('Opening Google Play Store...');
    }
  };

  const connectDevice = (id: string) => {
    setDevices(
      devices.map((d) =>
        d.id === id
          ? { ...d, connected: true, lastSync: new Date() }
          : d
      )
    );
    toast.success('Device connected!');
  };

  const syncDevice = (id: string) => {
    toast.loading('Syncing device...');
    setTimeout(() => {
      setDevices(
        devices.map((d) =>
          d.id === id ? { ...d, lastSync: new Date() } : d
        )
      );
      toast.success('Device synced!');
    }, 2000);
  };

  const generateQRCode = (deviceId: string) => {
    toast.success('QR code generated for quick pairing!');
  };

  return (
    <div className="space-y-4">
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-blue-400" />
            Mobile App Companion
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Download Section */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => downloadApp('iOS')}
              className="bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              <div className="text-left">
                <div className="text-xs font-semibold">Download iOS</div>
                <div className="text-xs text-slate-400">App Store</div>
              </div>
            </Button>
            <Button
              onClick={() => downloadApp('Android')}
              className="bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              <div className="text-left">
                <div className="text-xs font-semibold">Download Android</div>
                <div className="text-xs text-slate-400">Play Store</div>
              </div>
            </Button>
          </div>

          {/* Connected Devices */}
          <div className="space-y-3 border-t border-slate-700 pt-4">
            <h3 className="text-sm font-semibold text-white">Connected Devices</h3>
            <div className="space-y-2">
              {devices.map((device) => (
                <div
                  key={device.id}
                  className="bg-slate-900 rounded p-3 border border-slate-700 cursor-pointer hover:border-slate-600 transition"
                  onClick={() => setSelectedDevice(device.id)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="text-sm text-white font-semibold flex items-center gap-2">
                        <Smartphone className="w-4 h-4" />
                        {device.name}
                        {device.connected && (
                          <span className="flex items-center gap-1 text-xs bg-green-900 text-green-300 px-2 py-1 rounded">
                            <Wifi className="w-3 h-3" />
                            Connected
                          </span>
                        )}
                        {!device.connected && (
                          <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded">
                            Offline
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        {device.platform} {device.version}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {!device.connected ? (
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            connectDevice(device.id);
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-xs"
                        >
                          Connect
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            syncDevice(device.id);
                          }}
                          className="bg-slate-700 hover:bg-slate-600 text-xs"
                        >
                          Sync
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Features */}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {device.features.map((feature) => (
                      <span
                        key={feature}
                        className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>

                  {/* Last Sync */}
                  <div className="text-xs text-slate-500 mt-2">
                    Last sync: {device.lastSync.toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile Features */}
          <div className="space-y-3 border-t border-slate-700 pt-4">
            <h3 className="text-sm font-semibold text-white">Mobile Features</h3>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
              <div className="bg-slate-900 rounded p-2 border border-slate-700">
                <div className="font-semibold text-white mb-1">Touch Faders</div>
                <div>Full-featured touch controls for mixing</div>
              </div>
              <div className="bg-slate-900 rounded p-2 border border-slate-700">
                <div className="font-semibold text-white mb-1">Wireless Streaming</div>
                <div>Stream audio to mobile devices</div>
              </div>
              <div className="bg-slate-900 rounded p-2 border border-slate-700">
                <div className="font-semibold text-white mb-1">Session Control</div>
                <div>Full session management on mobile</div>
              </div>
              <div className="bg-slate-900 rounded p-2 border border-slate-700">
                <div className="font-semibold text-white mb-1">Voice Commands</div>
                <div>Control studio with voice on mobile</div>
              </div>
              <div className="bg-slate-900 rounded p-2 border border-slate-700">
                <div className="font-semibold text-white mb-1">Offline Mode</div>
                <div>Work without internet connection</div>
              </div>
              <div className="bg-slate-900 rounded p-2 border border-slate-700">
                <div className="font-semibold text-white mb-1">Notifications</div>
                <div>Real-time alerts and updates</div>
              </div>
            </div>
          </div>

          {/* Installation Guide */}
          <Button
            onClick={() => setShowInstallGuide(!showInstallGuide)}
            className="w-full bg-slate-700 hover:bg-slate-600"
          >
            <Settings className="w-4 h-4 mr-2" />
            {showInstallGuide ? 'Hide' : 'Show'} Installation Guide
          </Button>

          {showInstallGuide && (
            <div className="bg-slate-900 rounded p-3 border border-slate-700 text-xs text-slate-300 space-y-2">
              <div className="font-semibold text-white">Installation Steps:</div>
              <ol className="space-y-2 list-decimal list-inside">
                <li>Download the app from App Store (iOS) or Play Store (Android)</li>
                <li>Install the app on your mobile device</li>
                <li>Open the app and create/login to your account</li>
                <li>Scan the QR code or enter pairing code to connect</li>
                <li>Grant permissions for microphone and notifications</li>
                <li>Start controlling your studio from your phone!</li>
              </ol>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Device Details */}
      {selectedDevice && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-sm">Device Details</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-slate-400 space-y-3">
            {devices
              .filter((d) => d.id === selectedDevice)
              .map((device) => (
                <div key={device.id} className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-slate-500">Device Name</div>
                      <div className="text-white">{device.name}</div>
                    </div>
                    <div>
                      <div className="text-slate-500">Platform</div>
                      <div className="text-white">{device.platform}</div>
                    </div>
                    <div>
                      <div className="text-slate-500">OS Version</div>
                      <div className="text-white">{device.version}</div>
                    </div>
                    <div>
                      <div className="text-slate-500">Status</div>
                      <div className={device.connected ? 'text-green-400' : 'text-slate-400'}>
                        {device.connected ? 'Connected' : 'Offline'}
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-900 rounded p-2 border border-slate-700">
                    <div className="text-slate-500 mb-2">Quick Actions</div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => generateQRCode(device.id)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                      >
                        <Share2 className="w-3 h-3 mr-1" />
                        Generate QR
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => syncDevice(device.id)}
                        className="flex-1 bg-slate-700 hover:bg-slate-600"
                      >
                        <Zap className="w-3 h-3 mr-1" />
                        Sync Now
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
