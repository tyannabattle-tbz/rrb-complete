import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Plus, Trash2, Edit, Lock, Unlock, Shield } from 'lucide-react';
import { toast } from 'sonner';

interface FamilyMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'producer' | 'engineer' | 'guest';
  permissions: string[];
  isActive: boolean;
  lastLogin: Date | null;
  joinDate: Date;
}

interface Permission {
  id: string;
  name: string;
  description: string;
  category: 'studio' | 'mixing' | 'recording' | 'streaming' | 'admin';
}

const AUTHORIZED_USERS = [
  { name: 'Chris Battle Sr', email: 'chris@battle.family', role: 'admin' as const },
  { name: 'C.J. Battle', email: 'cj@battle.family', role: 'admin' as const },
  { name: 'Kairen Battle', email: 'kairen@battle.family', role: 'admin' as const },
  { name: 'AP/Amandes Studio', email: 'ap@amandes.studio', role: 'admin' as const },
];

const ROLE_PERMISSIONS = {
  admin: [
    'view_all_projects',
    'edit_all_projects',
    'delete_projects',
    'manage_users',
    'access_admin_panel',
    'view_analytics',
    'export_sessions',
    'manage_hardware',
  ],
  producer: [
    'view_all_projects',
    'edit_own_projects',
    'create_projects',
    'record_audio',
    'mix_tracks',
    'export_sessions',
    'manage_hardware',
  ],
  engineer: [
    'view_assigned_projects',
    'edit_assigned_projects',
    'record_audio',
    'mix_tracks',
    'view_analytics',
  ],
  guest: ['view_assigned_projects', 'listen_only'],
};

