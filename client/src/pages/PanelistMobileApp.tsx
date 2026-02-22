/**
 * Panelist Mobile App
 * Mobile-first experience for panelists with push notifications
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Clock, CheckCircle, AlertCircle, Phone, Video, Copy, Eye, EyeOff } from 'lucide-react';

interface PushNotification {
  id: string;
  title: string;
  message: string;
  type: 'reminder' | 'alert' | 'info' | 'action';
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

interface PanelistMobileAppProps {
  panelistId?: string;
}

export const PanelistMobileApp: React.FC<PanelistMobileAppProps> = ({ panelistId }) => {
  const [notifications, setNotifications] = useState<PushNotification[]>([
    {
      id: 'notif-1',
      title: 'Event Starting Soon!',
      message: 'UN WCS broadcast starts in 1 hour. Please join 10 minutes early.',
      type: 'reminder',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      read: false,
    },
    {
      id: 'notif-2',
      title: 'Pre-Event Checklist',
      message: 'Complete your tech setup checklist before the broadcast.',
      type: 'action',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      read: false,
    },
    {
      id: 'notif-3',
      title: 'Zoom Link Ready',
      message: 'Your Zoom meeting link is now available.',
      type: 'info',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      read: true,
    },
  ]);

  const [showPasscode, setShowPasscode] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'notifications' | 'checklist' | 'zoom'>('overview');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const zoomDetails = {
    meetingId: '123456789',
    passcode: 'ABC123',
    joinUrl: 'https://zoom.us/j/123456789',
    startTime: new Date('2026-03-17T09:00:00Z'),
  };

  const checklistItems = [
    { id: 'check-1', title: 'Test Microphone', completed: true },
    { id: 'check-2', title: 'Test Camera', completed: true },
    { id: 'check-3', title: 'Test Internet Connection', completed: true },
    { id: 'check-4', title: 'Review Event Details', completed: false },
    { id: 'check-5', title: 'Download Zoom App', completed: true },
    { id: 'check-6', title: 'Join Test Call', completed: false },
  ];

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        setNotificationsEnabled(true);
        new Notification('Notifications Enabled', {
          body: 'You will receive push notifications for event updates.',
          icon: '/icon.png',
        });
      } else if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          setNotificationsEnabled(true);
          new Notification('Notifications Enabled', {
            body: 'You will receive push notifications for event updates.',
            icon: '/icon.png',
          });
        }
      }
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Mobile Header */}
      <div className="sticky top-0 bg-white border-b z-10">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">UN WCS Event</h1>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('notifications')}
                className="relative p-2 hover:bg-gray-100 rounded-lg"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center p-0">
                    {unreadCount}
                  </Badge>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="max-w-md mx-auto sticky top-16 bg-white border-b z-10">
        <div className="flex gap-2 px-4 overflow-x-auto">
          {(['overview', 'notifications', 'checklist', 'zoom'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-3 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto px-4 py-4 space-y-4">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* Event Status */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Event Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Status</span>
                  <Badge className="bg-green-600">Confirmed</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Date & Time</span>
                  <span className="font-medium">Mar 17, 9:00 AM UTC</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Time Until Event</span>
                  <span className="font-medium text-blue-600">2 days, 14 hours</span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full gap-2" variant="default">
                  <Video className="w-4 h-4" />
                  Copy Zoom Link
                </Button>
                <Button className="w-full gap-2" variant="outline">
                  <Phone className="w-4 h-4" />
                  Call Support
                </Button>
                <Button className="w-full gap-2" variant="outline">
                  <Clock className="w-4 h-4" />
                  Add to Calendar
                </Button>
              </CardContent>
            </Card>

            {/* Upcoming Reminders */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Upcoming Reminders</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm">1 hour before event</p>
                    <p className="text-xs text-gray-600">You'll receive a notification</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm">30 minutes before event</p>
                    <p className="text-xs text-gray-600">Final reminder to join</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <>
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Notifications</CardTitle>
                  <Button
                    size="sm"
                    variant={notificationsEnabled ? 'default' : 'outline'}
                    onClick={requestNotificationPermission}
                  >
                    {notificationsEnabled ? 'Enabled' : 'Enable'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      notif.read
                        ? 'bg-gray-50 border-gray-200'
                        : 'bg-blue-50 border-blue-200'
                    }`}
                    onClick={() => handleMarkAsRead(notif.id)}
                  >
                    <div className="flex items-start gap-3">
                      {notif.type === 'reminder' && (
                        <Clock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      )}
                      {notif.type === 'alert' && (
                        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                      )}
                      {notif.type === 'action' && (
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      )}
                      {notif.type === 'info' && (
                        <Bell className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{notif.title}</p>
                        <p className="text-xs text-gray-600 mt-1">{notif.message}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {notif.timestamp.toLocaleString()}
                        </p>
                      </div>
                      {!notif.read && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-1 flex-shrink-0" />
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </>
        )}

        {/* Checklist Tab */}
        {activeTab === 'checklist' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pre-Event Checklist</CardTitle>
              <p className="text-xs text-gray-600 mt-1">
                {checklistItems.filter((c) => c.completed).length} of {checklistItems.length} completed
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {checklistItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => {}}
                    className="w-5 h-5 rounded"
                  />
                  <span className={`flex-1 ${item.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                    {item.title}
                  </span>
                  {item.completed && <CheckCircle className="w-5 h-5 text-green-600" />}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Zoom Tab */}
        {activeTab === 'zoom' && (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Zoom Meeting Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Meeting ID */}
                <div>
                  <p className="text-sm text-gray-600 mb-2">Meeting ID</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 px-3 py-2 bg-gray-100 rounded font-mono text-sm">
                      {zoomDetails.meetingId}
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopyToClipboard(zoomDetails.meetingId)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Passcode */}
                <div>
                  <p className="text-sm text-gray-600 mb-2">Passcode</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 px-3 py-2 bg-gray-100 rounded font-mono text-sm">
                      {showPasscode ? zoomDetails.passcode : '••••••'}
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowPasscode(!showPasscode)}
                    >
                      {showPasscode ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopyToClipboard(zoomDetails.passcode)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Join Button */}
                <Button className="w-full gap-2" size="lg">
                  <Video className="w-4 h-4" />
                  Open Zoom Meeting
                </Button>

                {/* Download Details */}
                <Button className="w-full" variant="outline">
                  Download Meeting Details
                </Button>
              </CardContent>
            </Card>

            {/* Support */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full" variant="outline">
                  View Tech Requirements
                </Button>
                <Button className="w-full" variant="outline">
                  Contact Support
                </Button>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default PanelistMobileApp;
