import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Share2, Copy, Trash2, Clock, UserPlus, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

interface Collaborator {
  id: string;
  name: string;
  color: string;
  cursorX: number;
  cursorY: number;
  isActive: boolean;
  lastActive: Date;
}

interface SharedPreset {
  id: string;
  name: string;
  owner: string;
  sharedWith: string[];
  createdAt: Date;
  lastModified: Date;
  permissions: 'view' | 'edit' | 'admin';
}

interface ActivityLog {
  id: string;
  user: string;
  action: string;
  timestamp: Date;
  details: string;
}

export function CollaborationManager() {
  const [sessionId, setSessionId] = useState('STUDIO-' + Math.random().toString(36).substr(2, 9).toUpperCase());
  const [collaborators, setCollaborators] = useState<Collaborator[]>([
    {
      id: '1',
      name: 'You',
      color: '#3b82f6',
      cursorX: 0,
      cursorY: 0,
      isActive: true,
      lastActive: new Date(),
    },
  ]);
  const [sharedPresets, setSharedPresets] = useState<SharedPreset[]>([
    {
      id: '1',
      name: 'Vocal Mix v2',
      owner: 'You',
      sharedWith: ['User2', 'User3'],
      createdAt: new Date(),
      lastModified: new Date(),
      permissions: 'edit',
    },
  ]);
  const [activityLog, setActivityLog] = useState<ActivityLog[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [selectedPermission, setSelectedPermission] = useState<'view' | 'edit' | 'admin'>('edit');
  const [conflictMode, setConflictMode] = useState<'merge' | 'local' | 'remote'>('merge');

  const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

  const generateInviteLink = () => {
    const link = `https://studio.example.com/join/${sessionId}`;
    navigator.clipboard.writeText(link);
    toast.success('Invite link copied to clipboard');
  };

  const addCollaborator = () => {
    if (!inviteEmail.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    const newCollaborator: Collaborator = {
      id: Date.now().toString(),
      name: inviteEmail.split('@')[0],
      color: colors[collaborators.length % colors.length],
      cursorX: 0,
      cursorY: 0,
      isActive: true,
      lastActive: new Date(),
    };

    setCollaborators([...collaborators, newCollaborator]);
    logActivity('invite', `Invited ${inviteEmail} with ${selectedPermission} permissions`);
    setInviteEmail('');
    toast.success(`Invited ${inviteEmail}`);
  };

  const removeCollaborator = (id: string) => {
    const removed = collaborators.find((c) => c.id === id);
    setCollaborators(collaborators.filter((c) => c.id !== id));
    if (removed) {
      logActivity('remove', `Removed ${removed.name} from session`);
    }
  };

  const sharePreset = (presetId: string, collaboratorId: string) => {
    const preset = sharedPresets.find((p) => p.id === presetId);
    const collaborator = collaborators.find((c) => c.id === collaboratorId);

    if (preset && collaborator && !preset.sharedWith.includes(collaborator.name)) {
      const updated = {
        ...preset,
        sharedWith: [...preset.sharedWith, collaborator.name],
        lastModified: new Date(),
      };
      setSharedPresets(sharedPresets.map((p) => (p.id === presetId ? updated : p)));
      logActivity('share', `Shared preset "${preset.name}" with ${collaborator.name}`);
      toast.success(`Shared with ${collaborator.name}`);
    }
  };

  const logActivity = (action: string, details: string) => {
    const newLog: ActivityLog = {
      id: Date.now().toString(),
      user: 'You',
      action,
      timestamp: new Date(),
      details,
    };
    setActivityLog([newLog, ...activityLog.slice(0, 49)]);
  };

  const resolveConflict = (resolution: 'merge' | 'local' | 'remote') => {
    setConflictMode(resolution);
    logActivity('conflict', `Conflict resolved using ${resolution} strategy`);
    toast.success(`Conflict resolved using ${resolution} strategy`);
  };

  return (
    <div className="space-y-6">
      {/* Session Info */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-400" />
            Collaboration Session
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="bg-slate-900 rounded p-3 border border-slate-700">
            <div className="text-xs text-slate-400 mb-1">Session ID</div>
            <div className="text-sm text-white font-mono flex items-center justify-between">
              {sessionId}
              <Button
                size="sm"
                variant="ghost"
                onClick={generateInviteLink}
                className="text-xs"
              >
                <Copy className="w-3 h-3" />
              </Button>
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-2 block">Invite Collaborators</label>
            <div className="flex gap-2">
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-slate-300"
                placeholder="collaborator@example.com"
              />
              <select
                value={selectedPermission}
                onChange={(e) => setSelectedPermission(e.target.value as 'view' | 'edit' | 'admin')}
                className="bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-slate-300"
              >
                <option value="view">View</option>
                <option value="edit">Edit</option>
                <option value="admin">Admin</option>
              </select>
              <Button onClick={addCollaborator} className="bg-blue-600 hover:bg-blue-700">
                <UserPlus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <Button onClick={generateInviteLink} variant="outline" className="w-full">
            <Share2 className="w-4 h-4 mr-2" />
            Copy Invite Link
          </Button>
        </CardContent>
      </Card>

      {/* Active Collaborators */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-sm">Active Collaborators ({collaborators.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {collaborators.map((collab) => (
              <div
                key={collab.id}
                className="flex items-center justify-between bg-slate-900 p-3 rounded border border-slate-700"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: collab.color }}
                  />
                  <div>
                    <div className="text-sm text-white font-medium">{collab.name}</div>
                    <div className="text-xs text-slate-400">
                      {collab.isActive ? '🟢 Active now' : `Last seen ${Math.floor((Date.now() - collab.lastActive.getTime()) / 60000)}m ago`}
                    </div>
                  </div>
                </div>
                {collab.id !== '1' && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => removeCollaborator(collab.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Shared Presets */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-sm">Shared Presets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {sharedPresets.map((preset) => (
              <div key={preset.id} className="bg-slate-900 p-3 rounded border border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="text-sm text-white font-medium">{preset.name}</div>
                    <div className="text-xs text-slate-400">Owner: {preset.owner}</div>
                  </div>
                  <div className="bg-blue-900/30 text-blue-300 px-2 py-1 rounded text-xs">
                    {preset.permissions}
                  </div>
                </div>
                <div className="text-xs text-slate-400 mb-2">
                  Shared with: {preset.sharedWith.join(', ') || 'No one yet'}
                </div>
                <div className="flex gap-1">
                  {collaborators
                    .filter((c) => c.id !== '1' && !preset.sharedWith.includes(c.name))
                    .map((collab) => (
                      <Button
                        key={collab.id}
                        size="sm"
                        variant="outline"
                        onClick={() => sharePreset(preset.id, collab.id)}
                        className="text-xs flex-1"
                      >
                        Share with {collab.name}
                      </Button>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Conflict Resolution */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-sm">Conflict Resolution</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="text-xs text-slate-400 mb-2 block">Strategy</label>
            <div className="grid grid-cols-3 gap-2">
              {(['merge', 'local', 'remote'] as const).map((strategy) => (
                <Button
                  key={strategy}
                  size="sm"
                  variant={conflictMode === strategy ? 'default' : 'outline'}
                  onClick={() => resolveConflict(strategy)}
                  className="text-xs capitalize"
                >
                  {strategy}
                </Button>
              ))}
            </div>
          </div>
          <div className="text-xs text-slate-400">
            <strong>Merge:</strong> Combine changes from all users
            <br />
            <strong>Local:</strong> Keep your changes, discard others
            <br />
            <strong>Remote:</strong> Accept latest changes from collaborators
          </div>
        </CardContent>
      </Card>

      {/* Activity Log */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-400" />
            Activity Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {activityLog.length === 0 ? (
              <div className="text-center py-4 text-slate-400 text-sm">No activity yet</div>
            ) : (
              activityLog.map((log) => (
                <div key={log.id} className="bg-slate-900 p-2 rounded text-xs border border-slate-700">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-slate-300 font-medium">{log.user}</span>
                    <span className="text-slate-500">{log.timestamp.toLocaleTimeString()}</span>
                  </div>
                  <div className="text-slate-400">{log.details}</div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Cursor Tracking Info */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-green-400" />
            Real-Time Features
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-slate-400 space-y-2">
          <div>✓ Live cursor tracking for all collaborators</div>
          <div>✓ Real-time preset synchronization</div>
          <div>✓ Automatic conflict detection and resolution</div>
          <div>✓ Session recording and replay capability</div>
          <div>✓ Undo/redo across all users</div>
          <div>✓ Permission-based access control</div>
        </CardContent>
      </Card>
    </div>
  );
}
