import { useState } from 'react';
import { useLocation } from 'wouter';
import {
  ArrowLeft,
  Bell,
  Globe,
  Volume2,
  Eye,
  Save,
  RotateCcw,
  CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

interface UserPreferences {
  notificationTypes: {
    critical: boolean;
    broadcasts: boolean;
    networkAlerts: boolean;
    systemUpdates: boolean;
    mentions: boolean;
  };
  deliveryChannels: {
    push: boolean;
    email: boolean;
    sms: boolean;
    inApp: boolean;
  };
  quietHours: {
    enabled: boolean;
    startTime: string;
    endTime: string;
  };
  language: string;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  emailDigest: 'instant' | 'daily' | 'weekly' | 'never';
}

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'ja', name: 'Japanese' },
  { code: 'zh', name: 'Chinese' },
];

export default function UserPreferences() {
  const [, navigate] = useLocation();
  const [preferences, setPreferences] = useState<UserPreferences>({
    notificationTypes: {
      critical: true,
      broadcasts: true,
      networkAlerts: true,
      systemUpdates: false,
      mentions: true,
    },
    deliveryChannels: {
      push: true,
      email: true,
      sms: false,
      inApp: true,
    },
    quietHours: {
      enabled: false,
      startTime: '22:00',
      endTime: '08:00',
    },
    language: 'en',
    soundEnabled: true,
    vibrationEnabled: true,
    emailDigest: 'daily',
  });

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // Validate quiet hours
    if (preferences.quietHours.enabled) {
      const start = preferences.quietHours.startTime;
      const end = preferences.quietHours.endTime;
      if (start === end) {
        toast.error('Quiet hours start and end times cannot be the same');
        return;
      }
    }

    // Save preferences
    localStorage.setItem('userPreferences', JSON.stringify(preferences));
    setSaved(true);
    toast.success('Preferences saved successfully');

    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = () => {
    setPreferences({
      notificationTypes: {
        critical: true,
        broadcasts: true,
        networkAlerts: true,
        systemUpdates: false,
        mentions: true,
      },
      deliveryChannels: {
        push: true,
        email: true,
        sms: false,
        inApp: true,
      },
      quietHours: {
        enabled: false,
        startTime: '22:00',
        endTime: '08:00',
      },
      language: 'en',
      soundEnabled: true,
      vibrationEnabled: true,
      emailDigest: 'daily',
    });
    toast.success('Preferences reset to defaults');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <Button
            onClick={() => navigate('/')}
            variant="ghost"
            className="text-slate-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white">User Preferences</h1>
            <p className="text-slate-400 text-sm mt-1">Customize your notification and communication settings</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Notification Types */}
          <Card className="p-6 bg-slate-800 border-slate-700">
            <div className="flex items-center gap-3 mb-6">
              <Bell className="w-6 h-6 text-cyan-400" />
              <h2 className="text-xl font-semibold text-white">Notification Types</h2>
            </div>

            <div className="space-y-4">
              {Object.entries(preferences.notificationTypes).map(([key, value]) => (
                <label key={key} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        notificationTypes: {
                          ...preferences.notificationTypes,
                          [key]: e.target.checked,
                        },
                      })
                    }
                    className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-cyan-600 cursor-pointer"
                  />
                  <span className="text-slate-300 group-hover:text-white transition-colors capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <span className="text-xs text-slate-500 ml-auto">
                    {key === 'critical' && 'Emergency alerts and critical broadcasts'}
                    {key === 'broadcasts' && 'General broadcast messages'}
                    {key === 'networkAlerts' && 'Network status and connectivity alerts'}
                    {key === 'systemUpdates' && 'System maintenance and updates'}
                    {key === 'mentions' && 'When someone mentions you'}
                  </span>
                </label>
              ))}
            </div>
          </Card>

          {/* Delivery Channels */}
          <Card className="p-6 bg-slate-800 border-slate-700">
            <div className="flex items-center gap-3 mb-6">
              <Globe className="w-6 h-6 text-cyan-400" />
              <h2 className="text-xl font-semibold text-white">Delivery Channels</h2>
            </div>

            <div className="space-y-4">
              {Object.entries(preferences.deliveryChannels).map(([key, value]) => (
                <label key={key} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        deliveryChannels: {
                          ...preferences.deliveryChannels,
                          [key]: e.target.checked,
                        },
                      })
                    }
                    className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-cyan-600 cursor-pointer"
                  />
                  <span className="text-slate-300 group-hover:text-white transition-colors capitalize">
                    {key === 'inApp' ? 'In-App' : key}
                  </span>
                  <span className="text-xs text-slate-500 ml-auto">
                    {key === 'push' && 'Browser push notifications'}
                    {key === 'email' && 'Email notifications'}
                    {key === 'sms' && 'SMS text messages'}
                    {key === 'inApp' && 'In-app notification center'}
                  </span>
                </label>
              ))}
            </div>
          </Card>

          {/* Quiet Hours */}
          <Card className="p-6 bg-slate-800 border-slate-700">
            <div className="flex items-center gap-3 mb-6">
              <Volume2 className="w-6 h-6 text-cyan-400" />
              <h2 className="text-xl font-semibold text-white">Quiet Hours</h2>
            </div>

            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.quietHours.enabled}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      quietHours: {
                        ...preferences.quietHours,
                        enabled: e.target.checked,
                      },
                    })
                  }
                  className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-cyan-600 cursor-pointer"
                />
                <span className="text-slate-300">Enable quiet hours</span>
                <span className="text-xs text-slate-500 ml-auto">
                  Mute non-critical notifications during specified times
                </span>
              </label>

              {preferences.quietHours.enabled && (
                <div className="grid grid-cols-2 gap-4 ml-7">
                  <div>
                    <label className="text-sm text-slate-400 block mb-2">Start Time</label>
                    <input
                      type="time"
                      value={preferences.quietHours.startTime}
                      onChange={(e) =>
                        setPreferences({
                          ...preferences,
                          quietHours: {
                            ...preferences.quietHours,
                            startTime: e.target.value,
                          },
                        })
                      }
                      className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-400 block mb-2">End Time</label>
                    <input
                      type="time"
                      value={preferences.quietHours.endTime}
                      onChange={(e) =>
                        setPreferences({
                          ...preferences,
                          quietHours: {
                            ...preferences.quietHours,
                            endTime: e.target.value,
                          },
                        })
                      }
                      className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
                    />
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Audio & Haptic */}
          <Card className="p-6 bg-slate-800 border-slate-700">
            <div className="flex items-center gap-3 mb-6">
              <Eye className="w-6 h-6 text-cyan-400" />
              <h2 className="text-xl font-semibold text-white">Audio & Haptic Feedback</h2>
            </div>

            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={preferences.soundEnabled}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      soundEnabled: e.target.checked,
                    })
                  }
                  className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-cyan-600 cursor-pointer"
                />
                <span className="text-slate-300 group-hover:text-white transition-colors">
                  Sound notifications
                </span>
                <span className="text-xs text-slate-500 ml-auto">Play sound for incoming alerts</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={preferences.vibrationEnabled}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      vibrationEnabled: e.target.checked,
                    })
                  }
                  className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-cyan-600 cursor-pointer"
                />
                <span className="text-slate-300 group-hover:text-white transition-colors">
                  Vibration feedback
                </span>
                <span className="text-xs text-slate-500 ml-auto">Vibrate on mobile devices</span>
              </label>
            </div>
          </Card>

          {/* Language & Digest */}
          <Card className="p-6 bg-slate-800 border-slate-700">
            <div className="flex items-center gap-3 mb-6">
              <Globe className="w-6 h-6 text-cyan-400" />
              <h2 className="text-xl font-semibold text-white">Language & Email Digest</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-slate-400 block mb-2">Language</label>
                <select
                  value={preferences.language}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      language: e.target.value,
                    })
                  }
                  className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm text-slate-400 block mb-2">Email Digest Frequency</label>
                <select
                  value={preferences.emailDigest}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      emailDigest: e.target.value as any,
                    })
                  }
                  className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
                >
                  <option value="instant">Instant</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="never">Never</option>
                </select>
                <p className="text-xs text-slate-500 mt-2">
                  How often you want to receive email summaries of notifications
                </p>
              </div>
            </div>
          </Card>

          {/* Actions */}
          <div className="flex gap-4">
            <Button
              onClick={handleSave}
              className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white"
            >
              {saved ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Saved
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Preferences
                </>
              )}
            </Button>
            <Button
              onClick={handleReset}
              variant="outline"
              className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset to Defaults
            </Button>
          </div>

          {/* Info Box */}
          <Card className="p-4 bg-blue-500/10 border border-blue-500/30">
            <p className="text-sm text-blue-300">
              💡 <strong>Tip:</strong> Critical notifications will always be delivered, even during quiet hours. Adjust your delivery channels to control how you receive notifications.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
