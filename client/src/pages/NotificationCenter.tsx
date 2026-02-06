import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, CheckCircle, AlertCircle, AlertTriangle, Info, Trash2, Check } from "lucide-react";

export default function NotificationCenter() {
  const [selectedFilter, setSelectedFilter] = useState<"all" | "unread">("all");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch notifications
  const { data: notifications, refetch } = trpc.system.getNotifications.useQuery({
    limit: 50,
    unreadOnly: selectedFilter === "unread",
  });

  //   const { data: {} } = trpc.system.getStats.useQuery();

  // Mark as read mutation
  //   const markAsReadMutation = trpc.system.markAsRead.useMutation({
  //     onSuccess: () => refetch(),
  //   });
  // 
  //   const markAllAsReadMutation = trpc.system.markAllAsRead.useMutation({
  //     onSuccess: () => refetch(),
  //   });
  // 
  //   const deleteNotificationMutation = trpc.system.deleteNotification.useMutation({
  //     onSuccess: () => refetch(),
  //   });

  const handleMarkAsRead = (notificationId: string) => {
    markAsReadMutation.mutate({ notificationId });
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  const handleDelete = (notificationId: string) => {
    deleteNotificationMutation.mutate({ notificationId });
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "info":
        return <Info className="w-5 h-5 text-blue-500" />;
      default:
        return <Bell className="w-5 h-5 text-slate-500" />;
    }
  };

  const getNotificationBadgeColor = (type: string) => {
    switch (type) {
      case "error":
        return "bg-red-100 text-red-800";
      case "warning":
        return "bg-yellow-100 text-yellow-800";
      case "success":
        return "bg-green-100 text-green-800";
      case "info":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">Notification Center</h1>
              <p className="text-lg text-slate-600">Manage your system alerts and notifications</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-slate-900">{{}?.unread || 0}</div>
              <p className="text-sm text-slate-600">Unread notifications</p>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900">{{}?.total || 0}</div>
                <p className="text-sm text-slate-600">Total</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{{}?.byType?.error || 0}</div>
                <p className="text-sm text-slate-600">Errors</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{{}?.byType?.warning || 0}</div>
                <p className="text-sm text-slate-600">Warnings</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{{}?.byType?.success || 0}</div>
                <p className="text-sm text-slate-600">Success</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>View and manage your notifications</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={selectedFilter === "all" ? "default" : "outline"}
                  onClick={() => setSelectedFilter("all")}
                >
                  All
                </Button>
                <Button
                  variant={selectedFilter === "unread" ? "default" : "outline"}
                  onClick={() => setSelectedFilter("unread")}
                >
                  Unread ({{}?.unread || 0})
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex gap-2">
              <Button
                onClick={handleRefresh}
                disabled={isRefreshing}
                variant="outline"
                className="flex-1"
              >
                {isRefreshing ? "Refreshing..." : "Refresh"}
              </Button>
              <Button
                onClick={handleMarkAllAsRead}
                variant="outline"
                className="flex-1"
              >
                <Check className="w-4 h-4 mr-2" />
                Mark All as Read
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notifications List */}
        <div className="space-y-3">
          {notifications && notifications.length > 0 ? (
            notifications.map((notification: any) => (
              <Card
                key={notification.id}
                className={`shadow-md transition-all ${
                  !notification.read ? "border-l-4 border-l-blue-500 bg-blue-50" : ""
                }`}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-slate-900">
                          {notification.title}
                        </h3>
                        <Badge className={getNotificationBadgeColor(notification.type)}>
                          {notification.type}
                        </Badge>
                        {!notification.read && (
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                            New
                          </Badge>
                        )}
                      </div>
                      <p className="text-slate-700 mb-2">{notification.message}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex gap-2 text-xs text-slate-500">
                          <span>Source: {notification.source}</span>
                          <span>•</span>
                          <span>
                            {new Date(notification.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          {!notification.read && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleMarkAsRead(notification.id)}
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(notification.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="shadow-lg">
              <CardContent className="pt-12 pb-12 text-center">
                <Bell className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600 text-lg">No notifications yet</p>
                <p className="text-slate-500 text-sm">You're all caught up!</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
