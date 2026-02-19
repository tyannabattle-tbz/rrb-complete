import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, Settings, Send, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface NotificationTemplate {
  id: string;
  type: 'episode' | 'frequency' | 'broadcast' | 'custom';
  title: string;
  message: string;
  icon: string;
}

interface NotificationSchedule {
  id: string;
  title: string;
  message: string;
  channels: string[];
  scheduledTime: string;
  status: 'scheduled' | 'sent' | 'failed';
}

const NOTIFICATION_TEMPLATES: NotificationTemplate[] = [
  {
    id: '1',
    type: 'episode',
    title: 'New Episode Released',
    message: 'A new episode of {channel} is now available',
    icon: '🎙️',
  },
  {
    id: '2',
    type: 'frequency',
    title: 'Frequency Tuning Available',
    message: 'Your favorite frequency {frequency} Hz is now active',
    icon: '🔊',
  },
  {
    id: '3',
    type: 'broadcast',
    title: 'Live Broadcast Starting',
    message: '{channel} is going live now!',
    icon: '📡',
  },
  {
    id: '4',
    type: 'custom',
    title: 'Custom Notification',
    message: 'Send a custom message to your listeners',
    icon: '💬',
  },
];

const SCHEDULED_NOTIFICATIONS: NotificationSchedule[] = [
  {
    id: '1',
    title: 'Episode Release - RRB Main',
    message: 'New episode: "The Beginning" is now available',
    channels: ['RRB Main'],
    scheduledTime: '2026-02-20 10:00 AM',
    status: 'scheduled',
  },
  {
    id: '2',
    title: 'Live Broadcast Alert',
    message: 'Sean\'s Music is going live in 30 minutes',
    channels: ['Sean\'s Music'],
    scheduledTime: '2026-02-20 2:30 PM',
    status: 'scheduled',
  },
  {
    id: '3',
    title: 'Frequency Activation',
    message: '528 Hz healing frequency is now available',
    channels: ['All Channels'],
    scheduledTime: '2026-02-19 3:00 PM',
    status: 'sent',
  },
];

