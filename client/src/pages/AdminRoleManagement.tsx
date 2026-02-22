/**
 * Admin Role Management Page
 * Interface for managing platform broadcaster and moderator roles
 */

import React, { useState } from 'react';
import { Users, Plus, Trash2, Edit2, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { trpc } from '../lib/trpc';

export const AdminRoleManagement: React.FC = () => {
  const [selectedPlatform, setSelectedPlatform] = useState<string>('squadd');
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<'viewer' | 'moderator' | 'broadcaster' | 'admin'>(
    'broadcaster'
  );
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const platforms = [
    { id: 'squadd', name: 'SQUADD', color: 'bg-red-600' },
    { id: 'solbones', name: 'Solbones Podcast', color: 'bg-purple-600' },
  ];

  // Fetch platform roles
  const { data: roleAssignments, isLoading: isLoadingRoles, refetch } = trpc.admin.roles.getPlatformRoles.useQuery(
    { platformId: selectedPlatform },
    { enabled: !!selectedPlatform }
  );

  // Fetch role stats
  const { data: stats } = trpc.admin.roles.getRoleStats.useQuery(
    { platformId: selectedPlatform },
    { enabled: !!selectedPlatform }
  );

  // Assign role mutation
  const assignRoleMutation = trpc.admin.roles.assignRole.useMutation({
    onSuccess: () => {
      setMessage({ type: 'success', text: 'Role assigned successfully' });
      setShowAssignForm(false);
      setSelectedUser('');
      setReason('');
      refetch();
    },
    onError: (error) => {
      setMessage({ type: 'error', text: error.message });
    },
  });

  // Remove role mutation
  const removeRoleMutation = trpc.admin.roles.removeRole.useMutation({
    onSuccess: () => {
      setMessage({ type: 'success', text: 'Role removed successfully' });
      refetch();
    },
    onError: (error) => {
      setMessage({ type: 'error', text: error.message });
    },
  });

  const handleAssignRole = async () => {
    if (!selectedUser) {
      setMessage({ type: 'error', text: 'Please select a user' });
      return;
    }

    await assignRoleMutation.mutateAsync({
      userId: parseInt(selectedUser),
      platformId: selectedPlatform,
      role: selectedRole,
      reason: reason || undefined,
    });
  };

  const handleRemoveRole = async (userId: number) => {
    if (confirm('Are you sure you want to remove this role?')) {
      await removeRoleMutation.mutateAsync({
        userId,
        platformId: selectedPlatform,
      });
    }
  };

  const currentPlatform = platforms.find((p) => p.id === selectedPlatform);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Role Management</h1>
          </div>
          <p className="text-gray-600">Manage broadcaster and moderator roles across platforms</p>
        </div>

        {/* Message Alert */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${
              message.type === 'success'
                ? 'bg-green-100 border border-green-300'
                : 'bg-red-100 border border-red-300'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <p
                className={`font-semibold ${
                  message.type === 'success' ? 'text-green-900' : 'text-red-900'
                }`}
              >
                {message.type === 'success' ? 'Success' : 'Error'}
              </p>
              <p className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                {message.text}
              </p>
            </div>
          </div>
        )}

        {/* Platform Selector */}
        <div className="mb-8">
          <label className="block text-sm font-semibold text-gray-700 mb-3">Select Platform</label>
          <div className="flex gap-3">
            {platforms.map((platform) => (
              <button
                key={platform.id}
                onClick={() => setSelectedPlatform(platform.id)}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  selectedPlatform === platform.id
                    ? `${platform.color} text-white shadow-lg`
                    : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-gray-400'
                }`}
              >
                {platform.name}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <p className="text-gray-600 text-sm font-medium">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <p className="text-gray-600 text-sm font-medium">Admins</p>
              <p className="text-2xl font-bold text-blue-600">{stats.admins}</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <p className="text-gray-600 text-sm font-medium">Broadcasters</p>
              <p className="text-2xl font-bold text-purple-600">{stats.broadcasters}</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <p className="text-gray-600 text-sm font-medium">Moderators</p>
              <p className="text-2xl font-bold text-orange-600">{stats.moderators}</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <p className="text-gray-600 text-sm font-medium">Viewers</p>
              <p className="text-2xl font-bold text-gray-600">{stats.viewers}</p>
            </div>
          </div>
        )}

        {/* Assign Role Form */}
        {showAssignForm && (
          <div className="bg-white p-6 rounded-lg border border-gray-300 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Assign New Role</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">User ID</label>
                <input
                  type="number"
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  placeholder="Enter user ID"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <select
                  value={selectedRole}
                  onChange={(e) =>
                    setSelectedRole(
                      e.target.value as 'viewer' | 'moderator' | 'broadcaster' | 'admin'
                    )
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                >
                  <option value="viewer">Viewer</option>
                  <option value="moderator">Moderator</option>
                  <option value="broadcaster">Broadcaster</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason (Optional)
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Why are you assigning this role?"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  rows={3}
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleAssignRole}
                  disabled={assignRoleMutation.isPending}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {assignRoleMutation.isPending ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Assigning...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Assign Role
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowAssignForm(false)}
                  className="px-6 py-2 bg-gray-300 text-gray-900 rounded-lg font-semibold hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Assign Role Button */}
        {!showAssignForm && (
          <button
            onClick={() => setShowAssignForm(true)}
            className="mb-8 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Assign New Role
          </button>
        )}

        {/* Role Assignments Table */}
        <div className="bg-white rounded-lg border border-gray-300 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">
              {currentPlatform?.name} - Role Assignments
            </h2>
          </div>

          {isLoadingRoles ? (
            <div className="p-6 text-center">
              <Loader className="w-6 h-6 animate-spin mx-auto text-gray-400" />
            </div>
          ) : roleAssignments && roleAssignments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Granted
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {roleAssignments.map((assignment) => (
                    <tr key={assignment.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {assignment.userName || `User ${assignment.userId}`}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{assignment.userEmail}</td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            assignment.role === 'admin'
                              ? 'bg-blue-100 text-blue-800'
                              : assignment.role === 'broadcaster'
                                ? 'bg-purple-100 text-purple-800'
                                : assignment.role === 'moderator'
                                  ? 'bg-orange-100 text-orange-800'
                                  : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {assignment.role.charAt(0).toUpperCase() + assignment.role.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(assignment.grantedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => handleRemoveRole(assignment.userId)}
                          disabled={removeRoleMutation.isPending}
                          className="text-red-600 hover:text-red-800 font-semibold flex items-center gap-1 disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6 text-center text-gray-600">
              <p>No role assignments yet for this platform</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
