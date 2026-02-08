import React, { useState } from 'react';
import { Download, Trash2, Plus, Play, Pause, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface PlaylistItem {
  id: string;
  title: string;
  artist?: string;
  duration: number;
  fileSize: number;
  isDownloaded: boolean;
  downloadProgress?: number;
}

interface MobileOfflinePlaylistProps {
  playlistName: string;
  items: PlaylistItem[];
  onDownload?: (itemId: string) => void;
  onRemove?: (itemId: string) => void;
  onPlay?: (itemId: string) => void;
  isOnline?: boolean;
}

export default function MobileOfflinePlaylist({
  playlistName,
  items = [],
  onDownload,
  onRemove,
  onPlay,
  isOnline = true,
}: MobileOfflinePlaylistProps) {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [downloading, setDownloading] = useState<Set<string>>(new Set());

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const downloadedCount = items.filter((i) => i.isDownloaded).length;
  const totalSize = items.reduce((sum, item) => sum + item.fileSize, 0);
  const downloadedSize = items.filter((i) => i.isDownloaded).reduce((sum, item) => sum + item.fileSize, 0);

  const handleDownload = async (itemId: string) => {
    setDownloading((prev) => new Set([...prev, itemId]));
    if (onDownload) onDownload(itemId);

    // Simulate download
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setDownloading((prev) => {
      const next = new Set(prev);
      next.delete(itemId);
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedItems.size === items.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(items.map((i) => i.id)));
    }
  };

  const handleBulkDownload = () => {
    selectedItems.forEach((itemId) => {
      handleDownload(itemId);
    });
  };

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="px-4 pt-4">
        <div className="flex items-center gap-2 mb-2">
          <Download className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">{playlistName}</h3>
        </div>
        <div className="flex items-center gap-2">
          {isOnline ? (
            <>
              <Wifi className="w-4 h-4 text-green-400" />
              <span className="text-green-400 text-sm">Online</span>
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4 text-yellow-400" />
              <span className="text-yellow-400 text-sm">Offline</span>
            </>
          )}
        </div>
      </div>

      {/* Storage Stats */}
      <Card className="bg-slate-800 border-purple-500 border mx-4 p-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-purple-400">{downloadedCount}</p>
            <p className="text-purple-300 text-xs">Downloaded</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-400">{items.length}</p>
            <p className="text-purple-300 text-xs">Total</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-400">{Math.round((downloadedSize / totalSize) * 100)}%</p>
            <p className="text-purple-300 text-xs">Complete</p>
          </div>
        </div>
        <div className="mt-3 bg-slate-700 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all"
            style={{
              width: `${totalSize > 0 ? (downloadedSize / totalSize) * 100 : 0}%`,
            }}
          />
        </div>
        <p className="text-purple-300 text-xs mt-2">
          {formatBytes(downloadedSize)} / {formatBytes(totalSize)}
        </p>
      </Card>

      {/* Bulk Actions */}
      {items.length > 0 && (
        <div className="px-4 flex gap-2">
          <Button
            onClick={handleSelectAll}
            variant="outline"
            className="flex-1 py-2 text-sm"
          >
            {selectedItems.size === items.length ? 'Deselect All' : 'Select All'}
          </Button>
          {selectedItems.size > 0 && (
            <Button
              onClick={handleBulkDownload}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 text-sm"
            >
              Download ({selectedItems.size})
            </Button>
          )}
        </div>
      )}

      {/* Playlist Items */}
      <div className="px-4 pb-4 space-y-2">
        {items.length === 0 ? (
          <Card className="bg-slate-800 border-slate-700 border p-4 text-center">
            <Plus className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-slate-400">No items in playlist</p>
          </Card>
        ) : (
          items.map((item) => (
            <Card
              key={item.id}
              className={`bg-slate-800 border transition ${
                selectedItems.has(item.id) ? 'border-purple-500' : 'border-slate-700'
              } p-3`}
            >
              {/* Checkbox and Title */}
              <div className="flex items-start gap-3 mb-2">
                <input
                  type="checkbox"
                  checked={selectedItems.has(item.id)}
                  onChange={(e) => {
                    const newSelected = new Set(selectedItems);
                    if (e.target.checked) {
                      newSelected.add(item.id);
                    } else {
                      newSelected.delete(item.id);
                    }
                    setSelectedItems(newSelected);
                  }}
                  className="mt-1 w-4 h-4 cursor-pointer"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold truncate text-sm">{item.title}</p>
                  {item.artist && (
                    <p className="text-purple-300 text-xs truncate">{item.artist}</p>
                  )}
                </div>
              </div>

              {/* Download Progress or Status */}
              {downloading.has(item.id) ? (
                <div className="bg-slate-700 rounded-full h-1.5 mb-2">
                  <div className="bg-purple-500 h-1.5 rounded-full w-1/2 animate-pulse" />
                </div>
              ) : item.isDownloaded ? (
                <div className="bg-slate-700 rounded-full h-1.5 mb-2">
                  <div className="bg-green-500 h-1.5 rounded-full w-full" />
                </div>
              ) : null}

              {/* Info and Actions */}
              <div className="flex items-center justify-between text-xs text-purple-300">
                <div className="flex gap-2">
                  <span>{formatDuration(item.duration)}</span>
                  <span>•</span>
                  <span>{formatBytes(item.fileSize)}</span>
                </div>
                <div className="flex gap-2">
                  {item.isDownloaded && (
                    <button
                      onClick={() => onPlay && onPlay(item.id)}
                      className="p-1.5 hover:bg-slate-700 rounded transition"
                    >
                      <Play className="w-4 h-4 text-green-400" />
                    </button>
                  )}
                  {!item.isDownloaded && !downloading.has(item.id) && (
                    <button
                      onClick={() => handleDownload(item.id)}
                      className="p-1.5 hover:bg-slate-700 rounded transition"
                    >
                      <Download className="w-4 h-4 text-blue-400" />
                    </button>
                  )}
                  <button
                    onClick={() => onRemove && onRemove(item.id)}
                    className="p-1.5 hover:bg-slate-700 rounded transition"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
