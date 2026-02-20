import { useState } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

export function MobilePlayer({ title, artist, onPlay, onPause, isPlaying }: any) {
  const [volume, setVolume] = useState(70);
  const [isMuted, setIsMuted] = useState(false);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t p-4 md:hidden z-20">
      <div className="flex items-center gap-3">
        <button
          onClick={isPlaying ? onPause : onPlay}
          className="p-2 bg-primary text-primary-foreground rounded-full"
        >
          {isPlaying ? <Pause size={20} /> : <Play size={20} />}
        </button>
        
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{title}</p>
          <p className="text-xs text-muted-foreground truncate">{artist}</p>
        </div>

        <button
          onClick={() => setIsMuted(!isMuted)}
          className="p-2 text-muted-foreground"
        >
          {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
      </div>

      {!isMuted && (
        <input
          type="range"
          min="0"
          max="100"
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          className="w-full mt-2"
        />
      )}
    </div>
  );
}
