import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Radio, Send, Clock, Users, MapPin, Shield } from 'lucide-react';

interface EmergencyBroadcast {
  id: string;
  title: string;
  message: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'active' | 'scheduled' | 'archived';
  timestamp: number;
  recipients: number;
  coverage: string;
  offline: boolean;
}

export function EmergencyBroadcastProtocol() {
  const [broadcasts, setBroadcasts] = useState<EmergencyBroadcast[]>([
    {
      id: '1',
      title: 'System Initialized',
      message: 'Hybrid Broadcast System is now online. All edge nodes are synchronized.',
      severity: 'low',
      status: 'active',
      timestamp: Date.now() - 5 * 60 * 1000,
      recipients: 247,
      coverage: 'Global',
      offline: false,
    },
    {
      id: '2',
      title: 'Network Topology Update',
      message: 'New mesh node detected in sector 7. Automatic routing tables updated.',
      severity: 'medium',
      status: 'active',
      timestamp: Date.now() - 15 * 60 * 1000,
      recipients: 189,
      coverage: 'Sector 7',
      offline: false,
    },
  ]);

  const [newBroadcast, setNewBroadcast] = useState({
    title: '',
    message: '',
    severity: 'high' as const,
    coverage: 'Global',
  });

  const [isCreating, setIsCreating] = useState(false);

  const handleCreateBroadcast = () => {
    if (!newBroadcast.title || !newBroadcast.message) return;

    const broadcast: EmergencyBroadcast = {
      id: Date.now().toString(),
      ...newBroadcast,
      status: 'active',
      timestamp: Date.now(),
      recipients: Math.floor(Math.random() * 500 + 100),
      offline: true,
    };

    setBroadcasts([broadcast, ...broadcasts]);
    setNewBroadcast({ title: '', message: '', severity: 'high', coverage: 'Global' });
    setIsCreating(false);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-500 bg-red-500/20';
      case 'high':
        return 'text-orange-500 bg-orange-500/20';
      case 'medium':
        return 'text-yellow-500 bg-yellow-500/20';
      case 'low':
        return 'text-green-500 bg-green-500/20';
      default:
        return 'text-slate-500 bg-slate-500/20';
    }
  };

  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="p-4 bg-gradient-to-r from-red-900/30 to-orange-900/30 border border-red-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-red-500" />
            <div>
              <h2 className="text-xl font-bold text-white">Emergency Broadcast Protocol</h2>
              <p className="text-sm text-slate-400">Offline-capable emergency messaging system</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-400">{broadcasts.length}</div>
            <div className="text-xs text-slate-400">Active Broadcasts</div>
          </div>
        </div>
      </Card>

      {/* Create New Broadcast */}
      {isCreating ? (
        <Card className="p-4 bg-slate-900 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">Create Emergency Broadcast</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Title</label>
              <input
                type="text"
                value={newBroadcast.title}
                onChange={(e) => setNewBroadcast({ ...newBroadcast, title: e.target.value })}
                placeholder="Broadcast title..."
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Message</label>
              <textarea
                value={newBroadcast.message}
                onChange={(e) => setNewBroadcast({ ...newBroadcast, message: e.target.value })}
                placeholder="Broadcast message..."
                rows={4}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Severity</label>
                <select
                  value={newBroadcast.severity}
                  onChange={(e) => setNewBroadcast({ ...newBroadcast, severity: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Coverage</label>
                <select
                  value={newBroadcast.coverage}
                  onChange={(e) => setNewBroadcast({ ...newBroadcast, coverage: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="Global">Global</option>
                  <option value="Regional">Regional</option>
                  <option value="Local">Local</option>
                  <option value="Sector">Sector</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleCreateBroadcast} className="bg-red-600 hover:bg-red-700 text-white flex-1">
                <Send className="w-4 h-4 mr-2" />
                Broadcast
              </Button>
              <Button onClick={() => setIsCreating(false)} className="bg-slate-700 hover:bg-slate-600 text-white flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <Button onClick={() => setIsCreating(true)} className="w-full bg-red-600 hover:bg-red-700 text-white">
          <AlertTriangle className="w-4 h-4 mr-2" />
          Create Emergency Broadcast
        </Button>
      )}

      {/* Broadcasts List */}
      <div className="space-y-3">
        {broadcasts.map((broadcast) => (
          <Card key={broadcast.id} className="p-4 bg-slate-900 border border-slate-700 hover:border-slate-600 transition-colors">
            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Radio className="w-4 h-4 text-green-400" />
                    <h3 className="font-semibold text-white">{broadcast.title}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(broadcast.severity)}`}>
                      {broadcast.severity.toUpperCase()}
                    </span>
                    {broadcast.offline && (
                      <span className="px-2 py-1 rounded text-xs font-medium bg-purple-500/20 text-purple-400">
                        OFFLINE
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-300">{broadcast.message}</p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-2 text-xs">
                <div className="flex items-center gap-1 text-slate-400">
                  <Clock className="w-3 h-3" />
                  <span>{formatTime(broadcast.timestamp)}</span>
                </div>
                <div className="flex items-center gap-1 text-slate-400">
                  <Users className="w-3 h-3" />
                  <span>{broadcast.recipients} recipients</span>
                </div>
                <div className="flex items-center gap-1 text-slate-400">
                  <MapPin className="w-3 h-3" />
                  <span>{broadcast.coverage}</span>
                </div>
                <div className="flex items-center gap-1 text-slate-400">
                  <Shield className="w-3 h-3" />
                  <span>AES-256</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2 border-t border-slate-700">
                <Button className="bg-slate-800 hover:bg-slate-700 text-white text-xs py-1 px-2">
                  Resend
                </Button>
                <Button className="bg-slate-800 hover:bg-slate-700 text-white text-xs py-1 px-2">
                  Archive
                </Button>
                <Button className="bg-slate-800 hover:bg-slate-700 text-white text-xs py-1 px-2">
                  Analytics
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Protocol Info */}
      <Card className="p-4 bg-slate-900 border border-slate-700">
        <h4 className="font-semibold text-white mb-3">Protocol Features</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full mt-1.5 flex-shrink-0" />
            <div>
              <div className="font-medium text-white">Offline Capable</div>
              <div className="text-xs text-slate-400">Works without internet connection</div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full mt-1.5 flex-shrink-0" />
            <div>
              <div className="font-medium text-white">AES-256 Encryption</div>
              <div className="text-xs text-slate-400">Military-grade security</div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full mt-1.5 flex-shrink-0" />
            <div>
              <div className="font-medium text-white">Mesh Network</div>
              <div className="text-xs text-slate-400">Automatic routing and redundancy</div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full mt-1.5 flex-shrink-0" />
            <div>
              <div className="font-medium text-white">Priority Delivery</div>
              <div className="text-xs text-slate-400">Critical messages prioritized</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
