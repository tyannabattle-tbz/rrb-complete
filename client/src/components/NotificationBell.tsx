import { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { trpc } from '@/lib/trpc';
import { format } from 'date-fns';

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [userId, setUserId] = useState('user-123');

  // Fetch user notifications
  const { data: notificationsData, refetch } = trpc.decisionNotifications.getUserDecisionNotifications.useQuery({
    userId,
    limit: 10,
    unreadOnly: false,
  });

  // Fetch statistics
  const { data: statsData } = trpc.decisionNotifications.getDecisionNotificationStatistics.useQuery({
    userId,
  });

  // Mark as read mutation
  const markAsReadMutation = trpc.decisionNotifications.markDecisionAsRead.useMutation({
    onSuccess: () => refetch(),
  });

  // Mark all as read mutation
  const markAllAsReadMutation = trpc.decisionNotifications.markAllDecisionsAsRead.useMutation({
    onSuccess: () => refetch(),
  });

  // Delete notification mutation
  const deleteNotificationMutation = trpc.decisionNotifications.deleteDecisionNotification.useMutation({
    onSuccess: () => refetch(),
  });

  const notifications = notificationsData?.notifications || [];
  const unreadCount = statsData?.unreadCount || 0;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'approval_required':
        return '⚠️';
      case 'decision_executed':
        return '✓';
      case 'escalation_alert':
        return '🚨';
      case 'policy_violation':
        return '⛔';
      case 'threshold_breach':
        return '📊';
      default:
        return '🔔';
    }
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-2 -right-2 bg-red-500 text-white h-5 w-5 p-0 flex items-center justify-center text-xs">
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          {/* Header */}
          <div className="border-b border-gray-200 p-4 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => markAllAsReadMutation.mutate({ userId })}
                className="text-xs"
              >
                Mark all as read
              </Button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No notifications</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`border-b border-gray-100 p-3 hover:bg-gray-50 transition-colors ${
                    notification.isRead === 0 ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-lg flex-shrink-0">
                      {getTypeIcon(notification.notificationType)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-sm text-gray-900 truncate">
                          {notification.title}
                        </p>
                        <Badge
                          className={`${getPriorityColor(
                            notification.priority
                          )} text-white text-xs flex-shrink-0`}
                        >
                          {notification.priority}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-2 mb-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400">
                        {format(new Date(notification.createdAt), 'p')}
                      </p>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      {notification.isRead === 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() =>
                            markAsReadMutation.mutate({
                              notificationId: notification.id,
                            })
                          }
                        >
                          ✓
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() =>
                          deleteNotificationMutation.mutate({
                            notificationId: notification.id,
                          })
                        }
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t border-gray-200 p-3 text-center">
              <a
                href="/notification-center"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                View all notifications →
              </a>
            </div>
          )}
        </div>
      )}

      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
