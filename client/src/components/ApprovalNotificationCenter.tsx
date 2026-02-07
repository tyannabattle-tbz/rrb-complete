import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, CheckCircle2, XCircle, AlertCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface Notification {
  id: string;
  type: 'approval-request' | 'decision-executed' | 'approval-granted' | 'approval-denied';
  title: string;
  message: string;
  subsystem: string;
  autonomyLevel: number;
  impact: 'low' | 'medium' | 'high';
  timestamp: number;
  read: boolean;
  actionId?: string;
}

export function ApprovalNotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'approval-request',
      title: 'Approval Required',
      message: 'Large donation ($1,500) to Sweet Miracles requires approval',
      subsystem: 'Sweet Miracles',
      autonomyLevel: 45,
      impact: 'high',
      timestamp: Date.now() - 300000,
      read: false,
      actionId: 'action-1',
    },
    {
      id: '2',
      type: 'decision-executed',
      title: 'Decision Executed',
      message: 'Music track published to Rockin Rockin Boogie',
      subsystem: 'Rockin Rockin Boogie',
      autonomyLevel: 85,
      impact: 'low',
      timestamp: Date.now() - 600000,
      read: true,
    },
  ]);

  const [showPanel, setShowPanel] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    // Simulate new notifications
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const newNotif: Notification = {
          id: `notif-${Date.now()}`,
          type: 'approval-request',
          title: 'Approval Required',
          message: 'Emergency broadcast requires human approval',
          subsystem: 'HybridCast',
          autonomyLevel: 60,
          impact: 'high',
          timestamp: Date.now(),
          read: false,
        };
        setNotifications(prev => [newNotif, ...prev]);
        toast.warning('New approval request');
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleApprove = (id: string) => {
    setNotifications(prev =>
      prev.map(n =>
        n.id === id
          ? { ...n, type: 'approval-granted', read: true }
          : n
      )
    );
    toast.success('Approval granted');
  };

  const handleDeny = (id: string) => {
    setNotifications(prev =>
      prev.map(n =>
        n.id === id
          ? { ...n, type: 'approval-denied', read: true }
          : n
      )
    );
    toast.error('Approval denied');
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'approval-request':
        return <AlertCircle className="w-5 h-5 text-yellow-400" />;
      case 'approval-granted':
        return <CheckCircle2 className="w-5 h-5 text-green-400" />;
      case 'approval-denied':
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'decision-executed':
        return <CheckCircle2 className="w-5 h-5 text-blue-400" />;
    }
  };

  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Notification Bell */}
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="relative mb-4 p-3 bg-blue-600 hover:bg-blue-700 rounded-full shadow-lg transition"
      >
        <Bell className="w-6 h-6 text-white" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {showPanel && (
        <Card className="absolute bottom-20 right-0 w-96 max-h-96 bg-slate-800 border-slate-700 shadow-xl overflow-hidden">
          <div className="bg-slate-900 p-4 border-b border-slate-700">
            <h3 className="font-semibold text-white">Notifications</h3>
            <p className="text-xs text-slate-400">{unreadCount} unread</p>
          </div>

          <div className="overflow-y-auto max-h-80">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400">No notifications</div>
            ) : (
              notifications.map(notif => (
                <div
                  key={notif.id}
                  className={`p-4 border-b border-slate-700 hover:bg-slate-700/50 transition ${
                    !notif.read ? 'bg-slate-700/30' : ''
                  }`}
                  onClick={() => handleMarkAsRead(notif.id)}
                >
                  <div className="flex gap-3">
                    {getIcon(notif.type)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-semibold text-white text-sm">{notif.title}</p>
                        <span className="text-xs text-slate-400">{formatTime(notif.timestamp)}</span>
                      </div>
                      <p className="text-sm text-slate-300 mb-2">{notif.message}</p>
                      <div className="flex items-center gap-2 mb-3">
                        <Badge className="bg-slate-600 text-slate-200 text-xs">
                          {notif.subsystem}
                        </Badge>
                        <Badge
                          className={
                            notif.impact === 'high'
                              ? 'bg-red-500/20 text-red-300'
                              : notif.impact === 'medium'
                              ? 'bg-yellow-500/20 text-yellow-300'
                              : 'bg-green-500/20 text-green-300'
                          }
                        >
                          {notif.impact} impact
                        </Badge>
                        <Badge className="bg-blue-500/20 text-blue-300">
                          {notif.autonomyLevel}%
                        </Badge>
                      </div>

                      {notif.type === 'approval-request' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleApprove(notif.id)}
                            className="bg-green-600 hover:bg-green-700 text-xs flex-1"
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleDeny(notif.id)}
                            className="bg-red-600 hover:bg-red-700 text-xs flex-1"
                          >
                            Deny
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
