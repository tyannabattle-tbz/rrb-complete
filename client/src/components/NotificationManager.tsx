import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, Settings, Trash2, Volume2, Smartphone, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
  system: string;
  actionUrl?: string;
}

interface NotificationPreference {
  id: string;
  type: string;
  enabled: boolean;
  sound: boolean;
  vibration: boolean;
  desktop: boolean;
  mobile: boolean;
}

export function NotificationManager() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Recording Started',
      message: 'Audio recording has started on RRB Studio',
      type: 'success',
      timestamp: new Date(Date.now() - 300000),
      read: false,
      system: 'RRB Studio',
    },
    {
      id: '2',
      title: 'Session Shared',
      message: 'C.J. Battle shared a mixing session with you',
      type: 'info',
      timestamp: new Date(Date.now() - 600000),
      read: false,
      system: 'Collaboration',
    },
    {
      id: '3',
      title: 'Stream Started',
      message: 'Live broadcast started on QUMUS',
      type: 'success',
      timestamp: new Date(Date.now() - 900000),
      read: true,
      system: 'QUMUS',
    },
  ]);

  const [preferences, setPreferences] = useState<NotificationPreference[]>([
    {
      id: '1',
      type: 'Recording Events',
      enabled: true,
      sound: true,
      vibration: true,
      desktop: true,
      mobile: true,
    },
    {
      id: '2',
      type: 'Session Invites',
      enabled: true,
      sound: true,
      vibration: true,
      desktop: true,
      mobile: true,
    },
    {
      id: '3',
      type: 'Stream Events',
      enabled: true,
      sound: true,
      vibration: false,
      desktop: true,
      mobile: true,
    },
    {
      id: '4',
      type: 'Hardware Alerts',
      enabled: true,
      sound: false,
      vibration: true,
      desktop: true,
      mobile: true,
    },
  ]);

  const [showPreferences, setShowPreferences] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<string | null>(null);
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Request notification permissions
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const sendNotification = (title: string, options?: NotificationOptions) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, options);
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(
      notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
    toast.success('All notifications marked as read');
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter((n) => n.id !== id));
    toast.success('Notification deleted');
  };

  const clearAll = () => {
    setNotifications([]);
    toast.success('All notifications cleared');
  };

  const updatePreference = (id: string, field: string, value: boolean) => {
    setPreferences(
      preferences.map((p) =>
        p.id === id ? { ...p, [field]: value } : p
      )
    );
  };

  const testNotification = () => {
    const newNotif: Notification = {
      id: Date.now().toString(),
      title: 'Test Notification',
      message: 'This is a test notification from QUMUS Studio',
      type: 'info',
      timestamp: new Date(),
      read: false,
      system: 'System',
    };
    setNotifications([newNotif, ...notifications]);
    sendNotification('Test Notification', {
      body: 'This is a test notification from QUMUS Studio',
      icon: '/icon.png',
    });
    toast.success('Test notification sent!');
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✗';
      case 'warning':
        return '⚠';
      default:
        return 'ℹ';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'text-green-400';
      case 'error':
        return 'text-red-400';
      case 'warning':
        return 'text-yellow-400';
      default:
        return 'text-blue-400';
    }
  };

  return (
    <div className="space-y-4">
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-sm flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-yellow-400" />
              Notifications
              {unreadCount > 0 && (
                <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                  {unreadCount}
                </span>
              )}
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowPreferences(!showPreferences)}
              >
                <Settings className="w-3 h-3" />
              </Button>
              {notifications.length > 0 && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={clearAll}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Test Button */}
          <Button
            onClick={testNotification}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            <Bell className="w-4 h-4 mr-2" />
            Send Test Notification
          </Button>

          {/* Notifications List */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-sm">
                No notifications yet
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`bg-slate-900 rounded p-3 border cursor-pointer transition ${
                    notif.read
                      ? 'border-slate-700 opacity-60'
                      : 'border-slate-600 hover:border-slate-500'
                  }`}
                  onClick={() => {
                    setSelectedNotification(notif.id);
                    markAsRead(notif.id);
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-start gap-2 flex-1">
                      <span className={`text-lg ${getNotificationColor(notif.type)}`}>
                        {getNotificationIcon(notif.type)}
                      </span>
                      <div className="flex-1">
                        <div className="text-sm text-white font-semibold">{notif.title}</div>
                        <div className="text-xs text-slate-400">{notif.message}</div>
                        <div className="text-xs text-slate-500 mt-1">
                          {notif.system} • {notif.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notif.id);
                      }}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                  {!notif.read && (
                    <div className="h-1 bg-blue-600 rounded" />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Mark All as Read */}
          {unreadCount > 0 && (
            <Button
              onClick={markAllAsRead}
              className="w-full bg-slate-700 hover:bg-slate-600"
            >
              Mark All as Read
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Preferences */}
      {showPreferences && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Notification Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {preferences.map((pref) => (
              <div key={pref.id} className="bg-slate-900 rounded p-3 border border-slate-700">
                <div className="text-sm text-white font-semibold mb-3">{pref.type}</div>
                <div className="space-y-2 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pref.enabled}
                      onChange={(e) => updatePreference(pref.id, 'enabled', e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-slate-300">Enable notifications</span>
                  </label>
                  {pref.enabled && (
                    <>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={pref.sound}
                          onChange={(e) => updatePreference(pref.id, 'sound', e.target.checked)}
                          className="rounded"
                        />
                        <Volume2 className="w-3 h-3 text-slate-400" />
                        <span className="text-slate-300">Sound</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={pref.vibration}
                          onChange={(e) => updatePreference(pref.id, 'vibration', e.target.checked)}
                          className="rounded"
                        />
                        <span className="text-slate-300">Vibration</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={pref.desktop}
                          onChange={(e) => updatePreference(pref.id, 'desktop', e.target.checked)}
                          className="rounded"
                        />
                        <span className="text-slate-300">Desktop notifications</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={pref.mobile}
                          onChange={(e) => updatePreference(pref.id, 'mobile', e.target.checked)}
                          className="rounded"
                        />
                        <Smartphone className="w-3 h-3 text-slate-400" />
                        <span className="text-slate-300">Mobile push</span>
                      </label>
                    </>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
