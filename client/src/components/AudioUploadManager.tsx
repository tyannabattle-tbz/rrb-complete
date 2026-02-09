/**
 * Audio Upload Manager
 * 
 * Allows users to upload their own audio files to replace placeholder tracks.
 * Files are uploaded to S3 via the audio.uploadTrack tRPC procedure.
 * Uploaded tracks are stored in localStorage and available in the global audio player.
 * 
 * A Canryn Production — All Rights Reserved
 */
import { useState, useRef, useCallback } from 'react';
import { useAudio, type AudioTrack } from '@/contexts/AudioContext';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Upload, Music, Play, Trash2, Loader2, CheckCircle2,
  FileAudio, Plus, X
} from 'lucide-react';
import { toast } from 'sonner';

const STORAGE_KEY = 'qumus-user-tracks';
const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB

interface UserTrack extends AudioTrack {
  uploadedAt: number;
  fileSize: number;
}

function loadUserTracks(): UserTrack[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveUserTracks(tracks: UserTrack[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tracks));
}

export function AudioUploadManager() {
  const audio = useAudio();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [userTracks, setUserTracks] = useState<UserTrack[]>(loadUserTracks);
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    channel: 'User Upload',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const uploadMutation = trpc.audio.uploadTrack.useMutation();

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      toast.error('File too large', { description: 'Maximum file size is 15MB' });
      return;
    }

    if (!file.type.startsWith('audio/')) {
      toast.error('Invalid file type', { description: 'Please select an audio file (MP3, WAV, OGG, etc.)' });
      return;
    }

    setSelectedFile(file);
    // Auto-fill title from filename
    const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
    setFormData(prev => ({
      ...prev,
      title: prev.title || nameWithoutExt,
    }));
    setShowUploadForm(true);
  }, []);

  const handleUpload = useCallback(async () => {
    if (!selectedFile || !formData.title.trim() || !formData.artist.trim()) {
      toast.error('Please fill in title and artist');
      return;
    }

    setIsUploading(true);
    try {
      // Read file as base64
      const arrayBuffer = await selectedFile.arrayBuffer();
      const base64 = btoa(
        new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
      );

      // Get audio duration
      const duration = await new Promise<number>((resolve) => {
        const tempAudio = new Audio();
        tempAudio.addEventListener('loadedmetadata', () => {
          resolve(isFinite(tempAudio.duration) ? Math.round(tempAudio.duration) : 0);
        });
        tempAudio.addEventListener('error', () => resolve(0));
        tempAudio.src = URL.createObjectURL(selectedFile);
      });

      const result = await uploadMutation.mutateAsync({
        title: formData.title.trim(),
        artist: formData.artist.trim(),
        channel: formData.channel.trim() || 'User Upload',
        filename: selectedFile.name,
        mimeType: selectedFile.type,
        base64Data: base64,
        duration,
      });

      if (result.success && result.url) {
        const newTrack: UserTrack = {
          id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
          title: formData.title.trim(),
          artist: formData.artist.trim(),
          url: result.url,
          channel: formData.channel.trim() || 'User Upload',
          duration,
          uploadedAt: Date.now(),
          fileSize: selectedFile.size,
        };

        const updated = [...userTracks, newTrack];
        setUserTracks(updated);
        saveUserTracks(updated);

        toast.success('Track uploaded!', {
          description: `"${newTrack.title}" by ${newTrack.artist} is ready to play`,
        });

        // Reset form
        setSelectedFile(null);
        setFormData({ title: '', artist: '', channel: 'User Upload' });
        setShowUploadForm(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    } catch (err: any) {
      toast.error('Upload failed', {
        description: err.message || 'Please try again',
      });
    } finally {
      setIsUploading(false);
    }
  }, [selectedFile, formData, userTracks, uploadMutation]);

  const removeTrack = useCallback((trackId: string) => {
    const updated = userTracks.filter(t => t.id !== trackId);
    setUserTracks(updated);
    saveUserTracks(updated);
    toast.info('Track removed');
  }, [userTracks]);

  const playAllUploads = useCallback(() => {
    if (userTracks.length > 0) {
      audio.playQueue(userTracks, 0);
      toast.success('Playing your uploaded tracks');
    }
  }, [userTracks, audio]);

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '--:--';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      {/* Upload Section */}
      <div className="rounded-xl border border-border/50 bg-card/50 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" />
            <h3 className="text-sm font-semibold">Upload Your Audio</h3>
          </div>
          <span className="text-[10px] text-muted-foreground">Max 15MB per file</span>
        </div>

        {!showUploadForm ? (
          <div className="flex flex-col items-center gap-3 py-6 border-2 border-dashed border-border/50 rounded-lg">
            <FileAudio className="h-8 w-8 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">
              MP3, WAV, OGG, M4A supported
            </p>
            <Button
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              Choose Audio File
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        ) : (
          <div className="space-y-3">
            {/* Selected file info */}
            <div className="flex items-center gap-2 p-2 rounded-lg bg-primary/5 border border-primary/20">
              <Music className="h-4 w-4 text-primary shrink-0" />
              <span className="text-xs font-medium truncate flex-1">
                {selectedFile?.name}
              </span>
              <span className="text-[10px] text-muted-foreground shrink-0">
                {selectedFile && formatSize(selectedFile.size)}
              </span>
              <button
                onClick={() => {
                  setShowUploadForm(false);
                  setSelectedFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="p-1 rounded hover:bg-accent/50"
              >
                <X className="h-3 w-3" />
              </button>
            </div>

            {/* Metadata form */}
            <div className="space-y-2">
              <Input
                placeholder="Track Title *"
                value={formData.title}
                onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
                className="h-8 text-xs"
              />
              <Input
                placeholder="Artist Name *"
                value={formData.artist}
                onChange={e => setFormData(p => ({ ...p, artist: e.target.value }))}
                className="h-8 text-xs"
              />
              <Input
                placeholder="Channel (e.g., RRB Radio)"
                value={formData.channel}
                onChange={e => setFormData(p => ({ ...p, channel: e.target.value }))}
                className="h-8 text-xs"
              />
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleUpload}
                disabled={isUploading || !formData.title || !formData.artist}
                className="flex-1 gap-1.5"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-3.5 w-3.5" />
                    Upload Track
                  </>
                )}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setShowUploadForm(false);
                  setSelectedFile(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Uploaded Tracks List */}
      {userTracks.length > 0 && (
        <div className="rounded-xl border border-border/50 bg-card/50 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Music className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold">Your Tracks ({userTracks.length})</h3>
            </div>
            <Button size="sm" variant="ghost" onClick={playAllUploads} className="gap-1 h-7 text-xs">
              <Play className="h-3 w-3" />
              Play All
            </Button>
          </div>

          <div className="space-y-1.5">
            {userTracks.map(track => (
              <div
                key={track.id}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-accent/30 transition-colors group"
              >
                <button
                  onClick={() => audio.play(track)}
                  className="p-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                >
                  <Play className="h-3 w-3" />
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{track.title}</p>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {track.artist} · {track.channel}
                  </p>
                </div>
                <span className="text-[10px] text-muted-foreground font-mono">
                  {formatDuration(track.duration)}
                </span>
                <button
                  onClick={() => removeTrack(track.id)}
                  className="p-1 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default AudioUploadManager;