export default function ListenerNotifications() {
  const [selectedTemplate, setSelectedTemplate] = useState<NotificationTemplate | null>(null);
  const [notificationTitle, setNotificationTitle] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [scheduledTime, setScheduledTime] = useState('');
  const [showScheduler, setShowScheduler] = useState(false);

  const channels = ['RRB Main', 'Sean\'s Music', 'Anna Promotion', 'Jaelon Enterprises', 'Little C Recording'];

  const handleTemplateSelect = (template: NotificationTemplate) => {
    setSelectedTemplate(template);
    setNotificationTitle(template.title);
    setNotificationMessage(template.message);
  };

  const handleChannelToggle = (channel: string) => {
    setSelectedChannels(prev =>
      prev.includes(channel)
        ? prev.filter(c => c !== channel)
        : [...prev, channel]
    );
  };

  const sendNotification = () => {
    if (!notificationTitle.trim()) {
      toast.error('Please enter a notification title');
      return;
    }
    if (!notificationMessage.trim()) {
      toast.error('Please enter a notification message');
      return;
    }
    if (selectedChannels.length === 0) {
      toast.error('Please select at least one channel');
      return;
    }

    toast.success(`Notification sent to ${selectedChannels.length} channel(s)`);
    setNotificationTitle('');
    setNotificationMessage('');
    setSelectedChannels([]);
    setSelectedTemplate(null);
  };

  const scheduleNotification = () => {
    if (!scheduledTime) {
      toast.error('Please select a time to schedule');
      return;
    }

    toast.success('Notification scheduled successfully');
    setShowScheduler(false);
    setScheduledTime('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="container mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="w-8 h-8 text-blue-500" />
            <h1 className="text-4xl font-bold">Listener Notifications</h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Send push notifications to listeners about new episodes, live broadcasts, and frequency updates
          </p>
        </div>

        <Tabs defaultValue="send" className="mb-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="send">Send Notification</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>

          {/* Send Notification Tab */}
          <TabsContent value="send">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Templates Sidebar */}
              <Card className="p-4 lg:col-span-1">
                <h3 className="font-bold mb-4">Quick Templates</h3>
                <div className="space-y-2">
                  {NOTIFICATION_TEMPLATES.map(template => (
                    <button
                      key={template.id}
                      onClick={() => handleTemplateSelect(template)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        selectedTemplate?.id === template.id
                          ? 'bg-blue-500/20 border border-blue-500/50'
                          : 'hover:bg-accent border border-border'
                      }`}
                    >
                      <p className="text-sm font-semibold">{template.icon} {template.title}</p>
                      <p className="text-xs text-foreground/60 mt-1 line-clamp-2">{template.message}</p>
                    </button>
                  ))}
                </div>
              </Card>

              {/* Notification Editor */}
              <Card className="p-6 lg:col-span-2">
                <h3 className="text-lg font-bold mb-4">Compose Notification</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Title</label>
                    <input
                      type="text"
                      value={notificationTitle}
                      onChange={(e) => setNotificationTitle(e.target.value)}
                      placeholder="Notification title"
                      className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:border-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Message</label>
                    <textarea
                      value={notificationMessage}
                      onChange={(e) => setNotificationMessage(e.target.value)}
                      placeholder="Notification message"
                      rows={4}
                      className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:border-blue-500 outline-none resize-none"
                    />
                    <p className="text-xs text-foreground/60 mt-1">
                      Use {'{channel}'}, {'{frequency}'}, {'{episode}'} for dynamic content
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-3">Send to Channels</label>
                    <div className="space-y-2">
                      {channels.map(channel => (
                        <label key={channel} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedChannels.includes(channel)}
                            onChange={() => handleChannelToggle(channel)}
                            className="w-4 h-4 rounded border-border"
                          />
                          <span className="text-sm">{channel}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={sendNotification} className="flex-1 gap-2">
                      <Send className="w-4 h-4" />
                      Send Now
                    </Button>
                    <Button
                      onClick={() => setShowScheduler(!showScheduler)}
                      variant="outline"
                      className="flex-1 gap-2"
                    >
                      <Clock className="w-4 h-4" />
                      Schedule
                    </Button>
                  </div>

                  {showScheduler && (
                    <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                      <label className="block text-sm font-semibold mb-2">Schedule Time</label>
                      <input
                        type="datetime-local"
                        value={scheduledTime}
                        onChange={(e) => setScheduledTime(e.target.value)}
                        className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:border-blue-500 outline-none mb-2"
                      />
                      <Button onClick={scheduleNotification} className="w-full">
                        Schedule Notification
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Scheduled Notifications Tab */}
          <TabsContent value="scheduled">
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4">Scheduled Notifications</h3>
              <div className="space-y-3">
                {SCHEDULED_NOTIFICATIONS.map(notification => (
                  <div key={notification.id} className="p-4 border border-border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold">{notification.title}</p>
                        <p className="text-sm text-foreground/60 mt-1">{notification.message}</p>
                      </div>
                      <Badge
                        className={
                          notification.status === 'sent'
                            ? 'bg-green-600'
                            : notification.status === 'scheduled'
                            ? 'bg-blue-600'
                            : 'bg-red-600'
                        }
                      >
                        {notification.status === 'sent' && <CheckCircle className="w-3 h-3 mr-1" />}
                        {notification.status.charAt(0).toUpperCase() + notification.status.slice(1)}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {notification.channels.map(channel => (
                        <Badge key={channel} variant="secondary" className="text-xs">
                          {channel}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-xs text-foreground/60">{notification.scheduledTime}</p>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {NOTIFICATION_TEMPLATES.map(template => (
                <Card key={template.id} className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-bold text-lg">{template.icon} {template.title}</h3>
                    <Badge variant="secondary">{template.type}</Badge>
                  </div>
                  <p className="text-sm text-foreground/70 mb-4">{template.message}</p>
                  <Button
                    onClick={() => handleTemplateSelect(template)}
                    className="w-full"
                    variant="outline"
                  >
                    Use This Template
                  </Button>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Notification Settings */}
        <Card className="p-6 bg-blue-500/5 border-blue-500/20">
          <div className="flex items-center gap-3 mb-4">
            <Settings className="w-5 h-5" />
            <h3 className="font-bold">Notification Settings</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-border" />
              <span>Enable push notifications</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-border" />
              <span>Email notifications</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-border" />
              <span>SMS notifications</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-border" />
              <span>In-app notifications</span>
            </label>
          </div>
        </Card>
      </div>
    </div>
  );
}
