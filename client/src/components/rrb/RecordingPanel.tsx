import { useState, useEffect } from 'react';
import { Mic, Square, Download, Trash2, Play } from 'lucide-react';
import { useRecordingStore, formatDuration, formatFileSize } from '@/lib/recordingService';
import { Button } from '@/components/ui/button';

interface RecordingPanelProps {
  channelId: string;
  channelName: string;
}

export function RecordingPanel({ channelId, channelName }: RecordingPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const { currentRecording, recordings, startRecording, stopRecording, deleteRecording, downloadRecording, getRecordingsByChannel } = useRecordingStore();

  const channelRecordings = getRecordingsByChannel(channelId);

  // Update recording timer
  useEffect(() => {
    if (!currentRecording) {
      setRecordingTime(0);
      return;
    }

    const interval = setInterval(() => {
      setRecordingTime(Math.floor((Date.now() - currentRecording.startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [currentRecording]);

  const handleStartRecording = async () => {
    try {
      await startRecording(channelId, channelName);
    } catch (error) {
      console.error('Failed to start recording:', error);
      alert('Failed to start recording. Please check browser permissions.');
    }
  };

  const handleStopRecording = async () => {
    try {
      await stopRecording();
    } catch (error) {
      console.error('Failed to stop recording:', error);
      alert('Failed to stop recording.');
    }
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Mic className="w-5 h-5 text-orange-500" />
          <span className="font-semibold text-slate-900">Recording Studio</span>
          {currentRecording && (
            <span className="ml-2 px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded animate-pulse">
              RECORDING {formatDuration(recordingTime)}
            </span>
          )}
        </div>
        <span className="text-sm text-slate-500">{channelRecordings.length} recordings</span>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-slate-200 p-4 space-y-4">
          {/* Recording Controls */}
          <div className="flex gap-2">
            {!currentRecording ? (
              <Button
                onClick={handleStartRecording}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white"
              >
                <Mic className="w-4 h-4 mr-2" />
                Start Recording
              </Button>
            ) : (
              <Button
                onClick={handleStopRecording}
                className="flex-1 bg-slate-500 hover:bg-slate-600 text-white"
              >
                <Square className="w-4 h-4 mr-2" />
                Stop Recording
              </Button>
            )}
          </div>

          {/* Recordings List */}
          {channelRecordings.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold text-slate-900 text-sm">Saved Recordings</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {channelRecordings.map((recording) => (
                  <div
                    key={recording.id}
                    className="p-3 bg-slate-50 rounded border border-slate-200 flex items-center justify-between gap-2"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{recording.title}</p>
                      <p className="text-xs text-slate-500">
                        {formatDuration(recording.duration)} • {recording.fileSize ? formatFileSize(recording.fileSize) : 'Processing...'}
                      </p>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button
                        className="p-2 hover:bg-slate-200 rounded transition-colors"
                        title="Play"
                      >
                        <Play className="w-4 h-4 text-slate-600" />
                      </button>
                      <button
                        onClick={() => downloadRecording(recording.id)}
                        className="p-2 hover:bg-slate-200 rounded transition-colors"
                        title="Download"
                      >
                        <Download className="w-4 h-4 text-slate-600" />
                      </button>
                      <button
                        onClick={() => deleteRecording(recording.id)}
                        className="p-2 hover:bg-red-100 rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {channelRecordings.length === 0 && !currentRecording && (
            <p className="text-sm text-slate-500 text-center py-4">No recordings yet. Start recording to save your favorite broadcasts!</p>
          )}
        </div>
      )}
    </div>
  );
}
