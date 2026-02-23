import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Smartphone, Monitor, Laptop, LogOut, AlertCircle } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/hooks/useAuth';

interface Session {
  deviceId: string;
  deviceName: string;
  userAgent: string;
  ipAddress: string;
  createdAt: number;
  lastActivityAt: number;
  isCurrentDevice: boolean;
}

export function SessionManagement() {
  const { user } = useAuth();
  const [deviceId] = useState(() => localStorage.getItem('device-id') || crypto.randomUUID());
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const getActiveSessionsQuery = trpc.sessions.getActiveSessions.useQuery(undefined, {
    enabled: !!user,
  });

  const logoutDeviceMutation = trpc.sessions.logoutDevice.useMutation({
    onSuccess: () => {
      getActiveSessionsQuery.refetch();
    },
  });

  const logoutAllDevicesMutation = trpc.sessions.logoutAllDevices.useMutation({
    onSuccess: () => {
      getActiveSessionsQuery.refetch();
    },
  });

  useEffect(() => {
    if (getActiveSessionsQuery.data) {
      setSessions(getActiveSessionsQuery.data);
    }
  }, [getActiveSessionsQuery.data]);

  const getDeviceIcon = (userAgent: string) => {
    if (userAgent.includes('Mobile') || userAgent.includes('Android') || userAgent.includes('iPhone')) {
      return <Smartphone className="h-4 w-4" />;
    }
    if (userAgent.includes('Windows')) {
      return <Monitor className="h-4 w-4" />;
    }
    return <Laptop className="h-4 w-4" />;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const handleLogoutDevice = async (deviceId: string) => {
    setIsLoading(true);
    try {
      await logoutDeviceMutation.mutateAsync({ deviceId });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoutAllDevices = async () => {
    if (confirm('Are you sure? This will logout all your sessions.')) {
      setIsLoading(true);
      try {
        await logoutAllDevicesMutation.mutateAsync();
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (!user) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Sessions</CardTitle>
        <CardDescription>
          Manage your active sessions across devices
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {sessions.length === 0 ? (
          <div className="text-center py-8">
            <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">No active sessions found</p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {sessions.map((session) => (
                <div
                  key={session.deviceId}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded">
                      {getDeviceIcon(session.userAgent)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm truncate">
                          {session.deviceName}
                        </p>
                        {session.isCurrentDevice && (
                          <Badge variant="secondary" className="text-xs">
                            Current
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        {session.ipAddress} • Last active: {formatDate(session.lastActivityAt)}
                      </p>
                    </div>
                  </div>
                  {!session.isCurrentDevice && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLogoutDevice(session.deviceId)}
                      disabled={isLoading}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {sessions.length > 1 && (
              <Button
                variant="outline"
                className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={handleLogoutAllDevices}
                disabled={isLoading}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout All Devices
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