export function FamilyMemberManager() {
  const [members, setMembers] = useState<FamilyMember[]>(
    AUTHORIZED_USERS.map((user, idx) => ({
      id: idx.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      permissions: ROLE_PERMISSIONS[user.role],
      isActive: true,
      lastLogin: new Date(),
      joinDate: new Date(),
    }))
  );

  const [showAddMember, setShowAddMember] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<'admin' | 'producer' | 'engineer' | 'guest'>('producer');
  const [selectedMember, setSelectedMember] = useState<string | null>(null);

  const addMember = () => {
    if (!newMemberName || !newMemberEmail) {
      toast.error('Please fill in all fields');
      return;
    }

    const newMember: FamilyMember = {
      id: Date.now().toString(),
      name: newMemberName,
      email: newMemberEmail,
      role: newMemberRole,
      permissions: ROLE_PERMISSIONS[newMemberRole],
      isActive: true,
      lastLogin: null,
      joinDate: new Date(),
    };

    setMembers([...members, newMember]);
    setNewMemberName('');
    setNewMemberEmail('');
    setNewMemberRole('producer');
    setShowAddMember(false);
    toast.success(`${newMemberName} added to family`);
  };

  const removeMember = (id: string) => {
    const member = members.find((m) => m.id === id);
    setMembers(members.filter((m) => m.id !== id));
    toast.success(`${member?.name} removed from family`);
  };

  const toggleMemberActive = (id: string) => {
    setMembers(
      members.map((m) =>
        m.id === id ? { ...m, isActive: !m.isActive } : m
      )
    );
  };

  const updateMemberRole = (id: string, newRole: FamilyMember['role']) => {
    setMembers(
      members.map((m) =>
        m.id === id
          ? { ...m, role: newRole, permissions: ROLE_PERMISSIONS[newRole] }
          : m
      )
    );
    toast.success('Member role updated');
  };

  return (
    <div className="space-y-6">
      {/* Authorized Users Summary */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Shield className="w-4 h-4 text-green-400" />
            Authorized Family Members
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-300 space-y-2">
          <div>✓ <strong>Chris Battle Sr</strong> - Full Admin Access</div>
          <div>✓ <strong>C.J. Battle</strong> - Full Admin Access</div>
          <div>✓ <strong>Kairen Battle</strong> - Full Admin Access</div>
          <div>✓ <strong>AP/Amandes Studio</strong> - Full Admin Access</div>
          <div className="text-slate-400 mt-3">+ Other family members will be added as they enter</div>
        </CardContent>
      </Card>

      {/* Family Members List */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-400" />
            Family Members ({members.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {members.map((member) => (
              <div
                key={member.id}
                className={`bg-slate-900 rounded p-3 border ${
                  member.isActive ? 'border-slate-700' : 'border-slate-600 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex-1">
                    <div className="text-sm text-white font-semibold flex items-center gap-2">
                      {member.name}
                      {member.isActive ? (
                        <span className="w-2 h-2 bg-green-500 rounded-full" />
                      ) : (
                        <span className="w-2 h-2 bg-slate-500 rounded-full" />
                      )}
                    </div>
                    <div className="text-xs text-slate-400">{member.email}</div>
                  </div>
                  <div className="text-xs text-slate-400">
                    {member.lastLogin
                      ? `Last: ${member.lastLogin.toLocaleDateString()}`
                      : 'Never logged in'}
                  </div>
                </div>

                <div className="flex items-center justify-between mb-2">
                  <select
                    value={member.role}
                    onChange={(e) =>
                      updateMemberRole(
                        member.id,
                        e.target.value as FamilyMember['role']
                      )
                    }
                    className="text-xs bg-slate-800 border border-slate-600 rounded px-2 py-1 text-slate-300"
                  >
                    <option value="admin">Admin</option>
                    <option value="producer">Producer</option>
                    <option value="engineer">Engineer</option>
                    <option value="guest">Guest</option>
                  </select>

                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleMemberActive(member.id)}
                    >
                      {member.isActive ? (
                        <Unlock className="w-3 h-3 text-green-400" />
                      ) : (
                        <Lock className="w-3 h-3 text-red-400" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => removeMember(member.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                <div className="text-xs text-slate-400">
                  Permissions: {member.permissions.length} • Joined:{' '}
                  {member.joinDate.toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>

          <Button
            onClick={() => setShowAddMember(!showAddMember)}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Family Member
          </Button>

          {showAddMember && (
            <div className="bg-slate-900 rounded p-3 border border-slate-700 space-y-2">
              <input
                type="text"
                placeholder="Full Name"
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-slate-300"
              />
              <input
                type="email"
                placeholder="Email Address"
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
                className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-slate-300"
              />
              <select
                value={newMemberRole}
                onChange={(e) =>
                  setNewMemberRole(e.target.value as FamilyMember['role'])
                }
                className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-slate-300"
              >
                <option value="admin">Admin - Full Access</option>
                <option value="producer">Producer - Create & Mix</option>
                <option value="engineer">Engineer - Operate Only</option>
                <option value="guest">Guest - View Only</option>
              </select>
              <div className="flex gap-2">
                <Button onClick={addMember} className="flex-1 bg-green-600 hover:bg-green-700">
                  Add Member
                </Button>
                <Button
                  onClick={() => setShowAddMember(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Role Permissions Matrix */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-sm">Role Permissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(ROLE_PERMISSIONS).map(([role, perms]) => (
              <div key={role} className="bg-slate-900 rounded p-2 border border-slate-700">
                <div className="text-sm text-white font-semibold capitalize mb-2">{role}</div>
                <div className="text-xs text-slate-400 grid grid-cols-2 gap-1">
                  {perms.map((perm) => (
                    <div key={perm}>✓ {perm.replace(/_/g, ' ')}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-sm">Active Sessions</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-slate-400 space-y-2">
          {members
            .filter((m) => m.isActive && m.lastLogin)
            .map((member) => (
              <div key={member.id} className="flex justify-between">
                <span>{member.name}</span>
                <span className="text-green-400">● Online</span>
              </div>
            ))}
          {members.filter((m) => m.isActive && !m.lastLogin).length > 0 && (
            <div className="text-slate-500">
              {members.filter((m) => m.isActive && !m.lastLogin).length} members awaiting first login
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
