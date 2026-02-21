import { create } from 'zustand';

export interface Recording {
  id: string;
  channelId: string;
  channelName: string;
  startTime: number;
  endTime?: number;
  duration: number; // in seconds
  audioUrl?: string;
  title: string;
  description?: string;
  isRecording: boolean;
  fileSize?: number; // in bytes
}

interface RecordingStore {
  recordings: Recording[];
  currentRecording: Recording | null;
  mediaRecorder: MediaRecorder | null;
  audioChunks: Blob[];

  // Actions
  startRecording: (channelId: string, channelName: string) => Promise<void>;
  stopRecording: () => Promise<void>;
  deleteRecording: (recordingId: string) => void;
  downloadRecording: (recordingId: string) => void;
  getRecordingsByChannel: (channelId: string) => Recording[];
  getAllRecordings: () => Recording[];
  getTotalRecordingTime: () => number;
}

export const useRecordingStore = create<RecordingStore>((set, get) => ({
  recordings: [],
  currentRecording: null,
  mediaRecorder: null,
  audioChunks: [],

  startRecording: async (channelId, channelName) => {
    try {
      // Get audio stream from the page's audio element
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const destination = audioContext.createMediaStreamDestination();

      // Find the currently playing audio element
      const audioElement = document.querySelector('audio') as HTMLAudioElement;
      if (!audioElement) {
        throw new Error('No audio element found');
      }

      // Create a source from the audio element
      const source = audioContext.createMediaElementAudioSource(audioElement);
      source.connect(destination);

      const mediaRecorder = new MediaRecorder(destination.stream);
      const audioChunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      const recording: Recording = {
        id: `rec-${Date.now()}`,
        channelId,
        channelName,
        startTime: Date.now(),
        duration: 0,
        title: `${channelName} - ${new Date().toLocaleString()}`,
        isRecording: true,
      };

      set({
        currentRecording: recording,
        mediaRecorder,
        audioChunks,
      });

      mediaRecorder.start();
    } catch (error) {
      console.error('Failed to start recording:', error);
      throw error;
    }
  },

  stopRecording: async () => {
    return new Promise((resolve, reject) => {
      const { mediaRecorder, currentRecording, audioChunks } = get();

      if (!mediaRecorder || !currentRecording) {
        reject(new Error('No active recording'));
        return;
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        const duration = Math.floor((Date.now() - currentRecording.startTime) / 1000);

        const completedRecording: Recording = {
          ...currentRecording,
          endTime: Date.now(),
          duration,
          audioUrl,
          isRecording: false,
          fileSize: audioBlob.size,
        };

        set((state) => ({
          recordings: [completedRecording, ...state.recordings],
          currentRecording: null,
          mediaRecorder: null,
          audioChunks: [],
        }));

        resolve();
      };

      mediaRecorder.stop();
    });
  },

  deleteRecording: (recordingId) => {
    set((state) => {
      const recording = state.recordings.find((r) => r.id === recordingId);
      if (recording?.audioUrl) {
        URL.revokeObjectURL(recording.audioUrl);
      }
      return {
        recordings: state.recordings.filter((r) => r.id !== recordingId),
      };
    });
  },

  downloadRecording: (recordingId) => {
    const recording = get().recordings.find((r) => r.id === recordingId);
    if (!recording?.audioUrl) return;

    const link = document.createElement('a');
    link.href = recording.audioUrl;
    link.download = `${recording.title}.webm`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  getRecordingsByChannel: (channelId) => {
    return get().recordings.filter((r) => r.channelId === channelId);
  },

  getAllRecordings: () => {
    return get().recordings;
  },

  getTotalRecordingTime: () => {
    return get().recordings.reduce((total, r) => total + r.duration, 0);
  },
}));

// Format seconds to HH:MM:SS
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  }
  return `${minutes}m ${secs}s`;
}

// Format bytes to human-readable size
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
