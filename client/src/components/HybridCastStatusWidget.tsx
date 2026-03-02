import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Radio, Wifi, WifiOff, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

interface HybridCastStatus {
  isOnline: boolean;
  cachedItems: number;
  pendingSync: number;
  latency: number;
  uptime: number;
  activeNodes: number;
  lastSync: string;
  encryption: string;
}

export function HybridCastStatusWidget() {
  const [, navigate] = useLocation();
  const [status, setStatus] = useState<HybridCastStatus>({
    isOnline: true,
    cachedItems: 4,
    pendingSync: 0,
    latency: 24,
    uptime: 99.9,
    activeNodes: 12,
    lastSync: new Date().toLocaleTimeString(),
    encryption: 'AES-256',
  });

  // Simulate real-time status updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStatus((prev) => ({
        ...prev,
        latency: Math.floor(Math.random() * 50) + 10,
        activeNodes: Math.floor(Math.random() * 20) + 8,
        lastSync: new Date().toLocaleTimeString(),
        cachedItems: Math.floor(Math.random() * 10) + 3,
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    if (!status.isOnline) return 'text-red-500';
    if (status.latency > 100) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getStatusBadge = () => {
    if (!status.isOnline) return 'destructive';
    if (status.latency > 100) return 'secondary';
    return 'default';
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative gap-2 text-sm font-medium"
          title="HybridCast Status"
        >
          <div className="relative">
            <Radio className={`w-4 h-4 ${getStatusColor()}`} />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          </div>
          <span className="hidden sm:inline">HybridCast</span>
          <Badge variant={getStatusBadge()} className="text-xs">
            {status.isOnline ? 'Online' : 'Offline'}
          </Badge>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80">
        {/* Header */}
        <div className="px-4 py-3 border-b">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-sm">HybridCast Status</h3>
            <div className={`flex items-center gap-1 ${getStatusColor()}`}>
              {status.isOnline ? (
                <Wifi className="w-4 h-4" />
              ) : (
                <WifiOff className="w-4 h-4" />
              )}
              <span className="text-xs font-medium">
                {status.isOnline ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-500">
            Emergency Broadcast System Status
          </p>
        </div>

        {/* Status Grid */}
        <div className="px-4 py-3 grid grid-cols-2 gap-3 border-b">
          <div>
            <div className="text-xs text-slate-500 mb-1">Latency</div>
            <div className="text-sm font-semibold text-cyan-400">
              {status.latency}ms
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-500 mb-1">Uptime</div>
            <div className="text-sm font-semibold text-green-400">
              {status.uptime}%
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-500 mb-1">Cached Items</div>
            <div className="text-sm font-semibold text-blue-400">
              {status.cachedItems}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-500 mb-1">Active Nodes</div>
            <div className="text-sm font-semibold text-purple-400">
              {status.activeNodes}
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="px-4 py-3 space-y-2 border-b text-xs">
          <div className="flex justify-between">
            <span className="text-slate-500">Pending Sync:</span>
            <span className="font-medium">{status.pendingSync} items</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Encryption:</span>
            <span className="font-medium text-green-400">{status.encryption}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Last Sync:</span>
            <span className="font-medium">{status.lastSync}</span>
          </div>
        </div>

        {/* Actions */}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => navigate('/hybridcast')}
          className="cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span>Open HybridCast</span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => navigate('/hybridcast-analytics')}
          className="cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>View Analytics</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
