import { useState } from 'react';
import { Bell, X, Settings, Trash2 } from 'lucide-react';
import { useNotificationStore, type NotificationPreferences } from '@/lib/notificationService';
import { Button } from '@/components/ui/button';

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const { notifications, unreadCount, preferences, markAsRead, deleteNotification, markAllAsRead, updatePreferences, clearAllNotifications } = useNotificationStore();

  const handleNotificationClick = (notificationId: string) => {
    markAsRead(notificationId);
  };

  const handlePreferenceChange = (key: keyof NotificationPreferences, value: any) => {
    updatePreferences({ [key]: value });
  };

  return (
    <div className="relative">
      {/* Notification Bell Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-600 hover:text-slate-900 transition-colors"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-2xl border border-slate-200 z-50 max-h-96 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200">
            <h3 className="font-bold text-slate-900">Notifications</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-1 hover:bg-slate-100 rounded transition-colors"
                title="Settings"
              >
                <Settings className="w-4 h-4 text-slate-600" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-slate-100 rounded transition-colors"
              >
                <X className="w-4 h-4 text-slate-600" />
              </button>
            </div>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <div className="p-4 border-b border-slate-200 bg-slate-50 space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.enableLiveAlerts}
                  onChange={(e) => handlePreferenceChange('enableLiveAlerts', e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm text-slate-700">Live channel alerts</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.enableListenerSpike}
                  onChange={(e) => handlePreferenceChange('enableListenerSpike', e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm text-slate-700">Listener spike alerts</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.enableNewEpisode}
                  onChange={(e) => handlePreferenceChange('enableNewEpisode', e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm text-slate-700">New episode alerts</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.favoriteChannelsOnly}
                  onChange={(e) => handlePreferenceChange('favoriteChannelsOnly', e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm text-slate-700">Favorite channels only</span>
              </label>
              <div className="pt-2">
                <label className="text-sm text-slate-700 block mb-2">Spike threshold: {preferences.listenerSpikeThreshold}%</label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="10"
                  value={preferences.listenerSpikeThreshold}
                  onChange={(e) => handlePreferenceChange('listenerSpikeThreshold', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          )}

          {/* Notifications List */}
          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif.id)}
                  className={`p-3 border-b border-slate-100 cursor-pointer transition-colors ${
                    notif.read ? 'bg-white hover:bg-slate-50' : 'bg-blue-50 hover:bg-blue-100'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold truncate ${notif.read ? 'text-slate-700' : 'text-blue-900'}`}>
                        {notif.title}
                      </p>
                      <p className="text-xs text-slate-600 line-clamp-2">{notif.message}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {new Date(notif.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notif.id);
                      }}
                      className="p-1 hover:bg-slate-200 rounded transition-colors flex-shrink-0"
                    >
                      <X className="w-3 h-3 text-slate-500" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-slate-200 flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => markAllAsRead()}
                className="flex-1"
              >
                Mark all as read
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => clearAllNotifications()}
                className="flex-1 text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Clear all
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
