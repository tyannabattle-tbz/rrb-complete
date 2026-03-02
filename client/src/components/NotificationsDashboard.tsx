import { useState } from "react";
import { Bell, Trash2, CheckCircle, Clock, AlertCircle, Info, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useNotificationsDashboard, type NotificationType, type NotificationPriority } from "@/hooks/useNotificationsDashboard";

const typeIcons: Record<NotificationType, React.ReactNode> = {
  alert: <AlertCircle className="h-4 w-4" />,
  mention: <Bell className="h-4 w-4" />,
  activity: <Info className="h-4 w-4" />,
  system: <Info className="h-4 w-4" />,
  error: <AlertCircle className="h-4 w-4" />,
};

const priorityColors: Record<NotificationPriority, string> = {
  low: "bg-blue-100 text-blue-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-orange-100 text-orange-800",
  critical: "bg-red-100 text-red-800",
};

interface NotificationsDashboardProps {
  compact?: boolean;
}

export function NotificationsDashboard({ compact = false }: NotificationsDashboardProps) {
  const {
    notifications,
    stats,
    filters,
    setFilters,
    markAsRead,
    markAllAsRead,
    snoozeNotification,
    deleteNotification,
    bulkDelete,
    clearAll,
  } = useNotificationsDashboard({ enabled: true });

  const [selectedNotifications, setSelectedNotifications] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");

  const handleSelectNotification = (id: string) => {
    setSelectedNotifications((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedNotifications.size === notifications.length) {
      setSelectedNotifications(new Set());
    } else {
      setSelectedNotifications(new Set(notifications.map((n) => n.id)));
    }
  };

  if (compact) {
    return (
      <div className="space-y-2">
        {notifications.slice(0, 5).map((notification) => (
          <Card key={notification.id} className="p-3 flex items-start gap-3">
            <div className="mt-1">{typeIcons[notification.type]}</div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm">{notification.title}</div>
              <div className="text-xs text-muted-foreground truncate">
                {notification.message}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => deleteNotification(notification.id)}
            >
              <X className="h-4 w-4" />
            </Button>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-2xl font-bold">{stats.total}</div>
          <div className="text-sm text-muted-foreground">Total</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-blue-600">{stats.unread}</div>
          <div className="text-sm text-muted-foreground">Unread</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-red-600">{stats.critical}</div>
          <div className="text-sm text-muted-foreground">Critical</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-orange-600">{stats.snoozed}</div>
          <div className="text-sm text-muted-foreground">Snoozed</div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-2 items-center">
        <Input
          placeholder="Search notifications..."
          value={searchQuery}
          onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
          className="flex-1"
        />
        <Button variant="outline" size="sm" onClick={markAllAsRead}>
          Mark All Read
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => bulkDelete(Array.from(selectedNotifications))}
          disabled={selectedNotifications.size === 0}
        >
          Delete Selected
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={clearAll}
          className="text-red-600"
        >
          Clear All
        </Button>
      </div>

      {/* Notifications List */}
      <div className="space-y-2">
        {notifications.length === 0 ? (
          <Card className="p-8 text-center">
            <Bell className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <div className="text-muted-foreground">No notifications</div>
          </Card>
        ) : (
          notifications.map((notification) => (
            <Card
              key={notification.id}
              className={cn(
                "p-4 flex items-start gap-4 cursor-pointer hover:bg-accent transition-colors",
                !notification.read && "bg-blue-50"
              )}
            >
              <input
                type="checkbox"
                checked={selectedNotifications.has(notification.id)}
                onChange={() => handleSelectNotification(notification.id)}
                className="mt-1"
              />
              <div className="mt-1">{typeIcons[notification.type]}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <div className="font-medium">{notification.title}</div>
                  <Badge className={priorityColors[notification.priority]}>
                    {notification.priority}
                  </Badge>
                  {!notification.read && (
                    <div className="h-2 w-2 rounded-full bg-blue-600" />
                  )}
                </div>
                <div className="text-sm text-muted-foreground mb-2">
                  {notification.message}
                </div>
                <div className="text-xs text-muted-foreground">
                  {notification.timestamp.toLocaleString()}
                </div>
              </div>
              <div className="flex gap-2">
                {!notification.read && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => markAsRead(notification.id)}
                  >
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => snoozeNotification(notification.id, 30)}
                >
                  <Clock className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteNotification(notification.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
