import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';
import { Bell, Mail, MessageSquare, Clock } from 'lucide-react';

interface NotificationSetting {
  type: string;
  label: string;
  description: string;
  push: boolean;
  email: boolean;
  inApp: boolean;
  frequency: 'instant' | 'daily' | 'weekly' | 'never';
}

export const NotificationPreferences: React.FC = () => {
  const [settings, setSettings] = useState<NotificationSetting[]>([
    {
      type: 'likes',
      label: 'Likes & Reactions',
      description: 'When someone likes your comment or content',
      push: true,
      email: false,
      inApp: true,
      frequency: 'instant',
    },
    {
      type: 'replies',
      label: 'Replies',
      description: 'When someone replies to your comment',
      push: true,
      email: false,
      inApp: true,
      frequency: 'instant',
    },
    {
      type: 'recommendations',
      label: 'Recommendations',
      description: 'Personalized video recommendations',
      push: false,
      email: true,
      inApp: true,
      frequency: 'daily',
    },
    {
      type: 'playlist_shares',
      label: 'Playlist Shares',
      description: 'When someone shares a playlist with you',
      push: true,
      email: false,
      inApp: true,
      frequency: 'instant',
    },
  ]);

  const [dndEnabled, setDndEnabled] = useState(false);
  const [dndStart, setDndStart] = useState('22:00');
  const [dndEnd, setDndEnd] = useState('08:00');

  const handleToggle = (index: number, channel: 'push' | 'email' | 'inApp') => {
    const updated = [...settings];
    updated[index][channel] = !updated[index][channel];
    setSettings(updated);
  };

  const handleFrequencyChange = (index: number, frequency: 'instant' | 'daily' | 'weekly' | 'never') => {
    const updated = [...settings];
    updated[index].frequency = frequency;
    setSettings(updated);
  };

  return (
    <div className="space-y-6 p-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold">Notification Preferences</h1>
        <p className="text-gray-500 mt-1">Manage how and when you receive notifications</p>
      </div>

      {/* Do Not Disturb */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Do Not Disturb
          </CardTitle>
          <CardDescription>Pause push notifications during these hours</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <input
              type="checkbox"
              checked={dndEnabled}
              onChange={(e) => setDndEnabled(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="font-medium">Enable Do Not Disturb</span>
          </div>
          {dndEnabled && (
            <div className="grid grid-cols-2 gap-4 ml-8">
              <div>
                <label className="text-sm font-medium">Start Time</label>
                <input
                  type="time"
                  value={dndStart}
                  onChange={(e) => setDndStart(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="text-sm font-medium">End Time</label>
                <input
                  type="time"
                  value={dndEnd}
                  onChange={(e) => setDndEnd(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border rounded"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notification Types */}
      <div className="space-y-4">
        {settings.map((setting, index) => (
          <Card key={setting.type}>
            <CardHeader>
              <CardTitle className="text-lg">{setting.label}</CardTitle>
              <CardDescription>{setting.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Channels */}
              <div className="flex gap-6">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={setting.push}
                    onChange={() => handleToggle(index, 'push')}
                    className="w-4 h-4"
                  />
                  <Bell className="w-4 h-4" />
                  <span className="text-sm">Push</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={setting.email}
                    onChange={() => handleToggle(index, 'email')}
                    className="w-4 h-4"
                  />
                  <Mail className="w-4 h-4" />
                  <span className="text-sm">Email</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={setting.inApp}
                    onChange={() => handleToggle(index, 'inApp')}
                    className="w-4 h-4"
                  />
                  <MessageSquare className="w-4 h-4" />
                  <span className="text-sm">In-App</span>
                </label>
              </div>

              {/* Frequency */}
              <div>
                <label className="text-sm font-medium block mb-2">Frequency</label>
                <div className="flex gap-2">
                  {(['instant', 'daily', 'weekly', 'never'] as const).map(freq => (
                    <Button
                      key={freq}
                      size="sm"
                      variant={setting.frequency === freq ? 'default' : 'outline'}
                      onClick={() => handleFrequencyChange(index, freq)}
                      className="capitalize"
                    >
                      {freq}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Save Button */}
      <div className="flex gap-2">
        <Button className="bg-blue-600 hover:bg-blue-700">Save Preferences</Button>
        <Button variant="outline">Cancel</Button>
      </div>
    </div>
  );
};
