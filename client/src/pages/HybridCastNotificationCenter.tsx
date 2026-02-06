import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import {
  AlertCircle,
  Bell,
  CheckCircle,
  Clock,
  Filter,
  MessageSquare,
  Trash2,
  ArrowLeft,
  Radio,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

interface Notification {
  id: string;
  type: 'alert' | 'broadcast' | 'network' | 'sync';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

export default function HybridCastNotificationCenter() {
  const [, navigate] = useLocation();
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'alert',
      severity: 'critical',
      title: 'Emergency Alert Active',
      message: 'System-wide emergency broadcast protocol activated',
      timestamp: new Date(Date.now() - 5 * 60000),
      read: false,
      actionUrl: '/hybridcast',
    },
    {
      id: '2',
      type: 'broadcast',
      severity: 'high',
      title: 'New Broadcast Received',
      message: 'Critical infrastructure update broadcast from regional coordinator',
      timestamp: new Date(Date.now() - 15 * 60000),
      read: false,
      actionUrl: '/hybridcast',
    },
    {
      id: '3',
      type: 'network',
      severity: 'medium',
      title: 'Network Status Update',
      message: 'New mesh node detected in sector 7. Topology updated.',
      timestamp: new Date(Date.now() - 30 * 60000),
      read: true,
    },
    {
      id: '4',
      type: 'sync',
      severity: 'low',
      title: 'Data Sync Complete',
      message: '47 items synced from central server. Cache updated.',
      timestamp: new Date(Date.now() - 60 * 60000),
      read: true,
    },
  ]);

  const [filter, setFilter] = useState<'all' | 'unread' | 'critical'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread' && n.read) return false;
    if (filter === 'critical' && n.severity !== 'critical') return false;
    if (typeFilter !== 'all' && n.type !== typeFilter) return false;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success('All notifications marked as read');
  };

  const handleDelete = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    toast.success('Notification deleted');
  };

  const handleClearAll = () => {
    setNotifications([]);
    toast.success('All notifications cleared');
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500/20 border-red-500/50 text-red-300';
      case 'high':
        return 'bg-orange-500/20 border-orange-500/50 text-orange-300';
      case 'medium':
        return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-300';
      default:
        return 'bg-blue-500/20 border-blue-500/50 text-blue-300';
    }
  };

  const getSeverityBadgeVariant = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'secondary';
      case 'medium':
        return 'outline';
      default:
        return 'default';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'alert':
        return <AlertCircle className="w-5 h-5" />;
      case 'broadcast':
        return <Radio className="w-5 h-5" />;
      case 'network':
        return <MessageSquare className="w-5 h-5" />;
      case 'sync':
        return <CheckCircle className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => navigate('/')}
              variant="ghost"
              className="text-slate-400 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                <Bell className="w-8 h-8 text-cyan-400" />
                Notification Center
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                HybridCast Alerts & Broadcast Updates
              </p>
            </div>
          </div>

          {unreadCount > 0 && (
            <Badge className="bg-red-500 text-white text-lg px-3 py-1">
              {unreadCount} Unread
            </Badge>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4 bg-slate-800 border-slate-700">
            <div className="text-sm text-slate-400 mb-1">Total Notifications</div>
            <div className="text-2xl font-bold text-white">{notifications.length}</div>
          </Card>
          <Card className="p-4 bg-slate-800 border-slate-700">
            <div className="text-sm text-slate-400 mb-1">Unread</div>
            <div className="text-2xl font-bold text-cyan-400">{unreadCount}</div>
          </Card>
          <Card className="p-4 bg-slate-800 border-slate-700">
            <div className="text-sm text-slate-400 mb-1">Critical</div>
            <div className="text-2xl font-bold text-red-400">
              {notifications.filter((n) => n.severity === 'critical').length}
            </div>
          </Card>
          <Card className="p-4 bg-slate-800 border-slate-700">
            <div className="text-sm text-slate-400 mb-1">Broadcasts</div>
            <div className="text-2xl font-bold text-blue-400">
              {notifications.filter((n) => n.type === 'broadcast').length}
            </div>
          </Card>
        </div>

        {/* Controls */}
        <div className="mb-6 flex flex-col sm:flex-row gap-3">
          <div className="flex gap-2 flex-1">
            <Select value={filter} onValueChange={(v: any) => setFilter(v)}>
              <SelectTrigger className="w-40 bg-slate-800 border-slate-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Notifications</SelectItem>
                <SelectItem value="unread">Unread Only</SelectItem>
                <SelectItem value="critical">Critical Only</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40 bg-slate-800 border-slate-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="alert">Alerts</SelectItem>
                <SelectItem value="broadcast">Broadcasts</SelectItem>
                <SelectItem value="network">Network</SelectItem>
                <SelectItem value="sync">Sync</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button
                onClick={handleMarkAllAsRead}
                variant="outline"
                className="text-slate-300 border-slate-600 hover:bg-slate-700"
              >
                Mark All Read
              </Button>
            )}
            {notifications.length > 0 && (
              <Button
                onClick={handleClearAll}
                variant="outline"
                className="text-red-400 border-red-600 hover:bg-red-500/10"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <Card className="p-12 bg-slate-800 border-slate-700 text-center">
            <Bell className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-300 mb-2">
              No Notifications
            </h3>
            <p className="text-slate-500">
              You're all caught up! Check back later for HybridCast updates.
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => (
              <Card
                key={notification.id}
                className={`p-4 border cursor-pointer transition-all hover:shadow-lg ${
                  getSeverityColor(notification.severity)
                } ${!notification.read ? 'ring-2 ring-cyan-500/50' : ''}`}
              >
                <div className="flex items-start gap-4">
                  <div className="mt-1 text-cyan-400">
                    {getTypeIcon(notification.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-sm">{notification.title}</h3>
                      <Badge variant={getSeverityBadgeVariant(notification.severity)}>
                        {notification.severity}
                      </Badge>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-cyan-400 rounded-full" />
                      )}
                    </div>
                    <p className="text-sm opacity-90 mb-2">{notification.message}</p>
                    <div className="flex items-center gap-2 text-xs opacity-75">
                      <Clock className="w-3 h-3" />
                      {notification.timestamp.toLocaleString()}
                    </div>
                  </div>

                  <div className="flex gap-2 flex-shrink-0">
                    {notification.actionUrl && (
                      <Button
                        onClick={() => navigate(notification.actionUrl!)}
                        size="sm"
                        className="bg-cyan-600 hover:bg-cyan-700 text-white"
                      >
                        View
                      </Button>
                    )}
                    {!notification.read && (
                      <Button
                        onClick={() => handleMarkAsRead(notification.id)}
                        size="sm"
                        variant="outline"
                        className="text-slate-300 border-slate-600"
                      >
                        Read
                      </Button>
                    )}
                    <Button
                      onClick={() => handleDelete(notification.id)}
                      size="sm"
                      variant="ghost"
                      className="text-red-400 hover:bg-red-500/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Footer Info */}
        <div className="mt-8 p-4 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-400">
          <p>
            This notification center aggregates all HybridCast alerts, emergency broadcasts, and network status changes. Enable push notifications in your browser settings to receive real-time updates.
          </p>
        </div>
      </div>
    </div>
  );
}
