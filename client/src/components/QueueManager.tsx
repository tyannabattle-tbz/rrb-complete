import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, GripVertical, Play } from 'lucide-react';

export interface QueueTrack {
  id: number;
  title: string;
  artist: string;
  duration: number;
  channel: number;
}

interface QueueManagerProps {
  queue: QueueTrack[];
  currentIndex: number;
  onReorder?: (newQueue: QueueTrack[]) => void;
  onRemove?: (trackId: number) => void;
  onPlayTrack?: (index: number) => void;
}

export function QueueManager({
  queue,
  currentIndex,
  onReorder,
  onRemove,
  onPlayTrack,
}: QueueManagerProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newQueue = [...queue];
    const draggedItem = newQueue[draggedIndex];
    newQueue.splice(draggedIndex, 1);
    newQueue.splice(index, 0, draggedItem);

    onReorder?.(newQueue);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (queue.length === 0) {
    return (
      <Card className="border-orange-700">
        <CardHeader>
          <CardTitle className="text-orange-600">📋 Queue</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-500 text-center py-8">Queue is empty</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-orange-700">
      <CardHeader>
        <CardTitle className="text-orange-600">
          📋 Queue ({queue.length} tracks)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 max-h-96 overflow-y-auto">
        {queue.map((track, index) => (
          <div
            key={track.id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
              index === currentIndex
                ? 'bg-orange-100 dark:bg-orange-900 border-orange-500'
                : draggedIndex === index
                  ? 'bg-slate-200 dark:bg-slate-700 border-slate-400'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
            } cursor-move`}
          >
            <GripVertical className="w-4 h-4 text-slate-400 flex-shrink-0" />

            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{track.title}</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                {track.artist} • Ch {track.channel}
              </p>
            </div>

            <span className="text-xs text-slate-500 flex-shrink-0">
              {formatDuration(track.duration)}
            </span>

            {index === currentIndex && (
              <Play className="w-4 h-4 text-orange-600 flex-shrink-0" />
            )}

            <Button
              size="sm"
              variant="ghost"
              onClick={() => onRemove?.(track.id)}
              className="hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900 flex-shrink-0"
            >
              <Trash2 className="w-4 h-4" />
            </Button>

            {index !== currentIndex && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onPlayTrack?.(index)}
                className="hover:bg-orange-100 hover:text-orange-600 dark:hover:bg-orange-900 flex-shrink-0"
              >
                <Play className="w-4 h-4" />
              </Button>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
