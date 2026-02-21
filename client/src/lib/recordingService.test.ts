import { describe, it, expect, beforeEach } from 'vitest';
import { useRecordingStore, formatDuration, formatFileSize } from './recordingService';

describe('Recording Service', () => {
  beforeEach(() => {
    // Reset store before each test
    useRecordingStore.setState({
      recordings: [],
      currentRecording: null,
      mediaRecorder: null,
      audioChunks: [],
    });
  });

  describe('formatDuration', () => {
    it('should format seconds to MM:SS', () => {
      expect(formatDuration(65)).toBe('1m 5s');
      expect(formatDuration(3661)).toBe('1h 1m 1s');
      expect(formatDuration(45)).toBe('0m 45s');
    });

    it('should handle zero seconds', () => {
      expect(formatDuration(0)).toBe('0m 0s');
    });

    it('should handle large durations', () => {
      expect(formatDuration(86400)).toBe('24h 0m 0s');
    });
  });

  describe('formatFileSize', () => {
    it('should format bytes to human-readable size', () => {
      expect(formatFileSize(0)).toBe('0 Bytes');
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(1048576)).toBe('1 MB');
      expect(formatFileSize(1073741824)).toBe('1 GB');
    });

    it('should handle partial sizes', () => {
      expect(formatFileSize(512)).toBe('0.5 KB');
      expect(formatFileSize(2048)).toBe('2 KB');
    });
  });

  describe('Recording Store', () => {
    it('should get recordings by channel', () => {
      const store = useRecordingStore.getState();
      
      // Manually add recordings (since startRecording requires browser APIs)
      store.recordings.push({
        id: 'rec-1',
        channelId: 'channel-1',
        channelName: 'Test Channel',
        startTime: Date.now(),
        duration: 60,
        title: 'Recording 1',
        isRecording: false,
        audioUrl: 'blob:...',
        fileSize: 1024,
      });
      store.recordings.push({
        id: 'rec-2',
        channelId: 'channel-2',
        channelName: 'Another Channel',
        startTime: Date.now(),
        duration: 120,
        title: 'Recording 2',
        isRecording: false,
        audioUrl: 'blob:...',
        fileSize: 2048,
      });

      const channel1Recordings = store.getRecordingsByChannel('channel-1');
      expect(channel1Recordings).toHaveLength(1);
      expect(channel1Recordings[0].channelId).toBe('channel-1');
    });

    it('should get all recordings', () => {
      const store = useRecordingStore.getState();
      
      store.recordings.push({
        id: 'rec-1',
        channelId: 'channel-1',
        channelName: 'Test Channel',
        startTime: Date.now(),
        duration: 60,
        title: 'Recording 1',
        isRecording: false,
        audioUrl: 'blob:...',
        fileSize: 1024,
      });
      store.recordings.push({
        id: 'rec-2',
        channelId: 'channel-2',
        channelName: 'Another Channel',
        startTime: Date.now(),
        duration: 120,
        title: 'Recording 2',
        isRecording: false,
        audioUrl: 'blob:...',
        fileSize: 2048,
      });

      const allRecordings = store.getAllRecordings();
      expect(allRecordings).toHaveLength(2);
    });

    it('should calculate total recording time', () => {
      const store = useRecordingStore.getState();
      
      store.recordings.push({
        id: 'rec-1',
        channelId: 'channel-1',
        channelName: 'Test Channel',
        startTime: Date.now(),
        duration: 60,
        title: 'Recording 1',
        isRecording: false,
        audioUrl: 'blob:...',
        fileSize: 1024,
      });
      store.recordings.push({
        id: 'rec-2',
        channelId: 'channel-2',
        channelName: 'Another Channel',
        startTime: Date.now(),
        duration: 120,
        title: 'Recording 2',
        isRecording: false,
        audioUrl: 'blob:...',
        fileSize: 2048,
      });

      const totalTime = store.getTotalRecordingTime();
      expect(totalTime).toBe(180);
    });

    it('should delete recording', () => {
      const store = useRecordingStore.getState();
      
      store.recordings.push({
        id: 'rec-1',
        channelId: 'channel-1',
        channelName: 'Test Channel',
        startTime: Date.now(),
        duration: 60,
        title: 'Recording 1',
        isRecording: false,
        audioUrl: 'blob:...',
        fileSize: 1024,
      });

      store.deleteRecording('rec-1');
      expect(store.recordings).toHaveLength(0);
    });
  });
});
