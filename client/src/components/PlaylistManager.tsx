import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Trash2, Share2, Edit2, Music } from 'lucide-react';

interface PlaylistManagerProps {
  userId: string;
}

export function PlaylistManager({ userId }: PlaylistManagerProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistDesc, setNewPlaylistDesc] = useState('');

  const { data: playlists, refetch } = trpc.playlist.getUserPlaylists.useQuery({
    userId,
  });

  const createMutation = trpc.playlist.createPlaylist.useMutation({
    onSuccess: () => {
      refetch();
      setNewPlaylistName('');
      setNewPlaylistDesc('');
      setIsCreateOpen(false);
    },
  });

  const deleteMutation = trpc.playlist.deletePlaylist.useMutation({
    onSuccess: () => refetch(),
  });

  const shareMutation = trpc.playlist.sharePlaylist.useMutation({
    onSuccess: () => refetch(),
  });

  const handleCreatePlaylist = () => {
    if (!newPlaylistName.trim()) return;

    createMutation.mutate({
      name: newPlaylistName,
      description: newPlaylistDesc,
      userId,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">My Playlists</h2>
        <Button
          onClick={() => setIsCreateOpen(true)}
          className="bg-amber-500 hover:bg-amber-600 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Playlist
        </Button>
      </div>

      {/* Create Playlist Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">Create New Playlist</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-slate-300 mb-2 block">
                Playlist Name
              </label>
              <Input
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                placeholder="My Awesome Playlist"
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
            <div>
              <label className="text-sm text-slate-300 mb-2 block">
                Description (optional)
              </label>
              <Input
                value={newPlaylistDesc}
                onChange={(e) => setNewPlaylistDesc(e.target.value)}
                placeholder="Add a description..."
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreatePlaylist}
                disabled={!newPlaylistName.trim()}
                className="flex-1 bg-amber-500 hover:bg-amber-600"
              >
                Create
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Playlists Grid */}
      {playlists && playlists.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {playlists.map((playlist) => (
            <Card
              key={playlist.id}
              className="bg-slate-800 border-slate-700 p-6 hover:border-amber-500 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-bold text-white text-lg mb-1">
                    {playlist.name}
                  </h3>
                  {playlist.description && (
                    <p className="text-sm text-slate-400 line-clamp-2">
                      {playlist.description}
                    </p>
                  )}
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded flex items-center justify-center flex-shrink-0">
                  <Music className="w-6 h-6 text-white" />
                </div>
              </div>

              <div className="mb-4 p-2 bg-slate-700/50 rounded text-sm text-slate-400">
                {playlist.itemCount || 0} items
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => shareMutation.mutate({ playlistId: playlist.id })}
                >
                  <Share2 className="w-4 h-4 mr-1" />
                  Share
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <Edit2 className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-400 hover:text-red-300"
                  onClick={() =>
                    deleteMutation.mutate({
                      playlistId: playlist.id,
                      userId,
                    })
                  }
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              {playlist.isPublic && (
                <div className="mt-3 px-2 py-1 bg-amber-500/20 text-amber-400 text-xs rounded">
                  Public
                </div>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-slate-800 border-slate-700 p-12 text-center">
          <Music className="w-12 h-12 text-slate-500 mx-auto mb-4" />
          <p className="text-slate-400 mb-4">No playlists yet</p>
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="bg-amber-500 hover:bg-amber-600"
          >
            Create Your First Playlist
          </Button>
        </Card>
      )}
    </div>
  );
}
