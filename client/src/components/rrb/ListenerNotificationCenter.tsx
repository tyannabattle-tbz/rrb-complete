import React, { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Bell, X, Check, Trash2, Settings } from 'lucide-react';

interface Notification {
  id: number;
  type: 'track_live' | 'artist_live' | 'channel_update' | 'new_episode';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
}

export const ListenerNotificationCenter: React.FC = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);

  // Queries
  const { data: notifications = [], refetch: refetchNotifications } =
    trpc.listenerNotification.getNotifications.useQuery({
      limit: 50,
      offset: 0,
    });

  const { data: stats } = trpc.listenerNotification.getStats.useQuery();

  const { data: preferences = [] } = trpc.listenerNotification.getPreferences.useQuery();

  const { data: trending = [] } = trpc.listenerNotification.getTrending.useQuery({
    limit: 5,
  });

  // Mutations
  const markAsReadMutation = trpc.listenerNotification.markAsRead.useMutation({
    onSuccess: () => refetchNotifications(),
  });

  const markAllAsReadMutation = trpc.listenerNotification.markAllAsRead.useMutation({
    onSuccess: () => refetchNotifications(),
  });

  const deleteNotificationMutation = trpc.listenerNotification.deleteNotification.useMutation({
    onSuccess: () => refetchNotifications(),
  });

  const createPreferenceMutation = trpc.listenerNotification.createPreference.useMutation({
    onSuccess: () => {
      // Refresh preferences
    },
  });

  // Handlers
  const handleMarkAsRead = (notificationId: number) => {
    markAsReadMutation.mutate({ notificationId });
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  const handleDeleteNotification = (notificationId: number) => {
    deleteNotificationMutation.mutate({ notificationId });
  };

  const handleAddPreference = (type: 'email' | 'push' | 'in-app', trackId?: string) => {
    createPreferenceMutation.mutate({
      trackId,
      notificationType: type,
    });
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-4">
      {/* Notification Bell Icon */}
      <div className="relative">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowNotifications(!showNotifications)}
          className="relative"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>

        {/* Notifications Dropdown */}
        {showNotifications && (
          <Card className="absolute right-0 top-12 w-96 max-h-96 overflow-y-auto z-50 p-0">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-semibold">Notifications</h3>
              <div className="flex gap-2">
                {unreadCount > 0 && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleMarkAllAsRead}
                  >
                    Mark all as read
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowNotifications(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {notifications.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                No notifications yet
              </div>
            ) : (
              <div className="space-y-2 p-4">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg border ${
                      notification.isRead
                        ? 'bg-background'
                        : 'bg-accent border-primary'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{notification.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(notification.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        {!notification.isRead && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleMarkAsRead(notification.id)}
                          >
                            <Check className="w-3 h-3" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteNotification(notification.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}
      </div>

      {/* Notification Stats */}
      {stats && (
        <Card className="p-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-2xl font-bold">{stats.totalNotifications}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Unread</p>
              <p className="text-2xl font-bold text-orange-500">{stats.unreadCount}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Read</p>
              <p className="text-2xl font-bold text-green-500">{stats.readCount}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Trending Notifications */}
      {trending.length > 0 && (
        <Card className="p-4">
          <h3 className="font-semibold mb-3">Trending Now</h3>
          <div className="space-y-2">
            {trending.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center p-2 hover:bg-accent rounded">
                <div>
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.listeners.toLocaleString()} listeners
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleAddPreference('push', item.title)}
                >
                  Follow
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Notification Preferences */}
      <div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowPreferences(!showPreferences)}
          className="w-full"
        >
          <Settings className="w-4 h-4 mr-2" />
          Notification Preferences
        </Button>

        {showPreferences && (
          <Card className="mt-2 p-4 space-y-3">
            <div>
              <h4 className="font-medium text-sm mb-2">Current Preferences</h4>
              {preferences.length === 0 ? (
                <p className="text-xs text-muted-foreground">No preferences set</p>
              ) : (
                <div className="space-y-2">
                  {preferences.map((pref, idx) => (
                    <div key={idx} className="text-xs p-2 bg-accent rounded">
                      <p>
                        {pref.trackId && `Track: ${pref.trackId}`}
                        {pref.artistName && `Artist: ${pref.artistName}`}
                        {pref.channelId && `Channel: ${pref.channelId}`}
                      </p>
                      <p className="text-muted-foreground">
                        via {pref.notificationType}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t pt-3">
              <h4 className="font-medium text-sm mb-2">Add New Preference</h4>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleAddPreference('push')}
                >
                  + Push
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleAddPreference('email')}
                >
                  + Email
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleAddPreference('in-app')}
                >
                  + In-App
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};
