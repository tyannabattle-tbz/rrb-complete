import React, { useState, useCallback } from 'react';
import { Users, MessageSquare, Share2, Clock, Trash2, Lock, Unlock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';

interface Collaborator {
  id: string;
  email: string;
  name: string;
  role: 'owner' | 'editor' | 'viewer';
  joinedAt: Date;
  avatar?: string;
}

interface Comment {
  id: string;
  author: string;
  content: string;
  timestamp: number;
  trackId?: string;
  resolved: boolean;
}

interface CollaborationHubProps {
  projectId: string;
  projectName: string;
  collaborators: Collaborator[];
  comments: Comment[];
  onAddCollaborator?: (email: string, role: string) => Promise<void>;
  onRemoveCollaborator?: (collaboratorId: string) => Promise<void>;
  onAddComment?: (content: string, trackId?: string) => Promise<void>;
  onResolveComment?: (commentId: string) => Promise<void>;
}

export function CollaborationHub({
  projectId,
  projectName,
  collaborators,
  comments,
  onAddCollaborator,
  onRemoveCollaborator,
  onAddComment,
  onResolveComment,
}: CollaborationHubProps) {
  const [activeTab, setActiveTab] = useState<'collaborators' | 'comments'>('collaborators');
  const [newCollaboratorEmail, setNewCollaboratorEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState('editor');
  const [newComment, setNewComment] = useState('');
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [versions, setVersions] = useState<Array<{ id: string; timestamp: Date; author: string }>>([]);

  const shareMutation = trpc.collaboration.addCollaborator.useMutation();
  const removeMutation = trpc.collaboration.removeCollaborator.useMutation();
  const commentMutation = trpc.collaboration.addComment.useMutation();
  const versionsMutation = trpc.collaboration.getVersionHistory.useMutation();

  const handleAddCollaborator = useCallback(async () => {
    if (!newCollaboratorEmail) {
      toast.error('Please enter an email address');
      return;
    }

    try {
      await shareMutation.mutateAsync({
        projectId,
        collaboratorEmail: newCollaboratorEmail,
        role: selectedRole,
      });

      toast.success(`Invited ${newCollaboratorEmail} as ${selectedRole}`);
      setNewCollaboratorEmail('');
      setSelectedRole('editor');
    } catch (error) {
      toast.error('Failed to add collaborator');
    }
  }, [newCollaboratorEmail, selectedRole, projectId, shareMutation]);

  const handleRemoveCollaborator = useCallback(
    async (collaboratorId: string) => {
      try {
        await removeMutation.mutateAsync({
          projectId,
          collaboratorId,
        });

        toast.success('Collaborator removed');
      } catch (error) {
        toast.error('Failed to remove collaborator');
      }
    },
    [projectId, removeMutation]
  );

  const handleAddComment = useCallback(async () => {
    if (!newComment.trim()) return;

    try {
      await commentMutation.mutateAsync({
        projectId,
        content: newComment,
      });

      toast.success('Comment added');
      setNewComment('');
    } catch (error) {
      toast.error('Failed to add comment');
    }
  }, [newComment, projectId, commentMutation]);

  const handleLoadVersionHistory = useCallback(async () => {
    try {
      const history = await versionsMutation.mutateAsync({ projectId });
      setVersions(history);
      setShowVersionHistory(!showVersionHistory);
    } catch (error) {
      toast.error('Failed to load version history');
    }
  }, [projectId, showVersionHistory, versionsMutation]);

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-purple-600';
      case 'editor':
        return 'bg-blue-600';
      case 'viewer':
        return 'bg-gray-600';
      default:
        return 'bg-gray-600';
    }
  };

  return (
    <div className="w-full bg-gradient-to-b from-[#2a2a3e] to-[#1a1a2e] rounded-lg p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-cyan-400" />
          Collaboration Hub
        </h2>
        <Button
          onClick={handleLoadVersionHistory}
          className="bg-gray-600 hover:bg-gray-700 text-white flex items-center gap-2 text-sm"
        >
          <Clock className="w-4 h-4" />
          {showVersionHistory ? 'Hide' : 'Show'} History
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[#3a3a4e]">
        <button
          onClick={() => setActiveTab('collaborators')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'collaborators'
              ? 'text-cyan-400 border-b-2 border-cyan-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Collaborators ({collaborators.length})
        </button>
        <button
          onClick={() => setActiveTab('comments')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'comments'
              ? 'text-cyan-400 border-b-2 border-cyan-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Comments ({comments.length})
        </button>
      </div>

      {/* Collaborators Tab */}
      {activeTab === 'collaborators' && (
        <div className="space-y-4">
          {/* Add Collaborator Form */}
          <div className="bg-[#1a1a2e] rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-white text-sm">Invite Collaborator</h3>
            <div className="flex gap-2">
              <input
                type="email"
                value={newCollaboratorEmail}
                onChange={(e) => setNewCollaboratorEmail(e.target.value)}
                placeholder="collaborator@example.com"
                className="flex-1 bg-[#0f0f1e] text-white rounded px-3 py-2 text-sm"
              />
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="bg-[#0f0f1e] text-white rounded px-3 py-2 text-sm"
              >
                <option value="viewer">Viewer</option>
                <option value="editor">Editor</option>
                <option value="owner">Owner</option>
              </select>
              <Button
                onClick={handleAddCollaborator}
                className="bg-cyan-600 hover:bg-cyan-700 text-white flex items-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                Invite
              </Button>
            </div>
          </div>

          {/* Collaborators List */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {collaborators.map((collab) => (
              <div
                key={collab.id}
                className="bg-[#1a1a2e] rounded-lg p-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  {collab.avatar && (
                    <img
                      src={collab.avatar}
                      alt={collab.name}
                      className="w-8 h-8 rounded-full"
                    />
                  )}
                  <div>
                    <p className="font-medium text-white text-sm">{collab.name}</p>
                    <p className="text-xs text-gray-400">{collab.email}</p>
                  </div>
                  <span className={`${getRoleColor(collab.role)} text-white text-xs px-2 py-1 rounded`}>
                    {collab.role}
                  </span>
                </div>
                {collab.role !== 'owner' && (
                  <Button
                    onClick={() => handleRemoveCollaborator(collab.id)}
                    className="bg-red-600 hover:bg-red-700 text-white p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Comments Tab */}
      {activeTab === 'comments' && (
        <div className="space-y-4">
          {/* Add Comment Form */}
          <div className="bg-[#1a1a2e] rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-white text-sm">Add Comment</h3>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share feedback or notes..."
              className="w-full bg-[#0f0f1e] text-white rounded px-3 py-2 text-sm h-20 resize-none"
            />
            <Button
              onClick={handleAddComment}
              className="w-full bg-cyan-600 hover:bg-cyan-700 text-white flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              Post Comment
            </Button>
          </div>

          {/* Comments List */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className={`bg-[#1a1a2e] rounded-lg p-3 ${comment.resolved ? 'opacity-50' : ''}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <p className="font-medium text-white text-sm">{comment.author}</p>
                  <span className="text-xs text-gray-400">
                    {new Date(comment.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="text-gray-300 text-sm mb-2">{comment.content}</p>
                {comment.resolved && <p className="text-xs text-green-400">✓ Resolved</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Version History */}
      {showVersionHistory && (
        <div className="bg-[#1a1a2e] rounded-lg p-4 space-y-2 max-h-48 overflow-y-auto">
          <h3 className="font-semibold text-white text-sm mb-3">Version History</h3>
          {versions.map((version) => (
            <div key={version.id} className="flex justify-between items-center text-sm text-gray-300">
              <span>{version.author}</span>
              <span className="text-gray-500">{new Date(version.timestamp).toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
