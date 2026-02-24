import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Check, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { ChannelMetadata, getAllChannelMetadata, addChannelMetadata, updateChannelMetadata, deleteChannelMetadata } from '@/lib/channelMetadataService';

export const AdminChannelManager: React.FC = () => {
  const { user } = useAuth();
  const [channels, setChannels] = useState<ChannelMetadata[]>([]);
  const [isAddingChannel, setIsAddingChannel] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newChannel, setNewChannel] = useState<Partial<ChannelMetadata>>({
    genre: '',
    description: '',
    coverArt: '',
    backgroundColor: '#1a1a2e',
    textColor: '#ffffff',
    accentColor: '#ff6b35',
    tags: [],
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadChannels();
  }, []);

  const loadChannels = () => {
    setChannels(getAllChannelMetadata());
  };

  const validateChannel = (channel: Partial<ChannelMetadata>): boolean => {
    const errors: Record<string, string> = {};

    if (!channel.name?.trim()) errors.name = 'Channel name is required';
    if (!channel.genre?.trim()) errors.genre = 'Genre is required';
    if (!channel.description?.trim()) errors.description = 'Description is required';
    if (!channel.coverArt?.trim()) errors.coverArt = 'Cover art URL is required';

    // Validate URL format
    if (channel.coverArt) {
      try {
        new URL(channel.coverArt);
      } catch {
        errors.coverArt = 'Invalid URL format';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddChannel = () => {
    if (!validateChannel(newChannel)) return;

    const channel: ChannelMetadata = {
      id: `channel-${Date.now()}`,
      name: newChannel.name || '',
      genre: newChannel.genre || '',
      description: newChannel.description || '',
      coverArt: newChannel.coverArt || '',
      backgroundColor: newChannel.backgroundColor || '#1a1a2e',
      textColor: newChannel.textColor || '#ffffff',
      accentColor: newChannel.accentColor || '#ff6b35',
      tags: newChannel.tags || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    addChannelMetadata(channel);
    loadChannels();
    setNewChannel({
      genre: '',
      description: '',
      coverArt: '',
      backgroundColor: '#1a1a2e',
      textColor: '#ffffff',
      accentColor: '#ff6b35',
      tags: [],
    });
    setIsAddingChannel(false);
    setValidationErrors({});
  };

  const handleUpdateChannel = (id: string, updates: Partial<ChannelMetadata>) => {
    if (!validateChannel(updates)) return;

    updateChannelMetadata(id, updates);
    loadChannels();
    setEditingId(null);
    setValidationErrors({});
  };

  const handleDeleteChannel = (id: string) => {
    if (confirm('Are you sure you want to delete this channel?')) {
      deleteChannelMetadata(id);
      loadChannels();
    }
  };

  const checkChannelHealth = async (url: string): Promise<boolean> => {
    try {
      const response = await fetch(url, { method: 'HEAD', mode: 'no-cors' });
      return response.status < 400 || response.status === 0; // 0 for CORS
    } catch {
      return false;
    }
  };

  if (!user) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800">You must be logged in to manage channels.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Channel Management</h1>
        <Button
          onClick={() => setIsAddingChannel(!isAddingChannel)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Channel
        </Button>
      </div>

      {isAddingChannel && (
        <Card className="bg-slate-800 border-slate-700 p-6 space-y-4">
          <h2 className="text-xl font-semibold text-white">Add New Channel</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Channel Name</label>
              <Input
                value={newChannel.name || ''}
                onChange={e => setNewChannel({ ...newChannel, name: e.target.value })}
                placeholder="e.g., Jazz Nights"
                className="bg-slate-700 border-slate-600 text-white"
              />
              {validationErrors.name && <p className="text-red-400 text-xs mt-1">{validationErrors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Genre</label>
              <Input
                value={newChannel.genre || ''}
                onChange={e => setNewChannel({ ...newChannel, genre: e.target.value })}
                placeholder="e.g., Jazz"
                className="bg-slate-700 border-slate-600 text-white"
              />
              {validationErrors.genre && <p className="text-red-400 text-xs mt-1">{validationErrors.genre}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
              <textarea
                value={newChannel.description || ''}
                onChange={e => setNewChannel({ ...newChannel, description: e.target.value })}
                placeholder="Channel description"
                rows={3}
                className="w-full bg-slate-700 border border-slate-600 rounded-md text-white p-2"
              />
              {validationErrors.description && <p className="text-red-400 text-xs mt-1">{validationErrors.description}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-2">Cover Art URL</label>
              <Input
                value={newChannel.coverArt || ''}
                onChange={e => setNewChannel({ ...newChannel, coverArt: e.target.value })}
                placeholder="https://example.com/image.jpg"
                className="bg-slate-700 border-slate-600 text-white"
              />
              {validationErrors.coverArt && <p className="text-red-400 text-xs mt-1">{validationErrors.coverArt}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Background Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={newChannel.backgroundColor || '#1a1a2e'}
                  onChange={e => setNewChannel({ ...newChannel, backgroundColor: e.target.value })}
                  className="w-12 h-10 rounded cursor-pointer"
                />
                <Input
                  value={newChannel.backgroundColor || ''}
                  onChange={e => setNewChannel({ ...newChannel, backgroundColor: e.target.value })}
                  placeholder="#1a1a2e"
                  className="bg-slate-700 border-slate-600 text-white flex-1"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Accent Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={newChannel.accentColor || '#ff6b35'}
                  onChange={e => setNewChannel({ ...newChannel, accentColor: e.target.value })}
                  className="w-12 h-10 rounded cursor-pointer"
                />
                <Input
                  value={newChannel.accentColor || ''}
                  onChange={e => setNewChannel({ ...newChannel, accentColor: e.target.value })}
                  placeholder="#ff6b35"
                  className="bg-slate-700 border-slate-600 text-white flex-1"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setIsAddingChannel(false)}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleAddChannel} className="bg-green-600 hover:bg-green-700">
              <Check className="w-4 h-4 mr-2" />
              Add Channel
            </Button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {channels.map(channel => (
          <Card
            key={channel.id}
            className="bg-slate-800 border-slate-700 overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div
              className="h-32 bg-gradient-to-br"
              style={{
                backgroundImage: `url(${channel.coverArt})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />

            <div className="p-4 space-y-3">
              <div>
                <h3 className="font-semibold text-white text-lg">{channel.name}</h3>
                <p className="text-sm text-slate-400">{channel.genre}</p>
              </div>

              <p className="text-sm text-slate-300 line-clamp-2">{channel.description}</p>

              <div className="flex flex-wrap gap-1">
                {channel.tags.map(tag => (
                  <span key={tag} className="px-2 py-1 bg-slate-700 text-xs rounded-full text-slate-300">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-700">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingId(editingId === channel.id ? null : channel.id)}
                  className="flex-1"
                >
                  <Edit2 className="w-3 h-3 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteChannel(channel.id)}
                  className="flex-1 text-red-400 hover:text-red-300"
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Delete
                </Button>
              </div>

              {editingId === channel.id && (
                <div className="mt-4 p-3 bg-slate-700/50 rounded space-y-2 border-t border-slate-700">
                  <Input
                    value={channel.name}
                    onChange={e => {
                      const updated = { ...channel, name: e.target.value };
                      setChannels(channels.map(ch => (ch.id === channel.id ? updated : ch)));
                    }}
                    placeholder="Channel name"
                    className="bg-slate-700 border-slate-600 text-white text-sm"
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        handleUpdateChannel(channel.id, channel);
                      }}
                      className="bg-green-600 hover:bg-green-700 flex-1"
                    >
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingId(null)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {channels.length === 0 && (
        <Card className="bg-slate-800 border-slate-700 p-8 text-center">
          <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-400">No channels configured yet. Add your first channel to get started.</p>
        </Card>
      )}
    </div>
  );
};

export default AdminChannelManager;
