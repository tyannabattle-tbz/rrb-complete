import { useState, useEffect } from "react";
import { Bell, X, Check, Trash2 } from "lucide-react";
import { useLocation } from 'wouter';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Notification {
  id: number;
  type: "session_update" | "team_activity" | "search_result" | "alert" | "info";
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  actionUrl?: string;
}

interface NotificationCenterProps {
  onNotificationClick?: (notification: Notification) => void;
}

export default function NotificationCenter({
  onNotificationClick,
}: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getTypeColor = (type: Notification["type"]) => {
    switch (type) {
      case "alert":
        return "bg-red-100 text-red-800";
      case "session_update":
        return "bg-blue-100 text-blue-800";
      case "team_activity":
        return "bg-purple-100 text-purple-800";
      case "search_result":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeLabel = (type: Notification["type"]) => {
    switch (type) {
      case "session_update":
        return "Session";
      case "team_activity":
        return "Team";
      case "search_result":
        return "Search";
      case "alert":
        return "Alert";
      default:
        return "Info";
    }
  };

  const handleMarkAsRead = (id: number) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleDelete = (id: number) => {
    setNotifications((prevNotifications) => 
      prevNotifications.filter((n) => n.id !== id)
    );
    toast.success("Notification dismissed");
  };

  const handleClearAll = () => {
    setNotifications([]);
    setIsOpen(false);
    toast.success("All notifications cleared");
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
    toast.success("All notifications marked as read");
  };

  const [, navigate] = useLocation();

  const handleNotificationClick = (notification: Notification) => {
    handleMarkAsRead(notification.id);
    if (onNotificationClick) {
      onNotificationClick(notification);
    }
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };

  return (
    <div className="relative">
      {/* Bell Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-muted rounded-lg transition-colors"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <Card className="absolute right-0 top-full mt-2 w-96 max-h-96 overflow-y-auto shadow-lg z-50">
          {/* Header */}
          <div className="sticky top-0 bg-background border-b p-4 flex items-center justify-between">
            <h3 className="font-semibold">Notifications</h3>
            <div className="flex items-center gap-2">
              {notifications.length > 0 && (
                <>
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleMarkAllAsRead}
                      className="text-xs"
                    >
                      Mark all as read
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearAll}
                    className="text-xs"
                  >
                    Clear all
                  </Button>
                </>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-muted rounded"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          {notifications.length > 0 ? (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-muted/50 transition-colors cursor-pointer ${
                    !notification.read ? "bg-muted/20" : ""
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={getTypeColor(notification.type)}>
                          {getTypeLabel(notification.type)}
                        </Badge>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        )}
                      </div>
                      <h4 className="font-semibold text-sm">
                        {notification.title}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-3 hover:line-clamp-none transition-all" title={notification.message}>
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {notification.createdAt.toLocaleTimeString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      {!notification.read && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAsRead(notification.id);
                          }}
                          className="p-1 hover:bg-background rounded"
                          title="Mark as read"
                        >
                          <Check size={14} className="text-green-600" />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(notification.id);
                        }}
                        className="p-1 hover:bg-background rounded"
                        title="Delete"
                      >
                        <Trash2 size={14} className="text-red-600" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              <Bell size={32} className="mx-auto mb-2 opacity-50" />
              <p>No notifications</p>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
