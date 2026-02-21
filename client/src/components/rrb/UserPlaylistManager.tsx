import React, { useState, useMemo } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Trash2, Plus, Share2, Copy, Lock, Unlock } from 'lucide-react';

interface Playlist {
  id: number;
  name: string;
  description: string;
  isPublic: boolean;
  trackCount?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface PlaylistTrack {
  playlistId: number;
  trackId: string;
  position: number;
  addedAt: Date;
}

export const UserPlaylistManager: React.FC = () => {
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<number | null>(null);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistDesc, setNewPlaylistDesc] = useState('');
  const [draggedTrackId, setDraggedTrackId] = useState<string | null>(null);

  // Queries
  const { data: playlists = [], isLoading: playlistsLoading, refetch: refetchPlaylists } = 
    trpc.userPlaylist.getMyPlaylists.useQuery();

  const { data: selectedPlaylist, refetch: refetchPlaylist } = 
    trpc.userPlaylist.getPlaylist.useQuery(
      { id: selectedPlaylistId! },
      { enabled: selectedPlaylistId !== null }
    );

  // Mutations
  const createPlaylistMutation = trpc.userPlaylist.create.useMutation({
    onSuccess: () => {
      setNewPlaylistName('');
      setNewPlaylistDesc('');
      refetchPlaylists();
    },
  });

  const updatePlaylistMutation = trpc.userPlaylist.update.useMutation({
    onSuccess: () => refetchPlaylist(),
  });

  const deletePlaylistMutation = trpc.userPlaylist.delete.useMutation({
    onSuccess: () => {
      setSelectedPlaylistId(null);
      refetchPlaylists();
    },
  });

  const addTrackMutation = trpc.userPlaylist.addTrack.useMutation({
    onSuccess: () => refetchPlaylist(),
  });

  const removeTrackMutation = trpc.userPlaylist.removeTrack.useMutation({
    onSuccess: () => refetchPlaylist(),
  });

  const reorderTracksMutation = trpc.userPlaylist.reorderTracks.useMutation({
    onSuccess: () => refetchPlaylist(),
  });

  const clearPlaylistMutation = trpc.userPlaylist.clearPlaylist.useMutation({
    onSuccess: () => refetchPlaylist(),
  });

  const duplicatePlaylistMutation = trpc.userPlaylist.duplicate.useMutation({
    onSuccess: () => refetchPlaylists(),
  });

  // Handlers
  const handleCreatePlaylist = () => {
    if (!newPlaylistName.trim()) return;

    createPlaylistMutation.mutate({
      name: newPlaylistName,
      description: newPlaylistDesc,
      isPublic: false,
    });
  };

  const handleDeletePlaylist = (playlistId: number) => {
    if (window.confirm('Delete this playlist?')) {
      deletePlaylistMutation.mutate({ id: playlistId });
    }
  };

  const handleTogglePublic = (playlist: Playlist) => {
    updatePlaylistMutation.mutate({
      id: playlist.id,
      isPublic: !playlist.isPublic,
    });
  };

  const handleRemoveTrack = (trackId: string) => {
    if (selectedPlaylistId) {
      removeTrackMutation.mutate({
        playlistId: selectedPlaylistId,
        trackId,
      });
    }
  };

  const handleDragStart = (trackId: string) => {
    setDraggedTrackId(trackId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDropTrack = (targetTrackId: string) => {
    if (!draggedTrackId || !selectedPlaylist) return;

    const tracks = selectedPlaylist.tracks || [];
    const draggedIndex = tracks.findIndex(t => t.trackId === draggedTrackId);
    const targetIndex = tracks.findIndex(t => t.trackId === targetTrackId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    // Swap positions
    const newTrackIds = tracks.map(t => t.trackId);
    [newTrackIds[draggedIndex], newTrackIds[targetIndex]] = [
      newTrackIds[targetIndex],
      newTrackIds[draggedIndex],
    ];

    reorderTracksMutation.mutate({
      playlistId: selectedPlaylistId,
      trackIds: newTrackIds,
    });

    setDraggedTrackId(null);
  };

  const handleDuplicatePlaylist = (playlist: Playlist) => {
    const newName = `${playlist.name} (Copy)`;
    duplicatePlaylistMutation.mutate({
      sourcePlaylistId: playlist.id,
      newName,
    });
  };

  return (
    <div className="space-y-6">
      {/* Create New Playlist */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Create New Playlist</h3>
        <div className="space-y-3">
          <Input
            placeholder="Playlist name..."
            value={newPlaylistName}
            onChange={(e) => setNewPlaylistName(e.target.value)}
          />
          <Input
            placeholder="Description (optional)..."
            value={newPlaylistDesc}
            onChange={(e) => setNewPlaylistDesc(e.target.value)}
          />
          <Button
            onClick={handleCreatePlaylist}
            disabled={createPlaylistMutation.isPending || !newPlaylistName.trim()}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Playlist
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Playlists List */}
        <div className="lg:col-span-1">
          <Card className="p-4">
            <h3 className="font-semibold mb-4">My Playlists</h3>
            {playlistsLoading ? (
              <div className="text-sm text-muted-foreground">Loading...</div>
            ) : playlists.length === 0 ? (
              <div className="text-sm text-muted-foreground">No playlists yet</div>
            ) : (
              <div className="space-y-2">
                {playlists.map((playlist) => (
                  <button
                    key={playlist.id}
                    onClick={() => setSelectedPlaylistId(playlist.id)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedPlaylistId === playlist.id
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-accent'
                    }`}
                  >
                    <div className="font-medium text-sm">{playlist.name}</div>
                    <div className="text-xs opacity-75">
                      {playlist.trackCount || 0} tracks
                    </div>
                  </button>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Selected Playlist Details */}
        <div className="lg:col-span-2">
          {selectedPlaylist ? (
            <Card className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold">{selectedPlaylist.name}</h3>
                  {selectedPlaylist.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedPlaylist.description}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    {selectedPlaylist.trackCount || 0} tracks
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleTogglePublic(selectedPlaylist)}
                  >
                    {selectedPlaylist.isPublic ? (
                      <>
                        <Unlock className="w-4 h-4 mr-1" />
                        Public
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 mr-1" />
                        Private
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDuplicatePlaylist(selectedPlaylist)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeletePlaylist(selectedPlaylist.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Tracks List */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium">Tracks</h4>
                  {selectedPlaylist.trackCount && selectedPlaylist.trackCount > 0 && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => clearPlaylistMutation.mutate({ id: selectedPlaylist.id })}
                    >
                      Clear All
                    </Button>
                  )}
                </div>

                {selectedPlaylist.trackCount && selectedPlaylist.trackCount > 0 ? (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {selectedPlaylist.tracks?.map((track, index) => (
                      <div
                        key={track.trackId}
                        draggable
                        onDragStart={() => handleDragStart(track.trackId)}
                        onDragOver={handleDragOver}
                        onDrop={() => handleDropTrack(track.trackId)}
                        className="flex items-center justify-between p-2 bg-accent rounded hover:bg-accent/80 cursor-move"
                      >
                        <span className="text-sm">
                          {index + 1}. {track.trackId}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveTrack(track.trackId)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground text-center py-8">
                    No tracks in this playlist
                  </div>
                )}
              </div>
            </Card>
          ) : (
            <Card className="p-6 text-center text-muted-foreground">
              Select a playlist to view and manage tracks
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
